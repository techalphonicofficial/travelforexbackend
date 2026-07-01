const { models: { AppSetting } } = require('./src/container');

async function seedTaxes() {
  try {
    console.log("Seeding default tax types...");
    const existing = await AppSetting.findOne({ where: { key: 'tax_types' } });
    const taxTypesValue = JSON.stringify([
      { name: "GST", percent: 5.00 },
      { name: "IGST", percent: 18.00 },
      { name: "SGST", percent: 9.00 },
      { name: "CGST", percent: 9.00 }
    ]);
    if (existing) {
      await existing.update({ value: taxTypesValue });
      console.log("Updated existing tax_types setting.");
    } else {
      await AppSetting.create({ key: 'tax_types', value: taxTypesValue });
      console.log("Created tax_types setting.");
    }
  } catch (e) {
    console.error("Error seeding tax types:", e);
  } finally {
    process.exit();
  }
}

seedTaxes();
