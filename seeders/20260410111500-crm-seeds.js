'use strict';

const USER_ID = '23051544-2fc5-4df5-904b-d55d9ab9037d';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Pipelines
    const pipelines = await queryInterface.bulkInsert('crm_pipelines', [
      {
        name: 'International Holiday Packages',
        description: 'Global vacation tours and custom packages',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Domestic Getaways',
        description: 'Local weekend trips and family tours',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    const intlPipelineId = pipelines[0].id;
    const domPipelineId = pipelines[1].id;

    // 2. Stages
    await queryInterface.bulkInsert('crm_pipeline_stages', [
      { pipeline_id: intlPipelineId, name: 'New Inquiry', color: '#4f46e5', order: 0, created_at: new Date(), updated_at: new Date() },
      { pipeline_id: intlPipelineId, name: 'Contacted', color: '#f59e0b', order: 1, created_at: new Date(), updated_at: new Date() },
      { pipeline_id: intlPipelineId, name: 'Quotation Sent', color: '#0ea5e9', order: 2, created_at: new Date(), updated_at: new Date() },
      { pipeline_id: intlPipelineId, name: 'Negotiation', color: '#a855f7', order: 3, created_at: new Date(), updated_at: new Date() },
      { pipeline_id: intlPipelineId, name: 'Won (Booked)', color: '#10b981', order: 4, created_at: new Date(), updated_at: new Date() },
      { pipeline_id: intlPipelineId, name: 'Lost', color: '#ef4444', order: 5, created_at: new Date(), updated_at: new Date() },
      
      { pipeline_id: domPipelineId, name: 'Fresh Lead', color: '#4f46e5', order: 0, created_at: new Date(), updated_at: new Date() },
      { pipeline_id: domPipelineId, name: 'In Progress', color: '#f59e0b', order: 1, created_at: new Date(), updated_at: new Date() },
      { pipeline_id: domPipelineId, name: 'Completed', color: '#10b981', order: 2, created_at: new Date(), updated_at: new Date() }
    ]);

    // Get the first stage ID for initial leads
    const stages = await queryInterface.sequelize.query(
      `SELECT id FROM crm_pipeline_stages WHERE pipeline_id = ${intlPipelineId} ORDER BY "order" ASC LIMIT 1`
    );
    const firstStageId = stages[0][0].id;

    // 3. Form Fields
    await queryInterface.bulkInsert('crm_lead_form_fields', [
      {
        pipeline_id: intlPipelineId,
        label: 'Destination Country',
        field_key: 'destination_country',
        field_type: 'text',
        is_required: true,
        order: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        pipeline_id: intlPipelineId,
        label: 'Travel Month',
        field_key: 'travel_month',
        field_type: 'select',
        options: JSON.stringify(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']),
        is_required: false,
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        pipeline_id: intlPipelineId,
        label: 'Budget Range',
        field_key: 'budget',
        field_type: 'select',
        options: JSON.stringify(['< $1000', '$1000 - $3000', '$3000 - $5000', '$5000+']),
        is_required: false,
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 4. Leads
    const leads = await queryInterface.bulkInsert('crm_leads', [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+91 9876543210',
        source: 'Website',
        pipeline_id: intlPipelineId,
        stage_id: firstStageId,
        assigned_to: USER_ID,
        custom_fields: JSON.stringify({ destination_country: 'Switzerland', travel_month: 'June', budget: '$3000 - $5000' }),
        notes: 'Interested in a 7-day family tour.',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Anita Desai',
        email: 'anita@example.com',
        phone: '+91 9988776655',
        source: 'WhatsApp',
        pipeline_id: intlPipelineId,
        stage_id: firstStageId,
        assigned_to: USER_ID,
        custom_fields: JSON.stringify({ destination_country: 'Bali', travel_month: 'August' }),
        notes: 'Honeymoon package inquiry.',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // 5. Follow-ups
    await queryInterface.bulkInsert('crm_lead_follow_ups', [
      {
        lead_id: leads[0].id,
        follow_up_date: new Date().toISOString().split('T')[0],
        follow_up_time: '14:30',
        follow_up_type: 'call',
        notes: 'Call to discuss Switzerland itinerary details.',
        status: 'pending',
        created_by: USER_ID,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        lead_id: leads[1].id,
        follow_up_date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
        follow_up_time: '11:00',
        follow_up_type: 'whatsapp',
        notes: 'Send Bali honeymoon vouchers PDF on WhatsApp.',
        status: 'pending',
        created_by: USER_ID,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('crm_lead_follow_ups', null, {});
    await queryInterface.bulkDelete('crm_leads', null, {});
    await queryInterface.bulkDelete('crm_lead_form_fields', null, {});
    await queryInterface.bulkDelete('crm_pipeline_stages', null, {});
    await queryInterface.bulkDelete('crm_pipelines', null, {});
  }
};
