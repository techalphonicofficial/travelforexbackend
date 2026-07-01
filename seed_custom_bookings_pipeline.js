const sequelize = require('./src/database');
const { Pipeline, PipelineStage, LeadFormField, Lead } = require('./src/container').models;

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Create the Custom Bookings Pipeline
        const [pipeline, created] = await Pipeline.findOrCreate({
            where: { name: 'Custom Bookings' },
            defaults: { description: 'Pipeline for custom trip inquiries from the website', is_active: true }
        });

        if (created) {
            console.log('Created pipeline: Custom Bookings');
        } else {
            console.log('Pipeline "Custom Bookings" already exists.');
        }

        // 2. Create Stages
        const stagesData = [
            { name: 'New Request', color: '#3b82f6', order: 0 },
            { name: 'Designing Itinerary', color: '#f59e0b', order: 1 },
            { name: 'Quote Sent', color: '#8b5cf6', order: 2 },
            { name: 'Negotiation', color: '#f97316', order: 3 },
            { name: 'Won (Paid)', color: '#10b981', order: 4 },
            { name: 'Lost', color: '#ef4444', order: 5 }
        ];

        let stages = [];
        for (const stage of stagesData) {
            const [stg] = await PipelineStage.findOrCreate({
                where: { pipeline_id: pipeline.id, name: stage.name },
                defaults: { color: stage.color, order: stage.order }
            });
            stages.push(stg);
        }
        console.log(`Seeded ${stages.length} stages for pipeline.`);

        // 3. Create LeadFormFields for this pipeline
        const fieldsData = [
            { label: 'Destination', field_key: 'destination', field_type: 'text', is_required: true, order: 0 },
            { label: 'Travel With', field_key: 'travel_with', field_type: 'select', options: ['Solo', 'Couple', 'Family', 'Group', 'Luxury'], is_required: false, order: 1 },
            { label: 'Duration', field_key: 'duration', field_type: 'text', is_required: false, order: 2 },
            { label: 'Departure City', field_key: 'departure_city', field_type: 'text', is_required: false, order: 3 },
            { label: 'Departure Date', field_key: 'departure_date', field_type: 'date', is_required: false, order: 4 },
            { label: 'Total Travellers', field_key: 'total_travellers', field_type: 'number', is_required: true, order: 5 },
            { label: 'Rooms Info', field_key: 'rooms', field_type: 'textarea', is_required: false, order: 6 },
            { label: 'Cities Plan', field_key: 'cities', field_type: 'textarea', is_required: false, order: 7 },
            { label: 'Trip Inquiry ID', field_key: 'custom_booking_id', field_type: 'text', is_required: false, order: 8 }
        ];

        for (const field of fieldsData) {
            await LeadFormField.findOrCreate({
                where: { pipeline_id: pipeline.id, field_key: field.field_key },
                defaults: field
            });
        }
        console.log('Seeded form fields for Custom Bookings pipeline.');

        // 4. Seed a few demo leads
        const demoLeads = [
            {
                name: 'Rahul Sharma',
                email: 'rahul.s@example.com',
                phone: '9876543210',
                source: 'customize_flow',
                pipeline_id: pipeline.id,
                stage_id: stages[0].id, // New Request
                custom_fields: {
                    destination: 'Kerala',
                    travel_with: 'Family',
                    duration: '5-6 Days',
                    departure_city: 'Delhi',
                    departure_date: '2024-11-15',
                    total_travellers: 4
                },
                notes: 'Looking for a relaxing houseboat experience.'
            },
            {
                name: 'Priya Patel',
                email: 'priya.p@example.com',
                phone: '9988776655',
                source: 'customize_flow',
                pipeline_id: pipeline.id,
                stage_id: stages[1].id, // Designing Itinerary
                custom_fields: {
                    destination: 'Bali',
                    travel_with: 'Couple',
                    duration: '7 Days',
                    departure_city: 'Mumbai',
                    departure_date: '2024-12-05',
                    total_travellers: 2
                },
                notes: 'Honeymoon trip, wants luxury resorts and private transfers.'
            },
            {
                name: 'Amit Kumar',
                email: 'amit.k@example.com',
                phone: '9123456789',
                source: 'customize_flow',
                pipeline_id: pipeline.id,
                stage_id: stages[2].id, // Quote Sent
                custom_fields: {
                    destination: 'Dubai',
                    travel_with: 'Group',
                    duration: '4 Days',
                    departure_city: 'Bangalore',
                    departure_date: '2024-10-20',
                    total_travellers: 6
                },
                notes: 'Needs adventure activities like desert safari and Burj Khalifa tickets.'
            }
        ];

        let createdLeadsCount = 0;
        for (const leadData of demoLeads) {
            const [lead, leadCreated] = await Lead.findOrCreate({
                where: { email: leadData.email, pipeline_id: pipeline.id },
                defaults: leadData
            });
            if (leadCreated) createdLeadsCount++;
        }
        console.log(`Seeded ${createdLeadsCount} demo leads.`);

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

seed();
