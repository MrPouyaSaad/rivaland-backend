import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Riva Land API Docs",
      version: "1.0.0",
      description: "by Pouya",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "توکن دسترسی (JWT) - از فرمت 'Bearer {token}' استفاده کنید"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  
  apis: [
    "./src/**/*.js",
    "./src/**/**/*.js"

  ], // آدرس فایل‌هایی که داکیومنت روشون می‌نویسیم
};

const swaggerSpec = swaggerJsdoc(options);

export function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
