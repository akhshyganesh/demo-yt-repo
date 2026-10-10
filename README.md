# Daylist — MERN Todo

A full-stack todo app built with MongoDB, Express, React, and Node.js. The React client and Express API are deployed together on Vercel.

## Features

- Create, complete, and delete tasks
- Filter tasks by all, in progress, and completed
- Clear all completed tasks
- Persist tasks in MongoDB
- Responsive interface with progress tracking

## Requirements

- Node.js 18 or later
- A MongoDB database, such as a MongoDB Atlas cluster

## Run locally

1. Install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Create `backend/.env` and set your MongoDB connection string:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
   ```

3. Start the API and frontend together:

   ```bash
   npm run dev
   ```

   The API runs at `http://localhost:5000` and the Vite frontend at `http://localhost:5173`.

4. Create a production frontend build with:

   ```bash
   npm run build
   ```

## Deploy to Vercel

1. Push the repository to GitHub and import it into Vercel with the repository root as the project root.
2. Add `MONGODB_URI` to the Vercel project's environment variables for each deployment environment.
3. Deploy. The root `vercel.json` builds the React frontend and routes `/api/*` requests to the Express serverless function.

The MongoDB network access settings must allow connections from the Vercel deployment. Do not commit `.env` files or database credentials.
