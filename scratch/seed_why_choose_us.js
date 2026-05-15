const { models } = require('../src/container');
const { PageDetail } = models;

async function seed() {
    try {
        const jsonData = {
            stats: [
                { value: "3400+", label: "Holidays Customized" },
                { value: "98%", label: "Customer Satisfaction" },
                { value: "4.9*", label: "Average App Rating" }
            ],
            features: [
                { title: "100% Customized", desc: "Every holiday built from scratch - no templates." },
                { title: "Best Price Guarantee", desc: "We'll match any verified cheaper quote, plus 5% off." },
                { title: "Zero Hidden Charges", desc: "Pay exactly what we quote. No surprises, ever." },
                { title: "24/7 Expert Support", desc: "Your dedicated travel expert is always reachable." }
            ],
            gallery: [
                { img: "/uploads/swiss-alps.jpg", lbl: "Swiss Alps" },
                { img: "/uploads/thailand.jpg", lbl: "Thailand" },
                { img: "/uploads/maldives.jpg", lbl: "Maldives" },
                { img: "/uploads/serengeti.jpg", lbl: "Serengeti" },
                { img: "/uploads/japan.jpg", lbl: "Japan" }
            ]
        };

        const [detail, created] = await PageDetail.findOrCreate({
            where: { 
                page_id: 1, 
                section: 'why_choose_us' 
            },
            defaults: {
                key: 'why-choose-us-home',
                title: 'Why Choose ITS TRAVELS AND TOURS?',
                json_data: jsonData
            }
        });

        if (!created) {
            console.log('Section already exists, updating...');
            await detail.update({
                title: 'Why Choose ITS TRAVELS AND TOURS?',
                json_data: jsonData
            });
        } else {
            console.log('Inserting new section...');
        }

        console.log('Seeding successful!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
