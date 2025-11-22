# Node.js/Express Reference

## Complete Express Application Structure

```javascript
// app.js - Application entry point
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
```

```javascript
// server.js
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

## Error Handling Pattern

### Custom Error Classes

```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
};
```

### Error Handler Middleware

```javascript
// middleware/errorHandler.js
const { AppError } = require('../utils/errors');

module.exports = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Handle validation errors (e.g., from Joi)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.details
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // Unknown errors
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
```

### Async Handler Wrapper

```javascript
// utils/asyncHandler.js
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

## Controller Pattern

```javascript
// controllers/userController.js
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, NotFoundError } = require('../utils/errors');

exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const users = await userService.getUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    search
  });

  res.status(200).json({
    status: 'success',
    data: users
  });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

exports.createUser = asyncHandler(async (req, res) => {
  const userData = req.body;
  const user = await userService.createUser(userData);

  res.status(201).json({
    status: 'success',
    data: user
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await userService.updateUser(id, updates);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await userService.deleteUser(id);

  res.status(204).send();
});
```

## Service Layer Pattern

```javascript
// services/userService.js
const User = require('../models/User');
const { ValidationError } = require('../utils/errors');
const bcrypt = require('bcrypt');

class UserService {
  async getUsers({ page, limit, search }) {
    const skip = (page - 1) * limit;
    const query = search ? { name: new RegExp(search, 'i') } : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getUserById(id) {
    return User.findById(id).select('-password').lean();
  }

  async createUser(userData) {
    const { email, password, name } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });

    // Return without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async updateUser(id, updates) {
    // Don't allow password updates through this method
    const { password, ...safeUpdates } = updates;

    const user = await User.findByIdAndUpdate(
      id,
      safeUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    return user;
  }

  async deleteUser(id) {
    await User.findByIdAndDelete(id);
  }
}

module.exports = new UserService();
```

## Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};
```

## Validation Middleware

```javascript
// middleware/validate.js
const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      throw new ValidationError('Validation failed', errors);
    }

    next();
  };
};
```

### Validation Schemas

```javascript
// validators/userValidators.js
const Joi = require('joi');

exports.createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('user', 'admin').default('user')
});

exports.updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email()
}).min(1);

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
```

## Route Definition Pattern

```javascript
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../validators/userValidators');

// Public routes
router.post(
  '/register',
  validate(createUserSchema),
  userController.createUser
);

// Protected routes
router.use(authenticate);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

// Admin only routes
router.patch(
  '/:id',
  authorize('admin'),
  validate(updateUserSchema),
  userController.updateUser
);

router.delete(
  '/:id',
  authorize('admin'),
  userController.deleteUser
);

module.exports = router;
```

```javascript
// routes/index.js
const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

module.exports = router;
```

## Database Configuration

### MongoDB with Mongoose

```javascript
// config/database.js
const mongoose = require('mongoose');

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
```

### PostgreSQL with Sequelize

```javascript
// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

exports.connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    }
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
};

exports.sequelize = sequelize;
```

## Model Definition

### Mongoose Model

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
```

### Sequelize Model

```javascript
// models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = User;
```

## JWT Authentication

```javascript
// services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { UnauthorizedError, ValidationError } = require('../utils/errors');

class AuthService {
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async register(userData) {
    const { email, password, name } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  async login(email, password) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }
}

module.exports = new AuthService();
```

## Rate Limiting

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});
```

## File Upload

```javascript
// middleware/upload.js
const multer = require('multer');
const path = require('path');
const { ValidationError } = require('../utils/errors');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

## Testing with Jest and Supertest

```javascript
// tests/user.test.js
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { connectDB } = require('../config/database');
const mongoose = require('mongoose');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User API', () => {
  describe('POST /api/users/register', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password'
      });

      const token = generateToken(user._id);

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.email).toBe(user.email);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const token = generateToken(fakeId);

      await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
```

## Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/myapp
# OR
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# External APIs
STRIPE_API_KEY=sk_test_...
SENDGRID_API_KEY=SG...

# AWS (for file uploads)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...

# Redis (for caching/sessions)
REDIS_URL=redis://localhost:6379
```

## Best Practices Summary

1. **Separation of concerns**: Controllers handle HTTP, services handle business logic
2. **Error handling**: Use custom error classes and centralized error middleware
3. **Async handling**: Always wrap async controllers with error handling
4. **Validation**: Validate all input with Joi or similar libraries
5. **Authentication**: Use JWT with proper expiration and refresh tokens
6. **Authorization**: Implement role-based access control
7. **Security**: Use helmet, rate limiting, input sanitization
8. **Testing**: Write unit and integration tests
9. **Environment variables**: Never commit secrets
10. **Logging**: Use structured logging with appropriate levels
