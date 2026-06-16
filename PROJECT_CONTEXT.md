# LinkedOut Project Context

Last updated: 2026-06-17

## Workspace

The project lives locally at:

`C:\Users\admin\OneDrive\Máy tính\project\LinkedOut`

This repository is the Express/MongoDB backend. The frontend is a separate repository in:

`..\social-media-react`

The parent `LinkedOut` folder is only a local container and is not currently a Git repo.

## Deployment

The app is deployed on Vercel.

Important constraint: do not depend on realtime/socket features for free Vercel deployment. Messaging and notifications should work through normal REST requests, refreshes, navigation, or manual reloads. No Socket.IO server is required.

Backend required environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`

Optional backend environment variables:

- `JWT_EXPIRATION`
- `CORS_ORIGINS`
- `LOG_LEVEL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Current Backend Architecture

- Express 4
- MongoDB via Mongoose
- JWT auth middleware
- REST routes under `/api`
- Vercel serverless config in `vercel.json`

Core backend routes:

- `/api/auth`
- `/api/user`
- `/api/post`
- `/api/comment`
- `/api/chat`
- `/api/activity`
- `/api/upload`

## Recent Completion Work

- Updated `src/server.js` so local development still calls `app.listen()`, while Vercel uses the exported Express app.
- Added a `/api` middleware that connects MongoDB before API requests, which is needed for serverless execution.
- Updated `vercel.json` to route `/api/*` to `src/server.js` through `@vercel/node`.
- Fixed `/api/user/profile/me` route order so it is not swallowed by `/:id`.
- Fixed `PUT /api/post/:id`, which referenced `txt` and `imgUrl` before destructuring them.
- Added `src/utils/activity.js` with `createActivity()`.
- Backend now creates notifications automatically for:
  - post like
  - post comment
  - new connection
  - message sent
- CORS now allows configured origins and LinkedOut Vercel subdomains.

## Messaging And Notifications Policy

Do not add realtime dependencies.

Expected behavior:

- Messages are sent through `/api/chat/:id/message`.
- Message list is loaded through REST.
- Notifications are loaded through `/api/activity`.
- Unread counts are based on stored `Activity.isRead`.
- It is acceptable for notification/message state to update on page navigation or manual refresh.

## Verification

Backend syntax checks passed:

`node --check src/server.js`

Also checked route files:

- `src/routes/post.js`
- `src/routes/comment.js`
- `src/routes/chat.js`
- `src/routes/user.js`
- `src/routes/activity.js`

Serverless-style import check passed with `VERCEL=1`.

## Recommended Next Steps

- Add a backend endpoint to mark only message activities as read, instead of only read-all.
- Test deployed backend health at `/api/health` after Vercel redeploy.
