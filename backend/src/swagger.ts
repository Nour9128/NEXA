export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NEXA Platform API',
    version: '1.0.0',
    description: 'REST API documentation for NEXA — Your life, connected. AI-powered life organization platform.',
    contact: {
      name: 'NEXA Engineering',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development server',
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
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user account',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'fullName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  fullName: { type: 'string' },
                  timezone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login and obtain tokens',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/plans': {
      get: {
        summary: 'List user and shared plans',
        tags: ['Plans'],
        responses: { 200: { description: 'List of plans' } },
      },
      post: {
        summary: 'Create a new plan',
        tags: ['Plans'],
        responses: { 201: { description: 'Plan created' } },
      },
    },
    '/api/tasks': {
      get: {
        summary: 'List user tasks with filters',
        tags: ['Tasks'],
        responses: { 200: { description: 'List of tasks' } },
      },
      post: {
        summary: 'Create a task',
        tags: ['Tasks'],
        responses: { 201: { description: 'Task created' } },
      },
    },
    '/api/ai/chat': {
      post: {
        summary: 'Send a message to the AI copilot',
        tags: ['AI'],
        responses: { 200: { description: 'AI assistant reply' } },
      },
    },
    '/api/ai/organize': {
      post: {
        summary: 'Generate structured plan from natural language',
        tags: ['AI'],
        responses: { 200: { description: 'Structured plan generated' } },
      },
    },
    '/api/ai/extract': {
      post: {
        summary: 'Extract structured tasks and info from raw content or screenshot',
        tags: ['AI'],
        responses: { 200: { description: 'Extracted content' } },
      },
    },
    '/api/spaces': {
      get: {
        summary: 'List shared collaboration spaces',
        tags: ['Shared Spaces'],
        responses: { 200: { description: 'List of spaces' } },
      },
    },
    '/api/saved-items': {
      get: {
        summary: 'Get saved captures, notes, screenshots, and links',
        tags: ['Saved Items'],
        responses: { 200: { description: 'List of saved items' } },
      },
    },
  },
};
