# Linkedout Backend API

Backend API for Linkedout social media application. Built with Node.js, Express, and MongoDB.

## Features

- ✅ JWT Token Authentication
- ✅ User Management (signup, login, profile)
- ✅ Posts (create, read, update, delete, like)
- ✅ Comments (create, read, update, delete, like)
- ✅ Chats & Messages (create, read messages)
- ✅ Activities & Notifications
- ✅ MongoDB Atlas Integration
- ✅ Ready for Vercel Deployment

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file with:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
JWT_SECRET=your_secret_key
PORT=3030
NODE_ENV=development
```

## Running Locally

```bash
npm run dev
```

Server will run on `http://localhost:3030`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update user (protected)
- `DELETE /api/user/:id` - Delete user (protected)

### Posts
- `GET /api/post` - Get all posts
- `GET /api/post/:id` - Get post by ID
- `POST /api/post` - Create post (protected)
- `PUT /api/post/:id` - Update post (protected)
- `DELETE /api/post/:id` - Delete post (protected)
- `PUT /api/post/:id/like` - Like/unlike post (protected)

### Comments
- `GET /api/comment` - Get all comments
- `GET /api/comment/:id` - Get comment by ID
- `POST /api/comment` - Create comment (protected)
- `PUT /api/comment/:id` - Update comment (protected)
- `DELETE /api/comment/:id` - Delete comment (protected)
- `PUT /api/comment/:id/like` - Like/unlike comment (protected)

### Chats & Messages
- `GET /api/chat` - Get all chats for user (protected)
- `GET /api/chat/:id` - Get chat with messages (protected)
- `POST /api/chat` - Create or get chat (protected)
- `GET /api/chat/:chatId/messages` - Get messages (protected)
- `POST /api/chat/:chatId/messages` - Send message (protected)

### Activities
- `GET /api/activity` - Get activities (protected)
- `GET /api/activity/count` - Get unread count (protected)
- `POST /api/activity` - Create activity (protected)
- `PUT /api/activity/:id/read` - Mark as read (protected)

## Authentication

Protected routes require `Authorization` header:

```
Authorization: Bearer <token>
```

Token is returned on login/signup and valid for 7 days.

## Deployment

### Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Database

MongoDB Atlas is used. Collections are auto-created:
- users
- posts
- comments
- chats
- messages
- activities

## License

MIT
