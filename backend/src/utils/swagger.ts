import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Management API',
      version,
      description: 'API documentation for the Property Management System',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password (hashed in database)'
            },
            role: {
              type: 'string',
              enum: ['USER', 'AGENT', 'ADMIN'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the user was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the user was last updated'
            }
          }
        },
        Agent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Agent ID'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user associated with this agent'
            },
            name: {
              type: 'string',
              description: 'Agent full name'
            },
            bio: {
              type: 'string',
              description: 'Agent biography'
            },
            phoneNumber: {
              type: 'string',
              description: 'Agent contact phone number'
            },
            agencyName: {
              type: 'string',
              description: 'Name of the agent\'s agency or firm'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            properties: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Property'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the agent was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the agent was last updated'
            }
          }
        },
        Property: {
          type: 'object',
          required: ['title', 'description', 'price', 'agentId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Property ID'
            },
            title: {
              type: 'string',
              description: 'Property title'
            },
            description: {
              type: 'string',
              description: 'Property description'
            },
            price: {
              type: 'number',
              description: 'Property price'
            },
            address: {
              type: 'string',
              description: 'Property address'
            },
            city: {
              type: 'string',
              description: 'City where property is located'
            },
            state: {
              type: 'string',
              description: 'State/province where property is located'
            },
            country: {
              type: 'string',
              description: 'Country where property is located'
            },
            zipCode: {
              type: 'string',
              description: 'Postal/ZIP code'
            },
            bedrooms: {
              type: 'integer',
              description: 'Number of bedrooms'
            },
            bathrooms: {
              type: 'integer',
              description: 'Number of bathrooms'
            },
            squareFootage: {
              type: 'number',
              description: 'Property size in square feet/meters'
            },
            propertyType: {
              type: 'string',
              enum: ['APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'LAND', 'OTHER'],
              description: 'Type of property'
            },
            status: {
              type: 'string',
              enum: ['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED', 'PENDING'],
              description: 'Current status of the property'
            },
            imageUrls: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'URLs to property images'
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Special features of the property'
            },
            agentId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the agent representing this property'
            },
            agent: {
              $ref: '#/components/schemas/Agent'
            },
            bookings: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Booking'
              }
            },
            favorites: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Favorite'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the property was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the property was last updated'
            }
          }
        },
        Booking: {
          type: 'object',
          required: ['userId', 'propertyId', 'startDate', 'endDate'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Booking ID'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user making the booking'
            },
            propertyId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the property being booked'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Start date of the booking'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'End date of the booking'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
              description: 'Current status of the booking'
            },
            totalPrice: {
              type: 'number',
              description: 'Total price for the booking'
            },
            notes: {
              type: 'string',
              description: 'Additional notes for the booking'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            property: {
              $ref: '#/components/schemas/Property'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the booking was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the booking was last updated'
            }
          }
        },
        Favorite: {
          type: 'object',
          required: ['userId', 'propertyId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Favorite ID'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who favorited the property'
            },
            propertyId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the favorited property'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            property: {
              $ref: '#/components/schemas/Property'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the favorite was created'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Error status'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            role: {
              type: 'string',
              enum: ['USER', 'AGENT'],
              description: 'User role'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: 'JWT authentication token'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Properties',
        description: 'Property management endpoints'
      },
      {
        name: 'Agents',
        description: 'Agent management endpoints'
      },
      {
        name: 'Bookings',
        description: 'Booking management endpoints'
      },
      {
        name: 'Favorites',
        description: 'Favorite properties endpoints'
      }
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          description: 'Create a new user account',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterRequest'
                },
                example: {
                  email: 'user@example.com',
                  password: 'Password123!',
                  name: 'John Doe',
                  role: 'USER'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '409': {
              description: 'Email already exists',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          description: 'Authenticate user and return JWT token',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest'
                },
                example: {
                  email: 'user@example.com',
                  password: 'Password123!'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user',
          description: 'Retrieve the authenticated user\'s information',
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            '200': {
              description: 'User information retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/properties': {
        get: {
          tags: ['Properties'],
          summary: 'Get all properties',
          description: 'Retrieve a list of all properties',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Maximum number of properties to return',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number for pagination',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter by property status',
              schema: {
                type: 'string',
                enum: ['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED', 'PENDING']
              }
            },
            {
              name: 'propertyType',
              in: 'query',
              description: 'Filter by property type',
              schema: {
                type: 'string',
                enum: ['APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'LAND', 'OTHER']
              }
            },
            {
              name: 'minPrice',
              in: 'query',
              description: 'Minimum price',
              schema: {
                type: 'number'
              }
            },
            {
              name: 'maxPrice',
              in: 'query',
              description: 'Maximum price',
              schema: {
                type: 'number'
              }
            },
            {
              name: 'city',
              in: 'query',
              description: 'Filter by city',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of properties',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      results: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Property'
                        }
                      },
                      total: {
                        type: 'integer'
                      },
                      page: {
                        type: 'integer'
                      },
                      limit: {
                        type: 'integer'
                      },
                      totalPages: {
                        type: 'integer'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Properties'],
          summary: 'Create a new property',
          description: 'Add a new property listing',
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'price', 'propertyType', 'status'],
                  properties: {
                    title: {
                      type: 'string',
                      example: 'Modern Downtown Apartment'
                    },
                    description: {
                      type: 'string',
                      example: 'A beautiful modern apartment in the heart of downtown.'
                    },
                    price: {
                      type: 'number',
                      example: 350000
                    },
                    address: {
                      type: 'string',
                      example: '123 Main St'
                    },
                    city: {
                      type: 'string',
                      example: 'New York'
                    },
                    state: {
                      type: 'string',
                      example: 'NY'
                    },
                    country: {
                      type: 'string',
                      example: 'USA'
                    },
                    zipCode: {
                      type: 'string',
                      example: '10001'
                    },
                    bedrooms: {
                      type: 'integer',
                      example: 2
                    },
                    bathrooms: {
                      type: 'integer',
                      example: 2
                    },
                    squareFootage: {
                      type: 'number',
                      example: 1200
                    },
                    propertyType: {
                      type: 'string',
                      enum: ['APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'LAND', 'OTHER'],
                      example: 'APARTMENT'
                    },
                    status: {
                      type: 'string',
                      enum: ['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED', 'PENDING'],
                      example: 'FOR_SALE'
                    },
                    imageUrls: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
                    },
                    features: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      example: ['Gym', 'Pool', 'Parking']
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Property created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Property'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Not authorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/properties/{id}': {
        get: {
          tags: ['Properties'],
          summary: 'Get a property by ID',
          description: 'Retrieve a specific property by its ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Property ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Property details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Property'
                  }
                }
              }
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Properties'],
          summary: 'Update a property',
          description: 'Update an existing property',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Property ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string'
                    },
                    description: {
                      type: 'string'
                    },
                    price: {
                      type: 'number'
                    },
                    address: {
                      type: 'string'
                    },
                    city: {
                      type: 'string'
                    },
                    state: {
                      type: 'string'
                    },
                    country: {
                      type: 'string'
                    },
                    zipCode: {
                      type: 'string'
                    },
                    bedrooms: {
                      type: 'integer'
                    },
                    bathrooms: {
                      type: 'integer'
                    },
                    squareFootage: {
                      type: 'number'
                    },
                    propertyType: {
                      type: 'string',
                      enum: ['APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'LAND', 'OTHER']
                    },
                    status: {
                      type: 'string',
                      enum: ['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED', 'PENDING']
                    },
                    imageUrls: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    },
                    features: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Property updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Property'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Not authorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Properties'],
          summary: 'Delete a property',
          description: 'Delete an existing property',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Property ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          responses: {
            '204': {
              description: 'Property deleted successfully'
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Not authorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/agents': {
        get: {
          tags: ['Agents'],
          summary: 'Get all agents',
          description: 'Retrieve a list of all real estate agents',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Maximum number of agents to return',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number for pagination',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'name',
              in: 'query',
              description: 'Filter by agent name',
              schema: {
                type: 'string'
              }
            },
            {
              name: 'agencyName',
              in: 'query',
              description: 'Filter by agency name',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of agents',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      results: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Agent'
                        }
                      },
                      total: {
                        type: 'integer'
                      },
                      page: {
                        type: 'integer'
                      },
                      limit: {
                        type: 'integer'
                      },
                      totalPages: {
                        type: 'integer'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Agents'],
          summary: 'Create a new agent profile',
          description: 'Create a new agent profile for the authenticated user',
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: {
                      type: 'string',
                      example: 'Jane Smith'
                    },
                    bio: {
                      type: 'string',
                      example: 'Experienced real estate agent with 10+ years in the industry.'
                    },
                    phoneNumber: {
                      type: 'string',
                      example: '+1 (123) 456-7890'
                    },
                    agencyName: {
                      type: 'string',
                      example: 'ABC Realty'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Agent profile created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Agent'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '409': {
              description: 'Agent profile already exists for this user',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/agents/{id}': {
        get: {
          tags: ['Agents'],
          summary: 'Get an agent by ID',
          description: 'Retrieve a specific agent by their ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Agent ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Agent details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Agent'
                  }
                }
              }
            },
            '404': {
              description: 'Agent not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Agents'],
          summary: 'Update an agent profile',
          description: 'Update an existing agent profile',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Agent ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string'
                    },
                    bio: {
                      type: 'string'
                    },
                    phoneNumber: {
                      type: 'string'
                    },
                    agencyName: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Agent profile updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Agent'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Not authorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Agent not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Agents'],
          summary: 'Delete an agent profile',
          description: 'Delete an existing agent profile',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Agent ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          responses: {
            '204': {
              description: 'Agent profile deleted successfully'
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Not authorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Agent not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/agents/{id}/properties': {
        get: {
          tags: ['Agents'],
          summary: 'Get properties by agent',
          description: 'Retrieve all properties listed by a specific agent',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Agent ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Maximum number of properties to return',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number for pagination',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter by property status',
              schema: {
                type: 'string',
                enum: ['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED', 'PENDING']
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of properties by agent',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      results: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Property'
                        }
                      },
                      total: {
                        type: 'integer'
                      },
                      page: {
                        type: 'integer'
                      },
                      limit: {
                        type: 'integer'
                      },
                      totalPages: {
                        type: 'integer'
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Agent not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/bookings': {
        get: {
          tags: ['Bookings'],
          summary: 'Get all bookings',
          description: 'Retrieve all bookings for the authenticated user',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Maximum number of bookings to return',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number for pagination',
              schema: {
                type: 'integer',
                default: 1
              }
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter by booking status',
              schema: {
                type: 'string',
                enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of bookings',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      results: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Booking'
                        }
                      },
                      total: {
                        type: 'integer'
                      },
                      page: {
                        type: 'integer'
                      },
                      limit: {
                        type: 'integer'
                      },
                      totalPages: {
                        type: 'integer'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Bookings'],
          summary: 'Create a new booking',
          description: 'Create a new property viewing booking',
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['propertyId', 'startDate', 'endDate'],
                  properties: {
                    propertyId: {
                      type: 'string',
                      format: 'uuid',
                      example: '123e4567-e89b-12d3-a456-426614174000'
                    },
                    startDate: {
                      type: 'string',
                      format: 'date',
                      example: '2025-05-01'
                    },
                    endDate: {
                      type: 'string',
                      format: 'date',
                      example: '2025-05-01'
                    },
                    notes: {
                      type: 'string',
                      example: 'I would like to see the property in the afternoon.'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Booking created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Booking'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '409': {
              description: 'Booking date conflict',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/bookings/{id}': {
        get: {
          tags: ['Bookings'],
          summary: 'Get a booking by ID',
          description: 'Retrieve a specific booking by its ID',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Booking ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Booking details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Booking'
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Not authorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Booking not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Bookings'],
          summary: 'Update a booking',
          description: 'Update an existing booking',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Booking ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    startDate: {
                      type: 'string',
                      format: 'date'
                    },
                    endDate: {
                      type: 'string',
                      format: 'date'
                    },
                    status: {
                      type: 'string',
                      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
                    },
                    notes: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Booking updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Booking'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Not authorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Booking not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '409': {
              description: 'Booking date conflict',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Bookings'],
          summary: 'Delete a booking',
          description: 'Delete an existing booking',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Booking ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          responses: {
            '204': {
              description: 'Booking deleted successfully'
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Not authorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Booking not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/favorites': {
        get: {
          tags: ['Favorites'],
          summary: 'Get all favorites',
          description: 'Retrieve all favorite properties for the authenticated user',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'Maximum number of favorites to return',
              schema: {
                type: 'integer',
                default: 10
              }
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number for pagination',
              schema: {
                type: 'integer',
                default: 1
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of favorite properties',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      results: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Favorite'
                        }
                      },
                      total: {
                        type: 'integer'
                      },
                      page: {
                        type: 'integer'
                      },
                      limit: {
                        type: 'integer'
                      },
                      totalPages: {
                        type: 'integer'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Favorites'],
          summary: 'Add a property to favorites',
          description: 'Add a property to the authenticated user\'s favorites',
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['propertyId'],
                  properties: {
                    propertyId: {
                      type: 'string',
                      format: 'uuid',
                      example: '123e4567-e89b-12d3-a456-426614174000'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Property added to favorites successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Favorite'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '409': {
              description: 'Property already in favorites',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/favorites/{id}': {
        delete: {
          tags: ['Favorites'],
          summary: 'Remove a property from favorites',
          description: 'Remove a property from the authenticated user\'s favorites',
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Favorite ID',
              schema: {
                type: 'string',
                format: 'uuid'
              }
            }
          ],
          responses: {
            '204': {
              description: 'Property removed from favorites successfully'
            },
            '401': {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Not authorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Favorite not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/server.ts']
};

export const specs = swaggerJSDoc(options);