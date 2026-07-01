const { db, models } = require('./src/container');

const reviewers = [
  {
    reviewer_name: 'Aarav Mehta',
    reviewer_email: 'aarav.review@example.com',
    rating: 5,
    title: 'Excellent package',
    comment: 'The itinerary was well planned and the booking experience was smooth.'
  },
  {
    reviewer_name: 'Priya Sharma',
    reviewer_email: 'priya.review@example.com',
    rating: 4,
    title: 'Great experience',
    comment: 'Good hotels, helpful support, and enough time to enjoy the destination.'
  },
  {
    reviewer_name: 'Rohan Kapoor',
    reviewer_email: 'rohan.review@example.com',
    rating: 5,
    title: 'Loved the trip',
    comment: 'Everything was organized nicely and the package matched the details shown.'
  }
];

async function seedReviews() {
  await db.authenticate();

  const packageId = parseInt(process.argv[2], 10);
  const hasPackageId = Number.isInteger(packageId) && packageId > 0;

  const packages = await models.Package.findAll({
    attributes: ['id', 'name', 'slug'],
    where: hasPackageId ? { id: packageId } : undefined,
    order: [['id', 'ASC']],
    limit: hasPackageId ? undefined : 5
  });

  if (!packages.length) {
    console.log(hasPackageId
      ? `No package found with id ${packageId}.`
      : 'No packages found. Add packages first, then run this seed.');
    return;
  }

  let created = 0;

  for (const pkg of packages) {
    const existingSeedCount = await models.Review.count({
      where: {
        reviewable_type: 'package',
        package_id: pkg.id,
        source: 'seed'
      }
    });

    if (existingSeedCount > 0) {
      console.log(`Skipped package ${pkg.id} (${pkg.slug || pkg.name}) - seed reviews already exist.`);
      continue;
    }

    await models.Review.bulkCreate(
      reviewers.map(review => ({
        reviewable_type: 'package',
        reviewable_id: pkg.id,
        package_id: pkg.id,
        custom_trip_id: null,
        customer_id: null,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        reviewer_name: review.reviewer_name,
        reviewer_email: review.reviewer_email,
        reviewer_phone: null,
        status: 'approved',
        source: 'seed',
        metadata: {
          package_slug: pkg.slug,
          package_name: pkg.name
        }
      }))
    );

    created += reviewers.length;
    console.log(`Created ${reviewers.length} reviews for package ${pkg.id} (${pkg.slug || pkg.name}).`);
  }

  console.log(`Done. Created ${created} package reviews.`);
}

seedReviews()
  .catch(error => {
    console.error('Failed to seed package reviews:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
