const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel & Forex API',
      version: '1.0.0',
      description: 'API documentation for the Travel & Forex application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const documentedOperations = new Set([
  // Customers & authentication
  'post /api/v1/customers/register',
  'post /api/v1/customers/login',
  'post /api/v1/customers/forgot-password',
  'post /api/v1/customers/reset-password',
  'get /api/v1/customers/profile',
  'post /api/v1/customers/change-password',

  // Packages, categories & destinations
  'get /api/v1/packages',
  'get /api/v1/packages/filters',
  'get /api/v1/packages/{slug}',
  'get /api/v1/package-categories/get-package-category',
  'get /api/v1/categories',
  'get /api/v1/categories/home',
  'get /api/v1/destinations',
  'get /api/v1/destinations/trending',
  'get /api/v1/destinations/visa-free',
  'get /api/v1/destinations/slug/{slug}/related-by-country',
  'get /api/v1/destinations/slug/{slug}/related-packages',

  // Bookings
  'post /api/v1/bookings/create-booking',
  'post /api/v1/bookings/customize',
  'get /api/v1/bookings/customer/{customer_id}',
  'post /api/v1/bookings/coupons/validate',
  'get /api/v1/bookings/cancellation-rules',
  'post /api/v1/bookings/package/{booking_id}/pay-remaining',
  'post /api/v1/bookings/package/{booking_id}/return-request',
  'get /api/v1/bookings/package/return-requests/my',

  // Forex, hotels & custom trips
  'get /api/v1/forex-rates',
  'get /api/v1/forex-rates/{code}',
  'get /api/v1/forex-rates/convert',
  'get /api/v1/hotels',
  'get /api/v1/locations/country-city',
  'get /api/v1/trip-inquiries',
  'get /api/v1/trip-inquiries/{id}',

  // Reviews
  'get /api/v1/reviews',
  'post /api/v1/reviews',
  'post /api/v1/reviews/{id}/like',

  // Global settings, CRM & content
  'get /api/v1/crm/settings/company-info',
  'get /api/v1/pages/slug/{slug}',
  'get /api/v1/blogs',
  'get /api/v1/blogs/{slug}/related',
  'get /api/v1/airports/search',
  'get /api/v1/crm/settings/forex-service-charge',
  'get /api/v1/crm/settings/partial-booking',
  'get /api/v1/crm/settings/theme-colours',
  'get /api/v1/crm/pipelines/{id}/form',
  'post /api/v1/crm/leads/submit',
  'post /api/v1/newsletter',
]);

function filterDocumentedOperations(generatedSpecs) {
  const paths = {};

  Object.entries(generatedSpecs.paths || {}).forEach(([path, pathItem]) => {
    const filteredPathItem = {};
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (documentedOperations.has(`${method.toLowerCase()} ${path}`)) {
        filteredPathItem[method] = operation;
      }
    });

    if (Object.keys(filteredPathItem).length) paths[path] = filteredPathItem;
  });

  return { ...generatedSpecs, paths };
}

const specs = filterDocumentedOperations(swaggerJsdoc(options));

module.exports = {
  swaggerUi,
  specs,
  documentedOperations,
  filterDocumentedOperations,
};
