import { NextResponse } from "next/server";

/**
 * OpenAPI v3.1 Metadata Endpoint — /api/openapi
 * Sprint 11.7: Platform Extensibility & Developer Ecosystem
 *
 * Provides a dynamic JSON description of all shared REST endpoints
 * used by external developers and native applications.
 */

const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Smart Personal Finance Analyzer API",
    description: "REST API powering the Smart Personal Finance Analyzer ecosystem, supporting transactions, budgets, goals, and AI Copilot interaction.",
    version: "11.7.0",
    contact: {
      name: "Developer Support",
      email: "developer@smartfinance.analyzer",
    },
  },
  servers: [
    {
      url: "https://your-finance-api.vercel.app",
      description: "Production API Server",
    },
  ],
  paths: {
    "/api/auth/login": {
      post: {
        summary: "Authenticate developer or client device",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Authentication successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    token: { type: "string" },
                    refreshToken: { type: "string" },
                    userId: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/transactions": {
      get: {
        summary: "Retrieve transactions list",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
        ],
        responses: {
          200: {
            description: "Paginated transactions list",
          },
        },
      },
      post: {
        summary: "Create a transaction record",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number", minimum: 0.01 },
                  currency: { type: "string", minLength: 3, maxLength: 3 },
                  type: { type: "string", enum: ["Income", "Expense"] },
                  description: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  categoryId: { type: "string", nullable: true },
                },
                required: ["amount", "currency", "type", "description", "date"],
              },
            },
          },
        },
        responses: {
          201: { description: "Transaction created successfully" },
        },
      },
    },
    "/api/budgets": {
      get: {
        summary: "Retrieve user budgets",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "List of budgets" } },
      },
    },
    "/api/copilot/chat": {
      post: {
        summary: "Send prompt message to the AI copilot",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  conversationId: { type: "string", nullable: true },
                },
                required: ["message"],
              },
            },
          },
        },
        responses: {
          200: { description: "AI reply payload" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
