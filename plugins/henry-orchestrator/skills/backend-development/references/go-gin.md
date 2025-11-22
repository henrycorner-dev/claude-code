# Go/Gin Reference

## Project Structure

```
project/
├── main.go
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handlers/
│   │   ├── user_handler.go
│   │   └── product_handler.go
│   ├── services/
│   │   ├── user_service.go
│   │   └── product_service.go
│   ├── models/
│   │   ├── user.go
│   │   └── product.go
│   ├── middleware/
│   │   ├── auth.go
│   │   └── logger.go
│   ├── repository/
│   │   ├── user_repository.go
│   │   └── product_repository.go
│   └── config/
│       └── config.go
├── pkg/
│   ├── database/
│   │   └── postgres.go
│   └── jwt/
│       └── jwt.go
└── go.mod
```

## Main Application Setup

```go
// cmd/server/main.go
package main

import (
    "log"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "myapp/internal/config"
    "myapp/internal/handlers"
    "myapp/internal/middleware"
    "myapp/pkg/database"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    // Initialize configuration
    cfg := config.New()

    // Connect to database
    db, err := database.NewPostgresDB(cfg.DatabaseURL)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()

    // Run migrations
    if err := database.RunMigrations(db); err != nil {
        log.Fatal("Failed to run migrations:", err)
    }

    // Initialize router
    router := setupRouter(cfg, db)

    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Server starting on port %s", port)
    if err := router.Run(":" + port); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}

func setupRouter(cfg *config.Config, db *sql.DB) *gin.Engine {
    // Set gin mode
    if cfg.Environment == "production" {
        gin.SetMode(gin.ReleaseMode)
    }

    router := gin.New()

    // Global middleware
    router.Use(gin.Recovery())
    router.Use(middleware.Logger())
    router.Use(middleware.CORS())
    router.Use(middleware.RequestID())

    // Health check
    router.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    // API routes
    api := router.Group("/api")
    {
        // Auth routes
        auth := api.Group("/auth")
        {
            authHandler := handlers.NewAuthHandler(cfg, db)
            auth.POST("/register", authHandler.Register)
            auth.POST("/login", authHandler.Login)
        }

        // User routes
        users := api.Group("/users")
        users.Use(middleware.AuthRequired(cfg.JWTSecret))
        {
            userHandler := handlers.NewUserHandler(db)
            users.GET("", userHandler.GetUsers)
            users.GET("/:id", userHandler.GetUser)
            users.PUT("/:id", middleware.AuthorizeOwnerOrAdmin(), userHandler.UpdateUser)
            users.DELETE("/:id", middleware.AuthorizeAdmin(), userHandler.DeleteUser)
        }

        // Product routes
        products := api.Group("/products")
        {
            productHandler := handlers.NewProductHandler(db)
            products.GET("", productHandler.GetProducts)
            products.GET("/:id", productHandler.GetProduct)

            // Protected routes
            products.Use(middleware.AuthRequired(cfg.JWTSecret))
            products.POST("", productHandler.CreateProduct)
            products.PUT("/:id", productHandler.UpdateProduct)
            products.DELETE("/:id", middleware.AuthorizeAdmin(), productHandler.DeleteProduct)
        }
    }

    return router
}
```

## Configuration

```go
// internal/config/config.go
package config

import "os"

type Config struct {
    Environment  string
    DatabaseURL  string
    JWTSecret    string
    Port         string
}

func New() *Config {
    return &Config{
        Environment: getEnv("ENVIRONMENT", "development"),
        DatabaseURL: getEnv("DATABASE_URL", ""),
        JWTSecret:   getEnv("JWT_SECRET", ""),
        Port:        getEnv("PORT", "8080"),
    }
}

func getEnv(key, defaultValue string) string {
    value := os.Getenv(key)
    if value == "" {
        return defaultValue
    }
    return value
}
```

## Models

```go
// internal/models/user.go
package models

import (
    "time"
)

type User struct {
    ID        int64     `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name"`
    Password  string    `json:"-"` // Never expose password in JSON
    Role      string    `json:"role"`
    IsActive  bool      `json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type UserCreate struct {
    Email    string `json:"email" binding:"required,email"`
    Name     string `json:"name" binding:"required,min=2,max=50"`
    Password string `json:"password" binding:"required,min=8"`
}

type UserUpdate struct {
    Name  *string `json:"name" binding:"omitempty,min=2,max=50"`
    Email *string `json:"email" binding:"omitempty,email"`
}

type UserResponse struct {
    ID        int64     `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name"`
    Role      string    `json:"role"`
    IsActive  bool      `json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
}

type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
    Token string       `json:"token"`
    User  UserResponse `json:"user"`
}
```

```go
// internal/models/product.go
package models

import "time"

type Product struct {
    ID          int64     `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Price       float64   `json:"price"`
    Stock       int       `json:"stock"`
    IsActive    bool      `json:"is_active"`
    CreatedBy   int64     `json:"created_by"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

type ProductCreate struct {
    Name        string  `json:"name" binding:"required,min=2,max=255"`
    Description string  `json:"description" binding:"required"`
    Price       float64 `json:"price" binding:"required,gt=0"`
    Stock       int     `json:"stock" binding:"required,gte=0"`
}

type ProductUpdate struct {
    Name        *string  `json:"name" binding:"omitempty,min=2,max=255"`
    Description *string  `json:"description"`
    Price       *float64 `json:"price" binding:"omitempty,gt=0"`
    Stock       *int     `json:"stock" binding:"omitempty,gte=0"`
    IsActive    *bool    `json:"is_active"`
}
```

## Error Handling

```go
// internal/errors/errors.go
package errors

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

type AppError struct {
    Code    int    `json:"-"`
    Message string `json:"message"`
    Details any    `json:"details,omitempty"`
}

func (e *AppError) Error() string {
    return e.Message
}

func NewBadRequestError(message string, details any) *AppError {
    return &AppError{
        Code:    http.StatusBadRequest,
        Message: message,
        Details: details,
    }
}

func NewNotFoundError(message string) *AppError {
    return &AppError{
        Code:    http.StatusNotFound,
        Message: message,
    }
}

func NewUnauthorizedError(message string) *AppError {
    return &AppError{
        Code:    http.StatusUnauthorized,
        Message: message,
    }
}

func NewForbiddenError(message string) *AppError {
    return &AppError{
        Code:    http.StatusForbidden,
        Message: message,
    }
}

func NewInternalServerError(message string) *AppError {
    return &AppError{
        Code:    http.StatusInternalServerError,
        Message: message,
    }
}

// HandleError sends error response
func HandleError(c *gin.Context, err error) {
    if appErr, ok := err.(*AppError); ok {
        c.JSON(appErr.Code, gin.H{
            "status":  "error",
            "message": appErr.Message,
            "details": appErr.Details,
        })
        return
    }

    c.JSON(http.StatusInternalServerError, gin.H{
        "status":  "error",
        "message": "Internal server error",
    })
}

// Success sends success response
func Success(c *gin.Context, data any) {
    c.JSON(http.StatusOK, gin.H{
        "status": "success",
        "data":   data,
    })
}

// Created sends created response
func Created(c *gin.Context, data any) {
    c.JSON(http.StatusCreated, gin.H{
        "status": "success",
        "data":   data,
    })
}
```

## Handlers

```go
// internal/handlers/user_handler.go
package handlers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "myapp/internal/errors"
    "myapp/internal/models"
    "myapp/internal/services"
)

type UserHandler struct {
    userService *services.UserService
}

func NewUserHandler(db *sql.DB) *UserHandler {
    return &UserHandler{
        userService: services.NewUserService(db),
    }
}

func (h *UserHandler) GetUsers(c *gin.Context) {
    // Parse query parameters
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
    search := c.Query("search")

    users, total, err := h.userService.GetUsers(page, limit, search)
    if err != nil {
        errors.HandleError(c, err)
        return
    }

    errors.Success(c, gin.H{
        "users": users,
        "pagination": gin.H{
            "page":  page,
            "limit": limit,
            "total": total,
        },
    })
}

func (h *UserHandler) GetUser(c *gin.Context) {
    id, err := strconv.ParseInt(c.Param("id"), 10, 64)
    if err != nil {
        errors.HandleError(c, errors.NewBadRequestError("Invalid user ID", nil))
        return
    }

    user, err := h.userService.GetUserByID(id)
    if err != nil {
        errors.HandleError(c, err)
        return
    }

    errors.Success(c, user)
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
    id, err := strconv.ParseInt(c.Param("id"), 10, 64)
    if err != nil {
        errors.HandleError(c, errors.NewBadRequestError("Invalid user ID", nil))
        return
    }

    var input models.UserUpdate
    if err := c.ShouldBindJSON(&input); err != nil {
        errors.HandleError(c, errors.NewBadRequestError("Invalid input", err.Error()))
        return
    }

    user, err := h.userService.UpdateUser(id, &input)
    if err != nil {
        errors.HandleError(c, err)
        return
    }

    errors.Success(c, user)
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
    id, err := strconv.ParseInt(c.Param("id"), 10, 64)
    if err != nil {
        errors.HandleError(c, errors.NewBadRequestError("Invalid user ID", nil))
        return
    }

    if err := h.userService.DeleteUser(id); err != nil {
        errors.HandleError(c, err)
        return
    }

    c.Status(http.StatusNoContent)
}
```

## Services

```go
// internal/services/user_service.go
package services

import (
    "database/sql"

    "golang.org/x/crypto/bcrypt"
    "myapp/internal/errors"
    "myapp/internal/models"
    "myapp/internal/repository"
)

type UserService struct {
    userRepo *repository.UserRepository
}

func NewUserService(db *sql.DB) *UserService {
    return &UserService{
        userRepo: repository.NewUserRepository(db),
    }
}

func (s *UserService) GetUsers(page, limit int, search string) ([]models.UserResponse, int, error) {
    offset := (page - 1) * limit

    users, err := s.userRepo.FindAll(limit, offset, search)
    if err != nil {
        return nil, 0, errors.NewInternalServerError("Failed to fetch users")
    }

    total, err := s.userRepo.Count(search)
    if err != nil {
        return nil, 0, errors.NewInternalServerError("Failed to count users")
    }

    responses := make([]models.UserResponse, len(users))
    for i, user := range users {
        responses[i] = s.toUserResponse(&user)
    }

    return responses, total, nil
}

func (s *UserService) GetUserByID(id int64) (*models.UserResponse, error) {
    user, err := s.userRepo.FindByID(id)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, errors.NewNotFoundError("User not found")
        }
        return nil, errors.NewInternalServerError("Failed to fetch user")
    }

    response := s.toUserResponse(user)
    return &response, nil
}

func (s *UserService) CreateUser(input *models.UserCreate) (*models.UserResponse, error) {
    // Check if email exists
    existing, _ := s.userRepo.FindByEmail(input.Email)
    if existing != nil {
        return nil, errors.NewBadRequestError("Email already in use", nil)
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        return nil, errors.NewInternalServerError("Failed to hash password")
    }

    user := &models.User{
        Email:    input.Email,
        Name:     input.Name,
        Password: string(hashedPassword),
        Role:     "user",
        IsActive: true,
    }

    if err := s.userRepo.Create(user); err != nil {
        return nil, errors.NewInternalServerError("Failed to create user")
    }

    response := s.toUserResponse(user)
    return &response, nil
}

func (s *UserService) UpdateUser(id int64, input *models.UserUpdate) (*models.UserResponse, error) {
    user, err := s.userRepo.FindByID(id)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, errors.NewNotFoundError("User not found")
        }
        return nil, errors.NewInternalServerError("Failed to fetch user")
    }

    // Update fields if provided
    if input.Name != nil {
        user.Name = *input.Name
    }
    if input.Email != nil {
        user.Email = *input.Email
    }

    if err := s.userRepo.Update(user); err != nil {
        return nil, errors.NewInternalServerError("Failed to update user")
    }

    response := s.toUserResponse(user)
    return &response, nil
}

func (s *UserService) DeleteUser(id int64) error {
    if err := s.userRepo.Delete(id); err != nil {
        if err == sql.ErrNoRows {
            return errors.NewNotFoundError("User not found")
        }
        return errors.NewInternalServerError("Failed to delete user")
    }
    return nil
}

func (s *UserService) toUserResponse(user *models.User) models.UserResponse {
    return models.UserResponse{
        ID:        user.ID,
        Email:     user.Email,
        Name:      user.Name,
        Role:      user.Role,
        IsActive:  user.IsActive,
        CreatedAt: user.CreatedAt,
    }
}
```

## Repository

```go
// internal/repository/user_repository.go
package repository

import (
    "database/sql"
    "time"

    "myapp/internal/models"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) FindAll(limit, offset int, search string) ([]models.User, error) {
    query := `
        SELECT id, email, name, password, role, is_active, created_at, updated_at
        FROM users
        WHERE ($1 = '' OR name ILIKE $1 OR email ILIKE $1)
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
    `

    searchPattern := "%" + search + "%"
    rows, err := r.db.Query(query, searchPattern, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []models.User
    for rows.Next() {
        var user models.User
        err := rows.Scan(
            &user.ID,
            &user.Email,
            &user.Name,
            &user.Password,
            &user.Role,
            &user.IsActive,
            &user.CreatedAt,
            &user.UpdatedAt,
        )
        if err != nil {
            return nil, err
        }
        users = append(users, user)
    }

    return users, nil
}

func (r *UserRepository) Count(search string) (int, error) {
    query := `
        SELECT COUNT(*)
        FROM users
        WHERE ($1 = '' OR name ILIKE $1 OR email ILIKE $1)
    `

    searchPattern := "%" + search + "%"
    var count int
    err := r.db.QueryRow(query, searchPattern).Scan(&count)
    return count, err
}

func (r *UserRepository) FindByID(id int64) (*models.User, error) {
    query := `
        SELECT id, email, name, password, role, is_active, created_at, updated_at
        FROM users
        WHERE id = $1
    `

    var user models.User
    err := r.db.QueryRow(query, id).Scan(
        &user.ID,
        &user.Email,
        &user.Name,
        &user.Password,
        &user.Role,
        &user.IsActive,
        &user.CreatedAt,
        &user.UpdatedAt,
    )

    if err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
    query := `
        SELECT id, email, name, password, role, is_active, created_at, updated_at
        FROM users
        WHERE email = $1
    `

    var user models.User
    err := r.db.QueryRow(query, email).Scan(
        &user.ID,
        &user.Email,
        &user.Name,
        &user.Password,
        &user.Role,
        &user.IsActive,
        &user.CreatedAt,
        &user.UpdatedAt,
    )

    if err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *UserRepository) Create(user *models.User) error {
    query := `
        INSERT INTO users (email, name, password, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `

    now := time.Now()
    user.CreatedAt = now
    user.UpdatedAt = now

    return r.db.QueryRow(
        query,
        user.Email,
        user.Name,
        user.Password,
        user.Role,
        user.IsActive,
        user.CreatedAt,
        user.UpdatedAt,
    ).Scan(&user.ID)
}

func (r *UserRepository) Update(user *models.User) error {
    query := `
        UPDATE users
        SET email = $1, name = $2, updated_at = $3
        WHERE id = $4
    `

    user.UpdatedAt = time.Now()

    result, err := r.db.Exec(query, user.Email, user.Name, user.UpdatedAt, user.ID)
    if err != nil {
        return err
    }

    rows, err := result.RowsAffected()
    if err != nil {
        return err
    }
    if rows == 0 {
        return sql.ErrNoRows
    }

    return nil
}

func (r *UserRepository) Delete(id int64) error {
    query := `DELETE FROM users WHERE id = $1`

    result, err := r.db.Exec(query, id)
    if err != nil {
        return err
    }

    rows, err := result.RowsAffected()
    if err != nil {
        return err
    }
    if rows == 0 {
        return sql.ErrNoRows
    }

    return nil
}
```

## Middleware

```go
// internal/middleware/auth.go
package middleware

import (
    "strings"

    "github.com/gin-gonic/gin"
    "myapp/internal/errors"
    "myapp/pkg/jwt"
)

func AuthRequired(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            errors.HandleError(c, errors.NewUnauthorizedError("No authorization header"))
            c.Abort()
            return
        }

        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            errors.HandleError(c, errors.NewUnauthorizedError("Invalid authorization header"))
            c.Abort()
            return
        }

        token := parts[1]
        claims, err := jwt.ValidateToken(token, secret)
        if err != nil {
            errors.HandleError(c, errors.NewUnauthorizedError("Invalid token"))
            c.Abort()
            return
        }

        c.Set("user_id", claims.UserID)
        c.Set("user_role", claims.Role)
        c.Next()
    }
}

func AuthorizeAdmin() gin.HandlerFunc {
    return func(c *gin.Context) {
        role, exists := c.Get("user_role")
        if !exists || role != "admin" {
            errors.HandleError(c, errors.NewForbiddenError("Admin access required"))
            c.Abort()
            return
        }
        c.Next()
    }
}

func AuthorizeOwnerOrAdmin() gin.HandlerFunc {
    return func(c *gin.Context) {
        userID, _ := c.Get("user_id")
        userRole, _ := c.Get("user_role")
        resourceID := c.Param("id")

        if userRole == "admin" {
            c.Next()
            return
        }

        if userID.(int64) != parseID(resourceID) {
            errors.HandleError(c, errors.NewForbiddenError("Access denied"))
            c.Abort()
            return
        }

        c.Next()
    }
}
```

```go
// internal/middleware/logger.go
package middleware

import (
    "log"
    "time"

    "github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        method := c.Request.Method

        c.Next()

        latency := time.Since(start)
        statusCode := c.Writer.Status()

        log.Printf("[%s] %s %s - %d - %v",
            method,
            path,
            c.ClientIP(),
            statusCode,
            latency,
        )
    }
}

func RequestID() gin.HandlerFunc {
    return func(c *gin.Context) {
        requestID := c.GetHeader("X-Request-ID")
        if requestID == "" {
            requestID = generateRequestID()
        }

        c.Set("request_id", requestID)
        c.Header("X-Request-ID", requestID)
        c.Next()
    }
}

func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}
```

## JWT Package

```go
// pkg/jwt/jwt.go
package jwt

import (
    "time"

    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
    UserID int64  `json:"user_id"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.RegisteredClaims
}

func GenerateToken(userID int64, email, role, secret string) (string, error) {
    claims := Claims{
        UserID: userID,
        Email:  email,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}

func ValidateToken(tokenString, secret string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return []byte(secret), nil
    })

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }

    return nil, jwt.ErrSignatureInvalid
}
```

## Database

```go
// pkg/database/postgres.go
package database

import (
    "database/sql"
    "fmt"

    _ "github.com/lib/pq"
)

func NewPostgresDB(connString string) (*sql.DB, error) {
    db, err := sql.Open("postgres", connString)
    if err != nil {
        return nil, fmt.Errorf("failed to open database: %w", err)
    }

    if err := db.Ping(); err != nil {
        return nil, fmt.Errorf("failed to ping database: %w", err)
    }

    // Set connection pool settings
    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(5 * time.Minute)

    return db, nil
}

func RunMigrations(db *sql.DB) error {
    migrations := []string{
        `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
        `CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`,
    }

    for _, migration := range migrations {
        if _, err := db.Exec(migration); err != nil {
            return fmt.Errorf("migration failed: %w", err)
        }
    }

    return nil
}
```

## Testing

```go
// internal/handlers/user_handler_test.go
package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestGetUser(t *testing.T) {
    gin.SetMode(gin.TestMode)

    router := gin.New()
    handler := NewUserHandler(mockDB)
    router.GET("/users/:id", handler.GetUser)

    req, _ := http.NewRequest("GET", "/users/1", nil)
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)

    var response map[string]interface{}
    err := json.Unmarshal(w.Body.Bytes(), &response)
    assert.NoError(t, err)
    assert.Equal(t, "success", response["status"])
}

func TestCreateUser(t *testing.T) {
    gin.SetMode(gin.TestMode)

    router := gin.New()
    handler := NewAuthHandler(mockConfig, mockDB)
    router.POST("/auth/register", handler.Register)

    userData := map[string]string{
        "email":    "test@example.com",
        "name":     "Test User",
        "password": "password123",
    }
    jsonData, _ := json.Marshal(userData)

    req, _ := http.NewRequest("POST", "/auth/register", bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    assert.Equal(t, http.StatusCreated, w.Code)
}
```

## Best Practices Summary

1. **Use clear structure**: Handlers, services, repositories
2. **Handle errors explicitly**: Return and check errors
3. **Use interfaces** for testability
4. **Implement proper logging**
5. **Use context for request-scoped values**
6. **Validate input** with struct tags
7. **Use prepared statements** for database queries
8. **Implement graceful shutdown**
9. **Use dependency injection**
10. **Write unit and integration tests**
