const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kitap Koleksiyonu API',
      version: '1.0.0',
      description: 'Kitap koleksiyonu yönetimi için RESTful API dokümantasyonu',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Yerel Sunucu',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Route dosyalarındaki swagger açıklamalarını okur
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
