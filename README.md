# Freelance Bid Portal for Students

A complete MERN application supporting two user roles: `client` and `student`.

## Features

- Client can register, post projects, review bids, accept/reject bids, create milestones, and manage their posted projects.
- Student can register, browse open projects, submit/edit/withdraw bids, view active bids, and manage their portfolio.
- JWT authentication with role-based protected routing.
- MongoDB backend with Mongoose models for users, projects, bids, and milestones.
- React frontend with React Router v6 and Tailwind CSS.

## Structure

- `server/` - Express API
- `client/` - Vite React frontend

## Setup

1. Copy `.env.example` to `server/.env` and update values.
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```
4. Seed the database:
   ```bash
   cd ../server
   npm run seed
   ```
5. Start server:
   ```bash
   npm run dev
   ```
6. Start client:
   ```bash
   cd ../client
   npm run dev
   ```

## Default seed accounts

- client: `ravi@startup.com` / `Password123`
- client: `priya@eduplatform.com` / `Password123`
- student: `mani@dev.com` / `Password123`
- student: `akhil@ai.com` / `Password123`
- student: `sneha@design.com` / `Password123`
