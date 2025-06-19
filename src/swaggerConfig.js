const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

const PORT = process.env.PORT || 8000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation iTicket project',
      version: '1.0.0',
      description: 'Documentation for the backend APIs',
    },
    basePath: '/api/v1',
    servers: [
      { url: `https://abdulaziz-test.onrender.com` },
      { url: `http://localhost:5173` },
      { url: `http://localhost:${PORT}` },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, '/routes/*.js')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
