# 🚀 ReleaseCheck - Modern Release Management Tool

A sleek, functional single-page application (SPA) designed to help developers manage their release process with ease. Built with **React**, **Node.js**, and **MongoDB**.

![ReleaseCheck UI](https://public-swap.s3.us-east-1.amazonaws.com/releasecheck.png)

## ✨ Features

- **Dynamic Checklist**: track 7-10 mandatory steps for every release.
- **Auto-Status Computation**: Status (`Planned`, `Ongoing`, `Done`) is automatically calculated based on step completion.
- **Smart Sorting**: Active releases are prioritized in the order: **Ongoing > Planned > Done**.
- **Soft Delete**: Safely "delete" releases while preserving history in the database.
- **Duplicate Prevention**: Case-insensitive name validation that allows reusing names of deleted releases.
- **Premium UI**: Responsive design with glassmorphism aesthetics, custom toasts, and confirmation modals.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS (Premium styling).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Icons**: Custom CSS & Emoji-based iconography.

---

## 🏗 Database Schema (MongoDB)

### Release Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Unique (among active releases), mandatory. |
| `releaseDate` | Date | Mandatory due date. |
| `status` | String | Deletion status: `active` or `deleted`. |
| `lifecycleStatus` | String | Computed: `planned`, `ongoing`, or `done`. |
| `additionalInfo` | String | Optional markdown/text notes. |
| `stepState` | Map<String, Boolean> | Stores the on/off state of each checklist step. |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/releases` | Returns all `active` releases, sorted by priority. |
| `GET` | `/api/releases/:id` | Returns details for a specific release. |
| `POST` | `/api/releases` | Creates a new release (validates unique name). |
| `PATCH` | `/api/releases/:id` | Updates release details or checklist steps. |
| `DELETE` | `/api/releases/:id` | Soft-deletes a release (sets status to `deleted`). |
| `GET` | `/api/steps` | Returns the static list of checklist steps. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd release_check
```

### 2. Setup Environment Variables
Create a `.env` file in the `server` directory:
```env
DATABASE_URL=your_mongodb_connection_string
PORT=3001
```

### 3. Install Dependencies
From the root directory:
```bash
npm run install:all
```

### 4. Initialize Database (Optional)
To seed the database with 10 sample releases:
```bash
npm run db:init
```

### 5. Run Locally
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## ☁️ Deployment (Vercel)

This project is configured for a single-repo deployment on Vercel using the **Vercel Monorepo** pattern or via a custom `vercel.json` configuration.

1. **Frontend**: The Vite app in `/client` is built and served as static files.
2. **Backend**: The Express app in `/server` is deployed as a Serverless Function.

### Environment Variables for Vercel:
- `DATABASE_URL`: Your MongoDB production string.
- `VITE_API_URL`: (Optional) URL of your deployed API.

---

## 📝 Author
Developed as part of a technical assignment. Focused on clean code, premium UI, and robust backend logic.
