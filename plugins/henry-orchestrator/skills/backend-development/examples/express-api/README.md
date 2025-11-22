# Express REST API Example

A complete Node.js/Express REST API with authentication, validation, and error handling.

## Features

- User authentication with JWT
- Input validation with Joi
- Centralized error handling
- Service layer pattern
- Middleware for auth and logging
- MongoDB with Mongoose

## Project Structure

```
express-api/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Database models
│   ├── middleware/      # Custom middleware
│   ├── routes/          # Route definitions
│   ├── utils/           # Helper functions
│   ├── config/          # Configuration
│   └── app.js          # Express app setup
├── package.json
└── .env.example
```

## Installation

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (owner or admin)
- `DELETE /api/users/:id` - Delete user (admin only)

## Environment Variables

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Testing

```bash
npm test
```

## Key Patterns Demonstrated

1. **Controller-Service separation**: Controllers handle HTTP, services handle business logic
2. **Error handling**: Custom error classes with centralized error middleware
3. **Async wrapper**: Automatic error catching for async routes
4. **Validation**: Input validation with Joi schemas
5. **Authentication**: JWT-based authentication with role-based access
6. **Security**: Helmet, CORS, rate limiting

## Usage Example

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get users (with token)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Notes

This example demonstrates production-ready patterns for Express applications. The code emphasizes:
- Security best practices
- Clean architecture
- Testability
- Maintainability
- Error handling
- Input validation

Refer to the files in this directory for complete implementation details.
