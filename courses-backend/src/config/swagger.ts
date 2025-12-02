// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Courses API',
            version: '1.0.0',
            description: 'API dokumentace pro Learning Management System',
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Hlavní server',
            },
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
    apis: [
        './src/api/server.ts',
        './src/api/controllers/**/*.ts',
        './src/types/dto/*.ts'
    ],
};

export const swaggerSpec = swaggerJsdoc(options);