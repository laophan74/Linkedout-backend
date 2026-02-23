# Linkedout Backend API

Professional social media platform backend built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication**: JWT-based authentication with bcryptjs password hashing
- **User Management**: User profiles, connections, and relationship management
- **Posts**: Create, read, update, delete posts with likes
- **Comments**: Comment on posts with edit and delete functionality
- **Messaging**: Chat system with message management
- **Activities**: Real-time activity tracking and notifications
- **Input Validation**: Comprehensive validation for all endpoints
- **Error Handling**: Global error handling with detailed error messages
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Pagination**: Pagination support for all list endpoints
- **Logging**: Structured logging with different log levels
- **Production Ready**: Optimized for deployment on Vercel

## 📋 Quick API Reference

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout (client-side token management)

### Users
- `GET /api/user` - Get all users (paginated)
- `GET /api/user/:id` - Get user by ID
- `GET /api/user/profile/me` - Get current user profile (protected)
- `PUT /api/user/:id` - Update user (protected)
- `DELETE /api/user/:id` - Delete user (protected)
- `GET /api/user/:id/connections` - Get user's connections
- `POST /api/user/:id/connect` - Add connection (protected)
- `DELETE /api/user/:id/disconnect` - Remove connection (protected)

### Posts
- `GET /api/post` - Get all posts (paginated)
- `GET /api/post/:id` - Get post by ID
- `POST /api/post` - Create post (protected)
- `PUT /api/post/:id` - Update post (protected)
- `DELETE /api/post/:id` - Delete post (protected)
- `PUT /api/post/:id/like` - Like/unlike post (protected)

### Comments
- `GET /api/comment` - Get all comments (paginated)
- `GET /api/comment/post/:postId` - Get comments on a post (paginated)
- `POST /api/comment` - Create comment (protected)
- `PUT /api/comment/:id` - Edit comment (protected)
- `PUT /api/comment/:id/like` - Like/unlike comment (protected)
- `DELETE /api/comment/:id` - Delete comment (protected)

### Chat & Messages
- `GET /api/chat` - Get all chats (protected)
- `GET /api/chat/:id` - Get chat (protected)
- `GET /api/chat/:id/messages` - Get messages (paginated, protected)
- `POST /api/chat` - Create or get chat (protected)
- `POST /api/chat/:id/message` - Send message (protected)
- `PUT /api/chat/:id/message/:msgId` - Edit message (protected)
- `DELETE /api/chat/:id/message/:msgId` - Delete message (protected)
- `DELETE /api/chat/:id` - Delete chat (protected)

### Activities
- `GET /api/activity` - Get activities (protected)
- `GET /api/activity/count` - Get unread activities count (protected)
- `POST /api/activity` - Create activity (protected)
- `PUT /api/activity/:id/read` - Mark activity as read (protected)
- `PUT /api/activity/read-all` - Mark all activities as read (protected)

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key (min 20 characters)
- `CORS_ORIGIN`: Your frontend URL
- `NODE_ENV`: development or production

3. **Start development server**
```bash
npm run dev
```

Server runs on `http://localhost:3030`

4. **Seed database (optional)**
```bash
node seed.js
```

Test credentials:
- Username: `guest`
- Password: `guest123`

## 📁 Project Structure

```
src/
├── config/          # Configuration
│   ├── database.js  # MongoDB connection
│   └── environment.js   # Environment variables
├── middleware/      # Express middleware
│   ├── auth.js      # JWT verification
│   ├── cors.js      # CORS setup
│   ├── errorHandler.js  # Error handling
│   └── requestLogger.js  # Request logging
├── models/          # Mongoose schemas
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   ├── Chat.js
│   ├── Message.js
│   └── Activity.js
├── routes/          # API routes
│   ├── auth.js
│   ├── user.js
│   ├── post.js
│   ├── comment.js
│   ├── chat.js
│   ├── activity.js
│   └── upload.js
├── utils/           # Utilities
│   ├── auth.js      # Password & JWT
│   ├── logger.js    # Logging
│   └── response.js  # Response formatters
├── validators/      # Input validators
│   ├── userValidator.js
│   ├── postValidator.js
│   ├── commentValidator.js
│   └── chatValidator.js
└── server.js        # Main entry point
```

## 🔐 Authentication

1. Sign up or login
2. Server returns JWT token
3. Store token in client (localStorage/state)
4. Include in Authorization header: `Bearer <token>`
5. Server validates on protected routes

## ✅ Input Validation

All endpoints have built-in validation:
- Email format validation
- Username: 3-20 characters, alphanumeric + underscore
- Password: minimum 6 characters
- Text content: length limits
- URL validation for websites

## 🌐 CORS Configuration

Default origins:
- **Development**: `http://localhost:3000`
- **Production**: `https://linkedout.vercel.app`

Set `CORS_ORIGIN` env variable to change.

## 🐛 Error Handling

Standard error response format:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Technical details (development only)"
}
```

## 📊 Database Schema

See models in `src/models/` for detailed schema information.

## 🚀 Deployment on Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-frontend-url`
4. Deploy!

Node.js runtime is auto-detected.

## 📝 Logging

Console logs with color:
- 🔴 Error (Red)
- 🟡 Warn (Yellow)
- 🔵 Info (Cyan)
- 🟣 Debug (Magenta)

Control via `LOG_LEVEL` env variable.

## 📚 Testing API

### Health Check
```bash
curl http://localhost:3030/api/health
```

### Sign Up
```bash
curl -X POST http://localhost:3030/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullname": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3030/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

## 🧪 Best Practices

- Use descriptive commit messages
- Validate all user inputs
- Use pagination for list endpoints
- Implement proper error handling
- Keep secrets in environment variables
- Use HTTPS in production
- Monitor API logs
- Regular database backups

## 📄 License

ISC
