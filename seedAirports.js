const fs = require('fs');
const csv = require('csv-parser');
const container = require('./src/container'); 
const { models: { Airport } } = container;

async function seedAirports() {
    console.log('Connecting to database and syncing Airport model...');
    await Airport.sync({ alter: true }); 
    
    console.log('Starting CSV seeding...');
    const results = [];
    const BATCH_SIZE = 5000;
    let count = 0;

    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream('src/json/airports_fixed3.csv')
            .pipe(csv())
            .on('data', (data) => {
                const row = {
                    id: data.id ? parseInt(data.id.trim()) : null,
                    ident: data.ident || null,
                    type: data.type || null,
                    name: data.name || null,
                    latitude_deg: data.latitude_deg ? parseFloat(data.latitude_deg) : null,
                    longitude_deg: data.longitude_deg ? parseFloat(data.longitude_deg) : null,
                    elevation_ft: data.elevation_ft ? parseInt(data.elevation_ft) : null,
                    continent: data.continent || null,
                    iso_country: data.iso_country || null,
                    iso_region: data.iso_region || null,
                    municipality: data.municipality || null,
                    scheduled_service: data.scheduled_service || null,
                    gps_code: data.gps_code || null,
                    iata_code: data.iata_code || null,
                    local_code: data.local_code || null,
                    home_link: data.home_link || null,
                    wikipedia_link: data.wikipedia_link || null,
                    keywords: data.keywords || null
                };
                
                // Skip invalid rows like the initial <div> or empty lines
                if (row.id === null || isNaN(row.id)) {
                    return;
                }
                
                results.push(row);
                count++;
                
                if (results.length >= BATCH_SIZE) {
                    stream.pause();
                    Airport.bulkCreate([...results], { ignoreDuplicates: true })
                        .then(() => {
                            console.log(`Processed ${count} rows...`);
                            results.length = 0; 
                            stream.resume();
                        })
                        .catch((err) => {
                            console.error('Error in bulk insert:', err);
                            stream.resume(); 
                        });
                }
            })
            .on('end', async () => {
                if (results.length > 0) {
                    await Airport.bulkCreate(results, { ignoreDuplicates: true }).catch(err => console.error('Final batch error', err));
                    console.log(`Processed final ${results.length} rows.`);
                }
                console.log(`Finished seeding! Total processed: ${count}`);
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

seedAirports()
    .then(() => {
        console.log('Seed script completed successfully.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Seed script failed:', err);
        process.exit(1);
    });
