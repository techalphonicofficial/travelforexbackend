const { db, models } = require('./src/container');

const { CancellationRule } = models;

const rules = [
  {
    min_days_before_departure: 0,
    max_days_before_departure: 3,
    refund_percentage: '0.00',
    cancellation_percentage: '100.00',
    description: 'No refund for cancellations within 3 days of departure.',
    is_active: true
  },
  {
    min_days_before_departure: 4,
    max_days_before_departure: 7,
    refund_percentage: '25.00',
    cancellation_percentage: '75.00',
    description: '25% refund for cancellations 4-7 days before departure.',
    is_active: true
  },
  {
    min_days_before_departure: 8,
    max_days_before_departure: 14,
    refund_percentage: '50.00',
    cancellation_percentage: '50.00',
    description: '50% refund for cancellations 8-14 days before departure.',
    is_active: true
  },
  {
    min_days_before_departure: 15,
    max_days_before_departure: 30,
    refund_percentage: '75.00',
    cancellation_percentage: '25.00',
    description: '75% refund for cancellations 15-30 days before departure.',
    is_active: true
  },
  {
    min_days_before_departure: 31,
    max_days_before_departure: 9999,
    refund_percentage: '90.00',
    cancellation_percentage: '10.00',
    description: '90% refund for cancellations more than 30 days before departure.',
    is_active: true
  }
];

async function main() {
  await db.authenticate();

  let created = 0;
  let updated = 0;

  for (const rule of rules) {
    const existing = await CancellationRule.findOne({
      where: {
        min_days_before_departure: rule.min_days_before_departure,
        max_days_before_departure: rule.max_days_before_departure
      }
    });

    if (existing) {
      await existing.update(rule);
      updated += 1;
    } else {
      await CancellationRule.create(rule);
      created += 1;
    }
  }

  console.log(`Cancellation rules seed complete. Created ${created}, updated ${updated}.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
