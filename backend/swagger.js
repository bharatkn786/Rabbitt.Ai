const swaggerJsdoc = require("swagger-jsdoc");

const serverUrl = process.env.BACKEND_URL || "http://localhost:5000";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sales Insight Automator API",
      version: "1.0.0",
      description:
        "Upload sales data (CSV/XLSX), generate AI-powered summaries via Groq, and email the report.",
      contact: {
        name: "Rabbitt AI",
      },
    },
    servers: [
      {
        url: serverUrl,
        description: serverUrl.includes("localhost") ? "Local development server" : "Production server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
