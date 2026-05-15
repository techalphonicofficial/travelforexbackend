-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2026 at 01:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jewellery`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `country_id` bigint(20) UNSIGNED DEFAULT NULL,
  `state_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `street` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state_name` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) NOT NULL,
  `country_name` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `country_id`, `state_id`, `customer_id`, `full_name`, `phone`, `street`, `city`, `state_name`, `postal_code`, `country_name`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 26, 2, 'Akshay kumar', '7982487847', 'madangir', 'noida', NULL, '110883', NULL, 1, '2026-04-24 02:48:44', '2026-04-24 02:48:44'),
(2, 1, 10, 3, 'Akshay kumar', '9667796371', 'madangir', 'madangir', NULL, '110062', NULL, 1, '2026-04-27 01:25:47', '2026-04-27 01:25:47');

-- --------------------------------------------------------

--
-- Table structure for table `attributes`
--

CREATE TABLE `attributes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attributes`
--

INSERT INTO `attributes` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Material', '2026-04-24 02:19:01', '2026-04-24 02:19:01'),
(2, 'Color', '2026-04-24 02:20:08', '2026-04-24 02:20:08'),
(3, 'Diamond', '2026-04-24 02:21:03', '2026-04-24 02:21:03'),
(4, 'Metal', '2026-04-27 06:42:08', '2026-04-27 06:42:08');

-- --------------------------------------------------------

--
-- Table structure for table `attribute_values`
--

CREATE TABLE `attribute_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attribute_id` bigint(20) UNSIGNED NOT NULL,
  `value` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attribute_values`
--

INSERT INTO `attribute_values` (`id`, `attribute_id`, `value`, `created_at`, `updated_at`) VALUES
(1, 1, 'stainless steel', '2026-04-24 02:19:01', '2026-04-24 02:19:01'),
(2, 2, 'Yellow', '2026-04-24 02:20:08', '2026-04-24 02:20:08'),
(3, 2, 'White', '2026-04-24 02:20:08', '2026-04-24 02:20:08'),
(4, 3, 'Lab grown', '2026-04-24 02:21:03', '2026-04-24 02:21:03'),
(5, 3, 'Moissanite', '2026-04-24 02:21:03', '2026-04-24 02:21:03'),
(6, 4, '14KT Solid Gold', '2026-04-27 06:42:08', '2026-04-27 06:42:08'),
(7, 4, '18KT Solid Gold', '2026-04-27 06:42:09', '2026-04-27 06:42:09'),
(8, 4, '925 Sterling Silver', '2026-04-27 06:42:09', '2026-04-27 06:42:09'),
(9, 2, 'Pink', '2026-04-27 06:51:27', '2026-04-27 06:51:27'),
(10, 2, 'Silver', '2026-04-27 06:51:27', '2026-04-27 06:51:27');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `model_type` varchar(255) DEFAULT NULL,
  `model_id` varchar(255) DEFAULT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes`)),
  `ip_address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `cta_text` varchar(255) DEFAULT NULL,
  `cta_link` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `video_path` varchar(255) DEFAULT NULL,
  `position` enum('top','middle','sidebar','footer') NOT NULL DEFAULT 'top',
  `device` enum('all','desktop','mobile') NOT NULL DEFAULT 'all',
  `page_type` varchar(255) DEFAULT NULL,
  `page_id` bigint(20) UNSIGNED DEFAULT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `title`, `subtitle`, `cta_text`, `cta_link`, `image_path`, `video_path`, `position`, `device`, `page_type`, `page_id`, `start_date`, `end_date`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Home banner', 'This Mother\'s Day', 'EXPLORE COLLECTION', '/products', 'media/4nAfpafgpEkBzodbwUSIvBKDv5huCZMCbyzXLUPE.webp', NULL, 'top', 'desktop', 'index', 6, NULL, NULL, 1, 1, '2026-04-24 03:56:10', '2026-04-30 01:18:12'),
(2, 'Timeless Elegance, Crafted for You.', 'Discover the ultimate expression of luxury with our meticulously handcrafted jewelry pieces.', 'EXPLORE COLLECTION', '/products', 'media/f9TzesSZuzIpXrGctas7Xq93spUjo2YYNYIpo0vr.jpg', NULL, 'top', 'all', 'index', 5, NULL, NULL, 0, 1, '2026-04-27 00:58:26', '2026-04-27 01:40:32'),
(3, 'About Us', 'This Mother\'s Day', 'Shop Now', '/products', 'media/f9TzesSZuzIpXrGctas7Xq93spUjo2YYNYIpo0vr.jpg', NULL, 'top', 'all', NULL, 1, NULL, NULL, 0, 1, '2026-04-30 00:50:25', '2026-04-30 00:50:25'),
(4, 'Blog', 'Stories of craftsmanship, jewelry trends, and the lifestyle of the modern collector.', NULL, NULL, 'media/f9TzesSZuzIpXrGctas7Xq93spUjo2YYNYIpo0vr.jpg', NULL, 'top', 'all', '', 6, NULL, NULL, 0, 1, '2026-04-30 01:16:28', '2026-04-30 01:30:16');

-- --------------------------------------------------------

--
-- Table structure for table `blog_categories`
--

CREATE TABLE `blog_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_categories`
--

INSERT INTO `blog_categories` (`id`, `name`, `slug`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Jewelry Trends', 'jewelry-trends', 'Latest trends in luxury jewelry', 1, '2026-04-29 07:48:47', '2026-04-29 07:48:47');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `author_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `featured_image` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `schema_markup` longtext DEFAULT NULL,
  `status` enum('draft','published','scheduled') NOT NULL DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `category_id`, `author_id`, `title`, `slug`, `summary`, `content`, `featured_image`, `meta_title`, `meta_description`, `meta_keywords`, `schema_markup`, `status`, `published_at`, `is_featured`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Diamond Jewellery Care Tips: Make Your Sparkle Last Forever', 'the-art-of-layering-gold-chains-pendants', 'Master the trend of layering delicate gold chains for a sophisticated daily look.', '<p><strong>Diamond jewellery</strong> has always held a special place in people’s hearts. More than just accessories, these pieces are symbols of love, milestones, and sometimes even heirlooms that pass from one generation to the next.&nbsp;</p><p>Whether it’s a pair of elegant <strong>diamond earrings gifted</strong> on an anniversary, a solitaire engagement ring marking the promise of forever, or a diamond necklace that adds a touch of luxury to a bridal outfit, every piece carries emotions that go far beyond its sparkle.</p><p>But while diamonds are known as the hardest natural material on earth, <strong>diamond jewellery</strong> still needs attention and care. The diamonds may remain unscathed, but the settings, whether crafted in gold, platinum, or silver, are more delicate and prone to scratches, dirt, and loosening.&nbsp;</p><p>Without proper care, even the most exquisite fine <strong>diamond jewellery </strong>can lose its brilliance over time. That’s why following consistent diamond jewellery care tips is so important. With the right habits, your <strong>diamond pieces</strong> can shine just as brightly decades later as the day you first wore them.</p><h2><strong>Why Diamond Jewellery Needs Proper Care</strong></h2><p>Diamonds may be indestructible in many ways, but diamond ornaments are still vulnerable. The sparkle that makes them irresistible can easily get clouded by oils from your skin, makeup residue, lotions, or even everyday dust. Over time, this dull layer can block light from entering the stone, reducing its fire and brilliance.</p><p>More importantly, the metals that hold your diamonds, whether it’s white gold, yellow gold, platinum, or silver are not as durable as the stones themselves. These settings can bend, scratch, or weaken with frequent wear, making it possible for a diamond to loosen or even fall out. That’s why <strong>diamond jewellery</strong> maintenance is not only about preserving beauty but also about protecting your investment and emotional attachment.</p><h2><strong>Daily Diamond Jewellery Care Tips</strong></h2><p>One of the simplest ways to ensure long-term sparkle is by developing daily habits for proper care.</p><p><strong>Remove before physical activity</strong>: Whether you’re at the gym, swimming, or doing household chores, it’s best to take off your rings, bracelets, or bangles. Chemicals in chlorine pools, detergent, or even sweat can damage the metal and reduce shine.</p><p><strong>Handle with care</strong>: Always hold rings or necklaces by their band or chain rather than the stone. This prevents oils from your fingers from transferring to the diamonds.</p><p><strong>Wipe after wearing</strong>: A quick wipe with a clean, soft, lint-free cloth can remove surface oils and dirt before they build up.</p><p>These simple daily care practices for diamond jewellery don’t take much effort but make a huge difference in maintaining that natural sparkle.</p><h2><strong>How to Clean Diamond Jewellery at Home</strong></h2><p>Cleaning diamond jewellery at home is easy if done correctly. All you need are a few safe household items:</p><p><strong>Prepare a solution</strong>: Mix lukewarm water with a few drops of mild dish soap.</p><p><strong>Soak the jewellery</strong>: Place your diamond rings, earrings, or necklaces in the solution for about 15–20 minutes.</p><p><strong>Brush gently</strong>: Use a very soft-bristled toothbrush to clean around the prongs, under the diamond, and in small crevices. Avoid scrubbing too hard.</p><p><strong>Rinse well</strong>: Wash with clean lukewarm water to remove all soap.</p><p><strong>Dry carefully</strong>: Pat dry with a soft lint-free cloth.</p><p><strong>What to avoid:</strong> Harsh chemicals like bleach, acetone, or toothpaste should never be used. They can erode metal and leave scratches. Ultrasonic cleaning machines are also risky for delicate settings like pavé or halo designs, as the vibrations may loosen smaller diamonds.</p><p>These steps are the best way to clean diamond jewellery at home without risking damage.</p><h2><strong>Professional Diamond Jewellery Cleaning &amp; Inspection</strong></h2><p>While at-home care keeps jewellery looking fresh, nothing beats the expertise of a professional jeweller. Professional diamond jewellery cleaning uses specialized equipment that restores brilliance without harming delicate settings.</p><p>It’s recommended to have your fine diamond jewellery inspected and cleaned professionally every <strong>6–12 months</strong>. During these check-ups, jewellers ensure that prongs are secure, clasps are working properly, and no diamonds are at risk of falling out.</p><p>If you wear <strong>engagement diamond rings</strong> or bridal diamond jewellery daily, scheduling these professional check-ups becomes even more important. They’re not just about cleaning they help maintain the structural integrity of your precious adornments.</p><h2><strong>How to Store Diamond Jewellery Safely</strong></h2><p>Storage is another vital part of diamond jewellery care. When stored improperly, even the hardest stones can scratch other precious pieces.</p><p><strong>Use separate compartments</strong>: A jewellery box with fabric-lined compartments ensures pieces don’t rub against each other.</p><p><strong>Store in soft pouches</strong>: Diamond earrings, bracelets, or rings can be kept in velvet or satin pouches for added protection.</p><p><strong>Travel with care</strong>: For trips, use a dedicated jewellery travel case with padded slots to keep each piece safe.</p><p>Knowing how to store diamond jewellery correctly prevents unnecessary scratches and keeps your collection sparkling for years.</p><h2><strong>Dos and Don’ts of Diamond Jewellery Care</strong></h2><p>A few golden rules can make all the difference:</p><p><strong>Dos</strong>:</p><ul><li>Clean your diamond jewellery regularly with mild soap and water.</li><li>Check prongs, clasps, and settings frequently.</li><li>Remove before swimming, exercising, or cleaning with chemicals.</li></ul><p><strong>Don’ts</strong>:</p><ul><li>Don’t wear your diamond pieces during rough physical activities.</li><li>Don’t expose jewellery to chlorine, bleach, or harsh cleaning products.</li><li>Don’t store all diamond jewellery together in one box.</li></ul><p>Following these diamond jewellery care tips ensures your accessories remain just as beautiful as the day you bought them.</p><h2><strong>Common Mistakes People Make with Diamond Jewellery</strong></h2><p>Even with the best intentions, certain habits can damage jewellery over time.</p><p><strong>Wearing jewellery daily without cleaning</strong>: Oils and dirt accumulate faster than you think.</p><p><strong>Ignoring loose stones</strong>: Small movements in prongs may eventually lead to lost diamonds.</p><p><strong>Mixing storage with other jewellery</strong>: A diamond bracelet rubbing against softer gemstones or gold chains can cause scratches.</p><p>Avoiding these common mistakes with diamond jewellery helps you protect both its value and sentiment.</p><h2><strong>Long-Term Care for Diamond Jewellery</strong></h2><p>Long-term diamond jewellery care goes beyond daily cleaning.</p><p><strong>Annual professional check-ups</strong>: Regular inspections detect early issues before they become costly repairs.</p><p><strong>Resizing and re-polishing</strong>: Over time, rings may need resizing, and metal bands may benefit from professional polishing.</p><p><strong>Insurance for valuable pieces</strong>: For high-value items such as certified diamond jewellery, designer diamond jewellery, or luxury diamond jewellery, insurance offers peace of mind against theft or loss.</p><p>This approach ensures your fine <strong>diamond jewellery</strong> remains secure, polished, and ready to pass down as an heirloom.</p><h2><strong>Conclusion</strong></h2><p><strong>Diamond jewellery</strong> is more than just a precious adornment; it\'s a reflection of love, milestones, and cherished memories. From engagement rings that mark the beginning of forever to heirloom <strong>diamond necklaces</strong> passed down through generations, every piece deserves the care that matches its value. With regular cleaning, safe storage, and timely professional check-ups, your jewellery can retain its brilliance for decades to come.</p><p>Remember, even the hardest diamond needs attention to keep its sparkle alive. By avoiding common mistakes and following these simple <strong>diamond jewellery</strong> care tips, you’re not just preserving beauty you’re protecting memories and ensuring they shine bright for future generations.</p><p>At <strong>Dope Jewells</strong>, we believe every diamond deserves to shine at its best. Whether you need professional diamond jewellery cleaning, guidance on long-term care, or are looking to add a certified, luxury diamond piece to your collection, we’re here to help.</p><p>Take the next step, give<strong> your jewellery the care it deserves or find your next timeless piece at</strong> <strong>Dope Jewells.</strong></p><h2><strong>Frequently Asked Questions (FAQs)</strong></h2><p><strong>1. How often should you clean diamond jewellery?</strong></p><p><strong>Answer: </strong>At home, once every two weeks is ideal. Professional cleaning every 6–12 months keeps it in top condition.</p><p><strong>2. Can I use toothpaste to clean diamond jewellery?</strong></p><p><strong>Answer: </strong>No. Toothpaste is abrasive and can scratch metals and settings. Stick to mild soap and water.</p><p><strong>3. What’s the best way to store diamond jewellery?</strong></p><p><strong>Answer: </strong>Use a fabric-lined jewellery box with separate compartments or soft pouches to prevent scratches.</p><p><strong>4. How do I know if my diamond jewellery needs professional cleaning?</strong></p><p><strong>Answer: </strong>If your jewellery looks dull despite regular cleaning, or if you notice loose stones or worn prongs, it’s time for a professional inspection.</p>', 'media/4LwanvQ724CtuYYFgTUC07rsu1t2HQi77TZDchfh.jpg', 'DOPE JEWELLS | Luxury Gold & Diamond Jewellery Online', 'DOPE JEWELLS | Luxury Gold & Diamond Jewellery Online', 'Shop luxury gold and diamond jewellery at DOPE JEWELLS. Discover handcrafted designs, bridal collections, and certified fine jewellery with timeless elegance.', '<script type=\"application/ld+json\">\r\n{\r\n  \"@context\": \"https://schema.org\",\r\n  \"@type\": \"JewelryStore\",\r\n  \"name\": \"DOPE JEWELLS\",\r\n  \"url\": \"{{ url(\'/\') }}\",\r\n  \"logo\": \"{{ asset(\'logo.png\') }}\",\r\n  \"description\": \"DOPE JEWELLS offers premium handcrafted gold and diamond jewellery with certified quality and timeless elegance.\",\r\n  \"address\": {\r\n    \"@type\": \"PostalAddress\",\r\n    \"addressCountry\": \"IN\"\r\n  },\r\n  \"sameAs\": [\r\n    \"https://www.instagram.com/yourpage\",\r\n    \"https://www.facebook.com/yourpage\"\r\n  ]\r\n}\r\n</script>', 'published', '2026-04-29 07:48:00', 1, '2026-04-29 07:48:47', '2026-04-30 05:31:17'),
(2, 1, 1, 'How Minimalist Diamond Jewellery Is Taking Over Everyday Fashion', 'minimalist-diamond-jewellery-everyday-fashion', 'A comprehensive guide to selecting a diamond ring that reflects your unique love story.', '<p>Fashion has always evolved with the times, but one shift stands out today more than ever the move towards minimalism. The world is embracing simplicity, clean design, and effortless elegance. Heavy, ornate jewellery that once dominated special occasions is gradually giving way to lightweight and versatile pieces. <strong>Diamond jewellery</strong>, in particular, has found its place in everyday fashion, not through grandeur but through sleek, modern minimalism. The rise of <strong>minimalist diamond jewellery</strong> is redefining how women and men alike style themselves for work, casual outings, and even evening events. By blending subtlety with sparkle, this trend proves that luxury can be understated, wearable, and timeless.</p><h2><strong>The Shift Towards Minimalism in Fashion</strong></h2><p>Across global fashion runways and street styles, the emphasis has moved from excess to essentials. Minimalist accessories reflect a lifestyle choice where less is more and subtlety speaks volumes. Professionals, millennials, and Gen Z are especially drawn to this change because it aligns with their fast-paced lives and desire for <strong>effortless chic jewellery</strong>. Minimal designs are not only aesthetically pleasing but also highly versatile. A simple <strong>diamond pendant necklace</strong> or a pair of <strong>dainty diamond earrings</strong> can transition seamlessly from an office boardroom to a relaxed dinner with friends. This balance between simplicity and sophistication is why <strong>modern diamond jewellery</strong> resonates so strongly with younger generations.</p><h2><strong>What Makes Minimalist Diamond Jewellery Special?</strong></h2><p>Minimalist jewellery highlights craftsmanship and clarity rather than heavy embellishments. Pieces are designed with <strong>clean lines, delicate settings, and timeless beauty</strong>. A small solitaire pendant, a pair of classic diamond studs, or <strong>stackable diamond rings</strong> each carry a subtle elegance that doesn’t overpower but enhances any outfit. The value of diamonds remains unchanged; they continue to symbolize love, success, and sophistication. However, their form has shifted. Rather than being reserved for weddings or special occasions, <strong>everyday diamond jewellery</strong> has become the norm, appealing to those who prefer wearable luxury.</p><h2><strong>Everyday Fashion Meets Diamond Jewellery</strong></h2><p>Styling diamonds no longer requires a grand event. Minimalist pieces have made it easy to incorporate diamonds into <strong>daily wear</strong>: <strong>Office Wear:</strong> Sleek studs, fine diamond pendants, or <strong>minimalist diamond earrings</strong> add a professional polish without being flashy. <strong>Casual Outfits:</strong> Thin <strong>stackable rings</strong> or a dainty bracelet pair perfectly with jeans, summer dresses, or smart casuals. <strong>Evening Looks:</strong> Layered <strong>minimalist diamond necklaces</strong> or <strong>contemporary solitaire jewellery</strong> bring understated glamour to night-outs or dinners. The versatility of these designs is why <strong>fine jewellery for modern women</strong> is no longer locked inside lockers, waiting for weddings. Instead, diamonds are part of <strong>everyday fashion accessories, elegant</strong>, wearable, and meaningful.</p><h2><strong>Why Millennials &amp; Gen Z Prefer Minimalist Diamond Jewellery</strong></h2><p>The younger generation has redefined the meaning of luxury. Rather than indulging in bulky, traditional pieces, they prefer jewellery that complements their lifestyles. The reasons are clear: <strong>Affordability &amp; Accessibility:</strong> Minimalist designs often cost less than heavy traditional jewellery, making <strong>affordable diamond jewellery</strong> more accessible. <strong>Sustainability:</strong> With the rise of <strong>lab-grown diamond jewellery</strong> and <strong>sustainable diamond jewellery</strong>, conscious buyers are choosing ethical options. <strong>Functionality:</strong> Lightweight designs suit daily commutes, work meetings, and casual hangouts. <strong>Fashion Influence:</strong> Social media trends, especially on Instagram and TikTok, celebrate <strong>minimalist fashion accessories</strong>, showing that <strong>everyday diamond jewellery</strong> is not only stylish but aspirational. This is why <strong>diamond jewellery for millennials and Gen Z</strong> has moved from being a luxury purchase to a lifestyle essential.</p><h2><strong>Popular Minimalist Diamond Jewellery Styles in 2025</strong></h2><p>Fashion-forward individuals in 2025 are gravitating towards specific styles that balance elegance with simplicity: <strong>Diamond Studs &amp; Solitaire Earrings:</strong> Perfect for both professional and casual wear. <strong>Dainty Diamond Pendants:</strong> Simple necklaces with a single stone remain timeless. <strong>Minimalist Engagement Rings:</strong> Sleek bands with delicate stones reflect understated romance. <strong>Stackable Diamond Rings &amp; Bracelets:</strong> Allow versatility in styling while keeping it chic. <strong>Lightweight Diamond Necklaces:</strong> Everyday wear pieces designed for layering and styling flexibility. These pieces aren’t just accessories; they represent a lifestyle shift toward <strong>luxury made simple</strong>.</p><h2><strong>Benefits of Investing in Minimalist Diamond Jewellery</strong></h2><p>Minimalist designs carry more than just beauty. They represent value and practicality: <strong>Timeless Appeal:</strong> Diamonds never go out of style, regardless of trends. <strong>Every Occasion Ready:</strong> Whether office, casual, or evening, they fit seamlessly. <strong>Effortless Elegance:</strong> They enhance the outfit without stealing the spotlight. <strong>Smart Investment:</strong> Lightweight yet durable, minimalist jewellery ensures long-term usage. Unlike traditional heavy sets that are reserved for festivals or weddings, <strong>minimalist diamond jewellery</strong> becomes part of everyday fashion, maximizing wearability and return on investment.</p><h2><strong>How to Choose Minimalist Diamond Jewellery for Everyday Fashion</strong></h2><p>When shopping for minimalist designs, consider these tips: <strong>Cut &amp; Clarity:</strong> For smaller stones, brilliance matters more than size. <strong>Carat Balance:</strong> Opt for subtle carats that are budget-friendly yet impactful. <strong>Versatility:</strong> Choose designs like studs, pendants, or slim rings that match multiple outfits. <strong>Personal Style:</strong> Whether you prefer <strong>dainty diamond rings</strong> or <strong>sleek pendants</strong>, choose pieces that reflect your personality. For everyday wear, pieces should be lightweight, easy to maintain, and comfortable for long hours, making them ideal as <strong>fashion-forward diamond trends</strong>.</p><h2><strong>The Future of Diamond Jewellery in Everyday Fashion</strong></h2><p>The future of <strong>contemporary diamond jewellery</strong> is deeply tied to sustainability, personalization, and technology. <strong>Lab-grown diamonds</strong> are becoming increasingly popular, offering the same sparkle as mined stones but with an ethical edge. Customization is also on the rise, with individuals preferring jewellery that reflects their identity. Technology is transforming shopping experiences too, with virtual try-ons and AR tools allowing customers to visualize <strong>dainty diamond designs</strong> before purchase. The combination of sustainability, style, and tech ensures that <strong>diamond jewellery for everyday wear</strong> will continue to dominate in the years ahead.</p><h2><strong>Conclusion</strong></h2><p>Minimalist jewellery is not a passing trend, it\'s a fashion evolution. By combining the timeless allure of diamonds with clean, modern designs, this movement has made diamonds more approachable, versatile, and wearable. <strong>Minimalist diamond jewellery</strong> embodies luxury without excess, fitting seamlessly into the wardrobes of professionals, millennials, and Gen Z alike. As the world embraces <strong>everyday diamond jewellery</strong>, pieces like <strong>solitaire earrings, stackable rings, dainty pendants, and sustainable designs</strong> are leading the way. Fashion today is about expressing individuality with elegance, and nothing captures that balance better than the simplicity of diamonds. For those who want to elevate their daily outfits with a touch of understated brilliance, the future of fashion lies in the timeless charm of minimalist diamonds. <strong>Minimalist diamond jewellery</strong> is redefining everyday fashion, elegant, versatile, and timeless. From dainty rings to sleek pendants, each piece adds effortless charm to your daily look. Find your perfect match at <strong>Dope Jewells</strong> and let simplicity shine brighter.</p><h2><strong>Frequently Asked Questions (FAQ)</strong></h2><h4><strong>1. What diamond jewellery styles are trending right now?</strong></h4><p><strong>Answer:</strong> Searches show growing interest in <strong>minimalist diamond jewellery</strong> for everyday wear, think subtle studs, thin stacking rings, and sleek pendants. Jewelry news highlights evolving trends toward wearable sparkle integrated into casual outfits.</p><h4><strong>2. Are lab-grown diamonds becoming more popular than natural diamonds?</strong></h4><p><strong>Answer:</strong> Lab-grown diamonds are on the rise projected to drive significant market share and gaining traction due to their ethical appeal and affordability. Search interest in lab-grown diamond jewellery is notably increasing.</p><h4><strong>3. What are the most searched types of diamond jewellery?</strong></h4><p><strong>Answer:</strong> Among all jewelry categories, <strong>diamond earrings, necklaces, and rings</strong> dominate search popularity. Notably, “diamond earrings” enjoys high monthly search volumes far above other types.</p><h4><strong>4. How is personalization influencing diamond jewellery trends?</strong></h4><p><strong>Answer:</strong> Searches reflect strong interest in <strong>personalized diamond pieces</strong> including initial pendants, birthstone designs, and bespoke customization options that add emotional value and individuality.</p><h4><strong>5. Which diamond jewellery trends are emerging in 2025?</strong></h4><p><strong>Answer: </strong>Key rising trends include <strong>cluster styles</strong>, <strong>mixed metals</strong>, <strong>minimalist everyday diamonds</strong>, <strong>vintage-inspired cuts</strong>, and a focus on <strong>sustainability and ethical sourcing</strong>.</p>', 'media/sKXQSZ0wypdbU8dpvJeAOT1cPduHWu4HW3XwA68W.jpg', NULL, NULL, NULL, NULL, 'published', '2026-04-29 07:48:00', 1, '2026-04-29 07:48:47', '2026-04-30 00:03:03'),
(3, 1, 1, 'Why Lab-Grown Diamonds Are Redefining Modern Jewellery Trends', 'why-lab-grown-diamonds-are-redefining-modern-jewellery-trends', 'Exploring the beauty and ethical considerations of modern diamond choices.', '<p>The jewellery landscape is undergoing a transformation. No longer confined to traditional expectations, the industry is responding to a new wave of consumers who prioritize <strong>ethics</strong>, <strong>sustainability</strong>, and <strong>authenticity</strong> as much as aesthetics and brilliance. At the heart of this shift is the rise of <strong>lab-grown diamonds</strong> also referred to as <strong>lab-created diamonds</strong>, <strong>man-made diamonds</strong>, <strong>synthetic diamonds</strong>, or <strong>cultured diamonds</strong>. These <strong>laboratory-grown gemstones</strong> are emerging as a powerful force reshaping the very idea of luxury. A combination of science, ethics, and modern style, they are appealing to Gen Z and Millennials who want more than sparkle they want values. Today, what’s precious isn’t just rarity; it’s responsibility. And <strong>lab-fabricated diamonds</strong> are fast becoming the symbol of that conscious choice.</p><h2><strong>What Exactly Are Lab-Grown Diamonds?</strong></h2><p><strong>Lab-grown diamonds</strong> are <strong>chemically, physically, and optically identical</strong> to natural diamonds. The only difference is their origin. Instead of forming under the earth’s crust over billions of years, these diamonds are created in advanced labs using <strong>High Pressure High Temperature (HPHT)</strong> or <strong>Chemical Vapor Deposition (CVD)</strong> methods. Both techniques mimic the natural formation process, delivering diamonds with the same dazzling clarity, cut, and brilliance as their mined counterparts. It’s important to clear the air lab-created diamonds are not imitations. They are not cubic zirconia or rhinestones. These are <strong>real diamonds</strong>, often certified by reputable bodies like <strong>GIA</strong> or <strong>IGI</strong>, and they meet the same standards in carat, cut, color, and clarity.</p><h2><strong>The Shift in Consumer Preferences</strong></h2><p>The definition of luxury is evolving. Modern buyers are far more conscious of how their purchases affect the world.</p><h3><strong>Ethical Choices Drive Demand</strong></h3><p>Today’s jewellery lovers, especially younger consumers, want more than sparkle they demand <strong>conflict-free diamonds</strong>, <strong>responsible sourcing</strong>, and transparency. For many, a diamond that funds war or contributes to ecological damage isn’t just unappealing it’s unacceptable. <strong>Eco-conscious consumers</strong> are increasingly drawn toward options that reduce harm. That’s where <strong>lab-grown diamonds</strong> shine. Free from the moral baggage of traditional mining, they offer a <strong>cleaner, kinder path to elegance</strong>.</p><h3><strong>Gen Z and Millennials Set the Pace</strong></h3><p>This is also a generational change. Gen Z and Millennials the future of luxury are leading the movement toward <strong>sustainable diamonds</strong>. Influenced by social media, ethical values, and environmental awareness, these consumers are turning away from mined stones in favor of <strong>man-made diamonds</strong>. In India and globally, younger buyers are investing in <strong>modern jewellery</strong> that reflects both their personality and principles.</p><h2><strong>Why Lab-Grown Diamonds Are Reshaping Jewellery Trends</strong></h2><h3><strong>Sustainability &amp; Environmental Impact</strong></h3><p>Mining diamonds comes at a high environmental cost, land degradation, water waste, carbon emissions, and destroyed ecosystems. In contrast, <strong>lab-grown diamonds</strong> drastically reduce these impacts.</p><ul><li>Up to 60% less energy consumption</li><li>No habitat destruction</li><li>Significantly lower water usage</li><li><strong>Carbon-neutral jewellery</strong> possibilities</li></ul><p>This makes <strong>lab-created diamonds</strong> the go-to option for buyers who prioritize the planet.</p><h3><strong>Ethical Sourcing &amp; Transparency</strong></h3><p>No more wondering where a diamond came from. With <strong>lab-grown stones</strong>, traceability is built-in. From the lab to the showroom, every step is <strong>transparent</strong>. They’re <strong>conflict-free</strong>, untainted by human rights violations, and made without the exploitation often linked to mining operations. In a world demanding accountability, this matters deeply.</p><h3><strong>Affordability Without Compromise</strong></h3><p>Lab-fabricated diamonds typically cost <strong>20–40% less</strong> than their mined equivalents. That means consumers can invest in <strong>larger, higher-quality stones</strong> or <strong>custom jewellery</strong> without stretching their budget. This accessibility is redefining what luxury means <strong>fine jewellery</strong> can now be both high-end and value-driven.</p><h3><strong>Design Innovation &amp; Creative Freedom</strong></h3><p>With the availability of consistently high-quality stones, designers have the freedom to <strong>experiment with bold, unique creations</strong>. From <strong>minimalist jewellery</strong> to dramatic <strong>bridal sets</strong>, the possibilities are endless. <strong>Lab-grown diamonds</strong> empower jewellers to break away from conventional constraints and create pieces that are imaginative, sustainable, and entirely modern.</p><h2><strong>Aligning With Modern Jewellery Trends</strong></h2><p>Across the world, <strong>lab-created diamonds</strong> are finding their place in some of the most important jewellery trends of our time.</p><h3><strong>Minimalist and Gender-Neutral Designs</strong></h3><p>Today’s consumers are embracing subtle elegance. Whether it’s a <strong>clean diamond ring</strong>, a <strong>gender-fluid bracelet</strong>, or a <strong>simple necklace</strong>, the trend leans toward timeless pieces with emotional depth. <strong>Lab-grown stones</strong> naturally fit into these trends with their understated brilliance and contemporary feel.</p><h3><strong>Conscious Luxury</strong></h3><p>Luxury no longer means excess, it means integrity. From <strong>recycled gold</strong> to <strong>eco-conscious gemstones</strong>, consumers are choosing items that align with their values. <strong>Cultured diamonds</strong> speak directly to this audience.</p><h3><strong>Technology Meets Artistry</strong></h3><p>Jewellery is now a blend of science and craftsmanship. <strong>High-tech gemstones</strong>, like synthetic diamonds and <strong>moissanite</strong>, reflect an era where technology enhances beauty. <strong>Lab-grown diamonds</strong>, born in cutting-edge labs, are the epitome of this fusion.</p><h3><strong>Customisation is King</strong></h3><p>Custom <strong>engagement rings</strong> and <strong>personalised jewellery</strong> are no longer a niche they’re mainstream. Since lab-created diamonds are more affordable, they enable customisation without compromise, leading to pieces that feel deeply personal and truly one-of-a-kind.</p><h2><strong>Breaking the Myths Around Lab-Grown Diamonds</strong></h2><p>Despite growing popularity, myths persist. Let’s address them.</p><h3><strong>Myth 1: They’re Not Real Diamonds</strong></h3><p>False. Lab-created diamonds are <strong>real diamonds</strong>, identical in every measurable way structure, brilliance, and composition.</p><h3><strong>Myth 2: They’re Low Quality</strong></h3><p>Also false. Lab-grown diamonds can achieve equal or better grades than natural ones in clarity, cut, and color. In fact, many high-end pieces use <strong>engineered diamonds</strong> specifically for their quality control.</p><h3><strong>Myth 3: Poor Resale Value</strong></h3><p>While resale dynamics vary, this argument applies to most jewellery not just lab-grown stones. Besides, modern consumers prioritise <strong>style, sustainability</strong>, and <strong>ethics</strong> over resale.</p><h2><strong>Celebrities &amp; Brands Supporting the Movement</strong></h2><p>The global spotlight is turning toward <strong>lab-fabricated diamonds</strong>. Actors, activists, and designers are championing this shift. <strong>Leonardo DiCaprio</strong>, a known investor in ethical diamond ventures, has publicly advocated for <strong>conflict-free alternatives</strong>. <strong>Emma Watson</strong>, known for her sustainable fashion choices, has worn lab-created jewellery on red carpets. Top brands are also taking a stand. Several designer houses now include <strong>lab-grown stones</strong> in their <strong>fine jewellery</strong> lines, reflecting rising demand among conscious consumers. In India, platforms like <strong>Dope Jewells</strong> are leading this ethical revolution, offering a premium yet sustainable alternative to traditional diamond jewellery.</p><h2><strong>The Future of Lab-Grown Diamonds in Fine Jewellery</strong></h2><p>The numbers speak for themselves. The <strong>lab-grown diamond market</strong> is expected to reach <strong>$55 billion globally by 2030</strong>, with India playing a significant role in both production and consumption. More than a trend, this is a movement. From <strong>custom bridal jewellery</strong> to <strong>daily wear rings</strong>, lab-created stones are becoming the preferred choice for those who want it all <strong>beauty, ethics, and value</strong>. Major cities like Mumbai, Delhi, Bangalore, and Hyderabad are witnessing a steady rise in demand for <strong>GIA-certified lab diamonds</strong> and sustainable jewellery options. This shift is not just in consumer sentiment, but across the entire <strong>jewellery supply chain</strong>, from manufacturing to retail.</p><h2><strong>Conclusion: The Diamond of the Future</strong></h2><p>As the world evolves, so do the values that define luxury. <strong>Lab-grown diamonds</strong> offer everything today’s buyer seeks <strong>sophistication</strong>, <strong>responsibility</strong>, and <strong>individual expression</strong>. They are the embodiment of what modern jewellery stands for <strong>ethical sourcing</strong>, <strong>technological innovation</strong>, and <strong>conscious elegance</strong>. No longer seen as secondary to mined diamonds, they now lead the narrative in <strong>fashion-forward jewellery</strong>. Whether you’re planning a <strong>proposal</strong>, gifting a <strong>designer ring</strong>, or investing in a <strong>statement piece</strong>, <strong>lab-created diamonds</strong> present a future-forward choice where you don’t have to choose between beauty and responsibility. At <strong>Dope Jewells</strong>, every lab-grown diamond tells a story not just of love or celebration but of <strong>values</strong>, <strong>progress</strong>, and <strong>planet-first luxury</strong>.</p>', 'media/MSnSM4NTyvnxTAyam4HI0URfLO5jq2z0JHjhOp3B.jpg', NULL, NULL, NULL, NULL, 'published', '2026-04-29 07:48:00', 1, '2026-04-29 07:48:47', '2026-04-30 00:06:48'),
(4, 1, 1, 'Diamond Bracelets That Add Timeless Elegance to Any Look', 'diamond-bracelets-timeless-elegance', 'Expert tips on cleaning and storing your precious pieces to ensure they last for generations.', '<p>A diamond bracelet is more than just an accessory; it\'s a signature of grace, elegance, and enduring style. Whether worn alone or layered with other fine pieces, <strong>diamond bracelets</strong> have long held their place as cherished essentials in every <strong>woman’s jewellry collection</strong>. From understated minimalist wrist wear to eye-catching <strong>luxury designs</strong>, these timeless pieces are crafted to complement any outfit, making them perfect for both everyday luxury and the most special occasions. The appeal of <strong>diamond bracelets</strong> lies not just in their sparkle, but in the craftsmanship, sentiment, and versatility they carry. They elevate a simple ensemble, add shine to formal wear, and bring timeless sophistication to traditional outfits. With a variety of styles and materials to choose from such as <strong>real diamond bracelets</strong>, <strong>elegant diamond bangles</strong>, or even <strong>custom-made designs</strong> the possibilities are endless for those seeking refined wrist jewelry that truly stands out.</p><h2><strong>Why Diamond Bracelets Never Go Out of Style</strong></h2><p>For centuries, diamonds have symbolized love, power, and eternity. When crafted into bracelets, they become personal symbols of legacy and grace. <strong>Timeless diamond bracelets</strong> have remained a staple in both royal collections and modern fashion for good reason they never bow to passing trends. Whether gifted during milestones or passed down through generations, these <strong>evergreen jewelry pieces</strong> maintain their allure across decades. Their universal appeal makes them relevant in every era from the roaring ‘20s to the sleek styles of 2025. And while fashion evolves, the brilliance of diamonds doesn’t fade. The clean design of a tennis bracelet or the boldness of a diamond cuff can pair as effortlessly with a silk saree as they can with a power suit or a cocktail dress. This is precisely why <strong>women’s diamond bracelets</strong> remain as relevant today as ever before.</p><h2><strong>Types of Diamond Bracelets That Elevate Any Outfit</strong></h2><p>The world of diamond bracelets is diverse, offering styles that range from bold to barely-there. Understanding the key types can help you find a bracelet that matches your personal taste and the occasion.</p><h3><strong>Tennis Bracelets</strong></h3><p>These are the most iconic of all. A continuous line of diamonds in a straight, sleek setting perfect for formal occasions or elegant daily wear. Their timeless appeal and secure fit make them a staple in any <strong>fine diamond jewelry</strong> collection.</p><h3><strong>Bangle Diamond Bracelets</strong></h3><p>Solid and circular, <strong>designer diamond bracelets</strong> in bangle form offer a more structured and impactful look. Often worn in pairs or stacks, they work wonderfully for festive events or bridal occasions.</p><h3><strong>Diamond Cuffs</strong></h3><p>Wider and more open-ended than bangles, cuffs offer a modern twist on traditional wristwear. A <strong>diamond cuff</strong> bracelet is perfect for someone who loves to make a statement with bold jewelry pieces.</p><h3><strong>Chain Diamond Bracelets</strong></h3><p>These <strong>dainty diamond wristwear</strong> styles are crafted with linked chains and small diamond accents. Delicate, elegant, and ideal for everyday luxury, especially when paired with other minimalist pieces. These <strong>diamond bracelet styles</strong> cater to all preferences be it bold, classic, or understated ensuring there\'s a perfect fit for everyone.</p><h2><strong>How to Style Diamond Bracelets for Different Occasions</strong></h2><p>A well-chosen diamond bracelet can enhance your look for virtually any occasion. From casual brunches to gala nights, styling these versatile pieces can be both fun and sophisticated.</p><h3><strong>Everyday Elegance</strong></h3><p>Minimalist <strong>gold and diamond bracelets</strong> are perfect for daywear. Pair a sleek tennis bracelet or a light chain design with a crisp white shirt or kurta for an effortless chic look.</p><h3><strong>Office or Business Settings</strong></h3><p>Opt for <strong>fine diamond jewelry</strong> in subtle styles, thin cuffs or delicate bangles in rose gold or platinum. The goal is to add refinement without overpowering your professional attire.</p><h3><strong>Evening &amp; Formal Events</strong></h3><p>Layer multiple bracelets mixing textures and finishes to create depth and glam. <strong>Statement diamond pieces</strong> with bold cuts and settings are ideal for black-tie events or gala dinners.</p><h3><strong>Weddings &amp; Celebrations</strong></h3><p>This is where <strong>bridal diamond accessories</strong> shine. Choose ornate bangles or customized cuffs with traditional motifs. Pair them with matching earrings or a necklace for a regal finish. Whether you’re dressing for everyday or a major celebration, knowing <strong>how to wear diamond bracelets</strong> can transform your outfit. Play with layers, mix metals, or let one striking bracelet stand alone; each approach adds its own kind of magic.</p><h2><strong>What to Look for When Buying a Diamond Bracelet</strong></h2><p>Investing in a diamond bracelet means knowing what makes one piece stand out over another. The right bracelet isn\'t just beautiful, it meets high standards of quality and comfort.</p><h3><strong>Understanding the 4Cs</strong></h3><p>The <strong>cut</strong>, <strong>clarity</strong>, <strong>color</strong>, and <strong>carat</strong> weight define a diamond’s value and brilliance. Look for well-cut stones that sparkle evenly and have minimal inclusions.</p><h3><strong>Choosing the Right Metal</strong></h3><p>Options like <strong>gold, white gold, rose gold</strong>, and <strong>platinum</strong> offer different aesthetics. White gold provides a sleek, modern finish, while yellow gold adds a traditional touch. Rose gold flatters most skin tones, and platinum offers unmatched durability.</p><h3><strong>Fit and Flexibility</strong></h3><p>Always ensure the bracelet sits comfortably on your wrist. Adjustable clasps or flexible chain designs can offer better day-to-day comfort. When making a purchase, a good <strong>buying guide for diamond bracelets</strong> can help you navigate the process and ensure you select a bracelet that meets both your style and quality expectations.</p><h2><strong>Top Trends in Diamond Bracelets in 2025</strong></h2><p>Jewelry trends evolve each year, and 2025 is no exception. Here’s what’s capturing attention this year in the world of <strong>luxury wrist bracelets</strong>.</p><h3><strong>Personalization &amp; Customization</strong></h3><p><strong>Custom diamond bracelets</strong> that reflect personal stories, initials, or birthstones are gaining popularity. They make for meaningful gifts and treasured keepsakes.</p><h3><strong>Minimalist Styles with a Twist</strong></h3><p>Think <strong>minimalist diamond jewelry</strong> with unexpected design elements like asymmetrical shapes or colored diamond accents.</p><h3><strong>Mix of Materials</strong></h3><p>Combining <strong>gold and diamond</strong> with leather, enamel, or even silk threads is in vogue, offering unique textures and contrast.</p><h3><strong>Influencer and Celebrity Picks</strong></h3><p>From Bollywood to global runways, many are gravitating toward <strong>platinum diamond bracelets</strong> and bold cuffs that double as conversation pieces. These <strong>diamond bracelet trends in 2025</strong> reflect a blend of tradition, innovation, and individual expression.</p><h2><strong>Why a Diamond Bracelet is the Perfect Gift</strong></h2><p>Few gifts carry the emotional weight and timelessness of a diamond bracelet. Whether it’s a milestone birthday, an anniversary, or a festive celebration, diamonds express love, appreciation, and commitment. These bracelets are symbolic of relationships, moments, and memories. <strong>Gifting diamond bracelets</strong> can represent a lasting bond, success, or the beginning of something new. Whether you’re choosing something bold or delicate, a <strong>diamond bracelet gift</strong> carries significance far beyond its sparkle.</p><h2><strong>How to Care for and Maintain Diamond Bracelets</strong></h2><p>To keep your bracelet shining for years to come, proper care is essential.</p><h3><strong>Regular Cleaning</strong></h3><p>Soak the bracelet in lukewarm water with a mild soap. Use a soft brush to gently clean the setting and diamonds. Avoid harsh chemicals.</p><h3><strong>Safe Storage</strong></h3><p>Keep your bracelet in a soft-lined box or pouch, separate from other jewelry to avoid scratches.</p><h3><strong>Professional Maintenance</strong></h3><p>Have your bracelet inspected by a professional every 12–18 months. They can check for loose stones, worn prongs, or any necessary repairs. Knowing <strong>how to clean a diamond bracelet</strong> and maintain its shine ensures your investment continues to look as beautiful as the day you received it.</p><h2><strong>Where to Buy Authentic &amp; Elegant Diamond Bracelets</strong></h2><p>When investing in <strong>authentic diamond bracelets</strong>, it’s important to choose a trusted source that offers certified quality and craftsmanship.</p><h3><strong>Online vs. In-store</strong></h3><p>Online platforms like <strong>DopeJewells.com</strong> offer convenience, competitive pricing, and a wide variety of options. Look for detailed product descriptions, certifications, and flexible return policies. In-store purchases allow you to feel the bracelet and try different fits but make sure the retailer offers certification and buy-back options. When shopping for <strong>diamond bracelets online</strong>, check for hallmarks, certification from bodies like IGI or GIA, and customer testimonials. A well-informed purchase is a confident purchase.</p><h2><strong>Conclusion</strong></h2><p><strong>Diamond bracelets</strong> embody elegance, emotion, and individuality. From classic tennis designs to bold cuffs and dainty chains, there\'s a piece for every personality and occasion. Their beauty lies not just in the diamonds, but in the stories they carry and the memories they help create. Whether you’re looking to elevate your personal style, find the perfect gift, or invest in something meaningful, these bracelets continue to stand the test of time. For those who appreciate craftsmanship, certified quality, and expressive design, <strong>DopeJewells.com</strong> brings a curated collection of <strong>real diamond bracelets</strong> designed for every moment. Let your wrist shine with the brilliance it deserves.</p><h2><strong>FAQs</strong></h2><p><strong>1. How do I choose the right diamond bracelet for daily wear?</strong></p><p><strong>Answer: </strong>When selecting a diamond bracelet for daily use, go for lightweight and sturdy designs like tennis or chain bracelets. Prioritize secure clasps, lower carat stones for comfort, and metals like white gold or platinum for better durability.</p><p><strong>2. What is the difference between a tennis bracelet and a diamond bangle?</strong></p><p><strong>Answer: </strong>A tennis bracelet features a continuous row of diamonds set in a flexible chain, offering a sleek and refined look. A diamond bangle, on the other hand, is a solid circular bracelet often more structured and bold, suitable for traditional and festive wear.</p><p><strong>3. Are diamond bracelets a good gift for special occasions?</strong></p><p><strong>Answer: </strong>Yes, diamond bracelets are ideal for birthdays, anniversaries, weddings, and milestone achievements. Their timeless elegance and emotional significance make them meaningful, long-lasting gifts for loved ones.</p><p><strong>4. How can I verify if my diamond bracelet is authentic?</strong></p><p><strong>Answer: </strong>Always ask for a certificate of authenticity from reputed labs like IGI or GIA. Check for hallmarking on the metal and buy only from trusted jewelers or platforms that provide certified <strong>real diamond bracelets.</strong></p><p><strong>5. Can diamond bracelets be custom-made to suit personal style?</strong></p><p><strong>Answer: Absolutely. Many jewelers offer custom diamond bracelets where you can choose the metal, diamond shape, setting, and even add personal touches like initials or symbols to create a one-of-a-kind piece.</strong></p>', 'media/woRX1aQHmqb2cZheupaX8GISrrJ8cuKdnCuE8mvs.jpg', NULL, NULL, NULL, NULL, 'published', '2026-04-29 07:48:00', 1, '2026-04-29 07:48:47', '2026-04-30 00:09:38');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `logo_url`, `created_at`, `updated_at`) VALUES
(1, 'General', NULL, '2026-04-24 02:08:04', '2026-04-24 02:08:04');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-app_settings', 'a:7:{s:10:\"site_title\";s:6:\"E Shop\";s:16:\"site_description\";s:245:\"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.\";s:13:\"support_email\";s:17:\"support@eshop.com\";s:9:\"mail_host\";s:16:\"smtp.mailtrap.io\";s:9:\"mail_port\";s:4:\"2525\";s:28:\"global_commission_percentage\";s:2:\"10\";s:15:\"commission_rate\";s:2:\"20\";}', 2092894520);
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-homepage_data', 'a:5:{s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:4:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:5:\"Rings\";s:4:\"slug\";s:5:\"rings\";s:18:\"parent_category_id\";i:1;s:9:\"image_url\";s:43:\"uploads/categories/Bxmj50mzm6Ept9dTdpvA.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:42:53\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:53\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:5:\"Rings\";s:4:\"slug\";s:5:\"rings\";s:18:\"parent_category_id\";i:1;s:9:\"image_url\";s:43:\"uploads/categories/Bxmj50mzm6Ept9dTdpvA.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:42:53\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:53\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:8:\"children\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:0:{}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:8:\"children\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:0:{}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:4;s:4:\"name\";s:8:\"Bracelet\";s:4:\"slug\";s:8:\"bracelet\";s:18:\"parent_category_id\";i:1;s:9:\"image_url\";s:43:\"uploads/categories/cge1P4FGgp8kYSE8ofA7.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:12\";s:10:\"updated_at\";s:19:\"2026-04-27 09:24:49\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:4;s:4:\"name\";s:8:\"Bracelet\";s:4:\"slug\";s:8:\"bracelet\";s:18:\"parent_category_id\";i:1;s:9:\"image_url\";s:43:\"uploads/categories/cge1P4FGgp8kYSE8ofA7.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:12\";s:10:\"updated_at\";s:19:\"2026-04-27 09:24:49\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:8:\"children\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:0:{}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:3;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:5;s:4:\"name\";s:8:\"Necklace\";s:4:\"slug\";s:8:\"necklace\";s:18:\"parent_category_id\";i:6;s:9:\"image_url\";s:43:\"uploads/categories/ozUDb2VEctWVFnwo38qQ.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:41\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:28\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:5;s:4:\"name\";s:8:\"Necklace\";s:4:\"slug\";s:8:\"necklace\";s:18:\"parent_category_id\";i:6;s:9:\"image_url\";s:43:\"uploads/categories/ozUDb2VEctWVFnwo38qQ.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:41\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:28\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:8:\"children\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:0:{}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:16:\"featuredProducts\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:5:{i:0;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:6;s:4:\"name\";s:39:\"Women’s Charming Diamond Necklace Set\";s:4:\"slug\";s:35:\"women-charming-diamond-necklace-set\";s:11:\"description\";s:102:\"<p>A sophisticated necklace featuring a pristine South Sea pearl drop on an 18k yellow gold chain.</p>\";s:10:\"base_price\";s:7:\"3430.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:4:\"5.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:46:26\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:6;s:4:\"name\";s:39:\"Women’s Charming Diamond Necklace Set\";s:4:\"slug\";s:35:\"women-charming-diamond-necklace-set\";s:11:\"description\";s:102:\"<p>A sophisticated necklace featuring a pristine South Sea pearl drop on an 18k yellow gold chain.</p>\";s:10:\"base_price\";s:7:\"3430.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:4:\"5.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:46:26\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";O:16:\"App\\Models\\Brand\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:6:\"brands\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:7:\"General\";s:8:\"logo_url\";N;s:10:\"created_at\";s:19:\"2026-04-24 07:38:04\";s:10:\"updated_at\";s:19:\"2026-04-24 07:38:04\";}s:11:\"\0*\0original\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:7:\"General\";s:8:\"logo_url\";N;s:10:\"created_at\";s:19:\"2026-04-24 07:38:04\";s:10:\"updated_at\";s:19:\"2026-04-24 07:38:04\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:8:\"logo_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:5;s:4:\"name\";s:8:\"Necklace\";s:4:\"slug\";s:8:\"necklace\";s:18:\"parent_category_id\";i:6;s:9:\"image_url\";s:43:\"uploads/categories/ozUDb2VEctWVFnwo38qQ.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:41\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:28\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:5;s:4:\"name\";s:8:\"Necklace\";s:4:\"slug\";s:8:\"necklace\";s:18:\"parent_category_id\";i:6;s:9:\"image_url\";s:43:\"uploads/categories/ozUDb2VEctWVFnwo38qQ.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:41\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:28\";s:16:\"pivot_product_id\";i:6;s:17:\"pivot_category_id\";i:5;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:6;s:11:\"category_id\";i:5;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:6;s:11:\"category_id\";i:5;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:0;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:0:{}s:11:\"\0*\0original\";a:0:{}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:12:\"pivotRelated\";O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";N;s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:0;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:0:{}s:11:\"\0*\0original\";a:0:{}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:7;s:10:\"product_id\";i:6;s:3:\"sku\";s:10:\"SKU-UFE1R0\";s:5:\"price\";s:7:\"2775.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 13:08:18\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:7;s:10:\"product_id\";i:6;s:3:\"sku\";s:10:\"SKU-UFE1R0\";s:5:\"price\";s:7:\"2775.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 13:08:18\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:17;s:10:\"product_id\";i:6;s:3:\"sku\";s:11:\"SKU-UFE1R12\";s:5:\"price\";s:7:\"3430.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 13:08:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:08:18\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:17;s:10:\"product_id\";i:6;s:3:\"sku\";s:11:\"SKU-UFE1R12\";s:5:\"price\";s:7:\"3430.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 13:08:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:08:18\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:18;s:10:\"product_id\";i:6;s:3:\"sku\";s:10:\"SKU-R44J13\";s:5:\"price\";s:6:\"405.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 13:08:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:08:18\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:18;s:10:\"product_id\";i:6;s:3:\"sku\";s:10:\"SKU-R44J13\";s:5:\"price\";s:6:\"405.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 13:08:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:08:18\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:35;s:10:\"product_id\";i:6;s:18:\"attribute_value_id\";i:6;s:9:\"image_url\";s:43:\"uploads/products/6/k4D3WfVtxTj5CzqkehSo.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:08:36\";s:10:\"updated_at\";s:19:\"2026-04-27 13:12:45\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:35;s:10:\"product_id\";i:6;s:18:\"attribute_value_id\";i:6;s:9:\"image_url\";s:43:\"uploads/products/6/k4D3WfVtxTj5CzqkehSo.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:08:36\";s:10:\"updated_at\";s:19:\"2026-04-27 13:12:45\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:36;s:10:\"product_id\";i:6;s:18:\"attribute_value_id\";i:7;s:9:\"image_url\";s:43:\"uploads/products/6/O7BpRRhw98Xo0bcdokiu.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:08:36\";s:10:\"updated_at\";s:19:\"2026-04-27 13:12:45\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:36;s:10:\"product_id\";i:6;s:18:\"attribute_value_id\";i:7;s:9:\"image_url\";s:43:\"uploads/products/6/O7BpRRhw98Xo0bcdokiu.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:08:36\";s:10:\"updated_at\";s:19:\"2026-04-27 13:12:45\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:37;s:10:\"product_id\";i:6;s:18:\"attribute_value_id\";i:8;s:9:\"image_url\";s:43:\"uploads/products/6/urW0VakJyT58iINJ8R2c.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:08:36\";s:10:\"updated_at\";s:19:\"2026-04-27 13:12:45\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:37;s:10:\"product_id\";i:6;s:18:\"attribute_value_id\";i:8;s:9:\"image_url\";s:43:\"uploads/products/6/urW0VakJyT58iINJ8R2c.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:08:36\";s:10:\"updated_at\";s:19:\"2026-04-27 13:12:45\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";s:16:\"pivot_product_id\";i:6;s:12:\"pivot_tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:6;s:6:\"tag_id\";i:1;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:6;s:6:\"tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:0;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:0:{}s:11:\"\0*\0original\";a:0:{}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:12:\"pivotRelated\";O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";N;s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:0;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:0:{}s:11:\"\0*\0original\";a:0:{}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:8;s:4:\"name\";s:26:\"Vintage Cartier Tank Watch\";s:4:\"slug\";s:26:\"vintage-cartier-tank-watch\";s:11:\"description\";s:122:\"<p>An authentic vintage Cartier Tank watch with a classic leather strap and gold-plated case. A true collector\'s item.</p>\";s:10:\"base_price\";s:9:\"350000.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"14.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:46:58\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:8;s:4:\"name\";s:26:\"Vintage Cartier Tank Watch\";s:4:\"slug\";s:26:\"vintage-cartier-tank-watch\";s:11:\"description\";s:122:\"<p>An authentic vintage Cartier Tank watch with a classic leather strap and gold-plated case. A true collector\'s item.</p>\";s:10:\"base_price\";s:9:\"350000.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"14.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:46:58\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";r:312;s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";s:16:\"pivot_product_id\";i:8;s:17:\"pivot_category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:8;s:11:\"category_id\";i:3;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:8;s:11:\"category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:440;s:12:\"pivotRelated\";r:500;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:9;s:10:\"product_id\";i:8;s:3:\"sku\";s:10:\"SKU-5RYL0O\";s:5:\"price\";s:9:\"350000.00\";s:14:\"stock_quantity\";i:13;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:9;s:10:\"product_id\";i:8;s:3:\"sku\";s:10:\"SKU-5RYL0O\";s:5:\"price\";s:9:\"350000.00\";s:14:\"stock_quantity\";i:13;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:27;s:10:\"product_id\";i:8;s:18:\"attribute_value_id\";i:5;s:9:\"image_url\";s:43:\"uploads/products/8/Z1e3K0H0tJu6gGhxSG9c.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:58:15\";s:10:\"updated_at\";s:19:\"2026-04-27 11:58:25\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:27;s:10:\"product_id\";i:8;s:18:\"attribute_value_id\";i:5;s:9:\"image_url\";s:43:\"uploads/products/8/Z1e3K0H0tJu6gGhxSG9c.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:58:15\";s:10:\"updated_at\";s:19:\"2026-04-27 11:58:25\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:28;s:10:\"product_id\";i:8;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";s:43:\"uploads/products/8/9rZxlW1AtRptSdwjv6b2.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:59:24\";s:10:\"updated_at\";s:19:\"2026-04-27 11:59:48\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:28;s:10:\"product_id\";i:8;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";s:43:\"uploads/products/8/9rZxlW1AtRptSdwjv6b2.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:59:24\";s:10:\"updated_at\";s:19:\"2026-04-27 11:59:48\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";s:16:\"pivot_product_id\";i:8;s:12:\"pivot_tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:8;s:6:\"tag_id\";i:1;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:8;s:6:\"tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:1002;s:12:\"pivotRelated\";r:1062;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:8;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:8;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:8;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:1002;s:12:\"pivotRelated\";r:1062;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:9;s:4:\"name\";s:39:\"Mossianite Diamond Luxury Fashion Watch\";s:4:\"slug\";s:19:\"rolex-datejust-gold\";s:11:\"description\";s:265:\"<p>Mossianite Diamond Luxury Fashion Watch Swiss Quartz Movement Stainless Steel Band-the Perfect Fusion of Craftsmanship Sparkle</p><p>Mossianite Diamond Luxury Watch Japanese Quartz Movement Stainless Steel Band Glass Dial Perfect Fusion Craftsmanship Sparkle</p>\";s:10:\"base_price\";s:6:\"699.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"15.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:47:39\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:9;s:4:\"name\";s:39:\"Mossianite Diamond Luxury Fashion Watch\";s:4:\"slug\";s:19:\"rolex-datejust-gold\";s:11:\"description\";s:265:\"<p>Mossianite Diamond Luxury Fashion Watch Swiss Quartz Movement Stainless Steel Band-the Perfect Fusion of Craftsmanship Sparkle</p><p>Mossianite Diamond Luxury Watch Japanese Quartz Movement Stainless Steel Band Glass Dial Perfect Fusion Craftsmanship Sparkle</p>\";s:10:\"base_price\";s:6:\"699.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"15.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:47:39\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";r:312;s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";s:16:\"pivot_product_id\";i:9;s:17:\"pivot_category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:9;s:11:\"category_id\";i:3;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:9;s:11:\"category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:440;s:12:\"pivotRelated\";r:500;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:10;s:10:\"product_id\";i:9;s:3:\"sku\";s:10:\"SKU-F7DGML\";s:5:\"price\";s:9:\"850000.00\";s:14:\"stock_quantity\";i:17;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:10;s:10:\"product_id\";i:9;s:3:\"sku\";s:10:\"SKU-F7DGML\";s:5:\"price\";s:9:\"850000.00\";s:14:\"stock_quantity\";i:17;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:22;s:10:\"product_id\";i:9;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:43:\"uploads/products/9/J1E4iPfB2iFty1OMMRpt.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:38:28\";s:10:\"updated_at\";s:19:\"2026-04-27 11:39:13\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:22;s:10:\"product_id\";i:9;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:43:\"uploads/products/9/J1E4iPfB2iFty1OMMRpt.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:38:28\";s:10:\"updated_at\";s:19:\"2026-04-27 11:39:13\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";s:16:\"pivot_product_id\";i:9;s:12:\"pivot_tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:9;s:6:\"tag_id\";i:1;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:9;s:6:\"tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:1002;s:12:\"pivotRelated\";r:1062;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:9;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:9;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:9;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:1002;s:12:\"pivotRelated\";r:1062;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:3;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:10;s:4:\"name\";s:65:\"1.00ct center soliatare diamond with tiney lab grown diamond Ring\";s:4:\"slug\";s:21:\"platinum-wedding-band\";s:11:\"description\";s:395:\"<p>14KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>18KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>925 sterling silver 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p>\";s:10:\"base_price\";s:6:\"290.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"15.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:47:47\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";i:28;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:10;s:4:\"name\";s:65:\"1.00ct center soliatare diamond with tiney lab grown diamond Ring\";s:4:\"slug\";s:21:\"platinum-wedding-band\";s:11:\"description\";s:395:\"<p>14KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>18KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>925 sterling silver 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p>\";s:10:\"base_price\";s:6:\"290.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"15.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:47:47\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";i:28;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";r:312;s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:5:\"Rings\";s:4:\"slug\";s:5:\"rings\";s:18:\"parent_category_id\";i:1;s:9:\"image_url\";s:43:\"uploads/categories/Bxmj50mzm6Ept9dTdpvA.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:42:53\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:53\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:2;s:4:\"name\";s:5:\"Rings\";s:4:\"slug\";s:5:\"rings\";s:18:\"parent_category_id\";i:1;s:9:\"image_url\";s:43:\"uploads/categories/Bxmj50mzm6Ept9dTdpvA.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:42:53\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:53\";s:16:\"pivot_product_id\";i:10;s:17:\"pivot_category_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:10;s:11:\"category_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:10;s:11:\"category_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:440;s:12:\"pivotRelated\";r:500;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:11;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-H44J10\";s:5:\"price\";s:7:\"2775.00\";s:14:\"stock_quantity\";i:12;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:18\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:11;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-H44J10\";s:5:\"price\";s:7:\"2775.00\";s:14:\"stock_quantity\";i:12;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:18\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:13;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-R44J10\";s:5:\"price\";s:7:\"3430.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 12:17:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:18\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:13;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-R44J10\";s:5:\"price\";s:7:\"3430.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 12:17:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:18\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:14;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-R44J11\";s:5:\"price\";s:6:\"405.00\";s:14:\"stock_quantity\";i:9;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 12:17:19\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:19\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:14;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-R44J11\";s:5:\"price\";s:6:\"405.00\";s:14:\"stock_quantity\";i:9;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 12:17:19\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:19\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:29;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";s:44:\"uploads/products/10/CAjA6Sb8xMZCUa34yDJH.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:29;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";s:44:\"uploads/products/10/CAjA6Sb8xMZCUa34yDJH.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:30;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:44:\"uploads/products/10/Ddi1xN8ntrKtbtX4mod5.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:30;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:44:\"uploads/products/10/Ddi1xN8ntrKtbtX4mod5.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:31;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:10;s:9:\"image_url\";s:44:\"uploads/products/10/Jvt5CFMhE8cYfOZNbOsG.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:31;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:10;s:9:\"image_url\";s:44:\"uploads/products/10/Jvt5CFMhE8cYfOZNbOsG.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";s:16:\"pivot_product_id\";i:10;s:12:\"pivot_tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:10;s:6:\"tag_id\";i:1;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:10;s:6:\"tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:1002;s:12:\"pivotRelated\";r:1062;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:10;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:10;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:10;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:1002;s:12:\"pivotRelated\";r:1062;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:4;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:1;s:4:\"name\";s:12:\"Daniel Klein\";s:4:\"slug\";s:12:\"daniel-klein\";s:11:\"description\";s:306:\"<p>Display: Analogue<br>Movement: Quartz<br>Power source: Battery<br>Dial style: Solid round stainless steel dial<br>Features: Reset Time, Calender<br>Strap style: Brown regular, leather strap with a tang closure<br>Water resistance: 30 m<br>Warranty: 2 years<br>Warranty provided by brand/manufacturer</p>\";s:10:\"base_price\";s:7:\"6600.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"60.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:10;s:10:\"created_at\";s:19:\"2026-04-24 08:08:10\";s:10:\"updated_at\";s:19:\"2026-04-29 12:45:29\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";i:28;s:12:\"tax_group_id\";i:2;s:16:\"is_free_shipping\";i:0;s:15:\"shipping_charge\";s:5:\"50.00\";s:24:\"multiply_shipping_by_qty\";i:1;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:4:\"9.99\";s:6:\"weight\";s:5:\"10.00\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:1;s:4:\"name\";s:12:\"Daniel Klein\";s:4:\"slug\";s:12:\"daniel-klein\";s:11:\"description\";s:306:\"<p>Display: Analogue<br>Movement: Quartz<br>Power source: Battery<br>Dial style: Solid round stainless steel dial<br>Features: Reset Time, Calender<br>Strap style: Brown regular, leather strap with a tang closure<br>Water resistance: 30 m<br>Warranty: 2 years<br>Warranty provided by brand/manufacturer</p>\";s:10:\"base_price\";s:7:\"6600.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"60.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:10;s:10:\"created_at\";s:19:\"2026-04-24 08:08:10\";s:10:\"updated_at\";s:19:\"2026-04-29 12:45:29\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";i:28;s:12:\"tax_group_id\";i:2;s:16:\"is_free_shipping\";i:0;s:15:\"shipping_charge\";s:5:\"50.00\";s:24:\"multiply_shipping_by_qty\";i:1;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:4:\"9.99\";s:6:\"weight\";s:5:\"10.00\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";r:312;s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";s:16:\"pivot_product_id\";i:1;s:17:\"pivot_category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:1;s:11:\"category_id\";i:3;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:1;s:11:\"category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:440;s:12:\"pivotRelated\";r:500;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:1;s:10:\"product_id\";i:1;s:3:\"sku\";s:6:\"WTH-01\";s:5:\"price\";s:7:\"6600.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-24 08:08:10\";s:10:\"updated_at\";s:19:\"2026-04-24 08:08:10\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:1;s:10:\"product_id\";i:1;s:3:\"sku\";s:6:\"WTH-01\";s:5:\"price\";s:7:\"6600.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-24 08:08:10\";s:10:\"updated_at\";s:19:\"2026-04-24 08:08:10\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:2;s:10:\"product_id\";i:1;s:3:\"sku\";s:6:\"WTH-02\";s:5:\"price\";s:7:\"6600.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-24 08:14:17\";s:10:\"updated_at\";s:19:\"2026-04-24 08:14:17\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:2;s:10:\"product_id\";i:1;s:3:\"sku\";s:6:\"WTH-02\";s:5:\"price\";s:7:\"6600.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-24 08:14:17\";s:10:\"updated_at\";s:19:\"2026-04-24 08:14:17\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:24;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:43:\"uploads/products/1/QOkMao6XpCVgJYFtBWxY.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:42:49\";s:10:\"updated_at\";s:19:\"2026-04-27 11:43:02\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:24;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:43:\"uploads/products/1/QOkMao6XpCVgJYFtBWxY.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:42:49\";s:10:\"updated_at\";s:19:\"2026-04-27 11:43:02\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:26;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:43:\"uploads/products/1/6SeqBQ51EnRLE7xXhOsl.png\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:52:48\";s:10:\"updated_at\";s:19:\"2026-04-27 11:52:48\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:26;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:43:\"uploads/products/1/6SeqBQ51EnRLE7xXhOsl.png\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:52:48\";s:10:\"updated_at\";s:19:\"2026-04-27 11:52:48\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";s:16:\"pivot_product_id\";i:1;s:12:\"pivot_tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:1;s:6:\"tag_id\";i:1;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:1;s:6:\"tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:1002;s:12:\"pivotRelated\";r:1062;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:1;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:1;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:1;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:1002;s:12:\"pivotRelated\";r:1062;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:10:\"topselling\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:6:{i:0;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:7;s:4:\"name\";s:38:\"Elegant Women’s Diamond Necklace Set\";s:4:\"slug\";s:21:\"ruby-pendant-necklace\";s:11:\"description\";s:1570:\"<h3>Industry-specific attributes</h3><figure class=\"table\"><table><tbody><tr><td>Jewelry Main Material</td><td>Rose Gold</td></tr><tr><td>Main Stone</td><td>Diamond</td></tr><tr><td>Style</td><td>TRENDY</td></tr></tbody></table></figure><h3>Other attributes</h3><figure class=\"table\"><table><tbody><tr><td>Place of Origin</td><td>Gujarat, India</td></tr><tr><td>Jewelry Sets Type</td><td>Necklace set</td></tr><tr><td>Brand Name</td><td>DOPE JEWELLS</td></tr><tr><td>Model Number</td><td>DER-0004</td></tr><tr><td>Material Type</td><td>14KT GOLD</td></tr><tr><td>Diamond shape</td><td>Round Brilliant Cut</td></tr><tr><td>Gender</td><td>Female</td></tr><tr><td>Jewelry Type</td><td>Jewelry Sets</td></tr><tr><td>Occasion</td><td>Other, Anniversary, Engagement, Gift, Wedding, Party</td></tr><tr><td>Certificate Type</td><td>IGI</td></tr><tr><td>Plating</td><td>Silver Plated, Gold Plated, Rose Gold Plated</td></tr><tr><td>Shape\\pattern</td><td>ROUND</td></tr><tr><td>Religious Type</td><td>ALL RELIGIONS</td></tr><tr><td>Inlay technology</td><td>PRONG Setting</td></tr><tr><td>Product name</td><td>DIAMOND STUDS</td></tr><tr><td>Material</td><td>14K Solid Gold</td></tr><tr><td>Color</td><td>ROSE GOLD,WHITE GOLD,YELLOW GOLD</td></tr><tr><td>Size</td><td>2 CT</td></tr><tr><td>Weight</td><td>10 GRAMS</td></tr><tr><td>Packing</td><td>Customized Gift Box</td></tr><tr><td>Delivery time</td><td>7-15 Working Days</td></tr><tr><td>Shipping</td><td>DHL UPS FedEx TNT</td></tr><tr><td>Payment</td><td>Alipay, PayPal, CashApp, Bank Transfer</td></tr></tbody></table></figure>\";s:10:\"base_price\";s:9:\"120000.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:4:\"8.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:46:50\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:7;s:4:\"name\";s:38:\"Elegant Women’s Diamond Necklace Set\";s:4:\"slug\";s:21:\"ruby-pendant-necklace\";s:11:\"description\";s:1570:\"<h3>Industry-specific attributes</h3><figure class=\"table\"><table><tbody><tr><td>Jewelry Main Material</td><td>Rose Gold</td></tr><tr><td>Main Stone</td><td>Diamond</td></tr><tr><td>Style</td><td>TRENDY</td></tr></tbody></table></figure><h3>Other attributes</h3><figure class=\"table\"><table><tbody><tr><td>Place of Origin</td><td>Gujarat, India</td></tr><tr><td>Jewelry Sets Type</td><td>Necklace set</td></tr><tr><td>Brand Name</td><td>DOPE JEWELLS</td></tr><tr><td>Model Number</td><td>DER-0004</td></tr><tr><td>Material Type</td><td>14KT GOLD</td></tr><tr><td>Diamond shape</td><td>Round Brilliant Cut</td></tr><tr><td>Gender</td><td>Female</td></tr><tr><td>Jewelry Type</td><td>Jewelry Sets</td></tr><tr><td>Occasion</td><td>Other, Anniversary, Engagement, Gift, Wedding, Party</td></tr><tr><td>Certificate Type</td><td>IGI</td></tr><tr><td>Plating</td><td>Silver Plated, Gold Plated, Rose Gold Plated</td></tr><tr><td>Shape\\pattern</td><td>ROUND</td></tr><tr><td>Religious Type</td><td>ALL RELIGIONS</td></tr><tr><td>Inlay technology</td><td>PRONG Setting</td></tr><tr><td>Product name</td><td>DIAMOND STUDS</td></tr><tr><td>Material</td><td>14K Solid Gold</td></tr><tr><td>Color</td><td>ROSE GOLD,WHITE GOLD,YELLOW GOLD</td></tr><tr><td>Size</td><td>2 CT</td></tr><tr><td>Weight</td><td>10 GRAMS</td></tr><tr><td>Packing</td><td>Customized Gift Box</td></tr><tr><td>Delivery time</td><td>7-15 Working Days</td></tr><tr><td>Shipping</td><td>DHL UPS FedEx TNT</td></tr><tr><td>Payment</td><td>Alipay, PayPal, CashApp, Bank Transfer</td></tr></tbody></table></figure>\";s:10:\"base_price\";s:9:\"120000.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:4:\"8.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:46:50\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";O:16:\"App\\Models\\Brand\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:6:\"brands\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:7:\"General\";s:8:\"logo_url\";N;s:10:\"created_at\";s:19:\"2026-04-24 07:38:04\";s:10:\"updated_at\";s:19:\"2026-04-24 07:38:04\";}s:11:\"\0*\0original\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:7:\"General\";s:8:\"logo_url\";N;s:10:\"created_at\";s:19:\"2026-04-24 07:38:04\";s:10:\"updated_at\";s:19:\"2026-04-24 07:38:04\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:8:\"logo_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:5;s:4:\"name\";s:8:\"Necklace\";s:4:\"slug\";s:8:\"necklace\";s:18:\"parent_category_id\";i:6;s:9:\"image_url\";s:43:\"uploads/categories/ozUDb2VEctWVFnwo38qQ.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:41\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:28\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:5;s:4:\"name\";s:8:\"Necklace\";s:4:\"slug\";s:8:\"necklace\";s:18:\"parent_category_id\";i:6;s:9:\"image_url\";s:43:\"uploads/categories/ozUDb2VEctWVFnwo38qQ.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:41\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:28\";s:16:\"pivot_product_id\";i:7;s:17:\"pivot_category_id\";i:5;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:7;s:11:\"category_id\";i:5;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:7;s:11:\"category_id\";i:5;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:0;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:0:{}s:11:\"\0*\0original\";a:0:{}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:12:\"pivotRelated\";O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";N;s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:0;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:0:{}s:11:\"\0*\0original\";a:0:{}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:8;s:10:\"product_id\";i:7;s:3:\"sku\";s:10:\"SKU-INFOAW\";s:5:\"price\";s:7:\"1300.00\";s:14:\"stock_quantity\";i:18;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 13:00:31\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:8;s:10:\"product_id\";i:7;s:3:\"sku\";s:10:\"SKU-INFOAW\";s:5:\"price\";s:7:\"1300.00\";s:14:\"stock_quantity\";i:18;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 13:00:31\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:15;s:10:\"product_id\";i:7;s:3:\"sku\";s:11:\"SKU-INFOAW1\";s:5:\"price\";s:7:\"1735.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 13:00:31\";s:10:\"updated_at\";s:19:\"2026-04-27 13:00:31\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:15;s:10:\"product_id\";i:7;s:3:\"sku\";s:11:\"SKU-INFOAW1\";s:5:\"price\";s:7:\"1735.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 13:00:31\";s:10:\"updated_at\";s:19:\"2026-04-27 13:00:31\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:16;s:10:\"product_id\";i:7;s:3:\"sku\";s:10:\"SKU-R44J12\";s:5:\"price\";s:6:\"260.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 13:00:31\";s:10:\"updated_at\";s:19:\"2026-04-27 13:00:31\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:16;s:10:\"product_id\";i:7;s:3:\"sku\";s:10:\"SKU-R44J12\";s:5:\"price\";s:6:\"260.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 13:00:31\";s:10:\"updated_at\";s:19:\"2026-04-27 13:00:31\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:41;s:10:\"product_id\";i:7;s:18:\"attribute_value_id\";i:6;s:9:\"image_url\";s:43:\"uploads/products/7/7Izq2v1kyaTK0viYM7qk.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:13:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:13:36\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:41;s:10:\"product_id\";i:7;s:18:\"attribute_value_id\";i:6;s:9:\"image_url\";s:43:\"uploads/products/7/7Izq2v1kyaTK0viYM7qk.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:13:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:13:36\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:42;s:10:\"product_id\";i:7;s:18:\"attribute_value_id\";i:7;s:9:\"image_url\";s:43:\"uploads/products/7/jA5189B1oZqjMkOYFmxS.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:13:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:13:36\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:42;s:10:\"product_id\";i:7;s:18:\"attribute_value_id\";i:7;s:9:\"image_url\";s:43:\"uploads/products/7/jA5189B1oZqjMkOYFmxS.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:13:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:13:36\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:43;s:10:\"product_id\";i:7;s:18:\"attribute_value_id\";i:8;s:9:\"image_url\";s:43:\"uploads/products/7/OojDncrNiObcVZTt1lfl.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:13:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:13:36\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:43;s:10:\"product_id\";i:7;s:18:\"attribute_value_id\";i:8;s:9:\"image_url\";s:43:\"uploads/products/7/OojDncrNiObcVZTt1lfl.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 13:13:18\";s:10:\"updated_at\";s:19:\"2026-04-27 13:13:36\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:7;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:7;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:7;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:0;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:0:{}s:11:\"\0*\0original\";a:0:{}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:12:\"pivotRelated\";O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";N;s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:0;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:0:{}s:11:\"\0*\0original\";a:0:{}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:8;s:4:\"name\";s:26:\"Vintage Cartier Tank Watch\";s:4:\"slug\";s:26:\"vintage-cartier-tank-watch\";s:11:\"description\";s:122:\"<p>An authentic vintage Cartier Tank watch with a classic leather strap and gold-plated case. A true collector\'s item.</p>\";s:10:\"base_price\";s:9:\"350000.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"14.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:46:58\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:8;s:4:\"name\";s:26:\"Vintage Cartier Tank Watch\";s:4:\"slug\";s:26:\"vintage-cartier-tank-watch\";s:11:\"description\";s:122:\"<p>An authentic vintage Cartier Tank watch with a classic leather strap and gold-plated case. A true collector\'s item.</p>\";s:10:\"base_price\";s:9:\"350000.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"14.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:46:58\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";r:3768;s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";s:16:\"pivot_product_id\";i:8;s:17:\"pivot_category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:8;s:11:\"category_id\";i:3;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:8;s:11:\"category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:3896;s:12:\"pivotRelated\";r:3956;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:9;s:10:\"product_id\";i:8;s:3:\"sku\";s:10:\"SKU-5RYL0O\";s:5:\"price\";s:9:\"350000.00\";s:14:\"stock_quantity\";i:13;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:9;s:10:\"product_id\";i:8;s:3:\"sku\";s:10:\"SKU-5RYL0O\";s:5:\"price\";s:9:\"350000.00\";s:14:\"stock_quantity\";i:13;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:27;s:10:\"product_id\";i:8;s:18:\"attribute_value_id\";i:5;s:9:\"image_url\";s:43:\"uploads/products/8/Z1e3K0H0tJu6gGhxSG9c.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:58:15\";s:10:\"updated_at\";s:19:\"2026-04-27 11:58:25\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:27;s:10:\"product_id\";i:8;s:18:\"attribute_value_id\";i:5;s:9:\"image_url\";s:43:\"uploads/products/8/Z1e3K0H0tJu6gGhxSG9c.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:58:15\";s:10:\"updated_at\";s:19:\"2026-04-27 11:58:25\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:28;s:10:\"product_id\";i:8;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";s:43:\"uploads/products/8/9rZxlW1AtRptSdwjv6b2.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:59:24\";s:10:\"updated_at\";s:19:\"2026-04-27 11:59:48\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:28;s:10:\"product_id\";i:8;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";s:43:\"uploads/products/8/9rZxlW1AtRptSdwjv6b2.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:59:24\";s:10:\"updated_at\";s:19:\"2026-04-27 11:59:48\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";s:16:\"pivot_product_id\";i:8;s:12:\"pivot_tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:8;s:6:\"tag_id\";i:1;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:8;s:6:\"tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:4458;s:12:\"pivotRelated\";r:4518;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:8;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:8;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:8;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:4458;s:12:\"pivotRelated\";r:4518;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:9;s:4:\"name\";s:39:\"Mossianite Diamond Luxury Fashion Watch\";s:4:\"slug\";s:19:\"rolex-datejust-gold\";s:11:\"description\";s:265:\"<p>Mossianite Diamond Luxury Fashion Watch Swiss Quartz Movement Stainless Steel Band-the Perfect Fusion of Craftsmanship Sparkle</p><p>Mossianite Diamond Luxury Watch Japanese Quartz Movement Stainless Steel Band Glass Dial Perfect Fusion Craftsmanship Sparkle</p>\";s:10:\"base_price\";s:6:\"699.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"15.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:47:39\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:9;s:4:\"name\";s:39:\"Mossianite Diamond Luxury Fashion Watch\";s:4:\"slug\";s:19:\"rolex-datejust-gold\";s:11:\"description\";s:265:\"<p>Mossianite Diamond Luxury Fashion Watch Swiss Quartz Movement Stainless Steel Band-the Perfect Fusion of Craftsmanship Sparkle</p><p>Mossianite Diamond Luxury Watch Japanese Quartz Movement Stainless Steel Band Glass Dial Perfect Fusion Craftsmanship Sparkle</p>\";s:10:\"base_price\";s:6:\"699.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"15.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:47:39\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";r:3768;s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";s:16:\"pivot_product_id\";i:9;s:17:\"pivot_category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:9;s:11:\"category_id\";i:3;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:9;s:11:\"category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:3896;s:12:\"pivotRelated\";r:3956;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:10;s:10:\"product_id\";i:9;s:3:\"sku\";s:10:\"SKU-F7DGML\";s:5:\"price\";s:9:\"850000.00\";s:14:\"stock_quantity\";i:17;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:10;s:10:\"product_id\";i:9;s:3:\"sku\";s:10:\"SKU-F7DGML\";s:5:\"price\";s:9:\"850000.00\";s:14:\"stock_quantity\";i:17;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:22;s:10:\"product_id\";i:9;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:43:\"uploads/products/9/J1E4iPfB2iFty1OMMRpt.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:38:28\";s:10:\"updated_at\";s:19:\"2026-04-27 11:39:13\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:22;s:10:\"product_id\";i:9;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:43:\"uploads/products/9/J1E4iPfB2iFty1OMMRpt.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:38:28\";s:10:\"updated_at\";s:19:\"2026-04-27 11:39:13\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";s:16:\"pivot_product_id\";i:9;s:12:\"pivot_tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:9;s:6:\"tag_id\";i:1;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:9;s:6:\"tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:4458;s:12:\"pivotRelated\";r:4518;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:9;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:9;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:9;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:4458;s:12:\"pivotRelated\";r:4518;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:3;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:10;s:4:\"name\";s:65:\"1.00ct center soliatare diamond with tiney lab grown diamond Ring\";s:4:\"slug\";s:21:\"platinum-wedding-band\";s:11:\"description\";s:395:\"<p>14KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>18KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>925 sterling silver 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p>\";s:10:\"base_price\";s:6:\"290.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"15.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:47:47\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";i:28;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:10;s:4:\"name\";s:65:\"1.00ct center soliatare diamond with tiney lab grown diamond Ring\";s:4:\"slug\";s:21:\"platinum-wedding-band\";s:11:\"description\";s:395:\"<p>14KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>18KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>925 sterling silver 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p>\";s:10:\"base_price\";s:6:\"290.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"15.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-29 12:47:47\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";i:28;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";r:3768;s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:5:\"Rings\";s:4:\"slug\";s:5:\"rings\";s:18:\"parent_category_id\";i:1;s:9:\"image_url\";s:43:\"uploads/categories/Bxmj50mzm6Ept9dTdpvA.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:42:53\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:53\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:2;s:4:\"name\";s:5:\"Rings\";s:4:\"slug\";s:5:\"rings\";s:18:\"parent_category_id\";i:1;s:9:\"image_url\";s:43:\"uploads/categories/Bxmj50mzm6Ept9dTdpvA.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:42:53\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:53\";s:16:\"pivot_product_id\";i:10;s:17:\"pivot_category_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:10;s:11:\"category_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:10;s:11:\"category_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:3896;s:12:\"pivotRelated\";r:3956;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:11;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-H44J10\";s:5:\"price\";s:7:\"2775.00\";s:14:\"stock_quantity\";i:12;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:18\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:11;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-H44J10\";s:5:\"price\";s:7:\"2775.00\";s:14:\"stock_quantity\";i:12;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:18\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:13;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-R44J10\";s:5:\"price\";s:7:\"3430.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 12:17:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:18\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:13;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-R44J10\";s:5:\"price\";s:7:\"3430.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 12:17:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:18\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:14;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-R44J11\";s:5:\"price\";s:6:\"405.00\";s:14:\"stock_quantity\";i:9;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 12:17:19\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:19\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:14;s:10:\"product_id\";i:10;s:3:\"sku\";s:10:\"SKU-R44J11\";s:5:\"price\";s:6:\"405.00\";s:14:\"stock_quantity\";i:9;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-27 12:17:19\";s:10:\"updated_at\";s:19:\"2026-04-27 12:17:19\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:29;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";s:44:\"uploads/products/10/CAjA6Sb8xMZCUa34yDJH.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:29;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";s:44:\"uploads/products/10/CAjA6Sb8xMZCUa34yDJH.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:30;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:44:\"uploads/products/10/Ddi1xN8ntrKtbtX4mod5.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:30;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:44:\"uploads/products/10/Ddi1xN8ntrKtbtX4mod5.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:31;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:10;s:9:\"image_url\";s:44:\"uploads/products/10/Jvt5CFMhE8cYfOZNbOsG.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:31;s:10:\"product_id\";i:10;s:18:\"attribute_value_id\";i:10;s:9:\"image_url\";s:44:\"uploads/products/10/Jvt5CFMhE8cYfOZNbOsG.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 12:06:18\";s:10:\"updated_at\";s:19:\"2026-04-27 12:23:22\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";s:16:\"pivot_product_id\";i:10;s:12:\"pivot_tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:10;s:6:\"tag_id\";i:1;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:10;s:6:\"tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:4458;s:12:\"pivotRelated\";r:4518;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:10;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:10;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:10;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:4458;s:12:\"pivotRelated\";r:4518;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:4;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:11;s:4:\"name\";s:58:\"Luxury Women’s Diamond Necklace Set For Anniversary Gift\";s:4:\"slug\";s:28:\"emerald-cut-diamond-necklace\";s:11:\"description\";s:272:\"<p>Luxury Women’s Diamond Necklace Set In 14kt Solid Gold For Anniversary Gift</p><p>Luxury Women’s Diamond Necklace Set 18kt Solid White Gold For Anniversary Gift</p><p>Luxury Women’s Diamond Necklace Set in 925 Sterling Silver Perfect Gift for Anniversary Gift</p>\";s:10:\"base_price\";s:9:\"450000.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:4:\"6.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:28:25\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:11;s:4:\"name\";s:58:\"Luxury Women’s Diamond Necklace Set For Anniversary Gift\";s:4:\"slug\";s:28:\"emerald-cut-diamond-necklace\";s:11:\"description\";s:272:\"<p>Luxury Women’s Diamond Necklace Set In 14kt Solid Gold For Anniversary Gift</p><p>Luxury Women’s Diamond Necklace Set 18kt Solid White Gold For Anniversary Gift</p><p>Luxury Women’s Diamond Necklace Set in 925 Sterling Silver Perfect Gift for Anniversary Gift</p>\";s:10:\"base_price\";s:9:\"450000.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:4:\"6.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:28:25\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";N;s:12:\"tax_group_id\";N;s:16:\"is_free_shipping\";i:1;s:15:\"shipping_charge\";s:4:\"0.00\";s:24:\"multiply_shipping_by_qty\";i:0;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";r:3768;s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:5;s:4:\"name\";s:8:\"Necklace\";s:4:\"slug\";s:8:\"necklace\";s:18:\"parent_category_id\";i:6;s:9:\"image_url\";s:43:\"uploads/categories/ozUDb2VEctWVFnwo38qQ.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:41\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:28\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:5;s:4:\"name\";s:8:\"Necklace\";s:4:\"slug\";s:8:\"necklace\";s:18:\"parent_category_id\";i:6;s:9:\"image_url\";s:43:\"uploads/categories/ozUDb2VEctWVFnwo38qQ.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:44:41\";s:10:\"updated_at\";s:19:\"2026-04-27 09:25:28\";s:16:\"pivot_product_id\";i:11;s:17:\"pivot_category_id\";i:5;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:11;s:11:\"category_id\";i:5;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:11;s:11:\"category_id\";i:5;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:3896;s:12:\"pivotRelated\";r:3956;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:12;s:10:\"product_id\";i:11;s:3:\"sku\";s:10:\"SKU-RA7KRZ\";s:5:\"price\";s:9:\"450000.00\";s:14:\"stock_quantity\";i:7;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:12;s:10:\"product_id\";i:11;s:3:\"sku\";s:10:\"SKU-RA7KRZ\";s:5:\"price\";s:9:\"450000.00\";s:14:\"stock_quantity\";i:7;s:6:\"length\";N;s:7:\"breadth\";N;s:6:\"height\";N;s:6:\"weight\";N;s:10:\"created_at\";s:19:\"2026-04-27 10:09:31\";s:10:\"updated_at\";s:19:\"2026-04-27 10:09:31\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:3:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:19;s:10:\"product_id\";i:11;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:44:\"uploads/products/11/9IQ3rgayjp2LXhTBRL3I.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:28:25\";s:10:\"updated_at\";s:19:\"2026-04-27 10:28:25\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:19;s:10:\"product_id\";i:11;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:44:\"uploads/products/11/9IQ3rgayjp2LXhTBRL3I.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:28:25\";s:10:\"updated_at\";s:19:\"2026-04-27 10:28:25\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:20;s:10:\"product_id\";i:11;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:44:\"uploads/products/11/TqHe6NCwTrvPCUIXVIBg.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:28:25\";s:10:\"updated_at\";s:19:\"2026-04-27 10:28:25\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:20;s:10:\"product_id\";i:11;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:44:\"uploads/products/11/TqHe6NCwTrvPCUIXVIBg.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:28:25\";s:10:\"updated_at\";s:19:\"2026-04-27 10:28:25\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:21;s:10:\"product_id\";i:11;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:44:\"uploads/products/11/MdF2MPBNdLNoy9KeJjzq.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:28:25\";s:10:\"updated_at\";s:19:\"2026-04-27 10:28:25\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:21;s:10:\"product_id\";i:11;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:44:\"uploads/products/11/MdF2MPBNdLNoy9KeJjzq.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 10:28:25\";s:10:\"updated_at\";s:19:\"2026-04-27 10:28:25\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:11;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:11;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:11;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:4458;s:12:\"pivotRelated\";r:4518;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:5;O:18:\"App\\Models\\Product\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:8:\"products\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:28:{s:2:\"id\";i:1;s:4:\"name\";s:12:\"Daniel Klein\";s:4:\"slug\";s:12:\"daniel-klein\";s:11:\"description\";s:306:\"<p>Display: Analogue<br>Movement: Quartz<br>Power source: Battery<br>Dial style: Solid round stainless steel dial<br>Features: Reset Time, Calender<br>Strap style: Brown regular, leather strap with a tang closure<br>Water resistance: 30 m<br>Warranty: 2 years<br>Warranty provided by brand/manufacturer</p>\";s:10:\"base_price\";s:7:\"6600.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"60.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:10;s:10:\"created_at\";s:19:\"2026-04-24 08:08:10\";s:10:\"updated_at\";s:19:\"2026-04-29 12:45:29\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";i:28;s:12:\"tax_group_id\";i:2;s:16:\"is_free_shipping\";i:0;s:15:\"shipping_charge\";s:5:\"50.00\";s:24:\"multiply_shipping_by_qty\";i:1;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:4:\"9.99\";s:6:\"weight\";s:5:\"10.00\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:11:\"\0*\0original\";a:28:{s:2:\"id\";i:1;s:4:\"name\";s:12:\"Daniel Klein\";s:4:\"slug\";s:12:\"daniel-klein\";s:11:\"description\";s:306:\"<p>Display: Analogue<br>Movement: Quartz<br>Power source: Battery<br>Dial style: Solid round stainless steel dial<br>Features: Reset Time, Calender<br>Strap style: Brown regular, leather strap with a tang closure<br>Water resistance: 30 m<br>Warranty: 2 years<br>Warranty provided by brand/manufacturer</p>\";s:10:\"base_price\";s:7:\"6600.00\";s:13:\"discount_type\";s:7:\"percent\";s:14:\"discount_value\";s:5:\"60.00\";s:9:\"vendor_id\";i:1;s:8:\"brand_id\";i:1;s:6:\"status\";s:6:\"active\";s:13:\"is_returnable\";i:1;s:18:\"return_window_days\";i:10;s:10:\"created_at\";s:19:\"2026-04-24 08:08:10\";s:10:\"updated_at\";s:19:\"2026-04-29 12:45:29\";s:10:\"hsn_sac_id\";N;s:6:\"uom_id\";i:28;s:12:\"tax_group_id\";i:2;s:16:\"is_free_shipping\";i:0;s:15:\"shipping_charge\";s:5:\"50.00\";s:24:\"multiply_shipping_by_qty\";i:1;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:4:\"9.99\";s:6:\"weight\";s:5:\"10.00\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:5:{s:5:\"brand\";r:3768;s:10:\"categories\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{i:0;O:19:\"App\\Models\\Category\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";}s:11:\"\0*\0original\";a:9:{s:2:\"id\";i:3;s:4:\"name\";s:5:\"Watch\";s:4:\"slug\";s:5:\"watch\";s:18:\"parent_category_id\";i:7;s:9:\"image_url\";s:43:\"uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg\";s:10:\"created_at\";s:19:\"2026-04-24 07:43:14\";s:10:\"updated_at\";s:19:\"2026-04-27 09:23:15\";s:16:\"pivot_product_id\";i:1;s:17:\"pivot_category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:18:\"product_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:1;s:11:\"category_id\";i:3;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:1;s:11:\"category_id\";i:3;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:3896;s:12:\"pivotRelated\";r:3956;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:11:\"category_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:18:\"parent_category_id\";i:3;s:9:\"image_url\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:8:\"variants\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:1;s:10:\"product_id\";i:1;s:3:\"sku\";s:6:\"WTH-01\";s:5:\"price\";s:7:\"6600.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-24 08:08:10\";s:10:\"updated_at\";s:19:\"2026-04-24 08:08:10\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:1;s:10:\"product_id\";i:1;s:3:\"sku\";s:6:\"WTH-01\";s:5:\"price\";s:7:\"6600.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-24 08:08:10\";s:10:\"updated_at\";s:19:\"2026-04-24 08:08:10\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductVariant\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:16:\"product_variants\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:11:{s:2:\"id\";i:2;s:10:\"product_id\";i:1;s:3:\"sku\";s:6:\"WTH-02\";s:5:\"price\";s:7:\"6600.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-24 08:14:17\";s:10:\"updated_at\";s:19:\"2026-04-24 08:14:17\";}s:11:\"\0*\0original\";a:11:{s:2:\"id\";i:2;s:10:\"product_id\";i:1;s:3:\"sku\";s:6:\"WTH-02\";s:5:\"price\";s:7:\"6600.00\";s:14:\"stock_quantity\";i:10;s:6:\"length\";s:5:\"10.00\";s:7:\"breadth\";s:5:\"10.00\";s:6:\"height\";s:5:\"10.00\";s:6:\"weight\";s:5:\"10.00\";s:10:\"created_at\";s:19:\"2026-04-24 08:14:17\";s:10:\"updated_at\";s:19:\"2026-04-24 08:14:17\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:8:{i:0;s:10:\"product_id\";i:1;s:3:\"sku\";i:2;s:5:\"price\";i:3;s:14:\"stock_quantity\";i:4;s:6:\"length\";i:5;s:7:\"breadth\";i:6;s:6:\"height\";i:7;s:6:\"weight\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"galleries\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:24;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:43:\"uploads/products/1/QOkMao6XpCVgJYFtBWxY.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:42:49\";s:10:\"updated_at\";s:19:\"2026-04-27 11:43:02\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:24;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:3;s:9:\"image_url\";s:43:\"uploads/products/1/QOkMao6XpCVgJYFtBWxY.jpg\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:42:49\";s:10:\"updated_at\";s:19:\"2026-04-27 11:43:02\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:25:\"App\\Models\\ProductGallery\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:17:\"product_galleries\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:8:{s:2:\"id\";i:26;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:43:\"uploads/products/1/6SeqBQ51EnRLE7xXhOsl.png\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:52:48\";s:10:\"updated_at\";s:19:\"2026-04-27 11:52:48\";}s:11:\"\0*\0original\";a:8:{s:2:\"id\";i:26;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";N;s:9:\"image_url\";s:43:\"uploads/products/1/6SeqBQ51EnRLE7xXhOsl.png\";s:8:\"alt_text\";N;s:10:\"sort_order\";i:0;s:10:\"created_at\";s:19:\"2026-04-27 11:52:48\";s:10:\"updated_at\";s:19:\"2026-04-27 11:52:48\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:5:{i:0;s:10:\"product_id\";i:1;s:18:\"attribute_value_id\";i:2;s:9:\"image_url\";i:3;s:8:\"alt_text\";i:4;s:10:\"sort_order\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:4:\"tags\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:8:\"Featured\";s:4:\"slug\";s:8:\"featured\";s:10:\"created_at\";s:19:\"2026-03-17 11:21:40\";s:10:\"updated_at\";s:19:\"2026-03-17 11:21:40\";s:16:\"pivot_product_id\";i:1;s:12:\"pivot_tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:1;s:6:\"tag_id\";i:1;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:1;s:6:\"tag_id\";i:1;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:4458;s:12:\"pivotRelated\";r:4518;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:14:\"App\\Models\\Tag\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:4:\"tags\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:5:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:2;s:4:\"name\";s:12:\"Best Selling\";s:4:\"slug\";s:12:\"best-selling\";s:10:\"created_at\";s:19:\"2026-03-17 11:22:13\";s:10:\"updated_at\";s:19:\"2026-03-17 11:22:13\";s:16:\"pivot_product_id\";i:1;s:12:\"pivot_tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:5:\"pivot\";O:44:\"Illuminate\\Database\\Eloquent\\Relations\\Pivot\":37:{s:13:\"\0*\0connection\";N;s:8:\"\0*\0table\";s:11:\"product_tag\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:0;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:2:{s:10:\"product_id\";i:1;s:6:\"tag_id\";i:2;}s:11:\"\0*\0original\";a:2:{s:10:\"product_id\";i:1;s:6:\"tag_id\";i:2;}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:0;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:0:{}s:10:\"\0*\0guarded\";a:0:{}s:11:\"pivotParent\";r:4458;s:12:\"pivotRelated\";r:4518;s:13:\"\0*\0foreignKey\";s:10:\"product_id\";s:13:\"\0*\0relatedKey\";s:6:\"tag_id\";}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:2:{i:0;s:4:\"name\";i:1;s:4:\"slug\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:25:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:10:\"base_price\";i:4;s:9:\"vendor_id\";i:5;s:8:\"brand_id\";i:6;s:6:\"status\";i:7;s:13:\"discount_type\";i:8;s:14:\"discount_value\";i:9;s:10:\"hsn_sac_id\";i:10;s:6:\"uom_id\";i:11;s:12:\"tax_group_id\";i:12;s:16:\"is_free_shipping\";i:13;s:15:\"shipping_charge\";i:14;s:24:\"multiply_shipping_by_qty\";i:15;s:6:\"length\";i:16;s:7:\"breadth\";i:17;s:6:\"height\";i:18;s:6:\"weight\";i:19;s:13:\"is_returnable\";i:20;s:18:\"return_window_days\";i:21;s:10:\"meta_title\";i:22;s:16:\"meta_description\";i:23;s:13:\"meta_keywords\";i:24;s:13:\"schema_markup\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:7:\"banners\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:1:{s:3:\"top\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:2:{i:0;O:17:\"App\\Models\\Banner\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:7:\"banners\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:17:{s:2:\"id\";i:2;s:5:\"title\";s:35:\"Timeless Elegance, Crafted for You.\";s:8:\"subtitle\";s:92:\"Discover the ultimate expression of luxury with our meticulously handcrafted jewelry pieces.\";s:8:\"cta_text\";s:18:\"EXPLORE COLLECTION\";s:8:\"cta_link\";s:9:\"/products\";s:10:\"image_path\";s:50:\"media/f9TzesSZuzIpXrGctas7Xq93spUjo2YYNYIpo0vr.jpg\";s:10:\"video_path\";N;s:8:\"position\";s:3:\"top\";s:6:\"device\";s:3:\"all\";s:9:\"page_type\";s:5:\"index\";s:7:\"page_id\";i:5;s:10:\"start_date\";N;s:8:\"end_date\";N;s:10:\"sort_order\";i:0;s:6:\"status\";i:1;s:10:\"created_at\";s:19:\"2026-04-27 06:28:26\";s:10:\"updated_at\";s:19:\"2026-04-27 07:10:32\";}s:11:\"\0*\0original\";a:17:{s:2:\"id\";i:2;s:5:\"title\";s:35:\"Timeless Elegance, Crafted for You.\";s:8:\"subtitle\";s:92:\"Discover the ultimate expression of luxury with our meticulously handcrafted jewelry pieces.\";s:8:\"cta_text\";s:18:\"EXPLORE COLLECTION\";s:8:\"cta_link\";s:9:\"/products\";s:10:\"image_path\";s:50:\"media/f9TzesSZuzIpXrGctas7Xq93spUjo2YYNYIpo0vr.jpg\";s:10:\"video_path\";N;s:8:\"position\";s:3:\"top\";s:6:\"device\";s:3:\"all\";s:9:\"page_type\";s:5:\"index\";s:7:\"page_id\";i:5;s:10:\"start_date\";N;s:8:\"end_date\";N;s:10:\"sort_order\";i:0;s:6:\"status\";i:1;s:10:\"created_at\";s:19:\"2026-04-27 06:28:26\";s:10:\"updated_at\";s:19:\"2026-04-27 07:10:32\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:10:\"start_date\";s:8:\"datetime\";s:8:\"end_date\";s:8:\"datetime\";s:6:\"status\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:14:{i:0;s:5:\"title\";i:1;s:8:\"subtitle\";i:2;s:8:\"cta_text\";i:3;s:8:\"cta_link\";i:4;s:10:\"image_path\";i:5;s:10:\"video_path\";i:6;s:8:\"position\";i:7;s:6:\"device\";i:8;s:9:\"page_type\";i:9;s:7:\"page_id\";i:10;s:10:\"start_date\";i:11;s:8:\"end_date\";i:12;s:10:\"sort_order\";i:13;s:6:\"status\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:17:\"App\\Models\\Banner\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:7:\"banners\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:17:{s:2:\"id\";i:1;s:5:\"title\";s:11:\"Home banner\";s:8:\"subtitle\";s:17:\"This Mother\'s Day\";s:8:\"cta_text\";s:18:\"EXPLORE COLLECTION\";s:8:\"cta_link\";s:9:\"/products\";s:10:\"image_path\";s:51:\"media/4nAfpafgpEkBzodbwUSIvBKDv5huCZMCbyzXLUPE.webp\";s:10:\"video_path\";N;s:8:\"position\";s:3:\"top\";s:6:\"device\";s:7:\"desktop\";s:9:\"page_type\";s:5:\"index\";s:7:\"page_id\";i:6;s:10:\"start_date\";N;s:8:\"end_date\";N;s:10:\"sort_order\";i:1;s:6:\"status\";i:1;s:10:\"created_at\";s:19:\"2026-04-24 09:26:10\";s:10:\"updated_at\";s:19:\"2026-04-30 06:48:12\";}s:11:\"\0*\0original\";a:17:{s:2:\"id\";i:1;s:5:\"title\";s:11:\"Home banner\";s:8:\"subtitle\";s:17:\"This Mother\'s Day\";s:8:\"cta_text\";s:18:\"EXPLORE COLLECTION\";s:8:\"cta_link\";s:9:\"/products\";s:10:\"image_path\";s:51:\"media/4nAfpafgpEkBzodbwUSIvBKDv5huCZMCbyzXLUPE.webp\";s:10:\"video_path\";N;s:8:\"position\";s:3:\"top\";s:6:\"device\";s:7:\"desktop\";s:9:\"page_type\";s:5:\"index\";s:7:\"page_id\";i:6;s:10:\"start_date\";N;s:8:\"end_date\";N;s:10:\"sort_order\";i:1;s:6:\"status\";i:1;s:10:\"created_at\";s:19:\"2026-04-24 09:26:10\";s:10:\"updated_at\";s:19:\"2026-04-30 06:48:12\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:3:{s:10:\"start_date\";s:8:\"datetime\";s:8:\"end_date\";s:8:\"datetime\";s:6:\"status\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:14:{i:0;s:5:\"title\";i:1;s:8:\"subtitle\";i:2;s:8:\"cta_text\";i:3;s:8:\"cta_link\";i:4;s:10:\"image_path\";i:5;s:10:\"video_path\";i:6;s:8:\"position\";i:7;s:6:\"device\";i:8;s:9:\"page_type\";i:9;s:7:\"page_id\";i:10;s:10:\"start_date\";i:11;s:8:\"end_date\";i:12;s:10:\"sort_order\";i:13;s:6:\"status\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}s:9:\"blogPosts\";O:39:\"Illuminate\\Database\\Eloquent\\Collection\":2:{s:8:\"\0*\0items\";a:4:{i:0;O:19:\"App\\Models\\BlogPost\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"blog_posts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:17:{s:2:\"id\";i:1;s:11:\"category_id\";i:1;s:9:\"author_id\";i:1;s:5:\"title\";s:59:\"Diamond Jewellery Care Tips: Make Your Sparkle Last Forever\";s:4:\"slug\";s:40:\"the-art-of-layering-gold-chains-pendants\";s:7:\"summary\";s:81:\"Master the trend of layering delicate gold chains for a sophisticated daily look.\";s:7:\"content\";s:10062:\"<p><strong>Diamond jewellery</strong> has always held a special place in people’s hearts. More than just accessories, these pieces are symbols of love, milestones, and sometimes even heirlooms that pass from one generation to the next.&nbsp;</p><p>Whether it’s a pair of elegant <strong>diamond earrings gifted</strong> on an anniversary, a solitaire engagement ring marking the promise of forever, or a diamond necklace that adds a touch of luxury to a bridal outfit, every piece carries emotions that go far beyond its sparkle.</p><p>But while diamonds are known as the hardest natural material on earth, <strong>diamond jewellery</strong> still needs attention and care. The diamonds may remain unscathed, but the settings, whether crafted in gold, platinum, or silver, are more delicate and prone to scratches, dirt, and loosening.&nbsp;</p><p>Without proper care, even the most exquisite fine <strong>diamond jewellery </strong>can lose its brilliance over time. That’s why following consistent diamond jewellery care tips is so important. With the right habits, your <strong>diamond pieces</strong> can shine just as brightly decades later as the day you first wore them.</p><h2><strong>Why Diamond Jewellery Needs Proper Care</strong></h2><p>Diamonds may be indestructible in many ways, but diamond ornaments are still vulnerable. The sparkle that makes them irresistible can easily get clouded by oils from your skin, makeup residue, lotions, or even everyday dust. Over time, this dull layer can block light from entering the stone, reducing its fire and brilliance.</p><p>More importantly, the metals that hold your diamonds, whether it’s white gold, yellow gold, platinum, or silver are not as durable as the stones themselves. These settings can bend, scratch, or weaken with frequent wear, making it possible for a diamond to loosen or even fall out. That’s why <strong>diamond jewellery</strong> maintenance is not only about preserving beauty but also about protecting your investment and emotional attachment.</p><h2><strong>Daily Diamond Jewellery Care Tips</strong></h2><p>One of the simplest ways to ensure long-term sparkle is by developing daily habits for proper care.</p><p><strong>Remove before physical activity</strong>: Whether you’re at the gym, swimming, or doing household chores, it’s best to take off your rings, bracelets, or bangles. Chemicals in chlorine pools, detergent, or even sweat can damage the metal and reduce shine.</p><p><strong>Handle with care</strong>: Always hold rings or necklaces by their band or chain rather than the stone. This prevents oils from your fingers from transferring to the diamonds.</p><p><strong>Wipe after wearing</strong>: A quick wipe with a clean, soft, lint-free cloth can remove surface oils and dirt before they build up.</p><p>These simple daily care practices for diamond jewellery don’t take much effort but make a huge difference in maintaining that natural sparkle.</p><h2><strong>How to Clean Diamond Jewellery at Home</strong></h2><p>Cleaning diamond jewellery at home is easy if done correctly. All you need are a few safe household items:</p><p><strong>Prepare a solution</strong>: Mix lukewarm water with a few drops of mild dish soap.</p><p><strong>Soak the jewellery</strong>: Place your diamond rings, earrings, or necklaces in the solution for about 15–20 minutes.</p><p><strong>Brush gently</strong>: Use a very soft-bristled toothbrush to clean around the prongs, under the diamond, and in small crevices. Avoid scrubbing too hard.</p><p><strong>Rinse well</strong>: Wash with clean lukewarm water to remove all soap.</p><p><strong>Dry carefully</strong>: Pat dry with a soft lint-free cloth.</p><p><strong>What to avoid:</strong> Harsh chemicals like bleach, acetone, or toothpaste should never be used. They can erode metal and leave scratches. Ultrasonic cleaning machines are also risky for delicate settings like pavé or halo designs, as the vibrations may loosen smaller diamonds.</p><p>These steps are the best way to clean diamond jewellery at home without risking damage.</p><h2><strong>Professional Diamond Jewellery Cleaning &amp; Inspection</strong></h2><p>While at-home care keeps jewellery looking fresh, nothing beats the expertise of a professional jeweller. Professional diamond jewellery cleaning uses specialized equipment that restores brilliance without harming delicate settings.</p><p>It’s recommended to have your fine diamond jewellery inspected and cleaned professionally every <strong>6–12 months</strong>. During these check-ups, jewellers ensure that prongs are secure, clasps are working properly, and no diamonds are at risk of falling out.</p><p>If you wear <strong>engagement diamond rings</strong> or bridal diamond jewellery daily, scheduling these professional check-ups becomes even more important. They’re not just about cleaning they help maintain the structural integrity of your precious adornments.</p><h2><strong>How to Store Diamond Jewellery Safely</strong></h2><p>Storage is another vital part of diamond jewellery care. When stored improperly, even the hardest stones can scratch other precious pieces.</p><p><strong>Use separate compartments</strong>: A jewellery box with fabric-lined compartments ensures pieces don’t rub against each other.</p><p><strong>Store in soft pouches</strong>: Diamond earrings, bracelets, or rings can be kept in velvet or satin pouches for added protection.</p><p><strong>Travel with care</strong>: For trips, use a dedicated jewellery travel case with padded slots to keep each piece safe.</p><p>Knowing how to store diamond jewellery correctly prevents unnecessary scratches and keeps your collection sparkling for years.</p><h2><strong>Dos and Don’ts of Diamond Jewellery Care</strong></h2><p>A few golden rules can make all the difference:</p><p><strong>Dos</strong>:</p><ul><li>Clean your diamond jewellery regularly with mild soap and water.</li><li>Check prongs, clasps, and settings frequently.</li><li>Remove before swimming, exercising, or cleaning with chemicals.</li></ul><p><strong>Don’ts</strong>:</p><ul><li>Don’t wear your diamond pieces during rough physical activities.</li><li>Don’t expose jewellery to chlorine, bleach, or harsh cleaning products.</li><li>Don’t store all diamond jewellery together in one box.</li></ul><p>Following these diamond jewellery care tips ensures your accessories remain just as beautiful as the day you bought them.</p><h2><strong>Common Mistakes People Make with Diamond Jewellery</strong></h2><p>Even with the best intentions, certain habits can damage jewellery over time.</p><p><strong>Wearing jewellery daily without cleaning</strong>: Oils and dirt accumulate faster than you think.</p><p><strong>Ignoring loose stones</strong>: Small movements in prongs may eventually lead to lost diamonds.</p><p><strong>Mixing storage with other jewellery</strong>: A diamond bracelet rubbing against softer gemstones or gold chains can cause scratches.</p><p>Avoiding these common mistakes with diamond jewellery helps you protect both its value and sentiment.</p><h2><strong>Long-Term Care for Diamond Jewellery</strong></h2><p>Long-term diamond jewellery care goes beyond daily cleaning.</p><p><strong>Annual professional check-ups</strong>: Regular inspections detect early issues before they become costly repairs.</p><p><strong>Resizing and re-polishing</strong>: Over time, rings may need resizing, and metal bands may benefit from professional polishing.</p><p><strong>Insurance for valuable pieces</strong>: For high-value items such as certified diamond jewellery, designer diamond jewellery, or luxury diamond jewellery, insurance offers peace of mind against theft or loss.</p><p>This approach ensures your fine <strong>diamond jewellery</strong> remains secure, polished, and ready to pass down as an heirloom.</p><h2><strong>Conclusion</strong></h2><p><strong>Diamond jewellery</strong> is more than just a precious adornment; it\'s a reflection of love, milestones, and cherished memories. From engagement rings that mark the beginning of forever to heirloom <strong>diamond necklaces</strong> passed down through generations, every piece deserves the care that matches its value. With regular cleaning, safe storage, and timely professional check-ups, your jewellery can retain its brilliance for decades to come.</p><p>Remember, even the hardest diamond needs attention to keep its sparkle alive. By avoiding common mistakes and following these simple <strong>diamond jewellery</strong> care tips, you’re not just preserving beauty you’re protecting memories and ensuring they shine bright for future generations.</p><p>At <strong>Dope Jewells</strong>, we believe every diamond deserves to shine at its best. Whether you need professional diamond jewellery cleaning, guidance on long-term care, or are looking to add a certified, luxury diamond piece to your collection, we’re here to help.</p><p>Take the next step, give<strong> your jewellery the care it deserves or find your next timeless piece at</strong> <strong>Dope Jewells.</strong></p><h2><strong>Frequently Asked Questions (FAQs)</strong></h2><p><strong>1. How often should you clean diamond jewellery?</strong></p><p><strong>Answer: </strong>At home, once every two weeks is ideal. Professional cleaning every 6–12 months keeps it in top condition.</p><p><strong>2. Can I use toothpaste to clean diamond jewellery?</strong></p><p><strong>Answer: </strong>No. Toothpaste is abrasive and can scratch metals and settings. Stick to mild soap and water.</p><p><strong>3. What’s the best way to store diamond jewellery?</strong></p><p><strong>Answer: </strong>Use a fabric-lined jewellery box with separate compartments or soft pouches to prevent scratches.</p><p><strong>4. How do I know if my diamond jewellery needs professional cleaning?</strong></p><p><strong>Answer: </strong>If your jewellery looks dull despite regular cleaning, or if you notice loose stones or worn prongs, it’s time for a professional inspection.</p>\";s:14:\"featured_image\";s:50:\"media/4LwanvQ724CtuYYFgTUC07rsu1t2HQi77TZDchfh.jpg\";s:10:\"meta_title\";s:53:\"DOPE JEWELLS | Luxury Gold & Diamond Jewellery Online\";s:16:\"meta_description\";s:53:\"DOPE JEWELLS | Luxury Gold & Diamond Jewellery Online\";s:13:\"meta_keywords\";s:158:\"Shop luxury gold and diamond jewellery at DOPE JEWELLS. Discover handcrafted designs, bridal collections, and certified fine jewellery with timeless elegance.\";s:13:\"schema_markup\";s:529:\"<script type=\"application/ld+json\">\r\n{\r\n  \"@context\": \"https://schema.org\",\r\n  \"@type\": \"JewelryStore\",\r\n  \"name\": \"DOPE JEWELLS\",\r\n  \"url\": \"{{ url(\'/\') }}\",\r\n  \"logo\": \"{{ asset(\'logo.png\') }}\",\r\n  \"description\": \"DOPE JEWELLS offers premium handcrafted gold and diamond jewellery with certified quality and timeless elegance.\",\r\n  \"address\": {\r\n    \"@type\": \"PostalAddress\",\r\n    \"addressCountry\": \"IN\"\r\n  },\r\n  \"sameAs\": [\r\n    \"https://www.instagram.com/yourpage\",\r\n    \"https://www.facebook.com/yourpage\"\r\n  ]\r\n}\r\n</script>\";s:6:\"status\";s:9:\"published\";s:12:\"published_at\";s:19:\"2026-04-29 13:18:00\";s:11:\"is_featured\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-30 11:01:17\";}s:11:\"\0*\0original\";a:17:{s:2:\"id\";i:1;s:11:\"category_id\";i:1;s:9:\"author_id\";i:1;s:5:\"title\";s:59:\"Diamond Jewellery Care Tips: Make Your Sparkle Last Forever\";s:4:\"slug\";s:40:\"the-art-of-layering-gold-chains-pendants\";s:7:\"summary\";s:81:\"Master the trend of layering delicate gold chains for a sophisticated daily look.\";s:7:\"content\";s:10062:\"<p><strong>Diamond jewellery</strong> has always held a special place in people’s hearts. More than just accessories, these pieces are symbols of love, milestones, and sometimes even heirlooms that pass from one generation to the next.&nbsp;</p><p>Whether it’s a pair of elegant <strong>diamond earrings gifted</strong> on an anniversary, a solitaire engagement ring marking the promise of forever, or a diamond necklace that adds a touch of luxury to a bridal outfit, every piece carries emotions that go far beyond its sparkle.</p><p>But while diamonds are known as the hardest natural material on earth, <strong>diamond jewellery</strong> still needs attention and care. The diamonds may remain unscathed, but the settings, whether crafted in gold, platinum, or silver, are more delicate and prone to scratches, dirt, and loosening.&nbsp;</p><p>Without proper care, even the most exquisite fine <strong>diamond jewellery </strong>can lose its brilliance over time. That’s why following consistent diamond jewellery care tips is so important. With the right habits, your <strong>diamond pieces</strong> can shine just as brightly decades later as the day you first wore them.</p><h2><strong>Why Diamond Jewellery Needs Proper Care</strong></h2><p>Diamonds may be indestructible in many ways, but diamond ornaments are still vulnerable. The sparkle that makes them irresistible can easily get clouded by oils from your skin, makeup residue, lotions, or even everyday dust. Over time, this dull layer can block light from entering the stone, reducing its fire and brilliance.</p><p>More importantly, the metals that hold your diamonds, whether it’s white gold, yellow gold, platinum, or silver are not as durable as the stones themselves. These settings can bend, scratch, or weaken with frequent wear, making it possible for a diamond to loosen or even fall out. That’s why <strong>diamond jewellery</strong> maintenance is not only about preserving beauty but also about protecting your investment and emotional attachment.</p><h2><strong>Daily Diamond Jewellery Care Tips</strong></h2><p>One of the simplest ways to ensure long-term sparkle is by developing daily habits for proper care.</p><p><strong>Remove before physical activity</strong>: Whether you’re at the gym, swimming, or doing household chores, it’s best to take off your rings, bracelets, or bangles. Chemicals in chlorine pools, detergent, or even sweat can damage the metal and reduce shine.</p><p><strong>Handle with care</strong>: Always hold rings or necklaces by their band or chain rather than the stone. This prevents oils from your fingers from transferring to the diamonds.</p><p><strong>Wipe after wearing</strong>: A quick wipe with a clean, soft, lint-free cloth can remove surface oils and dirt before they build up.</p><p>These simple daily care practices for diamond jewellery don’t take much effort but make a huge difference in maintaining that natural sparkle.</p><h2><strong>How to Clean Diamond Jewellery at Home</strong></h2><p>Cleaning diamond jewellery at home is easy if done correctly. All you need are a few safe household items:</p><p><strong>Prepare a solution</strong>: Mix lukewarm water with a few drops of mild dish soap.</p><p><strong>Soak the jewellery</strong>: Place your diamond rings, earrings, or necklaces in the solution for about 15–20 minutes.</p><p><strong>Brush gently</strong>: Use a very soft-bristled toothbrush to clean around the prongs, under the diamond, and in small crevices. Avoid scrubbing too hard.</p><p><strong>Rinse well</strong>: Wash with clean lukewarm water to remove all soap.</p><p><strong>Dry carefully</strong>: Pat dry with a soft lint-free cloth.</p><p><strong>What to avoid:</strong> Harsh chemicals like bleach, acetone, or toothpaste should never be used. They can erode metal and leave scratches. Ultrasonic cleaning machines are also risky for delicate settings like pavé or halo designs, as the vibrations may loosen smaller diamonds.</p><p>These steps are the best way to clean diamond jewellery at home without risking damage.</p><h2><strong>Professional Diamond Jewellery Cleaning &amp; Inspection</strong></h2><p>While at-home care keeps jewellery looking fresh, nothing beats the expertise of a professional jeweller. Professional diamond jewellery cleaning uses specialized equipment that restores brilliance without harming delicate settings.</p><p>It’s recommended to have your fine diamond jewellery inspected and cleaned professionally every <strong>6–12 months</strong>. During these check-ups, jewellers ensure that prongs are secure, clasps are working properly, and no diamonds are at risk of falling out.</p><p>If you wear <strong>engagement diamond rings</strong> or bridal diamond jewellery daily, scheduling these professional check-ups becomes even more important. They’re not just about cleaning they help maintain the structural integrity of your precious adornments.</p><h2><strong>How to Store Diamond Jewellery Safely</strong></h2><p>Storage is another vital part of diamond jewellery care. When stored improperly, even the hardest stones can scratch other precious pieces.</p><p><strong>Use separate compartments</strong>: A jewellery box with fabric-lined compartments ensures pieces don’t rub against each other.</p><p><strong>Store in soft pouches</strong>: Diamond earrings, bracelets, or rings can be kept in velvet or satin pouches for added protection.</p><p><strong>Travel with care</strong>: For trips, use a dedicated jewellery travel case with padded slots to keep each piece safe.</p><p>Knowing how to store diamond jewellery correctly prevents unnecessary scratches and keeps your collection sparkling for years.</p><h2><strong>Dos and Don’ts of Diamond Jewellery Care</strong></h2><p>A few golden rules can make all the difference:</p><p><strong>Dos</strong>:</p><ul><li>Clean your diamond jewellery regularly with mild soap and water.</li><li>Check prongs, clasps, and settings frequently.</li><li>Remove before swimming, exercising, or cleaning with chemicals.</li></ul><p><strong>Don’ts</strong>:</p><ul><li>Don’t wear your diamond pieces during rough physical activities.</li><li>Don’t expose jewellery to chlorine, bleach, or harsh cleaning products.</li><li>Don’t store all diamond jewellery together in one box.</li></ul><p>Following these diamond jewellery care tips ensures your accessories remain just as beautiful as the day you bought them.</p><h2><strong>Common Mistakes People Make with Diamond Jewellery</strong></h2><p>Even with the best intentions, certain habits can damage jewellery over time.</p><p><strong>Wearing jewellery daily without cleaning</strong>: Oils and dirt accumulate faster than you think.</p><p><strong>Ignoring loose stones</strong>: Small movements in prongs may eventually lead to lost diamonds.</p><p><strong>Mixing storage with other jewellery</strong>: A diamond bracelet rubbing against softer gemstones or gold chains can cause scratches.</p><p>Avoiding these common mistakes with diamond jewellery helps you protect both its value and sentiment.</p><h2><strong>Long-Term Care for Diamond Jewellery</strong></h2><p>Long-term diamond jewellery care goes beyond daily cleaning.</p><p><strong>Annual professional check-ups</strong>: Regular inspections detect early issues before they become costly repairs.</p><p><strong>Resizing and re-polishing</strong>: Over time, rings may need resizing, and metal bands may benefit from professional polishing.</p><p><strong>Insurance for valuable pieces</strong>: For high-value items such as certified diamond jewellery, designer diamond jewellery, or luxury diamond jewellery, insurance offers peace of mind against theft or loss.</p><p>This approach ensures your fine <strong>diamond jewellery</strong> remains secure, polished, and ready to pass down as an heirloom.</p><h2><strong>Conclusion</strong></h2><p><strong>Diamond jewellery</strong> is more than just a precious adornment; it\'s a reflection of love, milestones, and cherished memories. From engagement rings that mark the beginning of forever to heirloom <strong>diamond necklaces</strong> passed down through generations, every piece deserves the care that matches its value. With regular cleaning, safe storage, and timely professional check-ups, your jewellery can retain its brilliance for decades to come.</p><p>Remember, even the hardest diamond needs attention to keep its sparkle alive. By avoiding common mistakes and following these simple <strong>diamond jewellery</strong> care tips, you’re not just preserving beauty you’re protecting memories and ensuring they shine bright for future generations.</p><p>At <strong>Dope Jewells</strong>, we believe every diamond deserves to shine at its best. Whether you need professional diamond jewellery cleaning, guidance on long-term care, or are looking to add a certified, luxury diamond piece to your collection, we’re here to help.</p><p>Take the next step, give<strong> your jewellery the care it deserves or find your next timeless piece at</strong> <strong>Dope Jewells.</strong></p><h2><strong>Frequently Asked Questions (FAQs)</strong></h2><p><strong>1. How often should you clean diamond jewellery?</strong></p><p><strong>Answer: </strong>At home, once every two weeks is ideal. Professional cleaning every 6–12 months keeps it in top condition.</p><p><strong>2. Can I use toothpaste to clean diamond jewellery?</strong></p><p><strong>Answer: </strong>No. Toothpaste is abrasive and can scratch metals and settings. Stick to mild soap and water.</p><p><strong>3. What’s the best way to store diamond jewellery?</strong></p><p><strong>Answer: </strong>Use a fabric-lined jewellery box with separate compartments or soft pouches to prevent scratches.</p><p><strong>4. How do I know if my diamond jewellery needs professional cleaning?</strong></p><p><strong>Answer: </strong>If your jewellery looks dull despite regular cleaning, or if you notice loose stones or worn prongs, it’s time for a professional inspection.</p>\";s:14:\"featured_image\";s:50:\"media/4LwanvQ724CtuYYFgTUC07rsu1t2HQi77TZDchfh.jpg\";s:10:\"meta_title\";s:53:\"DOPE JEWELLS | Luxury Gold & Diamond Jewellery Online\";s:16:\"meta_description\";s:53:\"DOPE JEWELLS | Luxury Gold & Diamond Jewellery Online\";s:13:\"meta_keywords\";s:158:\"Shop luxury gold and diamond jewellery at DOPE JEWELLS. Discover handcrafted designs, bridal collections, and certified fine jewellery with timeless elegance.\";s:13:\"schema_markup\";s:529:\"<script type=\"application/ld+json\">\r\n{\r\n  \"@context\": \"https://schema.org\",\r\n  \"@type\": \"JewelryStore\",\r\n  \"name\": \"DOPE JEWELLS\",\r\n  \"url\": \"{{ url(\'/\') }}\",\r\n  \"logo\": \"{{ asset(\'logo.png\') }}\",\r\n  \"description\": \"DOPE JEWELLS offers premium handcrafted gold and diamond jewellery with certified quality and timeless elegance.\",\r\n  \"address\": {\r\n    \"@type\": \"PostalAddress\",\r\n    \"addressCountry\": \"IN\"\r\n  },\r\n  \"sameAs\": [\r\n    \"https://www.instagram.com/yourpage\",\r\n    \"https://www.facebook.com/yourpage\"\r\n  ]\r\n}\r\n</script>\";s:6:\"status\";s:9:\"published\";s:12:\"published_at\";s:19:\"2026-04-29 13:18:00\";s:11:\"is_featured\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-30 11:01:17\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:2:{s:12:\"published_at\";s:8:\"datetime\";s:11:\"is_featured\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:8:\"category\";O:23:\"App\\Models\\BlogCategory\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:15:\"blog_categories\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:14:\"Jewelry Trends\";s:4:\"slug\";s:14:\"jewelry-trends\";s:11:\"description\";s:31:\"Latest trends in luxury jewelry\";s:6:\"status\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-29 13:18:47\";}s:11:\"\0*\0original\";a:7:{s:2:\"id\";i:1;s:4:\"name\";s:14:\"Jewelry Trends\";s:4:\"slug\";s:14:\"jewelry-trends\";s:11:\"description\";s:31:\"Latest trends in luxury jewelry\";s:6:\"status\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-29 13:18:47\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:0:{}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:0:{}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:4:{i:0;s:4:\"name\";i:1;s:4:\"slug\";i:2;s:11:\"description\";i:3;s:6:\"status\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:14:{i:0;s:11:\"category_id\";i:1;s:9:\"author_id\";i:2;s:5:\"title\";i:3;s:4:\"slug\";i:4;s:7:\"summary\";i:5;s:7:\"content\";i:6;s:14:\"featured_image\";i:7;s:10:\"meta_title\";i:8;s:16:\"meta_description\";i:9;s:13:\"meta_keywords\";i:10;s:13:\"schema_markup\";i:11;s:6:\"status\";i:12;s:12:\"published_at\";i:13;s:11:\"is_featured\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:1;O:19:\"App\\Models\\BlogPost\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"blog_posts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:17:{s:2:\"id\";i:2;s:11:\"category_id\";i:1;s:9:\"author_id\";i:1;s:5:\"title\";s:64:\"How Minimalist Diamond Jewellery Is Taking Over Everyday Fashion\";s:4:\"slug\";s:45:\"minimalist-diamond-jewellery-everyday-fashion\";s:7:\"summary\";s:87:\"A comprehensive guide to selecting a diamond ring that reflects your unique love story.\";s:7:\"content\";s:10697:\"<p>Fashion has always evolved with the times, but one shift stands out today more than ever the move towards minimalism. The world is embracing simplicity, clean design, and effortless elegance. Heavy, ornate jewellery that once dominated special occasions is gradually giving way to lightweight and versatile pieces. <strong>Diamond jewellery</strong>, in particular, has found its place in everyday fashion, not through grandeur but through sleek, modern minimalism. The rise of <strong>minimalist diamond jewellery</strong> is redefining how women and men alike style themselves for work, casual outings, and even evening events. By blending subtlety with sparkle, this trend proves that luxury can be understated, wearable, and timeless.</p><h2><strong>The Shift Towards Minimalism in Fashion</strong></h2><p>Across global fashion runways and street styles, the emphasis has moved from excess to essentials. Minimalist accessories reflect a lifestyle choice where less is more and subtlety speaks volumes. Professionals, millennials, and Gen Z are especially drawn to this change because it aligns with their fast-paced lives and desire for <strong>effortless chic jewellery</strong>. Minimal designs are not only aesthetically pleasing but also highly versatile. A simple <strong>diamond pendant necklace</strong> or a pair of <strong>dainty diamond earrings</strong> can transition seamlessly from an office boardroom to a relaxed dinner with friends. This balance between simplicity and sophistication is why <strong>modern diamond jewellery</strong> resonates so strongly with younger generations.</p><h2><strong>What Makes Minimalist Diamond Jewellery Special?</strong></h2><p>Minimalist jewellery highlights craftsmanship and clarity rather than heavy embellishments. Pieces are designed with <strong>clean lines, delicate settings, and timeless beauty</strong>. A small solitaire pendant, a pair of classic diamond studs, or <strong>stackable diamond rings</strong> each carry a subtle elegance that doesn’t overpower but enhances any outfit. The value of diamonds remains unchanged; they continue to symbolize love, success, and sophistication. However, their form has shifted. Rather than being reserved for weddings or special occasions, <strong>everyday diamond jewellery</strong> has become the norm, appealing to those who prefer wearable luxury.</p><h2><strong>Everyday Fashion Meets Diamond Jewellery</strong></h2><p>Styling diamonds no longer requires a grand event. Minimalist pieces have made it easy to incorporate diamonds into <strong>daily wear</strong>: <strong>Office Wear:</strong> Sleek studs, fine diamond pendants, or <strong>minimalist diamond earrings</strong> add a professional polish without being flashy. <strong>Casual Outfits:</strong> Thin <strong>stackable rings</strong> or a dainty bracelet pair perfectly with jeans, summer dresses, or smart casuals. <strong>Evening Looks:</strong> Layered <strong>minimalist diamond necklaces</strong> or <strong>contemporary solitaire jewellery</strong> bring understated glamour to night-outs or dinners. The versatility of these designs is why <strong>fine jewellery for modern women</strong> is no longer locked inside lockers, waiting for weddings. Instead, diamonds are part of <strong>everyday fashion accessories, elegant</strong>, wearable, and meaningful.</p><h2><strong>Why Millennials &amp; Gen Z Prefer Minimalist Diamond Jewellery</strong></h2><p>The younger generation has redefined the meaning of luxury. Rather than indulging in bulky, traditional pieces, they prefer jewellery that complements their lifestyles. The reasons are clear: <strong>Affordability &amp; Accessibility:</strong> Minimalist designs often cost less than heavy traditional jewellery, making <strong>affordable diamond jewellery</strong> more accessible. <strong>Sustainability:</strong> With the rise of <strong>lab-grown diamond jewellery</strong> and <strong>sustainable diamond jewellery</strong>, conscious buyers are choosing ethical options. <strong>Functionality:</strong> Lightweight designs suit daily commutes, work meetings, and casual hangouts. <strong>Fashion Influence:</strong> Social media trends, especially on Instagram and TikTok, celebrate <strong>minimalist fashion accessories</strong>, showing that <strong>everyday diamond jewellery</strong> is not only stylish but aspirational. This is why <strong>diamond jewellery for millennials and Gen Z</strong> has moved from being a luxury purchase to a lifestyle essential.</p><h2><strong>Popular Minimalist Diamond Jewellery Styles in 2025</strong></h2><p>Fashion-forward individuals in 2025 are gravitating towards specific styles that balance elegance with simplicity: <strong>Diamond Studs &amp; Solitaire Earrings:</strong> Perfect for both professional and casual wear. <strong>Dainty Diamond Pendants:</strong> Simple necklaces with a single stone remain timeless. <strong>Minimalist Engagement Rings:</strong> Sleek bands with delicate stones reflect understated romance. <strong>Stackable Diamond Rings &amp; Bracelets:</strong> Allow versatility in styling while keeping it chic. <strong>Lightweight Diamond Necklaces:</strong> Everyday wear pieces designed for layering and styling flexibility. These pieces aren’t just accessories; they represent a lifestyle shift toward <strong>luxury made simple</strong>.</p><h2><strong>Benefits of Investing in Minimalist Diamond Jewellery</strong></h2><p>Minimalist designs carry more than just beauty. They represent value and practicality: <strong>Timeless Appeal:</strong> Diamonds never go out of style, regardless of trends. <strong>Every Occasion Ready:</strong> Whether office, casual, or evening, they fit seamlessly. <strong>Effortless Elegance:</strong> They enhance the outfit without stealing the spotlight. <strong>Smart Investment:</strong> Lightweight yet durable, minimalist jewellery ensures long-term usage. Unlike traditional heavy sets that are reserved for festivals or weddings, <strong>minimalist diamond jewellery</strong> becomes part of everyday fashion, maximizing wearability and return on investment.</p><h2><strong>How to Choose Minimalist Diamond Jewellery for Everyday Fashion</strong></h2><p>When shopping for minimalist designs, consider these tips: <strong>Cut &amp; Clarity:</strong> For smaller stones, brilliance matters more than size. <strong>Carat Balance:</strong> Opt for subtle carats that are budget-friendly yet impactful. <strong>Versatility:</strong> Choose designs like studs, pendants, or slim rings that match multiple outfits. <strong>Personal Style:</strong> Whether you prefer <strong>dainty diamond rings</strong> or <strong>sleek pendants</strong>, choose pieces that reflect your personality. For everyday wear, pieces should be lightweight, easy to maintain, and comfortable for long hours, making them ideal as <strong>fashion-forward diamond trends</strong>.</p><h2><strong>The Future of Diamond Jewellery in Everyday Fashion</strong></h2><p>The future of <strong>contemporary diamond jewellery</strong> is deeply tied to sustainability, personalization, and technology. <strong>Lab-grown diamonds</strong> are becoming increasingly popular, offering the same sparkle as mined stones but with an ethical edge. Customization is also on the rise, with individuals preferring jewellery that reflects their identity. Technology is transforming shopping experiences too, with virtual try-ons and AR tools allowing customers to visualize <strong>dainty diamond designs</strong> before purchase. The combination of sustainability, style, and tech ensures that <strong>diamond jewellery for everyday wear</strong> will continue to dominate in the years ahead.</p><h2><strong>Conclusion</strong></h2><p>Minimalist jewellery is not a passing trend, it\'s a fashion evolution. By combining the timeless allure of diamonds with clean, modern designs, this movement has made diamonds more approachable, versatile, and wearable. <strong>Minimalist diamond jewellery</strong> embodies luxury without excess, fitting seamlessly into the wardrobes of professionals, millennials, and Gen Z alike. As the world embraces <strong>everyday diamond jewellery</strong>, pieces like <strong>solitaire earrings, stackable rings, dainty pendants, and sustainable designs</strong> are leading the way. Fashion today is about expressing individuality with elegance, and nothing captures that balance better than the simplicity of diamonds. For those who want to elevate their daily outfits with a touch of understated brilliance, the future of fashion lies in the timeless charm of minimalist diamonds. <strong>Minimalist diamond jewellery</strong> is redefining everyday fashion, elegant, versatile, and timeless. From dainty rings to sleek pendants, each piece adds effortless charm to your daily look. Find your perfect match at <strong>Dope Jewells</strong> and let simplicity shine brighter.</p><h2><strong>Frequently Asked Questions (FAQ)</strong></h2><h4><strong>1. What diamond jewellery styles are trending right now?</strong></h4><p><strong>Answer:</strong> Searches show growing interest in <strong>minimalist diamond jewellery</strong> for everyday wear, think subtle studs, thin stacking rings, and sleek pendants. Jewelry news highlights evolving trends toward wearable sparkle integrated into casual outfits.</p><h4><strong>2. Are lab-grown diamonds becoming more popular than natural diamonds?</strong></h4><p><strong>Answer:</strong> Lab-grown diamonds are on the rise projected to drive significant market share and gaining traction due to their ethical appeal and affordability. Search interest in lab-grown diamond jewellery is notably increasing.</p><h4><strong>3. What are the most searched types of diamond jewellery?</strong></h4><p><strong>Answer:</strong> Among all jewelry categories, <strong>diamond earrings, necklaces, and rings</strong> dominate search popularity. Notably, “diamond earrings” enjoys high monthly search volumes far above other types.</p><h4><strong>4. How is personalization influencing diamond jewellery trends?</strong></h4><p><strong>Answer:</strong> Searches reflect strong interest in <strong>personalized diamond pieces</strong> including initial pendants, birthstone designs, and bespoke customization options that add emotional value and individuality.</p><h4><strong>5. Which diamond jewellery trends are emerging in 2025?</strong></h4><p><strong>Answer: </strong>Key rising trends include <strong>cluster styles</strong>, <strong>mixed metals</strong>, <strong>minimalist everyday diamonds</strong>, <strong>vintage-inspired cuts</strong>, and a focus on <strong>sustainability and ethical sourcing</strong>.</p>\";s:14:\"featured_image\";s:50:\"media/sKXQSZ0wypdbU8dpvJeAOT1cPduHWu4HW3XwA68W.jpg\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;s:6:\"status\";s:9:\"published\";s:12:\"published_at\";s:19:\"2026-04-29 13:18:00\";s:11:\"is_featured\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-30 05:33:03\";}s:11:\"\0*\0original\";a:17:{s:2:\"id\";i:2;s:11:\"category_id\";i:1;s:9:\"author_id\";i:1;s:5:\"title\";s:64:\"How Minimalist Diamond Jewellery Is Taking Over Everyday Fashion\";s:4:\"slug\";s:45:\"minimalist-diamond-jewellery-everyday-fashion\";s:7:\"summary\";s:87:\"A comprehensive guide to selecting a diamond ring that reflects your unique love story.\";s:7:\"content\";s:10697:\"<p>Fashion has always evolved with the times, but one shift stands out today more than ever the move towards minimalism. The world is embracing simplicity, clean design, and effortless elegance. Heavy, ornate jewellery that once dominated special occasions is gradually giving way to lightweight and versatile pieces. <strong>Diamond jewellery</strong>, in particular, has found its place in everyday fashion, not through grandeur but through sleek, modern minimalism. The rise of <strong>minimalist diamond jewellery</strong> is redefining how women and men alike style themselves for work, casual outings, and even evening events. By blending subtlety with sparkle, this trend proves that luxury can be understated, wearable, and timeless.</p><h2><strong>The Shift Towards Minimalism in Fashion</strong></h2><p>Across global fashion runways and street styles, the emphasis has moved from excess to essentials. Minimalist accessories reflect a lifestyle choice where less is more and subtlety speaks volumes. Professionals, millennials, and Gen Z are especially drawn to this change because it aligns with their fast-paced lives and desire for <strong>effortless chic jewellery</strong>. Minimal designs are not only aesthetically pleasing but also highly versatile. A simple <strong>diamond pendant necklace</strong> or a pair of <strong>dainty diamond earrings</strong> can transition seamlessly from an office boardroom to a relaxed dinner with friends. This balance between simplicity and sophistication is why <strong>modern diamond jewellery</strong> resonates so strongly with younger generations.</p><h2><strong>What Makes Minimalist Diamond Jewellery Special?</strong></h2><p>Minimalist jewellery highlights craftsmanship and clarity rather than heavy embellishments. Pieces are designed with <strong>clean lines, delicate settings, and timeless beauty</strong>. A small solitaire pendant, a pair of classic diamond studs, or <strong>stackable diamond rings</strong> each carry a subtle elegance that doesn’t overpower but enhances any outfit. The value of diamonds remains unchanged; they continue to symbolize love, success, and sophistication. However, their form has shifted. Rather than being reserved for weddings or special occasions, <strong>everyday diamond jewellery</strong> has become the norm, appealing to those who prefer wearable luxury.</p><h2><strong>Everyday Fashion Meets Diamond Jewellery</strong></h2><p>Styling diamonds no longer requires a grand event. Minimalist pieces have made it easy to incorporate diamonds into <strong>daily wear</strong>: <strong>Office Wear:</strong> Sleek studs, fine diamond pendants, or <strong>minimalist diamond earrings</strong> add a professional polish without being flashy. <strong>Casual Outfits:</strong> Thin <strong>stackable rings</strong> or a dainty bracelet pair perfectly with jeans, summer dresses, or smart casuals. <strong>Evening Looks:</strong> Layered <strong>minimalist diamond necklaces</strong> or <strong>contemporary solitaire jewellery</strong> bring understated glamour to night-outs or dinners. The versatility of these designs is why <strong>fine jewellery for modern women</strong> is no longer locked inside lockers, waiting for weddings. Instead, diamonds are part of <strong>everyday fashion accessories, elegant</strong>, wearable, and meaningful.</p><h2><strong>Why Millennials &amp; Gen Z Prefer Minimalist Diamond Jewellery</strong></h2><p>The younger generation has redefined the meaning of luxury. Rather than indulging in bulky, traditional pieces, they prefer jewellery that complements their lifestyles. The reasons are clear: <strong>Affordability &amp; Accessibility:</strong> Minimalist designs often cost less than heavy traditional jewellery, making <strong>affordable diamond jewellery</strong> more accessible. <strong>Sustainability:</strong> With the rise of <strong>lab-grown diamond jewellery</strong> and <strong>sustainable diamond jewellery</strong>, conscious buyers are choosing ethical options. <strong>Functionality:</strong> Lightweight designs suit daily commutes, work meetings, and casual hangouts. <strong>Fashion Influence:</strong> Social media trends, especially on Instagram and TikTok, celebrate <strong>minimalist fashion accessories</strong>, showing that <strong>everyday diamond jewellery</strong> is not only stylish but aspirational. This is why <strong>diamond jewellery for millennials and Gen Z</strong> has moved from being a luxury purchase to a lifestyle essential.</p><h2><strong>Popular Minimalist Diamond Jewellery Styles in 2025</strong></h2><p>Fashion-forward individuals in 2025 are gravitating towards specific styles that balance elegance with simplicity: <strong>Diamond Studs &amp; Solitaire Earrings:</strong> Perfect for both professional and casual wear. <strong>Dainty Diamond Pendants:</strong> Simple necklaces with a single stone remain timeless. <strong>Minimalist Engagement Rings:</strong> Sleek bands with delicate stones reflect understated romance. <strong>Stackable Diamond Rings &amp; Bracelets:</strong> Allow versatility in styling while keeping it chic. <strong>Lightweight Diamond Necklaces:</strong> Everyday wear pieces designed for layering and styling flexibility. These pieces aren’t just accessories; they represent a lifestyle shift toward <strong>luxury made simple</strong>.</p><h2><strong>Benefits of Investing in Minimalist Diamond Jewellery</strong></h2><p>Minimalist designs carry more than just beauty. They represent value and practicality: <strong>Timeless Appeal:</strong> Diamonds never go out of style, regardless of trends. <strong>Every Occasion Ready:</strong> Whether office, casual, or evening, they fit seamlessly. <strong>Effortless Elegance:</strong> They enhance the outfit without stealing the spotlight. <strong>Smart Investment:</strong> Lightweight yet durable, minimalist jewellery ensures long-term usage. Unlike traditional heavy sets that are reserved for festivals or weddings, <strong>minimalist diamond jewellery</strong> becomes part of everyday fashion, maximizing wearability and return on investment.</p><h2><strong>How to Choose Minimalist Diamond Jewellery for Everyday Fashion</strong></h2><p>When shopping for minimalist designs, consider these tips: <strong>Cut &amp; Clarity:</strong> For smaller stones, brilliance matters more than size. <strong>Carat Balance:</strong> Opt for subtle carats that are budget-friendly yet impactful. <strong>Versatility:</strong> Choose designs like studs, pendants, or slim rings that match multiple outfits. <strong>Personal Style:</strong> Whether you prefer <strong>dainty diamond rings</strong> or <strong>sleek pendants</strong>, choose pieces that reflect your personality. For everyday wear, pieces should be lightweight, easy to maintain, and comfortable for long hours, making them ideal as <strong>fashion-forward diamond trends</strong>.</p><h2><strong>The Future of Diamond Jewellery in Everyday Fashion</strong></h2><p>The future of <strong>contemporary diamond jewellery</strong> is deeply tied to sustainability, personalization, and technology. <strong>Lab-grown diamonds</strong> are becoming increasingly popular, offering the same sparkle as mined stones but with an ethical edge. Customization is also on the rise, with individuals preferring jewellery that reflects their identity. Technology is transforming shopping experiences too, with virtual try-ons and AR tools allowing customers to visualize <strong>dainty diamond designs</strong> before purchase. The combination of sustainability, style, and tech ensures that <strong>diamond jewellery for everyday wear</strong> will continue to dominate in the years ahead.</p><h2><strong>Conclusion</strong></h2><p>Minimalist jewellery is not a passing trend, it\'s a fashion evolution. By combining the timeless allure of diamonds with clean, modern designs, this movement has made diamonds more approachable, versatile, and wearable. <strong>Minimalist diamond jewellery</strong> embodies luxury without excess, fitting seamlessly into the wardrobes of professionals, millennials, and Gen Z alike. As the world embraces <strong>everyday diamond jewellery</strong>, pieces like <strong>solitaire earrings, stackable rings, dainty pendants, and sustainable designs</strong> are leading the way. Fashion today is about expressing individuality with elegance, and nothing captures that balance better than the simplicity of diamonds. For those who want to elevate their daily outfits with a touch of understated brilliance, the future of fashion lies in the timeless charm of minimalist diamonds. <strong>Minimalist diamond jewellery</strong> is redefining everyday fashion, elegant, versatile, and timeless. From dainty rings to sleek pendants, each piece adds effortless charm to your daily look. Find your perfect match at <strong>Dope Jewells</strong> and let simplicity shine brighter.</p><h2><strong>Frequently Asked Questions (FAQ)</strong></h2><h4><strong>1. What diamond jewellery styles are trending right now?</strong></h4><p><strong>Answer:</strong> Searches show growing interest in <strong>minimalist diamond jewellery</strong> for everyday wear, think subtle studs, thin stacking rings, and sleek pendants. Jewelry news highlights evolving trends toward wearable sparkle integrated into casual outfits.</p><h4><strong>2. Are lab-grown diamonds becoming more popular than natural diamonds?</strong></h4><p><strong>Answer:</strong> Lab-grown diamonds are on the rise projected to drive significant market share and gaining traction due to their ethical appeal and affordability. Search interest in lab-grown diamond jewellery is notably increasing.</p><h4><strong>3. What are the most searched types of diamond jewellery?</strong></h4><p><strong>Answer:</strong> Among all jewelry categories, <strong>diamond earrings, necklaces, and rings</strong> dominate search popularity. Notably, “diamond earrings” enjoys high monthly search volumes far above other types.</p><h4><strong>4. How is personalization influencing diamond jewellery trends?</strong></h4><p><strong>Answer:</strong> Searches reflect strong interest in <strong>personalized diamond pieces</strong> including initial pendants, birthstone designs, and bespoke customization options that add emotional value and individuality.</p><h4><strong>5. Which diamond jewellery trends are emerging in 2025?</strong></h4><p><strong>Answer: </strong>Key rising trends include <strong>cluster styles</strong>, <strong>mixed metals</strong>, <strong>minimalist everyday diamonds</strong>, <strong>vintage-inspired cuts</strong>, and a focus on <strong>sustainability and ethical sourcing</strong>.</p>\";s:14:\"featured_image\";s:50:\"media/sKXQSZ0wypdbU8dpvJeAOT1cPduHWu4HW3XwA68W.jpg\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;s:6:\"status\";s:9:\"published\";s:12:\"published_at\";s:19:\"2026-04-29 13:18:00\";s:11:\"is_featured\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-30 05:33:03\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:2:{s:12:\"published_at\";s:8:\"datetime\";s:11:\"is_featured\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:8:\"category\";r:7932;}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:14:{i:0;s:11:\"category_id\";i:1;s:9:\"author_id\";i:2;s:5:\"title\";i:3;s:4:\"slug\";i:4;s:7:\"summary\";i:5;s:7:\"content\";i:6;s:14:\"featured_image\";i:7;s:10:\"meta_title\";i:8;s:16:\"meta_description\";i:9;s:13:\"meta_keywords\";i:10;s:13:\"schema_markup\";i:11;s:6:\"status\";i:12;s:12:\"published_at\";i:13;s:11:\"is_featured\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:2;O:19:\"App\\Models\\BlogPost\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"blog_posts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:17:{s:2:\"id\";i:3;s:11:\"category_id\";i:1;s:9:\"author_id\";i:1;s:5:\"title\";s:61:\"Why Lab-Grown Diamonds Are Redefining Modern Jewellery Trends\";s:4:\"slug\";s:61:\"why-lab-grown-diamonds-are-redefining-modern-jewellery-trends\";s:7:\"summary\";s:74:\"Exploring the beauty and ethical considerations of modern diamond choices.\";s:7:\"content\";s:10738:\"<p>The jewellery landscape is undergoing a transformation. No longer confined to traditional expectations, the industry is responding to a new wave of consumers who prioritize <strong>ethics</strong>, <strong>sustainability</strong>, and <strong>authenticity</strong> as much as aesthetics and brilliance. At the heart of this shift is the rise of <strong>lab-grown diamonds</strong> also referred to as <strong>lab-created diamonds</strong>, <strong>man-made diamonds</strong>, <strong>synthetic diamonds</strong>, or <strong>cultured diamonds</strong>. These <strong>laboratory-grown gemstones</strong> are emerging as a powerful force reshaping the very idea of luxury. A combination of science, ethics, and modern style, they are appealing to Gen Z and Millennials who want more than sparkle they want values. Today, what’s precious isn’t just rarity; it’s responsibility. And <strong>lab-fabricated diamonds</strong> are fast becoming the symbol of that conscious choice.</p><h2><strong>What Exactly Are Lab-Grown Diamonds?</strong></h2><p><strong>Lab-grown diamonds</strong> are <strong>chemically, physically, and optically identical</strong> to natural diamonds. The only difference is their origin. Instead of forming under the earth’s crust over billions of years, these diamonds are created in advanced labs using <strong>High Pressure High Temperature (HPHT)</strong> or <strong>Chemical Vapor Deposition (CVD)</strong> methods. Both techniques mimic the natural formation process, delivering diamonds with the same dazzling clarity, cut, and brilliance as their mined counterparts. It’s important to clear the air lab-created diamonds are not imitations. They are not cubic zirconia or rhinestones. These are <strong>real diamonds</strong>, often certified by reputable bodies like <strong>GIA</strong> or <strong>IGI</strong>, and they meet the same standards in carat, cut, color, and clarity.</p><h2><strong>The Shift in Consumer Preferences</strong></h2><p>The definition of luxury is evolving. Modern buyers are far more conscious of how their purchases affect the world.</p><h3><strong>Ethical Choices Drive Demand</strong></h3><p>Today’s jewellery lovers, especially younger consumers, want more than sparkle they demand <strong>conflict-free diamonds</strong>, <strong>responsible sourcing</strong>, and transparency. For many, a diamond that funds war or contributes to ecological damage isn’t just unappealing it’s unacceptable. <strong>Eco-conscious consumers</strong> are increasingly drawn toward options that reduce harm. That’s where <strong>lab-grown diamonds</strong> shine. Free from the moral baggage of traditional mining, they offer a <strong>cleaner, kinder path to elegance</strong>.</p><h3><strong>Gen Z and Millennials Set the Pace</strong></h3><p>This is also a generational change. Gen Z and Millennials the future of luxury are leading the movement toward <strong>sustainable diamonds</strong>. Influenced by social media, ethical values, and environmental awareness, these consumers are turning away from mined stones in favor of <strong>man-made diamonds</strong>. In India and globally, younger buyers are investing in <strong>modern jewellery</strong> that reflects both their personality and principles.</p><h2><strong>Why Lab-Grown Diamonds Are Reshaping Jewellery Trends</strong></h2><h3><strong>Sustainability &amp; Environmental Impact</strong></h3><p>Mining diamonds comes at a high environmental cost, land degradation, water waste, carbon emissions, and destroyed ecosystems. In contrast, <strong>lab-grown diamonds</strong> drastically reduce these impacts.</p><ul><li>Up to 60% less energy consumption</li><li>No habitat destruction</li><li>Significantly lower water usage</li><li><strong>Carbon-neutral jewellery</strong> possibilities</li></ul><p>This makes <strong>lab-created diamonds</strong> the go-to option for buyers who prioritize the planet.</p><h3><strong>Ethical Sourcing &amp; Transparency</strong></h3><p>No more wondering where a diamond came from. With <strong>lab-grown stones</strong>, traceability is built-in. From the lab to the showroom, every step is <strong>transparent</strong>. They’re <strong>conflict-free</strong>, untainted by human rights violations, and made without the exploitation often linked to mining operations. In a world demanding accountability, this matters deeply.</p><h3><strong>Affordability Without Compromise</strong></h3><p>Lab-fabricated diamonds typically cost <strong>20–40% less</strong> than their mined equivalents. That means consumers can invest in <strong>larger, higher-quality stones</strong> or <strong>custom jewellery</strong> without stretching their budget. This accessibility is redefining what luxury means <strong>fine jewellery</strong> can now be both high-end and value-driven.</p><h3><strong>Design Innovation &amp; Creative Freedom</strong></h3><p>With the availability of consistently high-quality stones, designers have the freedom to <strong>experiment with bold, unique creations</strong>. From <strong>minimalist jewellery</strong> to dramatic <strong>bridal sets</strong>, the possibilities are endless. <strong>Lab-grown diamonds</strong> empower jewellers to break away from conventional constraints and create pieces that are imaginative, sustainable, and entirely modern.</p><h2><strong>Aligning With Modern Jewellery Trends</strong></h2><p>Across the world, <strong>lab-created diamonds</strong> are finding their place in some of the most important jewellery trends of our time.</p><h3><strong>Minimalist and Gender-Neutral Designs</strong></h3><p>Today’s consumers are embracing subtle elegance. Whether it’s a <strong>clean diamond ring</strong>, a <strong>gender-fluid bracelet</strong>, or a <strong>simple necklace</strong>, the trend leans toward timeless pieces with emotional depth. <strong>Lab-grown stones</strong> naturally fit into these trends with their understated brilliance and contemporary feel.</p><h3><strong>Conscious Luxury</strong></h3><p>Luxury no longer means excess, it means integrity. From <strong>recycled gold</strong> to <strong>eco-conscious gemstones</strong>, consumers are choosing items that align with their values. <strong>Cultured diamonds</strong> speak directly to this audience.</p><h3><strong>Technology Meets Artistry</strong></h3><p>Jewellery is now a blend of science and craftsmanship. <strong>High-tech gemstones</strong>, like synthetic diamonds and <strong>moissanite</strong>, reflect an era where technology enhances beauty. <strong>Lab-grown diamonds</strong>, born in cutting-edge labs, are the epitome of this fusion.</p><h3><strong>Customisation is King</strong></h3><p>Custom <strong>engagement rings</strong> and <strong>personalised jewellery</strong> are no longer a niche they’re mainstream. Since lab-created diamonds are more affordable, they enable customisation without compromise, leading to pieces that feel deeply personal and truly one-of-a-kind.</p><h2><strong>Breaking the Myths Around Lab-Grown Diamonds</strong></h2><p>Despite growing popularity, myths persist. Let’s address them.</p><h3><strong>Myth 1: They’re Not Real Diamonds</strong></h3><p>False. Lab-created diamonds are <strong>real diamonds</strong>, identical in every measurable way structure, brilliance, and composition.</p><h3><strong>Myth 2: They’re Low Quality</strong></h3><p>Also false. Lab-grown diamonds can achieve equal or better grades than natural ones in clarity, cut, and color. In fact, many high-end pieces use <strong>engineered diamonds</strong> specifically for their quality control.</p><h3><strong>Myth 3: Poor Resale Value</strong></h3><p>While resale dynamics vary, this argument applies to most jewellery not just lab-grown stones. Besides, modern consumers prioritise <strong>style, sustainability</strong>, and <strong>ethics</strong> over resale.</p><h2><strong>Celebrities &amp; Brands Supporting the Movement</strong></h2><p>The global spotlight is turning toward <strong>lab-fabricated diamonds</strong>. Actors, activists, and designers are championing this shift. <strong>Leonardo DiCaprio</strong>, a known investor in ethical diamond ventures, has publicly advocated for <strong>conflict-free alternatives</strong>. <strong>Emma Watson</strong>, known for her sustainable fashion choices, has worn lab-created jewellery on red carpets. Top brands are also taking a stand. Several designer houses now include <strong>lab-grown stones</strong> in their <strong>fine jewellery</strong> lines, reflecting rising demand among conscious consumers. In India, platforms like <strong>Dope Jewells</strong> are leading this ethical revolution, offering a premium yet sustainable alternative to traditional diamond jewellery.</p><h2><strong>The Future of Lab-Grown Diamonds in Fine Jewellery</strong></h2><p>The numbers speak for themselves. The <strong>lab-grown diamond market</strong> is expected to reach <strong>$55 billion globally by 2030</strong>, with India playing a significant role in both production and consumption. More than a trend, this is a movement. From <strong>custom bridal jewellery</strong> to <strong>daily wear rings</strong>, lab-created stones are becoming the preferred choice for those who want it all <strong>beauty, ethics, and value</strong>. Major cities like Mumbai, Delhi, Bangalore, and Hyderabad are witnessing a steady rise in demand for <strong>GIA-certified lab diamonds</strong> and sustainable jewellery options. This shift is not just in consumer sentiment, but across the entire <strong>jewellery supply chain</strong>, from manufacturing to retail.</p><h2><strong>Conclusion: The Diamond of the Future</strong></h2><p>As the world evolves, so do the values that define luxury. <strong>Lab-grown diamonds</strong> offer everything today’s buyer seeks <strong>sophistication</strong>, <strong>responsibility</strong>, and <strong>individual expression</strong>. They are the embodiment of what modern jewellery stands for <strong>ethical sourcing</strong>, <strong>technological innovation</strong>, and <strong>conscious elegance</strong>. No longer seen as secondary to mined diamonds, they now lead the narrative in <strong>fashion-forward jewellery</strong>. Whether you’re planning a <strong>proposal</strong>, gifting a <strong>designer ring</strong>, or investing in a <strong>statement piece</strong>, <strong>lab-created diamonds</strong> present a future-forward choice where you don’t have to choose between beauty and responsibility. At <strong>Dope Jewells</strong>, every lab-grown diamond tells a story not just of love or celebration but of <strong>values</strong>, <strong>progress</strong>, and <strong>planet-first luxury</strong>.</p>\";s:14:\"featured_image\";s:50:\"media/MSnSM4NTyvnxTAyam4HI0URfLO5jq2z0JHjhOp3B.jpg\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;s:6:\"status\";s:9:\"published\";s:12:\"published_at\";s:19:\"2026-04-29 13:18:00\";s:11:\"is_featured\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-30 05:36:48\";}s:11:\"\0*\0original\";a:17:{s:2:\"id\";i:3;s:11:\"category_id\";i:1;s:9:\"author_id\";i:1;s:5:\"title\";s:61:\"Why Lab-Grown Diamonds Are Redefining Modern Jewellery Trends\";s:4:\"slug\";s:61:\"why-lab-grown-diamonds-are-redefining-modern-jewellery-trends\";s:7:\"summary\";s:74:\"Exploring the beauty and ethical considerations of modern diamond choices.\";s:7:\"content\";s:10738:\"<p>The jewellery landscape is undergoing a transformation. No longer confined to traditional expectations, the industry is responding to a new wave of consumers who prioritize <strong>ethics</strong>, <strong>sustainability</strong>, and <strong>authenticity</strong> as much as aesthetics and brilliance. At the heart of this shift is the rise of <strong>lab-grown diamonds</strong> also referred to as <strong>lab-created diamonds</strong>, <strong>man-made diamonds</strong>, <strong>synthetic diamonds</strong>, or <strong>cultured diamonds</strong>. These <strong>laboratory-grown gemstones</strong> are emerging as a powerful force reshaping the very idea of luxury. A combination of science, ethics, and modern style, they are appealing to Gen Z and Millennials who want more than sparkle they want values. Today, what’s precious isn’t just rarity; it’s responsibility. And <strong>lab-fabricated diamonds</strong> are fast becoming the symbol of that conscious choice.</p><h2><strong>What Exactly Are Lab-Grown Diamonds?</strong></h2><p><strong>Lab-grown diamonds</strong> are <strong>chemically, physically, and optically identical</strong> to natural diamonds. The only difference is their origin. Instead of forming under the earth’s crust over billions of years, these diamonds are created in advanced labs using <strong>High Pressure High Temperature (HPHT)</strong> or <strong>Chemical Vapor Deposition (CVD)</strong> methods. Both techniques mimic the natural formation process, delivering diamonds with the same dazzling clarity, cut, and brilliance as their mined counterparts. It’s important to clear the air lab-created diamonds are not imitations. They are not cubic zirconia or rhinestones. These are <strong>real diamonds</strong>, often certified by reputable bodies like <strong>GIA</strong> or <strong>IGI</strong>, and they meet the same standards in carat, cut, color, and clarity.</p><h2><strong>The Shift in Consumer Preferences</strong></h2><p>The definition of luxury is evolving. Modern buyers are far more conscious of how their purchases affect the world.</p><h3><strong>Ethical Choices Drive Demand</strong></h3><p>Today’s jewellery lovers, especially younger consumers, want more than sparkle they demand <strong>conflict-free diamonds</strong>, <strong>responsible sourcing</strong>, and transparency. For many, a diamond that funds war or contributes to ecological damage isn’t just unappealing it’s unacceptable. <strong>Eco-conscious consumers</strong> are increasingly drawn toward options that reduce harm. That’s where <strong>lab-grown diamonds</strong> shine. Free from the moral baggage of traditional mining, they offer a <strong>cleaner, kinder path to elegance</strong>.</p><h3><strong>Gen Z and Millennials Set the Pace</strong></h3><p>This is also a generational change. Gen Z and Millennials the future of luxury are leading the movement toward <strong>sustainable diamonds</strong>. Influenced by social media, ethical values, and environmental awareness, these consumers are turning away from mined stones in favor of <strong>man-made diamonds</strong>. In India and globally, younger buyers are investing in <strong>modern jewellery</strong> that reflects both their personality and principles.</p><h2><strong>Why Lab-Grown Diamonds Are Reshaping Jewellery Trends</strong></h2><h3><strong>Sustainability &amp; Environmental Impact</strong></h3><p>Mining diamonds comes at a high environmental cost, land degradation, water waste, carbon emissions, and destroyed ecosystems. In contrast, <strong>lab-grown diamonds</strong> drastically reduce these impacts.</p><ul><li>Up to 60% less energy consumption</li><li>No habitat destruction</li><li>Significantly lower water usage</li><li><strong>Carbon-neutral jewellery</strong> possibilities</li></ul><p>This makes <strong>lab-created diamonds</strong> the go-to option for buyers who prioritize the planet.</p><h3><strong>Ethical Sourcing &amp; Transparency</strong></h3><p>No more wondering where a diamond came from. With <strong>lab-grown stones</strong>, traceability is built-in. From the lab to the showroom, every step is <strong>transparent</strong>. They’re <strong>conflict-free</strong>, untainted by human rights violations, and made without the exploitation often linked to mining operations. In a world demanding accountability, this matters deeply.</p><h3><strong>Affordability Without Compromise</strong></h3><p>Lab-fabricated diamonds typically cost <strong>20–40% less</strong> than their mined equivalents. That means consumers can invest in <strong>larger, higher-quality stones</strong> or <strong>custom jewellery</strong> without stretching their budget. This accessibility is redefining what luxury means <strong>fine jewellery</strong> can now be both high-end and value-driven.</p><h3><strong>Design Innovation &amp; Creative Freedom</strong></h3><p>With the availability of consistently high-quality stones, designers have the freedom to <strong>experiment with bold, unique creations</strong>. From <strong>minimalist jewellery</strong> to dramatic <strong>bridal sets</strong>, the possibilities are endless. <strong>Lab-grown diamonds</strong> empower jewellers to break away from conventional constraints and create pieces that are imaginative, sustainable, and entirely modern.</p><h2><strong>Aligning With Modern Jewellery Trends</strong></h2><p>Across the world, <strong>lab-created diamonds</strong> are finding their place in some of the most important jewellery trends of our time.</p><h3><strong>Minimalist and Gender-Neutral Designs</strong></h3><p>Today’s consumers are embracing subtle elegance. Whether it’s a <strong>clean diamond ring</strong>, a <strong>gender-fluid bracelet</strong>, or a <strong>simple necklace</strong>, the trend leans toward timeless pieces with emotional depth. <strong>Lab-grown stones</strong> naturally fit into these trends with their understated brilliance and contemporary feel.</p><h3><strong>Conscious Luxury</strong></h3><p>Luxury no longer means excess, it means integrity. From <strong>recycled gold</strong> to <strong>eco-conscious gemstones</strong>, consumers are choosing items that align with their values. <strong>Cultured diamonds</strong> speak directly to this audience.</p><h3><strong>Technology Meets Artistry</strong></h3><p>Jewellery is now a blend of science and craftsmanship. <strong>High-tech gemstones</strong>, like synthetic diamonds and <strong>moissanite</strong>, reflect an era where technology enhances beauty. <strong>Lab-grown diamonds</strong>, born in cutting-edge labs, are the epitome of this fusion.</p><h3><strong>Customisation is King</strong></h3><p>Custom <strong>engagement rings</strong> and <strong>personalised jewellery</strong> are no longer a niche they’re mainstream. Since lab-created diamonds are more affordable, they enable customisation without compromise, leading to pieces that feel deeply personal and truly one-of-a-kind.</p><h2><strong>Breaking the Myths Around Lab-Grown Diamonds</strong></h2><p>Despite growing popularity, myths persist. Let’s address them.</p><h3><strong>Myth 1: They’re Not Real Diamonds</strong></h3><p>False. Lab-created diamonds are <strong>real diamonds</strong>, identical in every measurable way structure, brilliance, and composition.</p><h3><strong>Myth 2: They’re Low Quality</strong></h3><p>Also false. Lab-grown diamonds can achieve equal or better grades than natural ones in clarity, cut, and color. In fact, many high-end pieces use <strong>engineered diamonds</strong> specifically for their quality control.</p><h3><strong>Myth 3: Poor Resale Value</strong></h3><p>While resale dynamics vary, this argument applies to most jewellery not just lab-grown stones. Besides, modern consumers prioritise <strong>style, sustainability</strong>, and <strong>ethics</strong> over resale.</p><h2><strong>Celebrities &amp; Brands Supporting the Movement</strong></h2><p>The global spotlight is turning toward <strong>lab-fabricated diamonds</strong>. Actors, activists, and designers are championing this shift. <strong>Leonardo DiCaprio</strong>, a known investor in ethical diamond ventures, has publicly advocated for <strong>conflict-free alternatives</strong>. <strong>Emma Watson</strong>, known for her sustainable fashion choices, has worn lab-created jewellery on red carpets. Top brands are also taking a stand. Several designer houses now include <strong>lab-grown stones</strong> in their <strong>fine jewellery</strong> lines, reflecting rising demand among conscious consumers. In India, platforms like <strong>Dope Jewells</strong> are leading this ethical revolution, offering a premium yet sustainable alternative to traditional diamond jewellery.</p><h2><strong>The Future of Lab-Grown Diamonds in Fine Jewellery</strong></h2><p>The numbers speak for themselves. The <strong>lab-grown diamond market</strong> is expected to reach <strong>$55 billion globally by 2030</strong>, with India playing a significant role in both production and consumption. More than a trend, this is a movement. From <strong>custom bridal jewellery</strong> to <strong>daily wear rings</strong>, lab-created stones are becoming the preferred choice for those who want it all <strong>beauty, ethics, and value</strong>. Major cities like Mumbai, Delhi, Bangalore, and Hyderabad are witnessing a steady rise in demand for <strong>GIA-certified lab diamonds</strong> and sustainable jewellery options. This shift is not just in consumer sentiment, but across the entire <strong>jewellery supply chain</strong>, from manufacturing to retail.</p><h2><strong>Conclusion: The Diamond of the Future</strong></h2><p>As the world evolves, so do the values that define luxury. <strong>Lab-grown diamonds</strong> offer everything today’s buyer seeks <strong>sophistication</strong>, <strong>responsibility</strong>, and <strong>individual expression</strong>. They are the embodiment of what modern jewellery stands for <strong>ethical sourcing</strong>, <strong>technological innovation</strong>, and <strong>conscious elegance</strong>. No longer seen as secondary to mined diamonds, they now lead the narrative in <strong>fashion-forward jewellery</strong>. Whether you’re planning a <strong>proposal</strong>, gifting a <strong>designer ring</strong>, or investing in a <strong>statement piece</strong>, <strong>lab-created diamonds</strong> present a future-forward choice where you don’t have to choose between beauty and responsibility. At <strong>Dope Jewells</strong>, every lab-grown diamond tells a story not just of love or celebration but of <strong>values</strong>, <strong>progress</strong>, and <strong>planet-first luxury</strong>.</p>\";s:14:\"featured_image\";s:50:\"media/MSnSM4NTyvnxTAyam4HI0URfLO5jq2z0JHjhOp3B.jpg\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;s:6:\"status\";s:9:\"published\";s:12:\"published_at\";s:19:\"2026-04-29 13:18:00\";s:11:\"is_featured\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-30 05:36:48\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:2:{s:12:\"published_at\";s:8:\"datetime\";s:11:\"is_featured\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:8:\"category\";r:7932;}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:14:{i:0;s:11:\"category_id\";i:1;s:9:\"author_id\";i:2;s:5:\"title\";i:3;s:4:\"slug\";i:4;s:7:\"summary\";i:5;s:7:\"content\";i:6;s:14:\"featured_image\";i:7;s:10:\"meta_title\";i:8;s:16:\"meta_description\";i:9;s:13:\"meta_keywords\";i:10;s:13:\"schema_markup\";i:11;s:6:\"status\";i:12;s:12:\"published_at\";i:13;s:11:\"is_featured\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}i:3;O:19:\"App\\Models\\BlogPost\":33:{s:13:\"\0*\0connection\";s:5:\"mysql\";s:8:\"\0*\0table\";s:10:\"blog_posts\";s:13:\"\0*\0primaryKey\";s:2:\"id\";s:10:\"\0*\0keyType\";s:3:\"int\";s:12:\"incrementing\";b:1;s:7:\"\0*\0with\";a:0:{}s:12:\"\0*\0withCount\";a:0:{}s:19:\"preventsLazyLoading\";b:0;s:10:\"\0*\0perPage\";i:15;s:6:\"exists\";b:1;s:18:\"wasRecentlyCreated\";b:0;s:28:\"\0*\0escapeWhenCastingToString\";b:0;s:13:\"\0*\0attributes\";a:17:{s:2:\"id\";i:4;s:11:\"category_id\";i:1;s:9:\"author_id\";i:1;s:5:\"title\";s:56:\"Diamond Bracelets That Add Timeless Elegance to Any Look\";s:4:\"slug\";s:35:\"diamond-bracelets-timeless-elegance\";s:7:\"summary\";s:93:\"Expert tips on cleaning and storing your precious pieces to ensure they last for generations.\";s:7:\"content\";s:12471:\"<p>A diamond bracelet is more than just an accessory; it\'s a signature of grace, elegance, and enduring style. Whether worn alone or layered with other fine pieces, <strong>diamond bracelets</strong> have long held their place as cherished essentials in every <strong>woman’s jewellry collection</strong>. From understated minimalist wrist wear to eye-catching <strong>luxury designs</strong>, these timeless pieces are crafted to complement any outfit, making them perfect for both everyday luxury and the most special occasions. The appeal of <strong>diamond bracelets</strong> lies not just in their sparkle, but in the craftsmanship, sentiment, and versatility they carry. They elevate a simple ensemble, add shine to formal wear, and bring timeless sophistication to traditional outfits. With a variety of styles and materials to choose from such as <strong>real diamond bracelets</strong>, <strong>elegant diamond bangles</strong>, or even <strong>custom-made designs</strong> the possibilities are endless for those seeking refined wrist jewelry that truly stands out.</p><h2><strong>Why Diamond Bracelets Never Go Out of Style</strong></h2><p>For centuries, diamonds have symbolized love, power, and eternity. When crafted into bracelets, they become personal symbols of legacy and grace. <strong>Timeless diamond bracelets</strong> have remained a staple in both royal collections and modern fashion for good reason they never bow to passing trends. Whether gifted during milestones or passed down through generations, these <strong>evergreen jewelry pieces</strong> maintain their allure across decades. Their universal appeal makes them relevant in every era from the roaring ‘20s to the sleek styles of 2025. And while fashion evolves, the brilliance of diamonds doesn’t fade. The clean design of a tennis bracelet or the boldness of a diamond cuff can pair as effortlessly with a silk saree as they can with a power suit or a cocktail dress. This is precisely why <strong>women’s diamond bracelets</strong> remain as relevant today as ever before.</p><h2><strong>Types of Diamond Bracelets That Elevate Any Outfit</strong></h2><p>The world of diamond bracelets is diverse, offering styles that range from bold to barely-there. Understanding the key types can help you find a bracelet that matches your personal taste and the occasion.</p><h3><strong>Tennis Bracelets</strong></h3><p>These are the most iconic of all. A continuous line of diamonds in a straight, sleek setting perfect for formal occasions or elegant daily wear. Their timeless appeal and secure fit make them a staple in any <strong>fine diamond jewelry</strong> collection.</p><h3><strong>Bangle Diamond Bracelets</strong></h3><p>Solid and circular, <strong>designer diamond bracelets</strong> in bangle form offer a more structured and impactful look. Often worn in pairs or stacks, they work wonderfully for festive events or bridal occasions.</p><h3><strong>Diamond Cuffs</strong></h3><p>Wider and more open-ended than bangles, cuffs offer a modern twist on traditional wristwear. A <strong>diamond cuff</strong> bracelet is perfect for someone who loves to make a statement with bold jewelry pieces.</p><h3><strong>Chain Diamond Bracelets</strong></h3><p>These <strong>dainty diamond wristwear</strong> styles are crafted with linked chains and small diamond accents. Delicate, elegant, and ideal for everyday luxury, especially when paired with other minimalist pieces. These <strong>diamond bracelet styles</strong> cater to all preferences be it bold, classic, or understated ensuring there\'s a perfect fit for everyone.</p><h2><strong>How to Style Diamond Bracelets for Different Occasions</strong></h2><p>A well-chosen diamond bracelet can enhance your look for virtually any occasion. From casual brunches to gala nights, styling these versatile pieces can be both fun and sophisticated.</p><h3><strong>Everyday Elegance</strong></h3><p>Minimalist <strong>gold and diamond bracelets</strong> are perfect for daywear. Pair a sleek tennis bracelet or a light chain design with a crisp white shirt or kurta for an effortless chic look.</p><h3><strong>Office or Business Settings</strong></h3><p>Opt for <strong>fine diamond jewelry</strong> in subtle styles, thin cuffs or delicate bangles in rose gold or platinum. The goal is to add refinement without overpowering your professional attire.</p><h3><strong>Evening &amp; Formal Events</strong></h3><p>Layer multiple bracelets mixing textures and finishes to create depth and glam. <strong>Statement diamond pieces</strong> with bold cuts and settings are ideal for black-tie events or gala dinners.</p><h3><strong>Weddings &amp; Celebrations</strong></h3><p>This is where <strong>bridal diamond accessories</strong> shine. Choose ornate bangles or customized cuffs with traditional motifs. Pair them with matching earrings or a necklace for a regal finish. Whether you’re dressing for everyday or a major celebration, knowing <strong>how to wear diamond bracelets</strong> can transform your outfit. Play with layers, mix metals, or let one striking bracelet stand alone; each approach adds its own kind of magic.</p><h2><strong>What to Look for When Buying a Diamond Bracelet</strong></h2><p>Investing in a diamond bracelet means knowing what makes one piece stand out over another. The right bracelet isn\'t just beautiful, it meets high standards of quality and comfort.</p><h3><strong>Understanding the 4Cs</strong></h3><p>The <strong>cut</strong>, <strong>clarity</strong>, <strong>color</strong>, and <strong>carat</strong> weight define a diamond’s value and brilliance. Look for well-cut stones that sparkle evenly and have minimal inclusions.</p><h3><strong>Choosing the Right Metal</strong></h3><p>Options like <strong>gold, white gold, rose gold</strong>, and <strong>platinum</strong> offer different aesthetics. White gold provides a sleek, modern finish, while yellow gold adds a traditional touch. Rose gold flatters most skin tones, and platinum offers unmatched durability.</p><h3><strong>Fit and Flexibility</strong></h3><p>Always ensure the bracelet sits comfortably on your wrist. Adjustable clasps or flexible chain designs can offer better day-to-day comfort. When making a purchase, a good <strong>buying guide for diamond bracelets</strong> can help you navigate the process and ensure you select a bracelet that meets both your style and quality expectations.</p><h2><strong>Top Trends in Diamond Bracelets in 2025</strong></h2><p>Jewelry trends evolve each year, and 2025 is no exception. Here’s what’s capturing attention this year in the world of <strong>luxury wrist bracelets</strong>.</p><h3><strong>Personalization &amp; Customization</strong></h3><p><strong>Custom diamond bracelets</strong> that reflect personal stories, initials, or birthstones are gaining popularity. They make for meaningful gifts and treasured keepsakes.</p><h3><strong>Minimalist Styles with a Twist</strong></h3><p>Think <strong>minimalist diamond jewelry</strong> with unexpected design elements like asymmetrical shapes or colored diamond accents.</p><h3><strong>Mix of Materials</strong></h3><p>Combining <strong>gold and diamond</strong> with leather, enamel, or even silk threads is in vogue, offering unique textures and contrast.</p><h3><strong>Influencer and Celebrity Picks</strong></h3><p>From Bollywood to global runways, many are gravitating toward <strong>platinum diamond bracelets</strong> and bold cuffs that double as conversation pieces. These <strong>diamond bracelet trends in 2025</strong> reflect a blend of tradition, innovation, and individual expression.</p><h2><strong>Why a Diamond Bracelet is the Perfect Gift</strong></h2><p>Few gifts carry the emotional weight and timelessness of a diamond bracelet. Whether it’s a milestone birthday, an anniversary, or a festive celebration, diamonds express love, appreciation, and commitment. These bracelets are symbolic of relationships, moments, and memories. <strong>Gifting diamond bracelets</strong> can represent a lasting bond, success, or the beginning of something new. Whether you’re choosing something bold or delicate, a <strong>diamond bracelet gift</strong> carries significance far beyond its sparkle.</p><h2><strong>How to Care for and Maintain Diamond Bracelets</strong></h2><p>To keep your bracelet shining for years to come, proper care is essential.</p><h3><strong>Regular Cleaning</strong></h3><p>Soak the bracelet in lukewarm water with a mild soap. Use a soft brush to gently clean the setting and diamonds. Avoid harsh chemicals.</p><h3><strong>Safe Storage</strong></h3><p>Keep your bracelet in a soft-lined box or pouch, separate from other jewelry to avoid scratches.</p><h3><strong>Professional Maintenance</strong></h3><p>Have your bracelet inspected by a professional every 12–18 months. They can check for loose stones, worn prongs, or any necessary repairs. Knowing <strong>how to clean a diamond bracelet</strong> and maintain its shine ensures your investment continues to look as beautiful as the day you received it.</p><h2><strong>Where to Buy Authentic &amp; Elegant Diamond Bracelets</strong></h2><p>When investing in <strong>authentic diamond bracelets</strong>, it’s important to choose a trusted source that offers certified quality and craftsmanship.</p><h3><strong>Online vs. In-store</strong></h3><p>Online platforms like <strong>DopeJewells.com</strong> offer convenience, competitive pricing, and a wide variety of options. Look for detailed product descriptions, certifications, and flexible return policies. In-store purchases allow you to feel the bracelet and try different fits but make sure the retailer offers certification and buy-back options. When shopping for <strong>diamond bracelets online</strong>, check for hallmarks, certification from bodies like IGI or GIA, and customer testimonials. A well-informed purchase is a confident purchase.</p><h2><strong>Conclusion</strong></h2><p><strong>Diamond bracelets</strong> embody elegance, emotion, and individuality. From classic tennis designs to bold cuffs and dainty chains, there\'s a piece for every personality and occasion. Their beauty lies not just in the diamonds, but in the stories they carry and the memories they help create. Whether you’re looking to elevate your personal style, find the perfect gift, or invest in something meaningful, these bracelets continue to stand the test of time. For those who appreciate craftsmanship, certified quality, and expressive design, <strong>DopeJewells.com</strong> brings a curated collection of <strong>real diamond bracelets</strong> designed for every moment. Let your wrist shine with the brilliance it deserves.</p><h2><strong>FAQs</strong></h2><p><strong>1. How do I choose the right diamond bracelet for daily wear?</strong></p><p><strong>Answer: </strong>When selecting a diamond bracelet for daily use, go for lightweight and sturdy designs like tennis or chain bracelets. Prioritize secure clasps, lower carat stones for comfort, and metals like white gold or platinum for better durability.</p><p><strong>2. What is the difference between a tennis bracelet and a diamond bangle?</strong></p><p><strong>Answer: </strong>A tennis bracelet features a continuous row of diamonds set in a flexible chain, offering a sleek and refined look. A diamond bangle, on the other hand, is a solid circular bracelet often more structured and bold, suitable for traditional and festive wear.</p><p><strong>3. Are diamond bracelets a good gift for special occasions?</strong></p><p><strong>Answer: </strong>Yes, diamond bracelets are ideal for birthdays, anniversaries, weddings, and milestone achievements. Their timeless elegance and emotional significance make them meaningful, long-lasting gifts for loved ones.</p><p><strong>4. How can I verify if my diamond bracelet is authentic?</strong></p><p><strong>Answer: </strong>Always ask for a certificate of authenticity from reputed labs like IGI or GIA. Check for hallmarking on the metal and buy only from trusted jewelers or platforms that provide certified <strong>real diamond bracelets.</strong></p><p><strong>5. Can diamond bracelets be custom-made to suit personal style?</strong></p><p><strong>Answer: Absolutely. Many jewelers offer custom diamond bracelets where you can choose the metal, diamond shape, setting, and even add personal touches like initials or symbols to create a one-of-a-kind piece.</strong></p>\";s:14:\"featured_image\";s:50:\"media/woRX1aQHmqb2cZheupaX8GISrrJ8cuKdnCuE8mvs.jpg\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;s:6:\"status\";s:9:\"published\";s:12:\"published_at\";s:19:\"2026-04-29 13:18:00\";s:11:\"is_featured\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-30 05:39:38\";}s:11:\"\0*\0original\";a:17:{s:2:\"id\";i:4;s:11:\"category_id\";i:1;s:9:\"author_id\";i:1;s:5:\"title\";s:56:\"Diamond Bracelets That Add Timeless Elegance to Any Look\";s:4:\"slug\";s:35:\"diamond-bracelets-timeless-elegance\";s:7:\"summary\";s:93:\"Expert tips on cleaning and storing your precious pieces to ensure they last for generations.\";s:7:\"content\";s:12471:\"<p>A diamond bracelet is more than just an accessory; it\'s a signature of grace, elegance, and enduring style. Whether worn alone or layered with other fine pieces, <strong>diamond bracelets</strong> have long held their place as cherished essentials in every <strong>woman’s jewellry collection</strong>. From understated minimalist wrist wear to eye-catching <strong>luxury designs</strong>, these timeless pieces are crafted to complement any outfit, making them perfect for both everyday luxury and the most special occasions. The appeal of <strong>diamond bracelets</strong> lies not just in their sparkle, but in the craftsmanship, sentiment, and versatility they carry. They elevate a simple ensemble, add shine to formal wear, and bring timeless sophistication to traditional outfits. With a variety of styles and materials to choose from such as <strong>real diamond bracelets</strong>, <strong>elegant diamond bangles</strong>, or even <strong>custom-made designs</strong> the possibilities are endless for those seeking refined wrist jewelry that truly stands out.</p><h2><strong>Why Diamond Bracelets Never Go Out of Style</strong></h2><p>For centuries, diamonds have symbolized love, power, and eternity. When crafted into bracelets, they become personal symbols of legacy and grace. <strong>Timeless diamond bracelets</strong> have remained a staple in both royal collections and modern fashion for good reason they never bow to passing trends. Whether gifted during milestones or passed down through generations, these <strong>evergreen jewelry pieces</strong> maintain their allure across decades. Their universal appeal makes them relevant in every era from the roaring ‘20s to the sleek styles of 2025. And while fashion evolves, the brilliance of diamonds doesn’t fade. The clean design of a tennis bracelet or the boldness of a diamond cuff can pair as effortlessly with a silk saree as they can with a power suit or a cocktail dress. This is precisely why <strong>women’s diamond bracelets</strong> remain as relevant today as ever before.</p><h2><strong>Types of Diamond Bracelets That Elevate Any Outfit</strong></h2><p>The world of diamond bracelets is diverse, offering styles that range from bold to barely-there. Understanding the key types can help you find a bracelet that matches your personal taste and the occasion.</p><h3><strong>Tennis Bracelets</strong></h3><p>These are the most iconic of all. A continuous line of diamonds in a straight, sleek setting perfect for formal occasions or elegant daily wear. Their timeless appeal and secure fit make them a staple in any <strong>fine diamond jewelry</strong> collection.</p><h3><strong>Bangle Diamond Bracelets</strong></h3><p>Solid and circular, <strong>designer diamond bracelets</strong> in bangle form offer a more structured and impactful look. Often worn in pairs or stacks, they work wonderfully for festive events or bridal occasions.</p><h3><strong>Diamond Cuffs</strong></h3><p>Wider and more open-ended than bangles, cuffs offer a modern twist on traditional wristwear. A <strong>diamond cuff</strong> bracelet is perfect for someone who loves to make a statement with bold jewelry pieces.</p><h3><strong>Chain Diamond Bracelets</strong></h3><p>These <strong>dainty diamond wristwear</strong> styles are crafted with linked chains and small diamond accents. Delicate, elegant, and ideal for everyday luxury, especially when paired with other minimalist pieces. These <strong>diamond bracelet styles</strong> cater to all preferences be it bold, classic, or understated ensuring there\'s a perfect fit for everyone.</p><h2><strong>How to Style Diamond Bracelets for Different Occasions</strong></h2><p>A well-chosen diamond bracelet can enhance your look for virtually any occasion. From casual brunches to gala nights, styling these versatile pieces can be both fun and sophisticated.</p><h3><strong>Everyday Elegance</strong></h3><p>Minimalist <strong>gold and diamond bracelets</strong> are perfect for daywear. Pair a sleek tennis bracelet or a light chain design with a crisp white shirt or kurta for an effortless chic look.</p><h3><strong>Office or Business Settings</strong></h3><p>Opt for <strong>fine diamond jewelry</strong> in subtle styles, thin cuffs or delicate bangles in rose gold or platinum. The goal is to add refinement without overpowering your professional attire.</p><h3><strong>Evening &amp; Formal Events</strong></h3><p>Layer multiple bracelets mixing textures and finishes to create depth and glam. <strong>Statement diamond pieces</strong> with bold cuts and settings are ideal for black-tie events or gala dinners.</p><h3><strong>Weddings &amp; Celebrations</strong></h3><p>This is where <strong>bridal diamond accessories</strong> shine. Choose ornate bangles or customized cuffs with traditional motifs. Pair them with matching earrings or a necklace for a regal finish. Whether you’re dressing for everyday or a major celebration, knowing <strong>how to wear diamond bracelets</strong> can transform your outfit. Play with layers, mix metals, or let one striking bracelet stand alone; each approach adds its own kind of magic.</p><h2><strong>What to Look for When Buying a Diamond Bracelet</strong></h2><p>Investing in a diamond bracelet means knowing what makes one piece stand out over another. The right bracelet isn\'t just beautiful, it meets high standards of quality and comfort.</p><h3><strong>Understanding the 4Cs</strong></h3><p>The <strong>cut</strong>, <strong>clarity</strong>, <strong>color</strong>, and <strong>carat</strong> weight define a diamond’s value and brilliance. Look for well-cut stones that sparkle evenly and have minimal inclusions.</p><h3><strong>Choosing the Right Metal</strong></h3><p>Options like <strong>gold, white gold, rose gold</strong>, and <strong>platinum</strong> offer different aesthetics. White gold provides a sleek, modern finish, while yellow gold adds a traditional touch. Rose gold flatters most skin tones, and platinum offers unmatched durability.</p><h3><strong>Fit and Flexibility</strong></h3><p>Always ensure the bracelet sits comfortably on your wrist. Adjustable clasps or flexible chain designs can offer better day-to-day comfort. When making a purchase, a good <strong>buying guide for diamond bracelets</strong> can help you navigate the process and ensure you select a bracelet that meets both your style and quality expectations.</p><h2><strong>Top Trends in Diamond Bracelets in 2025</strong></h2><p>Jewelry trends evolve each year, and 2025 is no exception. Here’s what’s capturing attention this year in the world of <strong>luxury wrist bracelets</strong>.</p><h3><strong>Personalization &amp; Customization</strong></h3><p><strong>Custom diamond bracelets</strong> that reflect personal stories, initials, or birthstones are gaining popularity. They make for meaningful gifts and treasured keepsakes.</p><h3><strong>Minimalist Styles with a Twist</strong></h3><p>Think <strong>minimalist diamond jewelry</strong> with unexpected design elements like asymmetrical shapes or colored diamond accents.</p><h3><strong>Mix of Materials</strong></h3><p>Combining <strong>gold and diamond</strong> with leather, enamel, or even silk threads is in vogue, offering unique textures and contrast.</p><h3><strong>Influencer and Celebrity Picks</strong></h3><p>From Bollywood to global runways, many are gravitating toward <strong>platinum diamond bracelets</strong> and bold cuffs that double as conversation pieces. These <strong>diamond bracelet trends in 2025</strong> reflect a blend of tradition, innovation, and individual expression.</p><h2><strong>Why a Diamond Bracelet is the Perfect Gift</strong></h2><p>Few gifts carry the emotional weight and timelessness of a diamond bracelet. Whether it’s a milestone birthday, an anniversary, or a festive celebration, diamonds express love, appreciation, and commitment. These bracelets are symbolic of relationships, moments, and memories. <strong>Gifting diamond bracelets</strong> can represent a lasting bond, success, or the beginning of something new. Whether you’re choosing something bold or delicate, a <strong>diamond bracelet gift</strong> carries significance far beyond its sparkle.</p><h2><strong>How to Care for and Maintain Diamond Bracelets</strong></h2><p>To keep your bracelet shining for years to come, proper care is essential.</p><h3><strong>Regular Cleaning</strong></h3><p>Soak the bracelet in lukewarm water with a mild soap. Use a soft brush to gently clean the setting and diamonds. Avoid harsh chemicals.</p><h3><strong>Safe Storage</strong></h3><p>Keep your bracelet in a soft-lined box or pouch, separate from other jewelry to avoid scratches.</p><h3><strong>Professional Maintenance</strong></h3><p>Have your bracelet inspected by a professional every 12–18 months. They can check for loose stones, worn prongs, or any necessary repairs. Knowing <strong>how to clean a diamond bracelet</strong> and maintain its shine ensures your investment continues to look as beautiful as the day you received it.</p><h2><strong>Where to Buy Authentic &amp; Elegant Diamond Bracelets</strong></h2><p>When investing in <strong>authentic diamond bracelets</strong>, it’s important to choose a trusted source that offers certified quality and craftsmanship.</p><h3><strong>Online vs. In-store</strong></h3><p>Online platforms like <strong>DopeJewells.com</strong> offer convenience, competitive pricing, and a wide variety of options. Look for detailed product descriptions, certifications, and flexible return policies. In-store purchases allow you to feel the bracelet and try different fits but make sure the retailer offers certification and buy-back options. When shopping for <strong>diamond bracelets online</strong>, check for hallmarks, certification from bodies like IGI or GIA, and customer testimonials. A well-informed purchase is a confident purchase.</p><h2><strong>Conclusion</strong></h2><p><strong>Diamond bracelets</strong> embody elegance, emotion, and individuality. From classic tennis designs to bold cuffs and dainty chains, there\'s a piece for every personality and occasion. Their beauty lies not just in the diamonds, but in the stories they carry and the memories they help create. Whether you’re looking to elevate your personal style, find the perfect gift, or invest in something meaningful, these bracelets continue to stand the test of time. For those who appreciate craftsmanship, certified quality, and expressive design, <strong>DopeJewells.com</strong> brings a curated collection of <strong>real diamond bracelets</strong> designed for every moment. Let your wrist shine with the brilliance it deserves.</p><h2><strong>FAQs</strong></h2><p><strong>1. How do I choose the right diamond bracelet for daily wear?</strong></p><p><strong>Answer: </strong>When selecting a diamond bracelet for daily use, go for lightweight and sturdy designs like tennis or chain bracelets. Prioritize secure clasps, lower carat stones for comfort, and metals like white gold or platinum for better durability.</p><p><strong>2. What is the difference between a tennis bracelet and a diamond bangle?</strong></p><p><strong>Answer: </strong>A tennis bracelet features a continuous row of diamonds set in a flexible chain, offering a sleek and refined look. A diamond bangle, on the other hand, is a solid circular bracelet often more structured and bold, suitable for traditional and festive wear.</p><p><strong>3. Are diamond bracelets a good gift for special occasions?</strong></p><p><strong>Answer: </strong>Yes, diamond bracelets are ideal for birthdays, anniversaries, weddings, and milestone achievements. Their timeless elegance and emotional significance make them meaningful, long-lasting gifts for loved ones.</p><p><strong>4. How can I verify if my diamond bracelet is authentic?</strong></p><p><strong>Answer: </strong>Always ask for a certificate of authenticity from reputed labs like IGI or GIA. Check for hallmarking on the metal and buy only from trusted jewelers or platforms that provide certified <strong>real diamond bracelets.</strong></p><p><strong>5. Can diamond bracelets be custom-made to suit personal style?</strong></p><p><strong>Answer: Absolutely. Many jewelers offer custom diamond bracelets where you can choose the metal, diamond shape, setting, and even add personal touches like initials or symbols to create a one-of-a-kind piece.</strong></p>\";s:14:\"featured_image\";s:50:\"media/woRX1aQHmqb2cZheupaX8GISrrJ8cuKdnCuE8mvs.jpg\";s:10:\"meta_title\";N;s:16:\"meta_description\";N;s:13:\"meta_keywords\";N;s:13:\"schema_markup\";N;s:6:\"status\";s:9:\"published\";s:12:\"published_at\";s:19:\"2026-04-29 13:18:00\";s:11:\"is_featured\";i:1;s:10:\"created_at\";s:19:\"2026-04-29 13:18:47\";s:10:\"updated_at\";s:19:\"2026-04-30 05:39:38\";}s:10:\"\0*\0changes\";a:0:{}s:11:\"\0*\0previous\";a:0:{}s:8:\"\0*\0casts\";a:2:{s:12:\"published_at\";s:8:\"datetime\";s:11:\"is_featured\";s:7:\"boolean\";}s:17:\"\0*\0classCastCache\";a:0:{}s:21:\"\0*\0attributeCastCache\";a:0:{}s:13:\"\0*\0dateFormat\";N;s:10:\"\0*\0appends\";a:0:{}s:19:\"\0*\0dispatchesEvents\";a:0:{}s:14:\"\0*\0observables\";a:0:{}s:12:\"\0*\0relations\";a:1:{s:8:\"category\";r:7932;}s:10:\"\0*\0touches\";a:0:{}s:27:\"\0*\0relationAutoloadCallback\";N;s:26:\"\0*\0relationAutoloadContext\";N;s:10:\"timestamps\";b:1;s:13:\"usesUniqueIds\";b:0;s:9:\"\0*\0hidden\";a:0:{}s:10:\"\0*\0visible\";a:0:{}s:11:\"\0*\0fillable\";a:14:{i:0;s:11:\"category_id\";i:1;s:9:\"author_id\";i:2;s:5:\"title\";i:3;s:4:\"slug\";i:4;s:7:\"summary\";i:5;s:7:\"content\";i:6;s:14:\"featured_image\";i:7;s:10:\"meta_title\";i:8;s:16:\"meta_description\";i:9;s:13:\"meta_keywords\";i:10;s:13:\"schema_markup\";i:11;s:6:\"status\";i:12;s:12:\"published_at\";i:13;s:11:\"is_featured\";}s:10:\"\0*\0guarded\";a:1:{i:0;s:1:\"*\";}}}s:28:\"\0*\0escapeWhenCastingToString\";b:0;}}', 1777635796);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cart_id` bigint(20) UNSIGNED NOT NULL,
  `variant_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `variant_id`, `quantity`, `created_at`, `updated_at`) VALUES
(3, 3, 1, 1, '2026-04-24 03:36:02', '2026-04-24 03:36:02'),
(6, 6, 2, 1, '2026-04-27 05:15:34', '2026-04-27 05:15:34'),
(8, 6, 9, 1, '2026-04-29 00:24:40', '2026-04-29 00:27:33');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `parent_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `parent_category_id`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 'High Jewelry', 'jewellery', NULL, 'uploads/categories/XJTJrOe7iTuAX6NCfhUN.png', '2026-04-24 02:10:58', '2026-04-29 06:17:26'),
(2, 'Rings', 'rings', 1, 'uploads/categories/Bxmj50mzm6Ept9dTdpvA.jpg', '2026-04-24 02:12:53', '2026-04-27 03:55:53'),
(3, 'Watch', 'watch', 7, 'uploads/categories/hP7sGHui8jYQpzIxcCbw.jpg', '2026-04-24 02:13:14', '2026-04-27 03:53:15'),
(4, 'Bracelet', 'bracelet', 1, 'uploads/categories/cge1P4FGgp8kYSE8ofA7.jpg', '2026-04-24 02:14:12', '2026-04-27 03:54:49'),
(5, 'Necklace', 'necklace', 6, 'uploads/categories/ozUDb2VEctWVFnwo38qQ.jpg', '2026-04-24 02:14:41', '2026-04-27 03:55:28'),
(6, 'Bridal Collection', 'bridal-collection', NULL, 'uploads/categories/UZeMeEGPkFIPECnHhS5k.png', '2026-04-29 04:22:25', '2026-04-29 06:32:12'),
(7, 'Minimal Gold', 'minimal-gold', NULL, 'uploads/categories/gRUJpXrwAeRx9cUZCHII.png', '2026-04-29 04:22:56', '2026-04-29 06:32:50');

-- --------------------------------------------------------

--
-- Table structure for table `category_attributes`
--

CREATE TABLE `category_attributes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `attribute_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category_attributes`
--

INSERT INTO `category_attributes` (`id`, `category_id`, `attribute_id`, `created_at`, `updated_at`) VALUES
(1, 3, 1, NULL, NULL),
(2, 3, 2, NULL, NULL),
(3, 3, 3, NULL, NULL),
(4, 2, 4, NULL, NULL),
(5, 2, 2, NULL, NULL),
(6, 5, 4, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `category_attribute_values`
--

CREATE TABLE `category_attribute_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `attribute_value_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category_attribute_values`
--

INSERT INTO `category_attribute_values` (`id`, `category_id`, `attribute_value_id`, `created_at`, `updated_at`) VALUES
(1, 3, 1, NULL, NULL),
(2, 3, 2, NULL, NULL),
(3, 3, 3, NULL, NULL),
(4, 3, 4, NULL, NULL),
(5, 3, 5, NULL, NULL),
(6, 2, 6, NULL, NULL),
(7, 2, 7, NULL, NULL),
(8, 2, 8, NULL, NULL),
(9, 2, 2, NULL, NULL),
(10, 2, 3, NULL, NULL),
(11, 2, 9, NULL, NULL),
(12, 2, 10, NULL, NULL),
(13, 5, 6, NULL, NULL),
(14, 5, 7, NULL, NULL),
(15, 5, 8, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `category_tag`
--

CREATE TABLE `category_tag` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `tag_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category_tag`
--

INSERT INTO `category_tag` (`id`, `category_id`, `tag_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, NULL),
(2, 1, 3, NULL, NULL),
(3, 2, 2, NULL, NULL),
(4, 3, 3, NULL, NULL),
(5, 4, 2, NULL, NULL),
(6, 5, 1, NULL, NULL),
(7, 6, 3, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `iso_code` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone_code` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`id`, `iso_code`, `name`, `phone_code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'IN', 'India', '+91', 1, '2026-03-31 00:46:09', '2026-03-31 00:46:09'),
(2, 'US', 'USA', '+1', 1, '2026-04-29 23:55:58', '2026-04-29 23:55:58');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `password`, `created_at`, `updated_at`) VALUES
(2, 'Akshay kumar', 'akshaytechalphonic@gmail.com', NULL, '$2y$12$OHFFFx1AEJo1Q7xcsPko/ukee3cOzlIy7LBvX9302adIW7LBA.pBu', '2026-04-24 02:46:40', '2026-04-24 02:46:40'),
(3, 'Akshay kumar', 'akshaytechalphonic1@gmail.com', NULL, '$2y$12$PwJZ0cOJPpxGEaTmMz0SQ.CAesKR44g3qGeEk61KhrQdPltoM1hHC', '2026-04-27 01:24:34', '2026-04-27 01:24:34');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hsn_sacs`
--

CREATE TABLE `hsn_sacs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `type` enum('contact','customization') NOT NULL DEFAULT 'contact',
  `subject` varchar(255) DEFAULT NULL,
  `jewelry_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`jewelry_type`)),
  `stone_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stone_type`)),
  `budget` varchar(255) DEFAULT NULL,
  `metal_type` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` enum('new','pending','resolved','cancelled') NOT NULL DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `name`, `email`, `phone`, `type`, `subject`, `jewelry_type`, `stone_type`, `budget`, `metal_type`, `message`, `attachments`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Adria Boyd', 'kikasaxyto@mailinator.com', '98987987', 'contact', 'Reprehenderit aliqua', NULL, NULL, NULL, NULL, 'Adipisci aliquid dol', NULL, 'new', '2026-04-29 04:47:31', '2026-04-29 04:47:31'),
(2, 'Judith Thornton', 'tepuqa@mailinator.com', '9098900989', 'customization', NULL, '[\"Necklace\",\"Bracelets\",\"Earrings\",\"Grills\"]', '[\"Lab Grown Diamond\"]', '$1,000 - $5,000', '14K White Gold', 'Vel dolorem adipisci', '[\"inquiries\\/WnSHtPxQ6EPXCpycfgZ16K9OMU6A3zWPvrA5hivB.jpg\"]', 'new', '2026-04-29 04:50:44', '2026-04-29 04:50:44');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `disk` varchar(255) NOT NULL DEFAULT 'public',
  `path` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `extension` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `size` bigint(20) UNSIGNED DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `folder_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`id`, `disk`, `path`, `filename`, `extension`, `mime_type`, `size`, `alt_text`, `folder_id`, `created_at`, `updated_at`) VALUES
(2, 'public', 'media/qm9wJWlKutKsLAAbtXfFx0ni2CsCYxIXkVhXG3JH.jpg', 'about us.jpg', 'jpg', 'image/jpeg', 88785, NULL, NULL, '2026-03-30 04:49:38', '2026-03-30 04:49:38'),
(3, 'public', 'media/FcTv5ifCtWTUHgu7zhTZJMeYcK1apyy1vRCrvhn6.jpg', 'Banner1.jpg', 'jpg', 'image/jpeg', 143074, NULL, NULL, '2026-03-30 05:33:03', '2026-03-30 05:33:03'),
(4, 'public', 'media/6E21sGsYAHMERnSdZWjSo0zwcHVY3zr4Zv69gxU9.jpg', 'Banner3.jpg', 'jpg', 'image/jpeg', 108320, NULL, NULL, '2026-03-30 05:39:38', '2026-03-30 05:39:38'),
(5, 'public', 'media/DmUhrDOA0N9ifX3lXgNfO4j01C8Dmk81ZNla3xTW.jpg', 'Banner3.jpg', 'jpg', 'image/jpeg', 108320, NULL, NULL, '2026-03-30 05:40:47', '2026-03-30 05:40:47'),
(6, 'public', 'media/GLpGMH6piPUYIlZCf4mqDVqiZsQ8BRzDkf1fZut3.jpg', 'Banner2.jpg', 'jpg', 'image/jpeg', 184305, NULL, NULL, '2026-03-30 05:41:13', '2026-03-30 05:41:13'),
(7, 'public', 'media/4nAfpafgpEkBzodbwUSIvBKDv5huCZMCbyzXLUPE.webp', 'Jesus-Christ_04d2fef6-9ca3-4e8d-baa2-c6afdda8ede2_1903x870.webp', 'webp', 'image/webp', 152414, NULL, NULL, '2026-04-24 03:54:19', '2026-04-24 03:54:19'),
(8, 'public', 'media/f9TzesSZuzIpXrGctas7Xq93spUjo2YYNYIpo0vr.jpg', 'Frame-1171275552-2.jpg', 'jpg', 'image/jpeg', 98057, NULL, NULL, '2026-04-27 00:51:46', '2026-04-27 00:51:46'),
(9, 'public', 'media/4LwanvQ724CtuYYFgTUC07rsu1t2HQi77TZDchfh.jpg', 'Diamond-Jewellery-Care-Tips-Make-Your-Sparkle-Last-Forever.jpg', 'jpg', 'image/jpeg', 59057, NULL, NULL, '2026-04-29 07:57:40', '2026-04-29 07:57:40'),
(10, 'public', 'media/sKXQSZ0wypdbU8dpvJeAOT1cPduHWu4HW3XwA68W.jpg', 'How-Minimalist-Diamond-Jewellery-Is-Taking-Over-Everyday-Fashion.jpg', 'jpg', 'image/jpeg', 52433, NULL, NULL, '2026-04-29 07:58:08', '2026-04-29 07:58:08'),
(11, 'public', 'media/MSnSM4NTyvnxTAyam4HI0URfLO5jq2z0JHjhOp3B.jpg', 'Why-Lab-Grown-Diamonds-Are-Redefining-Modern-Jewellery-Trends.jpg', 'jpg', 'image/jpeg', 83281, NULL, NULL, '2026-04-29 07:58:21', '2026-04-29 07:58:21'),
(12, 'public', 'media/z2GmaVUx70xigSdv6WpYTlscnCEih8gTJ4iLTzyI.jpg', 'How-Minimalist-Diamond-Jewellery-Is-Taking-Over-Everyday-Fashion.jpg', 'jpg', 'image/jpeg', 52433, NULL, NULL, '2026-04-29 07:58:43', '2026-04-29 07:58:43'),
(13, 'public', 'media/woRX1aQHmqb2cZheupaX8GISrrJ8cuKdnCuE8mvs.jpg', 'Diamond-Bracelets-That-Add-Timeless-Elegance-to-Any-Look.jpg', 'jpg', 'image/jpeg', 106166, NULL, NULL, '2026-04-30 00:09:34', '2026-04-30 00:09:34'),
(14, 'public', 'media/oky1YfDfcP8IIcjxpvI42QpeR3lfQH05KhznbOCc.png', 'Rectangle-34624186.png', 'png', 'image/png', 110305, NULL, NULL, '2026-04-30 02:17:04', '2026-04-30 02:17:04');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_01_01_000010_create_users_table', 1),
(2, '2026_01_01_000011_create_cache_table', 1),
(3, '2026_01_01_000012_create_jobs_table', 1),
(4, '2026_01_01_000020_create_vendors_table', 1),
(5, '2026_01_01_000021_create_brands_table', 1),
(6, '2026_01_01_000022_create_categories_table', 1),
(7, '2026_01_01_000023_create_variant_options_table', 1),
(8, '2026_01_01_000024_create_customers_table', 1),
(9, '2026_01_01_000025_create_promotions_table', 1),
(10, '2026_01_01_000030_create_products_table', 1),
(11, '2026_01_01_000031_create_addresses_table', 1),
(12, '2026_01_01_000032_create_shopping_carts_table', 1),
(13, '2026_01_01_000040_create_product_variants_table', 1),
(14, '2026_01_01_000041_create_product_categories_table', 1),
(15, '2026_01_01_000042_create_product_galleries_table', 1),
(16, '2026_01_01_000043_create_orders_table', 1),
(17, '2026_01_01_000044_create_variant_option_values_table', 1),
(18, '2026_01_01_000050_create_cart_items_table', 1),
(19, '2026_01_01_000051_create_order_items_table', 1),
(20, '2026_01_01_000052_create_payments_table', 1),
(21, '2026_01_01_000053_create_shipments_table', 1),
(22, '2026_01_01_000054_create_order_promotions_table', 1),
(23, '2026_01_01_000055_create_variant_galleries_table', 1),
(24, '2026_01_01_000060_create_product_variant_values_table', 1),
(25, '2026_03_13_061645_create_personal_access_tokens_table', 2),
(26, '2026_03_13_102338_rename_variations_to_attributes_tables', 3),
(27, '2026_03_13_103742_create_category_attributes_table', 4),
(28, '2026_03_13_105144_drop_color_from_product_variants_table', 5),
(29, '2026_03_13_110323_create_category_attribute_values_table', 6),
(30, '2026_03_13_113219_add_image_url_to_categories_table', 7),
(31, '2026_03_13_133320_add_status_to_products_table', 8),
(32, '2026_03_16_054452_update_promotions_tables_for_dynamic_rules', 9),
(33, '2026_03_17_051141_create_wishlists_table', 10),
(34, '2026_03_17_051147_create_wishlist_items_table', 10),
(35, '2026_03_17_081957_add_slug_to_categories_and_products_tables', 11),
(36, '2026_03_17_083644_create_tags_table', 12),
(37, '2026_03_17_083652_create_category_tag_table', 12),
(38, '2026_03_17_083657_create_product_tag_table', 12),
(39, '2026_03_20_055047_add_fields_to_vendors_table', 13),
(40, '2026_03_20_115307_create_vendor_documents_table', 14),
(41, '2026_03_20_115307_update_vendors_for_onboarding', 14),
(42, '2026_03_20_115308_create_stores_table', 14),
(43, '2026_03_20_115308_create_vendor_bank_accounts_table', 14),
(44, '2026_03_20_125911_add_rejection_reason_to_vendors_table', 15),
(45, '2026_03_24_094532_add_attribute_value_id_to_product_galleries_table', 16),
(46, '2026_03_24_094743_create_product_variant_images_table', 16),
(47, '2026_03_24_105151_create_sub_orders_table', 17),
(48, '2026_03_24_105313_add_order_number_to_orders_table', 18),
(49, '2026_03_24_113819_add_indexes_to_orders_tables', 19),
(50, '2026_03_30_080953_create_banners_table', 20),
(51, '2026_03_30_080958_create_blog_categories_table', 20),
(52, '2026_03_30_081002_create_blog_posts_table', 20),
(53, '2026_03_30_081006_create_pages_table', 20),
(54, '2026_03_30_081010_create_sections_table', 20),
(55, '2026_03_30_081014_create_faqs_table', 20),
(56, '2026_03_30_081018_create_media_table', 20),
(57, '2026_03_30_122420_add_fields_to_promotions_table', 21),
(58, '2026_03_30_122936_add_promotion_fields_to_orders_and_sub_orders', 21),
(59, '2026_03_31_060514_create_hsn_sacs_table', 22),
(60, '2026_03_31_060514_create_uoms_table', 22),
(61, '2026_03_31_060515_create_tax_groups_table', 22),
(62, '2026_03_31_060516_create_countries_table', 22),
(63, '2026_03_31_060517_create_states_table', 22),
(64, '2026_03_31_062816_add_gst_code_to_states_table', 23),
(65, '2026_03_31_083423_add_advanced_fields_to_products_table', 24),
(66, '2026_03_31_114553_add_dimensions_to_products_and_variants_tables', 25),
(67, '2026_03_31_124041_update_addresses_table_for_ids', 26),
(68, '2026_03_31_124714_rename_location_columns_in_addresses', 27),
(69, '2026_03_31_130018_make_location_names_nullable_in_addresses', 28),
(70, '2026_03_31_130153_add_contact_fields_to_addresses', 29),
(71, '2026_04_01_061243_create_settings_table', 30),
(72, '2026_04_01_061244_create_payment_gateways_table', 30),
(73, '2026_04_01_061245_create_social_logins_table', 30),
(74, '2026_04_01_061246_create_audit_logs_table', 30),
(75, '2026_04_01_063205_create_rbac_tables', 31),
(76, '2026_04_01_071449_add_payment_fields_to_orders_table', 32),
(77, '2026_04_01_103309_create_wallet_system_tables', 33),
(78, '2026_04_01_103429_add_commission_setting_to_settings_table', 34),
(79, '2026_04_01_115530_rename_password_hash_to_password_in_customers_table', 35),
(80, '2026_04_02_000000_add_return_fields_to_products_table', 36),
(81, '2026_04_02_100000_create_return_reasons_table', 36),
(82, '2026_04_02_110000_create_return_requests_table', 36),
(83, '2026_04_02_110001_create_return_request_items_table', 36),
(84, '2026_04_02_110002_create_return_status_history_table', 36),
(85, '2026_04_02_110003_create_return_shipments_table', 36),
(86, '2026_04_02_110004_create_refund_transactions_table', 36),
(87, '2026_04_02_134812_add_vendor_id_to_return_requests_table', 36),
(88, '2026_04_03_050800_add_status_values_to_return_requests_table', 36),
(89, '2026_04_06_090408_add_status_and_cancelled_at_to_order_items_table', 37),
(90, '2026_04_07_130427_update_status_column_to_enum_in_order_tables', 38),
(91, '2026_04_09_091252_add_cancellation_fields_to_order_items', 39),
(92, '2026_04_10_133239_add_order_item_id_to_shipments_table', 40),
(93, '2026_04_07_103344_add_indexes_to_sub_orders_table', 41),
(94, '2026_04_22_092533_add_breakup_fields_to_order_items', 41),
(95, '2026_04_29_094729_create_inquiries_table', 42),
(96, '2026_04_30_104909_add_seo_fields_to_products_table', 43);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `shipping_address_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned','refunded','completed') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `gateway_order_id` varchar(255) DEFAULT NULL,
  `payment_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_details`)),
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `order_number`, `shipping_address_id`, `status`, `total_amount`, `payment_method`, `gateway_order_id`, `payment_details`, `discount_amount`, `coupon_code`, `created_at`, `updated_at`) VALUES
(1, 2, 'ORD-ICQ8WRSQKR', 1, 'delivered', 8070.00, 'cod', NULL, NULL, 0.00, NULL, '2026-04-24 02:49:04', '2026-04-24 03:46:50'),
(3, 3, 'ORD-Y7TGW4WCWP', 2, 'pending', 2690.00, 'cod', NULL, NULL, 0.00, NULL, '2026-04-27 01:25:59', '2026-04-27 01:25:59'),
(4, 3, 'ORD-P955MFMK2A', 2, 'pending', 2690.00, 'cod', NULL, NULL, 0.00, NULL, '2026-04-27 03:20:59', '2026-04-27 03:20:59');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `sub_order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `variant_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `shipping_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned','refunded','completed') NOT NULL DEFAULT 'pending',
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` enum('buyer','admin','vendor') DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `sub_order_id`, `variant_id`, `quantity`, `unit_price`, `discount_amount`, `tax_amount`, `shipping_amount`, `status`, `cancelled_at`, `cancelled_by`, `cancel_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 2, 2640.00, 0.00, 251.43, 100.00, 'delivered', NULL, NULL, NULL, '2026-04-24 02:49:04', '2026-04-24 03:42:46'),
(2, 1, 1, 2, 1, 2640.00, 0.00, 125.71, 50.00, 'delivered', NULL, NULL, NULL, '2026-04-24 02:49:04', '2026-04-24 03:46:50'),
(4, 3, 3, 2, 1, 2640.00, 0.00, 125.71, 50.00, 'pending', NULL, NULL, NULL, '2026-04-27 01:25:59', '2026-04-27 01:25:59'),
(5, 4, 4, 1, 1, 2640.00, 0.00, 125.71, 50.00, 'pending', NULL, NULL, NULL, '2026-04-27 03:20:59', '2026-04-27 03:20:59');

-- --------------------------------------------------------

--
-- Table structure for table `order_promotions`
--

CREATE TABLE `order_promotions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `promotion_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `schema_markup` longtext DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `title`, `slug`, `content`, `meta_title`, `meta_description`, `meta_keywords`, `schema_markup`, `status`, `created_at`, `updated_at`) VALUES
(1, 'About Us', 'about-us', NULL, NULL, 'Learn more about E-Shop, your premium multi-vendor marketplace.', 'DOPE JEWELLS, gold jewellery, diamond jewellery, luxury jewellery, bridal jewellery, handcrafted jewellery, fine jewellery India, custom jewellery', '<script type=\"application/ld+json\">\r\n{\r\n  \"@context\": \"https://schema.org\",\r\n  \"@type\": \"AggregateRating\",\r\n  \"ratingValue\": \"4.8\",\r\n  \"reviewCount\": \"150\"\r\n}\r\n</script>', 1, '2026-03-30 04:07:47', '2026-04-30 05:37:44'),
(2, 'Privacy Policy', 'privacy-policy', NULL, NULL, 'Our commitment to protecting your personal information.', NULL, NULL, 1, '2026-03-30 04:07:47', '2026-03-30 04:07:47'),
(3, 'Return & Refund Policy', 'return-refund-policy', NULL, NULL, 'Hassle-free returns and refunds for all our customers.', NULL, NULL, 1, '2026-03-30 04:07:47', '2026-03-30 04:07:47'),
(4, 'Frequently Asked Questions', 'faq', NULL, NULL, 'Quick answers to common questions about shipping, payments, and account management.', NULL, NULL, 1, '2026-03-30 04:07:47', '2026-03-30 04:07:47'),
(5, 'Home', 'home', NULL, NULL, NULL, NULL, NULL, 1, '2026-04-30 00:52:55', '2026-04-30 00:52:55'),
(6, 'Blog', 'blog', NULL, NULL, NULL, NULL, NULL, 1, '2026-04-30 01:15:38', '2026-04-30 01:15:38');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `method` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_gateways`
--

CREATE TABLE `payment_gateways` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `credentials` text DEFAULT NULL,
  `mode` varchar(255) NOT NULL DEFAULT 'sandbox',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `transaction_fee` decimal(8,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(255) NOT NULL DEFAULT 'INR',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_gateways`
--

INSERT INTO `payment_gateways` (`id`, `name`, `slug`, `credentials`, `mode`, `is_enabled`, `is_default`, `transaction_fee`, `currency`, `created_at`, `updated_at`) VALUES
(1, 'Razorpay', 'razorpay', 'eyJpdiI6InRIUytsMEdzSlhRa1k5UXlwMGErUGc9PSIsInZhbHVlIjoiYnltUGFpUjZkejF4MDhCa1BxazF0OGsvWlQrMG05NHBKQlZiTmtPa3Qxci92UjJWS0tRRitsdGxMeUdGWHVOK0xOZHBoUWF4am5BWDdKNjB6RTRzS3JNMkZyNThCcEJlRkM0aXNaZkZ2RWQ4cUcwdjFLcE5XSGJzN2pWQm9OTkp5RXNwUlI4TW8zMldIYXJUdXVadU1RPT0iLCJtYWMiOiI1ZmRlZjcxODYxOTc2NmE0NDcyNmY2MzlkZGU0ZDZjMjVkNzJlMTIwYzNlZGI2MmU2NmQ1N2MzMTFhYWNlNGQ4IiwidGFnIjoiIn0=', 'sandbox', 1, 1, 0.00, 'INR', '2026-04-01 00:53:38', '2026-04-24 03:36:51'),
(2, 'Stripe', 'stripe', 'eyJpdiI6IkdKZmVwMFlCVWRqaG5YVzh0eHNHMEE9PSIsInZhbHVlIjoiWUxPbEJVSDRuN3BBdCtCb29HUEZxU3ZHdjVNQlZrcGVWSWZIWE5KV2sybFhYUTV4VlhmSkhhUjVZc0hkSDhLaU1xRktaMzBqREE4c3U2NUYrWlE3d2pQL1dNYjdwdVh0OGRTY05yR09OTTg9IiwibWFjIjoiMzJkNzczYzlhMjE1MjRhMzNmNmZjZDM3ZDYzMTE1ZjE4M2Y4MWRlMjQxZTM5N2M5OWU4ZWUyMTY3MTJiZjQ0ZiIsInRhZyI6IiJ9', 'sandbox', 0, 0, 0.00, 'INR', '2026-04-01 00:53:38', '2026-04-24 03:36:51'),
(3, 'PayPal', 'paypal', 'eyJpdiI6ImdDem9KbTIxNHZNU1pYdTJ4c2x0YkE9PSIsInZhbHVlIjoiNDVoQmFyR1UvZDNZa1J2R2cwenhHRERCamZ5bjk4MWk3ODZ6QkwxemxGdEc1TkpkeE9RSFRreWpkdUtSdFdRR1NnVWVaM2JvMGtrOHVwcnQ2UDJhQ3c9PSIsIm1hYyI6ImI5NDNiMmE1ZjY3MDYwNjY4MzkxMzgzZTUyZTFmZWUzMmRjMTczY2E0MDA1NTA5OWI4NDU5ZTVhZjRiYTZhOTMiLCJ0YWciOiIifQ==', 'sandbox', 0, 0, 0.00, 'INR', '2026-04-01 00:53:38', '2026-04-24 03:36:51');

-- --------------------------------------------------------

--
-- Table structure for table `payout_requests`
--

CREATE TABLE `payout_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `bank_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bank_details`)),
  `transaction_number` varchar(255) DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `group` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission_role`
--

CREATE TABLE `permission_role` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `discount_type` enum('percent','amount') DEFAULT NULL,
  `discount_value` decimal(10,2) DEFAULT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `brand_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `is_returnable` tinyint(1) NOT NULL DEFAULT 1,
  `return_window_days` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `hsn_sac_id` bigint(20) UNSIGNED DEFAULT NULL,
  `uom_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tax_group_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_free_shipping` tinyint(1) NOT NULL DEFAULT 1,
  `shipping_charge` decimal(10,2) DEFAULT NULL,
  `multiply_shipping_by_qty` tinyint(1) NOT NULL DEFAULT 0,
  `length` decimal(10,2) DEFAULT NULL,
  `breadth` decimal(10,2) DEFAULT NULL,
  `height` decimal(10,2) DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `schema_markup` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `base_price`, `discount_type`, `discount_value`, `vendor_id`, `brand_id`, `status`, `is_returnable`, `return_window_days`, `created_at`, `updated_at`, `hsn_sac_id`, `uom_id`, `tax_group_id`, `is_free_shipping`, `shipping_charge`, `multiply_shipping_by_qty`, `length`, `breadth`, `height`, `weight`, `meta_title`, `meta_description`, `meta_keywords`, `schema_markup`) VALUES
(1, 'Daniel Klein', 'daniel-klein', '<p>Display: Analogue<br>Movement: Quartz<br>Power source: Battery<br>Dial style: Solid round stainless steel dial<br>Features: Reset Time, Calender<br>Strap style: Brown regular, leather strap with a tang closure<br>Water resistance: 30 m<br>Warranty: 2 years<br>Warranty provided by brand/manufacturer</p>', 6600.00, 'percent', 60.00, 1, 1, 'active', 1, 10, '2026-04-24 02:38:10', '2026-04-29 07:15:29', NULL, 28, 2, 0, 50.00, 1, 10.00, 10.00, 9.99, 10.00, NULL, NULL, NULL, NULL),
(2, 'Eternity Diamond Ring', 'eternity-diamond-ring', '<p>A stunning eternity ring crafted in 18k white gold, featuring brilliant-cut diamonds all around the band. Perfect for engagements or anniversaries.</p>', 150000.00, 'percent', 15.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-30 06:11:26', NULL, NULL, NULL, 1, 0.00, 0, NULL, NULL, NULL, NULL, 'DOPE JEWELLS | Luxury Gold & Diamond Jewellery Online', 'Shop luxury gold and diamond jewellery at DOPE JEWELLS. Discover handcrafted designs, bridal collections, and certified fine jewellery with timeless elegance.', 'DOPE JEWELLS, luxury jewellery, gold jewellery, diamond jewellery, handcrafted jewellery, bridal jewellery, custom jewellery, certified jewellery, fine jewellery India', '<script type=\"application/ld+json\">\r\n{\r\n  \"@context\": \"https://schema.org\",\r\n  \"@type\": \"JewelryStore\",\r\n  \"name\": \"DOPE JEWELLS\",\r\n  \"url\": \"{{ url(\'/\') }}\",\r\n  \"logo\": \"{{ asset(\'logo.png\') }}\",\r\n  \"description\": \"DOPE JEWELLS offers premium handcrafted gold and diamond jewellery with certified quality and timeless elegance.\",\r\n  \"address\": {\r\n    \"@type\": \"PostalAddress\",\r\n    \"addressCountry\": \"IN\"\r\n  },\r\n  \"sameAs\": [\r\n    \"https://www.instagram.com/yourpage\",\r\n    \"https://www.facebook.com/yourpage\"\r\n  ]\r\n}\r\n</script>'),
(3, 'Solitaire Engagement Ring', 'solitaire-engagement-ring', 'Classic solitaire engagement ring with a 1-carat round brilliant diamond set in platinum. A timeless symbol of love.', 250000.00, 'percent', 7.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-27 04:39:31', NULL, NULL, NULL, 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Rose Gold Minimalist Bracelet', 'rose-gold-minimalist-bracelet', 'An elegant and minimalist bracelet crafted in 18k rose gold. Ideal for daily wear and stacking with other pieces.', 45000.00, 'percent', 5.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-27 04:39:31', NULL, NULL, NULL, 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Sapphire Tennis Bracelet', 'sapphire-tennis-bracelet', 'A breathtaking tennis bracelet featuring alternating deep blue sapphires and sparkling diamonds set in white gold.', 180000.00, 'percent', 13.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-27 04:39:31', NULL, NULL, NULL, 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Women’s Charming Diamond Necklace Set', 'women-charming-diamond-necklace-set', '<p>A sophisticated necklace featuring a pristine South Sea pearl drop on an 18k yellow gold chain.</p>', 3430.00, 'percent', 5.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-29 07:16:26', NULL, NULL, NULL, 1, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'Elegant Women’s Diamond Necklace Set', 'ruby-pendant-necklace', '<h3>Industry-specific attributes</h3><figure class=\"table\"><table><tbody><tr><td>Jewelry Main Material</td><td>Rose Gold</td></tr><tr><td>Main Stone</td><td>Diamond</td></tr><tr><td>Style</td><td>TRENDY</td></tr></tbody></table></figure><h3>Other attributes</h3><figure class=\"table\"><table><tbody><tr><td>Place of Origin</td><td>Gujarat, India</td></tr><tr><td>Jewelry Sets Type</td><td>Necklace set</td></tr><tr><td>Brand Name</td><td>DOPE JEWELLS</td></tr><tr><td>Model Number</td><td>DER-0004</td></tr><tr><td>Material Type</td><td>14KT GOLD</td></tr><tr><td>Diamond shape</td><td>Round Brilliant Cut</td></tr><tr><td>Gender</td><td>Female</td></tr><tr><td>Jewelry Type</td><td>Jewelry Sets</td></tr><tr><td>Occasion</td><td>Other, Anniversary, Engagement, Gift, Wedding, Party</td></tr><tr><td>Certificate Type</td><td>IGI</td></tr><tr><td>Plating</td><td>Silver Plated, Gold Plated, Rose Gold Plated</td></tr><tr><td>Shape\\pattern</td><td>ROUND</td></tr><tr><td>Religious Type</td><td>ALL RELIGIONS</td></tr><tr><td>Inlay technology</td><td>PRONG Setting</td></tr><tr><td>Product name</td><td>DIAMOND STUDS</td></tr><tr><td>Material</td><td>14K Solid Gold</td></tr><tr><td>Color</td><td>ROSE GOLD,WHITE GOLD,YELLOW GOLD</td></tr><tr><td>Size</td><td>2 CT</td></tr><tr><td>Weight</td><td>10 GRAMS</td></tr><tr><td>Packing</td><td>Customized Gift Box</td></tr><tr><td>Delivery time</td><td>7-15 Working Days</td></tr><tr><td>Shipping</td><td>DHL UPS FedEx TNT</td></tr><tr><td>Payment</td><td>Alipay, PayPal, CashApp, Bank Transfer</td></tr></tbody></table></figure>', 120000.00, 'percent', 8.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-29 07:16:50', NULL, NULL, NULL, 1, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Vintage Cartier Tank Watch', 'vintage-cartier-tank-watch', '<p>An authentic vintage Cartier Tank watch with a classic leather strap and gold-plated case. A true collector\'s item.</p>', 350000.00, 'percent', 14.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-29 07:16:58', NULL, NULL, NULL, 1, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'Mossianite Diamond Luxury Fashion Watch', 'rolex-datejust-gold', '<p>Mossianite Diamond Luxury Fashion Watch Swiss Quartz Movement Stainless Steel Band-the Perfect Fusion of Craftsmanship Sparkle</p><p>Mossianite Diamond Luxury Watch Japanese Quartz Movement Stainless Steel Band Glass Dial Perfect Fusion Craftsmanship Sparkle</p>', 699.00, 'percent', 15.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-29 07:17:39', NULL, NULL, NULL, 1, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, '1.00ct center soliatare diamond with tiney lab grown diamond Ring', 'platinum-wedding-band', '<p>14KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>18KT Fine Gold 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p><p>925 sterling silver 1.00ct center soliatare diamond with tiney lab grown diamond Wedding Party Gift IGI Certificate diamond ring</p>', 290.00, 'percent', 15.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-29 07:17:47', NULL, 28, NULL, 1, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'Luxury Women’s Diamond Necklace Set For Anniversary Gift', 'emerald-cut-diamond-necklace', '<p>Luxury Women’s Diamond Necklace Set In 14kt Solid Gold For Anniversary Gift</p><p>Luxury Women’s Diamond Necklace Set 18kt Solid White Gold For Anniversary Gift</p><p>Luxury Women’s Diamond Necklace Set in 925 Sterling Silver Perfect Gift for Anniversary Gift</p>', 450000.00, 'percent', 6.00, 1, 1, 'active', 1, 0, '2026-04-27 04:39:31', '2026-04-27 04:58:25', NULL, NULL, NULL, 1, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_attribute_values`
--

CREATE TABLE `product_attribute_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `variant_id` bigint(20) UNSIGNED NOT NULL,
  `attribute_value_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_attribute_values`
--

INSERT INTO `product_attribute_values` (`id`, `variant_id`, `attribute_value_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, NULL),
(2, 1, 3, NULL, NULL),
(3, 1, 4, NULL, NULL),
(4, 2, 1, NULL, NULL),
(5, 2, 3, NULL, NULL),
(6, 2, 5, NULL, NULL),
(7, 10, 1, NULL, NULL),
(8, 10, 3, NULL, NULL),
(9, 10, 4, NULL, NULL),
(10, 9, 1, NULL, NULL),
(11, 9, 2, NULL, NULL),
(12, 9, 5, NULL, NULL),
(13, 11, 6, NULL, NULL),
(14, 13, 7, NULL, NULL),
(15, 14, 8, NULL, NULL),
(16, 11, 3, NULL, NULL),
(17, 13, 2, NULL, NULL),
(18, 14, 10, NULL, NULL),
(19, 8, 6, NULL, NULL),
(20, 15, 7, NULL, NULL),
(21, 16, 8, NULL, NULL),
(22, 7, 6, NULL, NULL),
(23, 17, 7, NULL, NULL),
(24, 18, 8, NULL, NULL),
(25, 3, 2, NULL, NULL),
(26, 3, 6, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `product_id`, `category_id`, `created_at`, `updated_at`) VALUES
(1, 1, 3, NULL, NULL),
(2, 2, 2, NULL, NULL),
(3, 3, 2, NULL, NULL),
(4, 4, 4, NULL, NULL),
(5, 5, 4, NULL, NULL),
(6, 6, 5, NULL, NULL),
(7, 7, 5, NULL, NULL),
(8, 8, 3, NULL, NULL),
(9, 9, 3, NULL, NULL),
(10, 10, 2, NULL, NULL),
(11, 11, 5, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_galleries`
--

CREATE TABLE `product_galleries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `attribute_value_id` bigint(20) UNSIGNED DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_galleries`
--

INSERT INTO `product_galleries` (`id`, `product_id`, `attribute_value_id`, `image_url`, `alt_text`, `sort_order`, `created_at`, `updated_at`) VALUES
(4, 2, NULL, 'products/placeholder_ring.jpg', NULL, 0, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(5, 3, NULL, 'products/placeholder_ring.jpg', NULL, 0, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(6, 4, NULL, 'products/placeholder_bracelet.jpg', NULL, 0, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(7, 5, NULL, 'products/placeholder_bracelet.jpg', NULL, 0, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(19, 11, NULL, 'uploads/products/11/9IQ3rgayjp2LXhTBRL3I.jpg', NULL, 0, '2026-04-27 04:58:25', '2026-04-27 04:58:25'),
(20, 11, NULL, 'uploads/products/11/TqHe6NCwTrvPCUIXVIBg.jpg', NULL, 0, '2026-04-27 04:58:25', '2026-04-27 04:58:25'),
(21, 11, NULL, 'uploads/products/11/MdF2MPBNdLNoy9KeJjzq.jpg', NULL, 0, '2026-04-27 04:58:25', '2026-04-27 04:58:25'),
(22, 9, 3, 'uploads/products/9/J1E4iPfB2iFty1OMMRpt.jpg', NULL, 0, '2026-04-27 06:08:28', '2026-04-27 06:09:13'),
(24, 1, 3, 'uploads/products/1/QOkMao6XpCVgJYFtBWxY.jpg', NULL, 0, '2026-04-27 06:12:49', '2026-04-27 06:13:02'),
(26, 1, NULL, 'uploads/products/1/6SeqBQ51EnRLE7xXhOsl.png', NULL, 0, '2026-04-27 06:22:48', '2026-04-27 06:22:48'),
(27, 8, 5, 'uploads/products/8/Z1e3K0H0tJu6gGhxSG9c.jpg', NULL, 0, '2026-04-27 06:28:15', '2026-04-27 06:28:25'),
(28, 8, 2, 'uploads/products/8/9rZxlW1AtRptSdwjv6b2.jpg', NULL, 0, '2026-04-27 06:29:24', '2026-04-27 06:29:48'),
(29, 10, 2, 'uploads/products/10/CAjA6Sb8xMZCUa34yDJH.jpg', NULL, 0, '2026-04-27 06:36:18', '2026-04-27 06:53:22'),
(30, 10, 3, 'uploads/products/10/Ddi1xN8ntrKtbtX4mod5.jpg', NULL, 0, '2026-04-27 06:36:18', '2026-04-27 06:53:22'),
(31, 10, 10, 'uploads/products/10/Jvt5CFMhE8cYfOZNbOsG.jpg', NULL, 0, '2026-04-27 06:36:18', '2026-04-27 06:53:22'),
(35, 6, 6, 'uploads/products/6/k4D3WfVtxTj5CzqkehSo.jpg', NULL, 0, '2026-04-27 07:38:36', '2026-04-27 07:42:45'),
(36, 6, 7, 'uploads/products/6/O7BpRRhw98Xo0bcdokiu.jpg', NULL, 0, '2026-04-27 07:38:36', '2026-04-27 07:42:45'),
(37, 6, 8, 'uploads/products/6/urW0VakJyT58iINJ8R2c.jpg', NULL, 0, '2026-04-27 07:38:36', '2026-04-27 07:42:45'),
(41, 7, 6, 'uploads/products/7/7Izq2v1kyaTK0viYM7qk.jpg', NULL, 0, '2026-04-27 07:43:18', '2026-04-27 07:43:36'),
(42, 7, 7, 'uploads/products/7/jA5189B1oZqjMkOYFmxS.jpg', NULL, 0, '2026-04-27 07:43:18', '2026-04-27 07:43:36'),
(43, 7, 8, 'uploads/products/7/OojDncrNiObcVZTt1lfl.jpg', NULL, 0, '2026-04-27 07:43:18', '2026-04-27 07:43:36');

-- --------------------------------------------------------

--
-- Table structure for table `product_tag`
--

CREATE TABLE `product_tag` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `tag_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_tag`
--

INSERT INTO `product_tag` (`id`, `product_id`, `tag_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, NULL),
(2, 11, 2, NULL, NULL),
(3, 9, 2, NULL, NULL),
(4, 1, 2, NULL, NULL),
(6, 6, 1, NULL, NULL),
(7, 7, 2, NULL, NULL),
(8, 8, 1, NULL, NULL),
(9, 8, 2, NULL, NULL),
(10, 9, 1, NULL, NULL),
(11, 10, 1, NULL, NULL),
(12, 10, 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL,
  `length` decimal(10,2) DEFAULT NULL,
  `breadth` decimal(10,2) DEFAULT NULL,
  `height` decimal(10,2) DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `price`, `stock_quantity`, `length`, `breadth`, `height`, `weight`, `created_at`, `updated_at`) VALUES
(1, 1, 'WTH-01', 6600.00, 10, 10.00, 10.00, 10.00, 10.00, '2026-04-24 02:38:10', '2026-04-24 02:38:10'),
(2, 1, 'WTH-02', 6600.00, 10, 10.00, 10.00, 10.00, 10.00, '2026-04-24 02:44:17', '2026-04-24 02:44:17'),
(3, 2, 'SKU-PGBKF7', 150000.00, 11, NULL, NULL, NULL, NULL, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(4, 3, 'SKU-HJS4RN', 250000.00, 6, NULL, NULL, NULL, NULL, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(5, 4, 'SKU-YS9F2O', 45000.00, 7, NULL, NULL, NULL, NULL, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(6, 5, 'SKU-6OPYCN', 180000.00, 9, NULL, NULL, NULL, NULL, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(7, 6, 'SKU-UFE1R0', 2775.00, 10, NULL, NULL, NULL, NULL, '2026-04-27 04:39:31', '2026-04-27 07:38:18'),
(8, 7, 'SKU-INFOAW', 1300.00, 18, 10.00, 10.00, 10.00, 10.00, '2026-04-27 04:39:31', '2026-04-27 07:30:31'),
(9, 8, 'SKU-5RYL0O', 350000.00, 13, NULL, NULL, NULL, NULL, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(10, 9, 'SKU-F7DGML', 850000.00, 17, NULL, NULL, NULL, NULL, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(11, 10, 'SKU-H44J10', 2775.00, 12, 10.00, 10.00, 10.00, 10.00, '2026-04-27 04:39:31', '2026-04-27 06:47:18'),
(12, 11, 'SKU-RA7KRZ', 450000.00, 7, NULL, NULL, NULL, NULL, '2026-04-27 04:39:31', '2026-04-27 04:39:31'),
(13, 10, 'SKU-R44J10', 3430.00, 10, 10.00, 10.00, 10.00, 10.00, '2026-04-27 06:47:18', '2026-04-27 06:47:18'),
(14, 10, 'SKU-R44J11', 405.00, 9, 10.00, 10.00, 10.00, 10.00, '2026-04-27 06:47:19', '2026-04-27 06:47:19'),
(15, 7, 'SKU-INFOAW1', 1735.00, 10, NULL, NULL, NULL, NULL, '2026-04-27 07:30:31', '2026-04-27 07:30:31'),
(16, 7, 'SKU-R44J12', 260.00, 10, NULL, NULL, NULL, NULL, '2026-04-27 07:30:31', '2026-04-27 07:30:31'),
(17, 6, 'SKU-UFE1R12', 3430.00, 10, NULL, NULL, NULL, NULL, '2026-04-27 07:38:18', '2026-04-27 07:38:18'),
(18, 6, 'SKU-R44J13', 405.00, 10, NULL, NULL, NULL, NULL, '2026-04-27 07:38:18', '2026-04-27 07:38:18');

-- --------------------------------------------------------

--
-- Table structure for table `product_variant_images`
--

CREATE TABLE `product_variant_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `variant_id` bigint(20) UNSIGNED NOT NULL,
  `product_gallery_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variant_images`
--

INSERT INTO `product_variant_images` (`id`, `variant_id`, `product_gallery_id`, `created_at`, `updated_at`) VALUES
(8, 1, 24, NULL, NULL),
(9, 9, 27, NULL, NULL),
(10, 11, 30, NULL, NULL),
(11, 13, 29, NULL, NULL),
(12, 14, 31, NULL, NULL),
(17, 7, 35, NULL, NULL),
(18, 17, 36, NULL, NULL),
(19, 18, 37, NULL, NULL),
(20, 8, 41, NULL, NULL),
(21, 15, 42, NULL, NULL),
(22, 16, 43, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `vendor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `discount_type` varchar(255) NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `usage_limit` int(11) DEFAULT NULL,
  `usage_limit_per_user` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotions`
--

INSERT INTO `promotions` (`id`, `name`, `description`, `vendor_id`, `code`, `discount_type`, `discount_value`, `valid_from`, `valid_until`, `is_active`, `usage_limit`, `usage_limit_per_user`, `created_at`, `updated_at`) VALUES
(1, 'summer 2026', 'This is summer offer', NULL, 'KSLD44', 'percentage', 5.00, '2026-04-29 08:46:00', '2026-05-31 08:46:00', 0, NULL, 1, '2026-04-29 03:19:56', '2026-04-29 03:19:56');

-- --------------------------------------------------------

--
-- Table structure for table `promotion_categories`
--

CREATE TABLE `promotion_categories` (
  `promotion_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotion_categories`
--

INSERT INTO `promotion_categories` (`promotion_id`, `category_id`) VALUES
(1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `promotion_products`
--

CREATE TABLE `promotion_products` (
  `promotion_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotion_products`
--

INSERT INTO `promotion_products` (`promotion_id`, `product_id`) VALUES
(1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `promotion_rules`
--

CREATE TABLE `promotion_rules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `promotion_id` bigint(20) UNSIGNED NOT NULL,
  `rule_type` varchar(255) NOT NULL,
  `configuration` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`configuration`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotion_rules`
--

INSERT INTO `promotion_rules` (`id`, `promotion_id`, `rule_type`, `configuration`, `created_at`, `updated_at`) VALUES
(1, 1, 'cart_discount', '{\"min_cart_total\":\"2000\"}', '2026-04-29 03:19:56', '2026-04-29 03:19:56'),
(2, 1, 'bogo', '{\"buy_qty\":\"1\",\"get_qty\":\"1\"}', '2026-04-29 03:19:56', '2026-04-29 03:19:56');

-- --------------------------------------------------------

--
-- Table structure for table `refund_transactions`
--

CREATE TABLE `refund_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `return_request_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `mode` enum('wallet','original') NOT NULL DEFAULT 'original',
  `status` enum('pending','processed','failed') NOT NULL DEFAULT 'pending',
  `payment_reference` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_reasons`
--

CREATE TABLE `return_reasons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('return','replacement','both') NOT NULL DEFAULT 'both',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `return_reasons`
--

INSERT INTO `return_reasons` (`id`, `title`, `type`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Defective Product', 'both', 1, '2026-04-06 03:36:06', '2026-04-06 03:36:06'),
(2, 'Wrong Item Received', 'both', 1, '2026-04-06 03:36:06', '2026-04-06 03:36:06'),
(3, 'Quality Not as Expected', 'both', 1, '2026-04-06 03:36:06', '2026-04-06 03:36:06'),
(4, 'Damaged During Transit', 'both', 1, '2026-04-06 03:36:06', '2026-04-06 03:36:06'),
(5, 'No longer needed', 'return', 1, '2026-04-06 03:36:06', '2026-04-06 03:36:06');

-- --------------------------------------------------------

--
-- Table structure for table `return_requests`
--

CREATE TABLE `return_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `order_item_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('return','replacement') NOT NULL,
  `reason_id` bigint(20) UNSIGNED NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('requested','approved','rejected','picked','received','completed','refunded','replacement_created') DEFAULT 'requested',
  `refund_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `refund_mode` enum('wallet','original') DEFAULT NULL,
  `pickup_required` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_request_items`
--

CREATE TABLE `return_request_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `return_request_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_shipments`
--

CREATE TABLE `return_shipments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `return_request_id` bigint(20) UNSIGNED NOT NULL,
  `logistic_type` enum('manual','api') NOT NULL DEFAULT 'manual',
  `courier_name` varchar(255) DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `pickup_date` datetime DEFAULT NULL,
  `delivery_date` datetime DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_status_history`
--

CREATE TABLE `return_status_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `return_request_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `updated_by` enum('admin','vendor','system') NOT NULL DEFAULT 'system',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_user`
--

CREATE TABLE `role_user` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `user_type` varchar(255) NOT NULL DEFAULT 'AppModelsUser'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sectionable_type` varchar(255) NOT NULL,
  `sectionable_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`)),
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `sectionable_type`, `sectionable_id`, `type`, `content`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(6, 'App\\Models\\Page', 1, 'image_text', '{\"title\":\"Kurvesh Zaveri\",\"body\":\"<p>We are a manufacturer of loose diamonds and diamond jewellery from gujarat, india, having experience of 5 years in this field and expanding the company worldwide. you will get the best rates and quality from others. We have expertise in customization of hip-hop jewellery and minimal jewellery.<\\/p><p>At dope jewells, we believe that every piece of diamond jewelry should tell a story. Founded in 2019, we specialize in creating stunning, high-quality diamond jewelry pieces, including engagement rings, necklaces, earrings, and custom designs. With a passion for craftsmanship and elegance, our team works tirelessly to ensure each diamond jewellery is sourced responsibly and set to perfection, giving you a piece of jewelry that will last a lifetime.<\\/p>\",\"image_id\":\"14\",\"image_url\":\"\\/storage\\/media\\/oky1YfDfcP8IIcjxpvI42QpeR3lfQH05KhznbOCc.png\",\"side\":\"right\"}', 0, 1, '2026-03-30 04:07:47', '2026-04-30 02:19:54'),
(7, 'App\\Models\\Page', 1, 'cta_banner', '{\"title\":\"Become a Seller Today\",\"btn_text\":\"Join Now\",\"btn_link\":\"\\/register\"}', 4, 1, '2026-03-30 04:07:47', '2026-04-30 04:29:02'),
(8, 'App\\Models\\Page', 2, 'rich_text', '{\"body\":\"<p>At dopejewells, we value your privacy and are committed to protecting the personal information you provide when using our website. This Privacy Policy outlines the types of information we collect, how we use it, and the steps we take to protect your data.<br><br>&nbsp;<\\/p><h2><strong>What Information Do We Collect?<\\/strong><\\/h2><p>We collect personal information when you register on our site, place an order, subscribe to our newsletter, or fill out a form. The types of information we may collect include:<\\/p><ul><li>Name<\\/li><li>Email address<\\/li><li>Mailing address<\\/li><li>Phone number<\\/li><li>Payment information (e.g., credit\\/debit card details)<\\/li><\\/ul><p>You may, however, visit our site anonymously if you choose not to provide this information. Additionally, Google, as a third-party vendor, uses cookies to serve ads on our site. Google\\u2019s use of the DART cookie enables it to serve ads to users based on their visit to our site and other sites across the Internet. Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.<br><br>&nbsp;<\\/p><h2><strong>What Do We Use Your Information For?<\\/strong><\\/h2><p>The information we collect may be used in the following ways:<\\/p><ul><li><strong>Personalizing your experience:<\\/strong> To better respond to your individual needs.<\\/li><li><strong>Improving our website:<\\/strong> To enhance the overall user experience based on feedback and information.<\\/li><li><strong>Improving customer service:<\\/strong> To respond more effectively to customer service requests and support needs.<\\/li><li><strong>Processing transactions:<\\/strong> To complete your order and deliver the products you requested.<\\/li><li><strong>Administering contests, promotions, surveys, or other site features:<\\/strong> To engage with our customers in a meaningful way.<\\/li><li><strong>Sending periodic emails:<\\/strong> We may send updates regarding your order or promotional content. If you opt-in to our mailing list, you will receive emails with company news, updates, and product information. You can unsubscribe at any time by following the unsubscribe instructions included in each email.<\\/li><\\/ul><p>Your information will never be sold, exchanged, transferred, or given to any third party for any reason other than to fulfill your order or request, unless you have given consent.<br><br>&nbsp;<\\/p><h2><strong>How Do We Protect Your Information?<\\/strong><\\/h2><p>We implement a variety of security measures to maintain the safety of your personal information. These measures include using a secure server and Secure Socket Layer (SSL) technology to encrypt sensitive information during transactions. Once your transaction is completed, your personal information (such as credit card details) is not stored on our servers.<br><br>&nbsp;<\\/p><h2><strong>Do We Use Cookies?<\\/strong><\\/h2><p>Yes. Cookies are small files that are transferred to your computer\\u2019s hard drive via your web browser (if you allow) and allow us to recognize your browser and remember certain information. We use cookies to:<\\/p><ul><li>Remember and process the items in your shopping cart.<\\/li><li>Understand and save your preferences for future visits.<\\/li><li>Compile aggregate data about site traffic to improve the user experience.<\\/li><\\/ul><p>You can choose to have your browser warn you when a cookie is being sent or disable cookies entirely through your browser settings. Please note that disabling cookies may impact the functionality of some services, although you will still be able to place orders by phone.<br><br>&nbsp;<\\/p><h2><strong>Do We Disclose Any Information to Outside Parties?<\\/strong><\\/h2><p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. However, we may share information with trusted third-party service providers who assist in operating our website, conducting our business, or servicing you, provided they agree to keep this information confidential. We may also release information if we believe it is necessary to comply with the law, enforce our site policies, or protect the rights, property, or safety of our company or others. Non-personally identifiable visitor information may be shared with third parties for marketing, advertising, or other uses.<br><br>&nbsp;<\\/p><h2><strong>Third-Party Links<\\/strong><\\/h2><p>Occasionally, we may include or offer third-party products or services on our website. These third-party sites have their own privacy policies, which we encourage you to review. We are not responsible for the content or activities of linked sites. Nonetheless, we seek to protect the integrity of our site and welcome any feedback about these external links.<br><br>&nbsp;<\\/p><h2><strong>California Online Privacy Protection Act (CalOPPA) Compliance<\\/strong><\\/h2><p>We are in compliance with the California Online Privacy Protection Act. We do not share your personal information with outside parties without your consent.<br><br>&nbsp;<\\/p><h2><strong>Children\\u2019s Online Privacy Protection Act (COPPA) Compliance<\\/strong><\\/h2><p>We comply with COPPA and do not collect information from children under the age of 13. Our website, products, and services are directed to individuals who are at least 13 years old.<br><br>&nbsp;<\\/p><h2><strong>Online Privacy Policy Only<\\/strong><\\/h2><p>This privacy policy applies solely to information collected through our website and does not apply to information collected offline.<br><br>&nbsp;<\\/p><h2><strong>Your Consent<\\/strong><\\/h2><p>By using our site, you consent to our privacy policy.<br><br>&nbsp;<\\/p><h2><strong>Changes to Our Privacy Policy<\\/strong><\\/h2><p>We may update this Privacy Policy from time to time. Any changes will be posted on this page, and the effective date will be updated accordingly. Please check this page regularly for updates.<br><br>&nbsp;<\\/p><h2><strong>Contacting Us<\\/strong><\\/h2><p>If you have any questions about this Privacy Policy or need further clarification, please contact us at <a href=\\\"https:\\/\\/dopejewells.com\\/privacy-policy\\/sales@dopejewells.com\\\">sales@dopejewells.com<\\/a>.<\\/p>\"}', 0, 1, '2026-03-30 04:07:47', '2026-04-30 02:11:05'),
(9, 'App\\Models\\Page', 3, 'rich_text', '{\"body\":\"<h2><strong>Terms and Conditions for the Sale of Goods through&nbsp;Dopejewells<\\/strong><\\/h2><p>These Terms and Conditions (\\u201cTerms\\u201d) apply to all contracts entered into by&nbsp;<strong>dopejewells<\\/strong>&nbsp;for the sale of goods through our online store <a href=\\\"https:\\/\\/dopejewells.com\\/terms-and-conditions\\/sales@dopejewells.com\\\">dopejewells.com<\\/a>. By placing an order with us, you accept these Terms and Conditions. If you do not accept these Terms in full, you are not authorized to access the contents of this website and should cease using it immediately. By visiting our site or purchasing from us, you engage in our \\u201cService\\u201d and agree to be bound by the following terms, including those additional terms and policies referenced herein or available via hyperlink. These Terms apply to all users of the site, including but not limited to browsers, vendors, customers, merchants, and\\/or content contributors. Please read these Terms carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms. If you do not agree to all the terms, you may not access the website or use any of its services. Our store is hosted on WooCommerce, which provides us with the online platform to sell our products and services to you.<br><br>&nbsp;<\\/p><h2><strong>Site Access and Changes<\\/strong><\\/h2><p>Access to our website is granted on a temporary basis, and we reserve the right to suspend or withdraw access at any time. We aim to update our site regularly and may change content, product details, or pricing without notice. We do not guarantee that our site, or any part of it, will be available or error-free at all times. You are responsible for ensuring that all individuals accessing the site through your internet connection are aware of and comply with these Terms.<br><br>&nbsp;<\\/p><h2><strong>Contract Formation<\\/strong><\\/h2><p>No contract will exist between you and&nbsp;Dopejewells&nbsp;unless and until we have accepted your order with a confirmation email, and full payment has been received and processed. Our acceptance of your order creates a legally binding contract. Only adults (18 years or older) may enter into legally binding contracts. We reserve the right to decline orders in the event of payment issues, shipping restrictions, errors in pricing, or if the product does not meet our quality standards. We will not be liable for any indirect or consequential losses arising from the non-acceptance of an order. Our sole liability will be to refund the amount paid for the goods.<br><br>&nbsp;<\\/p><h2><strong>Payment<\\/strong><\\/h2><p>By making a purchase, you confirm that the payment method (PayPal account or credit\\/debit card) is yours or that you are authorized by the cardholder to use it. All transactions are processed via PayPal, a secure payment gateway that encrypts your card details. Prices on the site are in GBP (UK Pounds) and include VAT where applicable. Delivery charges will be clearly displayed before checkout and are included in the total cost.<br><br>&nbsp;<\\/p><h2><strong>Defective and Damaged Items<\\/strong><\\/h2><p>You must inspect your goods in the presence of the courier upon delivery to verify that they are undamaged and match your order. If items are found to be damaged or defective. We will work to resolve the issue by offering a replacement after the return of the faulty item.<br><br>&nbsp;<\\/p><h2><strong>Refunds and Exchanges<\\/strong><\\/h2><p>As each piece of jewellery is made to order, we are unable to offer refunds unless the product is defective. We may consider exchanges in certain cases. If a refund is approved, we will credit the original payment method, excluding delivery charges. Refunds will be processed within 48 hours of receiving the returned items. Please note that your card issuer may take 4-7 working days to process the refund.<br><br>&nbsp;<\\/p><h2><strong>Promotional Samples<\\/strong><\\/h2><p>Any product samples lent to you for promotional use must be returned within 7 working days, in perfect condition, unless otherwise agreed in writing. If not returned, you will be charged for the full cost of the item.<br><br>&nbsp;<\\/p><h2><strong>Intellectual Property<\\/strong><\\/h2><p>All content on this website, including jewellery designs, photographs, logos, trademarks, and other intellectual property, is the sole property of&nbsp;Dopejewells. You may print or display content only for personal use. Reproduction or use for commercial purposes is prohibited unless authorized in writing by us.<br><br>&nbsp;<\\/p><h2><strong>Changes to Terms &amp; Conditions<\\/strong><\\/h2><p>We reserve the right to update these Terms at any time. The most current version will always be posted on this page. By continuing to use our site after changes are made, you accept those changes. It is your responsibility to review these Terms periodically.<br><br>&nbsp;<\\/p><h2><strong>Agreement<\\/strong><\\/h2><p>These Terms and Conditions represent the entire agreement between you and&nbsp;Dopejewells&nbsp;regarding the sale and use of goods. They supersede any prior agreements, and no changes are binding unless agreed upon in writing.<br><br>&nbsp;<\\/p><h2><strong>Contact Information<\\/strong><\\/h2><p>If you have any questions about these Terms &amp; Conditions, please contact us at: <a href=\\\"mailto:sales@dopejewells.com\\\">sales@dopejewells.com<\\/a>.<\\/p>\"}', 0, 1, '2026-03-30 04:07:47', '2026-04-30 02:12:47'),
(10, 'App\\Models\\Page', 4, 'faq_accordion', '{\"faqs\":[{\"q\":\"How long does shipping take?\",\"a\":\"Shipping typically takes 3-7 business days depending on your location and the vendor\'s processing time.\"},{\"q\":\"Can I track my order?\",\"a\":\"Yes, once your order is shipped, you will receive a tracking number via email and in your account dashboard.\"},{\"q\":\"What payment methods do you accept?\",\"a\":\"We accept all major credit cards, PayPal, and various digital wallets.\"},{\"q\":\"How do I contact a seller?\",\"a\":\"You can contact sellers through the messaging system in your account dashboard or via the support button on the product page.\"}]}', 1, 1, '2026-03-30 04:07:47', '2026-03-30 04:07:47'),
(11, 'App\\Models\\Page', 1, 'faq_accordion', '{\"faqs\":[{\"q\":\"what we do\",\"a\":\"we sell product online\"},{\"q\":\"second quetion\",\"a\":\"this is for testing\"}]}', 6, 1, '2026-04-24 04:17:59', '2026-04-30 04:37:10'),
(12, 'App\\Models\\Page', 1, 'stats_bar', '{\"stats\":[{\"value\":\"25+\",\"label\":\"Years of Excellence\"},{\"value\":\"10,000+\",\"label\":\"Bespoke Creations\"},{\"value\":\"5,000+\",\"label\":\"Happy Clients\"},{\"value\":\"100%\",\"label\":\"Certified Jewellery\"}]}', 1, 1, '2026-04-30 04:22:23', '2026-04-30 04:22:23'),
(13, 'App\\Models\\Page', 1, 'timeline', '{\"headline\":\"Our Journey Through Time\",\"items\":[{\"year\":\"1995\",\"title\":\"The Beginning\",\"desc\":\"A small workshop with a big dream to redefine jewelry craftsmanship.\"},{\"year\":\"2005\",\"title\":\"Growing Recognition\",\"desc\":\"Expanded into premium custom jewelry with a loyal client base.\"},{\"year\":\"2015\",\"title\":\"Innovation Era\",\"desc\":\"Introduced modern designs blended with traditional artistry.\"},{\"year\":\"2026\",\"title\":\"Digital Transformation\",\"desc\":\"Launched online platform to reach customers worldwide.\"}]}', 2, 1, '2026-04-30 04:24:50', '2026-04-30 04:33:44'),
(14, 'App\\Models\\Page', 1, 'feature_grid', '{\"headline\":\"What Defines Us\",\"features\":[{\"icon\":\"bi-gem\",\"title\":\"Purity\",\"desc\":\"We use only certified materials and ethically sourced gemstones to ensure unmatched quality.\"},{\"icon\":\"bi-gem\",\"title\":\"Innovation\",\"desc\":\"Our designs blend timeless elegance with modern creativity, setting new trends in luxury jewelry.\"},{\"icon\":\"bi-gem\",\"title\":\"Integrity\",\"desc\":\"Transparency and trust are at the heart of everything we do.\"}]}', 3, 1, '2026-04-30 04:29:02', '2026-04-30 04:34:14'),
(15, 'App\\Models\\Page', 1, 'testimonial_grid', '{\"testimonials\":[{\"name\":\"Priya Sharma\",\"title\":\"\\u201cAbsolutely breathtaking craftsmanship!\\u201d\",\"text\":\"DOPE JEWELLS exceeded my expectations. The detailing is incredible.\"},{\"name\":\"Neha Kapoor\",\"title\":\"\\u201cPerfect for my wedding!\\u201d\",\"text\":\"The jewelry felt luxurious and unique. I received so many compliments.\"},{\"name\":\"Rahul Verma\",\"title\":\"\\u201cHighly recommended brand.\\u201d\",\"text\":\"Great quality, fast delivery, and amazing designs.\"}]}', 5, 1, '2026-04-30 04:37:10', '2026-04-30 04:37:10');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('eofPWIXA43Q7ma5x2LUDEFfpxCcTxBU3CuXlVmd8', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiRzVldEVDelNEM3lXUW9zVU5FYVR1bU5VVWJQU0J1RUJOdU16MGZSRyI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozNDoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2FkbWluL2JyYW5kcyI7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjUyOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvcHJvZHVjdHMvZXRlcm5pdHktZGlhbW9uZC1yaW5nIjtzOjU6InJvdXRlIjtzOjIyOiJmcm9udGVuZC5wcm9kdWN0cy5zaG93Ijt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MjoibG9naW5fYWRtaW5fNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO30=', 1777549401);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `group` varchar(255) NOT NULL DEFAULT 'general',
  `type` varchar(255) NOT NULL DEFAULT 'text',
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `group`, `type`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 'site_title', 'E Shop', 'general', 'text', 0, '2026-04-01 00:53:38', '2026-04-01 03:15:19'),
(2, 'site_description', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.', 'general', 'text', 0, '2026-04-01 00:53:38', '2026-04-01 03:15:19'),
(3, 'support_email', 'support@eshop.com', 'general', 'text', 0, '2026-04-01 00:53:38', '2026-04-01 03:15:19'),
(4, 'mail_host', 'smtp.mailtrap.io', 'email', 'text', 0, '2026-04-01 00:53:38', '2026-04-01 00:53:38'),
(5, 'mail_port', '2525', 'email', 'text', 0, '2026-04-01 00:53:38', '2026-04-01 00:53:38'),
(6, 'global_commission_percentage', '10', 'accounting', 'text', 0, '2026-04-01 05:04:50', '2026-04-01 05:04:50'),
(7, 'commission_rate', '20', 'commission', 'text', 0, '2026-04-03 01:23:52', '2026-04-03 01:23:52');

-- --------------------------------------------------------

--
-- Table structure for table `shipments`
--

CREATE TABLE `shipments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `order_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `carrier` varchar(255) NOT NULL,
  `tracking_number` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shipments`
--

INSERT INTO `shipments` (`id`, `order_id`, `order_item_id`, `carrier`, `tracking_number`, `status`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'FedEx', '123456789sdfh', 'delivered', '2026-04-24 03:40:29', '2026-04-24 03:42:46', '2026-04-24 03:40:29', '2026-04-24 03:42:46'),
(2, 1, 2, 'BlueDart', 'sdfcgv4576878', 'delivered', '2026-04-24 03:46:27', '2026-04-24 03:46:50', '2026-04-24 03:46:27', '2026-04-24 03:46:50');

-- --------------------------------------------------------

--
-- Table structure for table `shopping_carts`
--

CREATE TABLE `shopping_carts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shopping_carts`
--

INSERT INTO `shopping_carts` (`id`, `customer_id`, `created_at`, `updated_at`) VALUES
(3, 2, '2026-04-24 03:36:02', '2026-04-24 03:36:02'),
(6, 3, '2026-04-27 05:15:34', '2026-04-27 05:15:34');

-- --------------------------------------------------------

--
-- Table structure for table `social_logins`
--

CREATE TABLE `social_logins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `provider` varchar(255) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `client_secret` text NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `role_after_login` varchar(255) NOT NULL DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `social_logins`
--

INSERT INTO `social_logins` (`id`, `provider`, `client_id`, `client_secret`, `is_enabled`, `role_after_login`, `created_at`, `updated_at`) VALUES
(1, 'Google', 'g_123', 'eyJpdiI6IlNoR1YrcEtqcGlYSVhOb3hiVEdvR2c9PSIsInZhbHVlIjoibVlNVHRBZDB5VzgyM3FneVg1SVJFZz09IiwibWFjIjoiZTE3ZTJmZjM5MDgwZWI2MTA2NDdjZDU1YzMxNjhmZGNjYzczY2QxOTdiODJiZjc0YWMzMTNiYjI2MTMxY2IxNCIsInRhZyI6IiJ9', 0, 'customer', '2026-04-01 00:53:38', '2026-04-01 00:53:38'),
(2, 'Facebook', 'f_123', 'eyJpdiI6IjNoMTZQN1VKblZjY01jOE5ENFlCTEE9PSIsInZhbHVlIjoibU5SdW0zQjdPNytuU2V0NGRZejZvQT09IiwibWFjIjoiNjQ2ZTA3MzM2NzgzMzUwMTRmZDU5MGI2ZDNhMGJiMGMxMjQ3ZTQxNzI5MjIzNjg3YTY0NGI0ZDhhOTBjNTA2NCIsInRhZyI6IiJ9', 0, 'customer', '2026-04-01 00:53:38', '2026-04-01 00:53:38');

-- --------------------------------------------------------

--
-- Table structure for table `states`
--

CREATE TABLE `states` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `country_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `gst_code` varchar(5) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `states`
--

INSERT INTO `states` (`id`, `country_id`, `name`, `code`, `gst_code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Andhra Pradesh', 'AP', '37', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:13'),
(2, 1, 'Arunachal Pradesh', 'AR', '12', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(3, 1, 'Assam', 'AS', '18', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(4, 1, 'Bihar', 'BR', '10', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(5, 1, 'Chhattisgarh', 'CT', '22', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(6, 1, 'Goa', 'GA', '30', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(7, 1, 'Gujarat', 'GJ', '24', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(8, 1, 'Haryana', 'HR', '06', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(9, 1, 'Himachal Pradesh', 'HP', '02', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(10, 1, 'Jharkhand', 'JH', '20', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(11, 1, 'Karnataka', 'KA', '29', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(12, 1, 'Kerala', 'KL', '32', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(13, 1, 'Madhya Pradesh', 'MP', '23', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(14, 1, 'Maharashtra', 'MH', '27', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(15, 1, 'Manipur', 'MN', '14', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(16, 1, 'Meghalaya', 'ML', '17', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(17, 1, 'Mizoram', 'MZ', '15', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(18, 1, 'Nagaland', 'NL', '13', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(19, 1, 'Odisha', 'OR', '21', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(20, 1, 'Punjab', 'PB', '03', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(21, 1, 'Rajasthan', 'RJ', '08', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(22, 1, 'Sikkim', 'SK', '11', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(23, 1, 'Tamil Nadu', 'TN', '33', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:13'),
(24, 1, 'Telangana', 'TG', '36', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:13'),
(25, 1, 'Tripura', 'TR', '16', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(26, 1, 'Uttar Pradesh', 'UP', '09', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(27, 1, 'Uttarakhand', 'UT', '05', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(28, 1, 'West Bengal', 'WB', '19', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(29, 1, 'Andaman and Nicobar Islands', 'AN', '35', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:13'),
(30, 1, 'Chandigarh', 'CH', '04', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(31, 1, 'Dadra and Nagar Haveli and Daman and Diu', 'DN', '26', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(32, 1, 'Lakshadweep', 'LD', '31', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(33, 1, 'Delhi', 'DL', '07', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12'),
(34, 1, 'Puducherry', 'PY', '34', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:13'),
(35, 1, 'Ladakh', 'LA', '38', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:13'),
(36, 1, 'Jammu and Kashmir', 'JK', '01', 1, '2026-03-31 00:54:49', '2026-03-31 07:13:12');

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `pickup_address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `zip` varchar(20) NOT NULL,
  `country` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `vendor_id`, `name`, `slug`, `description`, `logo`, `banner`, `pickup_address`, `city`, `state`, `zip`, `country`, `created_at`, `updated_at`) VALUES
(1, 1, 'dopejewells', 'dopejewells', 'dopejewells', NULL, NULL, 'Noida', 'Noida', 'Noida', '110062', 'India', '2026-04-24 02:27:40', '2026-04-24 02:27:40');

-- --------------------------------------------------------

--
-- Table structure for table `sub_orders`
--

CREATE TABLE `sub_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `applied_promotions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`applied_promotions`)),
  `shipping_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total` decimal(15,2) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned','refunded','completed') NOT NULL DEFAULT 'pending',
  `tracking_number` varchar(255) DEFAULT NULL,
  `carrier_name` varchar(255) DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sub_orders`
--

INSERT INTO `sub_orders` (`id`, `order_id`, `vendor_id`, `order_number`, `subtotal`, `discount_amount`, `applied_promotions`, `shipping_cost`, `total`, `status`, `tracking_number`, `carrier_name`, `shipped_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'ORD-ICQ8WRSQKR-V1', 7920.00, 0.00, '[]', 150.00, 8070.00, 'delivered', NULL, NULL, NULL, '2026-04-24 02:49:04', '2026-04-24 03:46:50'),
(3, 3, 1, 'ORD-Y7TGW4WCWP-V1', 2640.00, 0.00, '[]', 50.00, 2690.00, 'pending', NULL, NULL, NULL, '2026-04-27 01:25:59', '2026-04-27 01:25:59'),
(4, 4, 1, 'ORD-P955MFMK2A-V1', 2640.00, 0.00, '[]', 50.00, 2690.00, 'pending', NULL, NULL, NULL, '2026-04-27 03:20:59', '2026-04-27 03:20:59');

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Featured', 'featured', '2026-03-17 05:51:40', '2026-03-17 05:51:40'),
(2, 'Best Selling', 'best-selling', '2026-03-17 05:52:13', '2026-03-17 05:52:13'),
(3, 'Trending', 'trending', '2026-03-17 05:52:41', '2026-03-17 05:52:41');

-- --------------------------------------------------------

--
-- Table structure for table `tax_groups`
--

CREATE TABLE `tax_groups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `cgst` decimal(5,2) NOT NULL DEFAULT 0.00,
  `sgst` decimal(5,2) NOT NULL DEFAULT 0.00,
  `igst` decimal(5,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tax_groups`
--

INSERT INTO `tax_groups` (`id`, `name`, `cgst`, `sgst`, `igst`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Exempted', 0.00, 0.00, 0.00, 1, '2026-03-31 03:54:06', '2026-03-31 03:55:11'),
(2, 'GST 5%', 2.50, 2.50, 5.00, 1, '2026-03-31 03:55:54', '2026-03-31 03:55:54'),
(3, 'GST 12%', 6.00, 6.00, 12.00, 1, '2026-03-31 03:56:33', '2026-03-31 03:56:33'),
(4, 'GST 18%', 9.00, 9.00, 18.00, 1, '2026-03-31 03:57:47', '2026-03-31 03:57:47'),
(5, 'GST 28%', 14.00, 14.00, 28.00, 1, '2026-03-31 03:59:11', '2026-03-31 03:59:11');

-- --------------------------------------------------------

--
-- Table structure for table `uoms`
--

CREATE TABLE `uoms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `uoms`
--

INSERT INTO `uoms` (`id`, `code`, `name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BAG', 'BAGS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(2, 'BAL', 'BALE', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(3, 'BDL', 'BUNDLES', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(4, 'BKL', 'BUCKLES', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(5, 'BOU', 'BILLION OF UNITS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(6, 'BOX', 'BOX', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(7, 'BTL', 'BOTTLES', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(8, 'BUN', 'BUNCHES', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(9, 'CAN', 'CANS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(10, 'CBM', 'CUBIC METERS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(11, 'CCM', 'CUBIC CENTIMETERS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(12, 'CMS', 'CENTIMETERS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(13, 'CTN', 'CARTONS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(14, 'DOZ', 'DOZENS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(15, 'DRM', 'DRUMS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(16, 'GGK', 'GREAT GROSS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(17, 'GMS', 'GRAMS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(18, 'GRS', 'GROSS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(19, 'GYD', 'GROSS YARDS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(20, 'KGS', 'KILOGRAMS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(21, 'KLR', 'KILOLITRE', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(22, 'KME', 'KILOMETRE', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(23, 'MLT', 'MILLILITRE', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(24, 'MTR', 'METERS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(25, 'MTS', 'METRIC TON', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(26, 'NOS', 'NUMBERS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(27, 'PAC', 'PACKS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(28, 'PCS', 'PIECES', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(29, 'PRS', 'PAIRS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(30, 'QTL', 'QUINTAL', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(31, 'ROL', 'ROLLS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(32, 'SET', 'SETS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(33, 'SQF', 'SQUARE FEET', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(34, 'SQM', 'SQUARE METERS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(35, 'SQY', 'SQUARE YARDS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(36, 'TBS', 'TABLETS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(37, 'TGM', 'TEN GROSS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(38, 'THD', 'THOUSANDS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(39, 'TON', 'TONNES', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(40, 'TUB', 'TUBES', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(41, 'UGS', 'US GALLONS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50'),
(42, 'YDS', 'YARDS', 1, '2026-03-31 01:16:50', '2026-03-31 01:16:50');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@example.com', NULL, '$2y$12$tp/WGqS2MU.pLFwcMIh1qeTlL5vvXO34erEXZiX.NYLEoElAswFGi', NULL, '2026-03-13 02:06:51', '2026-03-13 02:06:51');

-- --------------------------------------------------------

--
-- Table structure for table `variant_galleries`
--

CREATE TABLE `variant_galleries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `variant_id` bigint(20) UNSIGNED NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `business_type` varchar(255) DEFAULT NULL,
  `gst_number` varchar(255) DEFAULT NULL,
  `pan_number` varchar(255) DEFAULT NULL,
  `onboarding_step` int(11) NOT NULL DEFAULT 1,
  `onboarding_completed_at` timestamp NULL DEFAULT NULL,
  `shop_name` varchar(255) DEFAULT NULL,
  `shop_slug` varchar(255) DEFAULT NULL,
  `shop_description` text DEFAULT NULL,
  `shop_logo` varchar(255) DEFAULT NULL,
  `shop_banner` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `name`, `email`, `password`, `remember_token`, `phone`, `status`, `rejection_reason`, `business_type`, `gst_number`, `pan_number`, `onboarding_step`, `onboarding_completed_at`, `shop_name`, `shop_slug`, `shop_description`, `shop_logo`, `shop_banner`, `address`, `city`, `state`, `zip`, `country`, `created_at`, `updated_at`) VALUES
(1, 'dopejewells', 'dopejewells@gmail.com', '$2y$12$zdr4ZJTUaf0blfvOtRHsFOxJ8ublIgBiklzQ10XxmQyeZT9bm5ki2', NULL, '9667796371', 'active', NULL, 'Individual', NULL, 'ABCPS1234A', 7, '2026-04-24 02:27:49', 'dopejewells', 'dopejewells', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-24 02:24:32', '2026-04-24 02:28:39');

-- --------------------------------------------------------

--
-- Table structure for table `vendor_bank_accounts`
--

CREATE TABLE `vendor_bank_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `account_holder_name` varchar(255) NOT NULL,
  `account_number` varchar(255) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendor_bank_accounts`
--

INSERT INTO `vendor_bank_accounts` (`id`, `vendor_id`, `account_holder_name`, `account_number`, `ifsc_code`, `upi_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'dopejewells', '35334543454', 'SDFSD3', NULL, '2026-04-24 02:26:53', '2026-04-24 02:26:53');

-- --------------------------------------------------------

--
-- Table structure for table `vendor_documents`
--

CREATE TABLE `vendor_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vendor_id` bigint(20) UNSIGNED NOT NULL,
  `document_type` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendor_documents`
--

INSERT INTO `vendor_documents` (`id`, `vendor_id`, `document_type`, `file_path`, `status`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 'pan_card', 'vendor_documents/1/42D7hVkmRfCJ3NmqITGRHX9t6Ge1tAHU3MZXH42K.jpg', 'pending', NULL, '2026-04-24 02:26:08', '2026-04-24 02:26:08'),
(2, 1, 'id_proof', 'vendor_documents/1/JbXemOxcyXRHb76z7t3balEcaNDyvOaDK5lAz5h7.png', 'pending', NULL, '2026-04-24 02:26:20', '2026-04-24 02:26:20');

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `holder_type` varchar(255) NOT NULL,
  `holder_id` bigint(20) UNSIGNED NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `pending_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(255) NOT NULL DEFAULT 'INR',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `holder_type`, `holder_id`, `balance`, `pending_balance`, `currency`, `status`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\Vendor', 1, 0.00, 0.00, 'INR', 'active', '2026-04-24 03:43:03', '2026-04-24 03:43:03');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `wallet_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'completed',
  `amount` decimal(15,2) NOT NULL,
  `balance_before` decimal(15,2) NOT NULL,
  `balance_after` decimal(15,2) NOT NULL,
  `reference_type` varchar(255) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `customer_id`, `created_at`, `updated_at`) VALUES
(1, 3, '2026-04-27 03:32:27', '2026-04-27 03:32:27');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist_items`
--

CREATE TABLE `wishlist_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `wishlist_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlist_items`
--

INSERT INTO `wishlist_items` (`id`, `wishlist_id`, `product_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-04-27 03:32:27', '2026-04-27 03:32:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addresses_customer_id_foreign` (`customer_id`),
  ADD KEY `addresses_country_id_foreign` (`country_id`),
  ADD KEY `addresses_state_id_foreign` (`state_id`);

--
-- Indexes for table `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_option_values_option_id_foreign` (`attribute_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_categories_slug_unique` (`slug`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_posts_slug_unique` (`slug`),
  ADD KEY `blog_posts_category_id_foreign` (`category_id`),
  ADD KEY `blog_posts_author_id_foreign` (`author_id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cart_items_cart_id_foreign` (`cart_id`),
  ADD KEY `cart_items_variant_id_foreign` (`variant_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`),
  ADD KEY `categories_parent_category_id_foreign` (`parent_category_id`);

--
-- Indexes for table `category_attributes`
--
ALTER TABLE `category_attributes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_attributes_category_id_foreign` (`category_id`),
  ADD KEY `category_attributes_attribute_id_foreign` (`attribute_id`);

--
-- Indexes for table `category_attribute_values`
--
ALTER TABLE `category_attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_attribute_values_category_id_foreign` (`category_id`),
  ADD KEY `category_attribute_values_attribute_value_id_foreign` (`attribute_value_id`);

--
-- Indexes for table `category_tag`
--
ALTER TABLE `category_tag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_tag_category_id_tag_id_unique` (`category_id`,`tag_id`),
  ADD KEY `category_tag_tag_id_foreign` (`tag_id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `countries_iso_code_unique` (`iso_code`),
  ADD KEY `countries_name_index` (`name`),
  ADD KEY `countries_is_active_index` (`is_active`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customers_email_unique` (`email`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hsn_sacs`
--
ALTER TABLE `hsn_sacs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hsn_sacs_code_index` (`code`),
  ADD KEY `hsn_sacs_is_active_index` (`is_active`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_reserved_at_available_at_index` (`queue`,`reserved_at`,`available_at`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_number_unique` (`order_number`),
  ADD KEY `orders_shipping_address_id_foreign` (`shipping_address_id`),
  ADD KEY `orders_order_number_index` (`order_number`),
  ADD KEY `orders_customer_id_index` (`customer_id`),
  ADD KEY `orders_created_at_index` (`created_at`),
  ADD KEY `orders_status_index` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_variant_id_foreign` (`variant_id`),
  ADD KEY `order_items_sub_order_id_foreign` (`sub_order_id`),
  ADD KEY `order_items_status_index` (`status`);

--
-- Indexes for table `order_promotions`
--
ALTER TABLE `order_promotions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_promotions_order_id_foreign` (`order_id`),
  ADD KEY `order_promotions_promotion_id_foreign` (`promotion_id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pages_slug_unique` (`slug`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_order_id_foreign` (`order_id`);

--
-- Indexes for table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_gateways_slug_unique` (`slug`);

--
-- Indexes for table `payout_requests`
--
ALTER TABLE `payout_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payout_requests_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_unique` (`name`);

--
-- Indexes for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `permission_role_role_id_foreign` (`role_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_vendor_id_foreign` (`vendor_id`),
  ADD KEY `products_brand_id_foreign` (`brand_id`),
  ADD KEY `products_hsn_sac_id_foreign` (`hsn_sac_id`),
  ADD KEY `products_uom_id_foreign` (`uom_id`),
  ADD KEY `products_tax_group_id_foreign` (`tax_group_id`);

--
-- Indexes for table `product_attribute_values`
--
ALTER TABLE `product_attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variant_values_variant_id_foreign` (`variant_id`),
  ADD KEY `product_variant_values_option_value_id_foreign` (`attribute_value_id`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_categories_product_id_foreign` (`product_id`),
  ADD KEY `product_categories_category_id_foreign` (`category_id`);

--
-- Indexes for table `product_galleries`
--
ALTER TABLE `product_galleries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_galleries_product_id_foreign` (`product_id`),
  ADD KEY `product_galleries_attribute_value_id_foreign` (`attribute_value_id`);

--
-- Indexes for table `product_tag`
--
ALTER TABLE `product_tag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_tag_product_id_tag_id_unique` (`product_id`,`tag_id`),
  ADD KEY `product_tag_tag_id_foreign` (`tag_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_variants_sku_unique` (`sku`),
  ADD KEY `product_variants_product_id_foreign` (`product_id`);

--
-- Indexes for table `product_variant_images`
--
ALTER TABLE `product_variant_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variant_images_variant_id_foreign` (`variant_id`),
  ADD KEY `product_variant_images_product_gallery_id_foreign` (`product_gallery_id`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `promotions_code_unique` (`code`),
  ADD KEY `promotions_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `promotion_categories`
--
ALTER TABLE `promotion_categories`
  ADD PRIMARY KEY (`promotion_id`,`category_id`),
  ADD KEY `promotion_categories_category_id_foreign` (`category_id`);

--
-- Indexes for table `promotion_products`
--
ALTER TABLE `promotion_products`
  ADD PRIMARY KEY (`promotion_id`,`product_id`),
  ADD KEY `promotion_products_product_id_foreign` (`product_id`);

--
-- Indexes for table `promotion_rules`
--
ALTER TABLE `promotion_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotion_rules_promotion_id_foreign` (`promotion_id`);

--
-- Indexes for table `refund_transactions`
--
ALTER TABLE `refund_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `refund_transactions_return_request_id_foreign` (`return_request_id`),
  ADD KEY `refund_transactions_customer_id_foreign` (`customer_id`);

--
-- Indexes for table `return_reasons`
--
ALTER TABLE `return_reasons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `return_requests`
--
ALTER TABLE `return_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_requests_order_id_foreign` (`order_id`),
  ADD KEY `return_requests_order_item_id_foreign` (`order_item_id`),
  ADD KEY `return_requests_customer_id_foreign` (`customer_id`),
  ADD KEY `return_requests_reason_id_foreign` (`reason_id`),
  ADD KEY `return_requests_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `return_request_items`
--
ALTER TABLE `return_request_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_request_items_return_request_id_foreign` (`return_request_id`),
  ADD KEY `return_request_items_product_id_foreign` (`product_id`),
  ADD KEY `return_request_items_variant_id_foreign` (`variant_id`);

--
-- Indexes for table `return_shipments`
--
ALTER TABLE `return_shipments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_shipments_return_request_id_foreign` (`return_request_id`);

--
-- Indexes for table `return_status_history`
--
ALTER TABLE `return_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_status_history_return_request_id_foreign` (`return_request_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`);

--
-- Indexes for table `role_user`
--
ALTER TABLE `role_user`
  ADD PRIMARY KEY (`role_id`,`user_id`,`user_type`),
  ADD KEY `role_user_user_id_foreign` (`user_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sections_sectionable_type_sectionable_id_index` (`sectionable_type`,`sectionable_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);

--
-- Indexes for table `shipments`
--
ALTER TABLE `shipments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shipments_order_id_foreign` (`order_id`),
  ADD KEY `shipments_order_item_id_foreign` (`order_item_id`);

--
-- Indexes for table `shopping_carts`
--
ALTER TABLE `shopping_carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shopping_carts_customer_id_foreign` (`customer_id`);

--
-- Indexes for table `social_logins`
--
ALTER TABLE `social_logins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`),
  ADD KEY `states_country_id_foreign` (`country_id`),
  ADD KEY `states_name_index` (`name`),
  ADD KEY `states_is_active_index` (`is_active`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stores_slug_unique` (`slug`),
  ADD KEY `stores_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `sub_orders`
--
ALTER TABLE `sub_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sub_orders_order_number_unique` (`order_number`),
  ADD KEY `sub_orders_order_id_foreign` (`order_id`),
  ADD KEY `sub_orders_order_number_index` (`order_number`),
  ADD KEY `sub_orders_vendor_id_index` (`vendor_id`),
  ADD KEY `sub_orders_created_at_index` (`created_at`),
  ADD KEY `sub_orders_status_index` (`status`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tags_name_unique` (`name`),
  ADD UNIQUE KEY `tags_slug_unique` (`slug`);

--
-- Indexes for table `tax_groups`
--
ALTER TABLE `tax_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tax_groups_name_index` (`name`),
  ADD KEY `tax_groups_is_active_index` (`is_active`);

--
-- Indexes for table `uoms`
--
ALTER TABLE `uoms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uoms_code_index` (`code`),
  ADD KEY `uoms_is_active_index` (`is_active`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `variant_galleries`
--
ALTER TABLE `variant_galleries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_galleries_variant_id_foreign` (`variant_id`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendors_email_unique` (`email`),
  ADD UNIQUE KEY `vendors_shop_slug_unique` (`shop_slug`);

--
-- Indexes for table `vendor_bank_accounts`
--
ALTER TABLE `vendor_bank_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_bank_accounts_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `vendor_documents`
--
ALTER TABLE `vendor_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_documents_vendor_id_foreign` (`vendor_id`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallets_holder_type_holder_id_index` (`holder_type`,`holder_id`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallet_transactions_wallet_id_foreign` (`wallet_id`),
  ADD KEY `wallet_transactions_reference_type_reference_id_index` (`reference_type`,`reference_id`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wishlists_customer_id_foreign` (`customer_id`);

--
-- Indexes for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wishlist_items_wishlist_id_foreign` (`wishlist_id`),
  ADD KEY `wishlist_items_product_id_foreign` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `attributes`
--
ALTER TABLE `attributes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `attribute_values`
--
ALTER TABLE `attribute_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `category_attributes`
--
ALTER TABLE `category_attributes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `category_attribute_values`
--
ALTER TABLE `category_attribute_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `category_tag`
--
ALTER TABLE `category_tag`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hsn_sacs`
--
ALTER TABLE `hsn_sacs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `order_promotions`
--
ALTER TABLE `order_promotions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payout_requests`
--
ALTER TABLE `payout_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_attribute_values`
--
ALTER TABLE `product_attribute_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_galleries`
--
ALTER TABLE `product_galleries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `product_tag`
--
ALTER TABLE `product_tag`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `product_variant_images`
--
ALTER TABLE `product_variant_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `promotion_rules`
--
ALTER TABLE `promotion_rules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `refund_transactions`
--
ALTER TABLE `refund_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_reasons`
--
ALTER TABLE `return_reasons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `return_requests`
--
ALTER TABLE `return_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_request_items`
--
ALTER TABLE `return_request_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_shipments`
--
ALTER TABLE `return_shipments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_status_history`
--
ALTER TABLE `return_status_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `shipments`
--
ALTER TABLE `shipments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shopping_carts`
--
ALTER TABLE `shopping_carts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `social_logins`
--
ALTER TABLE `social_logins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `states`
--
ALTER TABLE `states`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sub_orders`
--
ALTER TABLE `sub_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tax_groups`
--
ALTER TABLE `tax_groups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `uoms`
--
ALTER TABLE `uoms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `variant_galleries`
--
ALTER TABLE `variant_galleries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vendor_bank_accounts`
--
ALTER TABLE `vendor_bank_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vendor_documents`
--
ALTER TABLE `vendor_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `addresses_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `addresses_state_id_foreign` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD CONSTRAINT `variant_option_values_option_id_foreign` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `blog_posts_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `shopping_carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_category_id_foreign` FOREIGN KEY (`parent_category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `category_attributes`
--
ALTER TABLE `category_attributes`
  ADD CONSTRAINT `category_attributes_attribute_id_foreign` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `category_attributes_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `category_attribute_values`
--
ALTER TABLE `category_attribute_values`
  ADD CONSTRAINT `category_attribute_values_attribute_value_id_foreign` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `category_attribute_values_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `category_tag`
--
ALTER TABLE `category_tag`
  ADD CONSTRAINT `category_tag_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `category_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_shipping_address_id_foreign` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_sub_order_id_foreign` FOREIGN KEY (`sub_order_id`) REFERENCES `sub_orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `order_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_promotions`
--
ALTER TABLE `order_promotions`
  ADD CONSTRAINT `order_promotions_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_promotions_promotion_id_foreign` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payout_requests`
--
ALTER TABLE `payout_requests`
  ADD CONSTRAINT `payout_requests_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_hsn_sac_id_foreign` FOREIGN KEY (`hsn_sac_id`) REFERENCES `hsn_sacs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_tax_group_id_foreign` FOREIGN KEY (`tax_group_id`) REFERENCES `tax_groups` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_uom_id_foreign` FOREIGN KEY (`uom_id`) REFERENCES `uoms` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_attribute_values`
--
ALTER TABLE `product_attribute_values`
  ADD CONSTRAINT `product_variant_values_option_value_id_foreign` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_variant_values_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD CONSTRAINT `product_categories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_categories_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_galleries`
--
ALTER TABLE `product_galleries`
  ADD CONSTRAINT `product_galleries_attribute_value_id_foreign` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `product_galleries_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_tag`
--
ALTER TABLE `product_tag`
  ADD CONSTRAINT `product_tag_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variant_images`
--
ALTER TABLE `product_variant_images`
  ADD CONSTRAINT `product_variant_images_product_gallery_id_foreign` FOREIGN KEY (`product_gallery_id`) REFERENCES `product_galleries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_variant_images_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotions`
--
ALTER TABLE `promotions`
  ADD CONSTRAINT `promotions_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotion_categories`
--
ALTER TABLE `promotion_categories`
  ADD CONSTRAINT `promotion_categories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `promotion_categories_promotion_id_foreign` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotion_products`
--
ALTER TABLE `promotion_products`
  ADD CONSTRAINT `promotion_products_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `promotion_products_promotion_id_foreign` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotion_rules`
--
ALTER TABLE `promotion_rules`
  ADD CONSTRAINT `promotion_rules_promotion_id_foreign` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refund_transactions`
--
ALTER TABLE `refund_transactions`
  ADD CONSTRAINT `refund_transactions_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `refund_transactions_return_request_id_foreign` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `return_requests`
--
ALTER TABLE `return_requests`
  ADD CONSTRAINT `return_requests_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_requests_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_requests_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_requests_reason_id_foreign` FOREIGN KEY (`reason_id`) REFERENCES `return_reasons` (`id`),
  ADD CONSTRAINT `return_requests_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `return_request_items`
--
ALTER TABLE `return_request_items`
  ADD CONSTRAINT `return_request_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_request_items_return_request_id_foreign` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_request_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `return_shipments`
--
ALTER TABLE `return_shipments`
  ADD CONSTRAINT `return_shipments_return_request_id_foreign` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `return_status_history`
--
ALTER TABLE `return_status_history`
  ADD CONSTRAINT `return_status_history_return_request_id_foreign` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_user`
--
ALTER TABLE `role_user`
  ADD CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipments`
--
ALTER TABLE `shipments`
  ADD CONSTRAINT `shipments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipments_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shopping_carts`
--
ALTER TABLE `shopping_carts`
  ADD CONSTRAINT `shopping_carts_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `states`
--
ALTER TABLE `states`
  ADD CONSTRAINT `states_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sub_orders`
--
ALTER TABLE `sub_orders`
  ADD CONSTRAINT `sub_orders_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sub_orders_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `variant_galleries`
--
ALTER TABLE `variant_galleries`
  ADD CONSTRAINT `variant_galleries_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vendor_bank_accounts`
--
ALTER TABLE `vendor_bank_accounts`
  ADD CONSTRAINT `vendor_bank_accounts_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vendor_documents`
--
ALTER TABLE `vendor_documents`
  ADD CONSTRAINT `vendor_documents_vendor_id_foreign` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_wallet_id_foreign` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `wishlist_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_items_wishlist_id_foreign` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
