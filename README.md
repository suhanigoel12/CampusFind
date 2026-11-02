#  CampusFind - Campus Lost & Found System (Backend API)

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v5.3.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/cloud/atlas)
[![Postman](https://img.shields.io/badge/Postman-Tested-orange.svg)](https://www.postman.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A robust, beginner-friendly RESTful backend API for campus communities. Students often lose belongings on campus, while people who find them have no central place to report them. **CampusFind** provides a centralized backend where students can register, report lost or found items, browse reports with search and category filters, update item details, and mark items as resolved when safely returned.

---

## 📋 Table of Contents
1. [Assignment Requirement Mapping](#-assignment-requirement-mapping)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Folder Structure](#-folder-structure)
4. [Step a: Project Setup & Git Configuration](#-step-a-project-setup--git-configuration)
5. [Step b: MongoDB Atlas Setup Guide](#-step-b-mongodb-atlas-setup-guide)
6. [Step c: Database Models](#-step-c-database-models)
7. [Step d: Express APIs & CRUD Operations](#-step-d-express-apis--crud-operations)
8. [Step e: Testing with Postman Desktop App](#-step-e-testing-with-postman-desktop-app)
9. [Running the App Locally (3rd Evaluation Demo)](#-running-the-app-locally-3rd-evaluation-demo)
10. [Submitting to GitHub](#-submitting-to-github)

---

## 🎯 Assignment Requirement Mapping

| Assignment Requirement | CampusFind Implementation | Location in Codebase |
| :--- | :--- | :--- |
| **Node.js project** | Backend Express server with environment configuration | `server.js`, `package.json` |
| **Online MongoDB cluster** | MongoDB Atlas cloud database connection | `config/db.js`, `.env.example` |
| **Database models** | Mongoose schemas for User and Lost/Found Item | `models/User.js`, `models/Item.js` |
| **Express routes & controllers** | Modular authentication & item CRUD APIs | `routes/`, `controllers/` |
| **Postman testing** | Pre-configured collection with automatic token handling | `postman/CampusFind.postman_collection.json` |
| **Public GitHub repository** | Git initialized with `.gitignore`, clear commit history | Public Git repo URL |
| **Running app on laptop** | Runs locally on port 5000 with health checks & live demo | `npm run dev` or `npm start` |

---

## 🛠 Tech Stack & Architecture

- **Runtime Environment:** [Node.js](https://nodejs.org/) (ES6+ / CommonJS)
- **Web Framework:** [Express.js](https://expressjs.com/) (Routing, Middleware, Controllers)
- **Database & ODM:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose](https://mongoosejs.com/)
- **Security & Authentication:** [bcryptjs](https://www.npmjs.com/package/bcryptjs) (Password hashing) & [jsonwebtoken](https://jwt.io/) (JWT)
- **CORS & Environment:** `cors`, `dotenv`
- **Testing:** Native Node Assertions test runner (`npm test`) & Postman Desktop Collection

```
                    ┌─────────────────────────┐
                    │      Client / Postman   │
                    └───────────┬─────────────┘
                                │ HTTP / JSON
                                ▼
                    ┌─────────────────────────┐
                    │   Express Server (5000) │
                    ├─────────────────────────┤
                    │ Middlewares (CORS, JWT) │
                    ├───────────┬─────────────┤
                    │   Auth    │    Items    │
                    │  Routes   │   Routes    │
                    ├───────────┴─────────────┤
                    │ Controllers & Business  │
                    ├─────────────────────────┤
                    │   Mongoose Data Models  │
                    └───────────┬─────────────┘
                                │ Mongoose ODM
                                ▼
                    ┌─────────────────────────┐
                    │   MongoDB Atlas Cluster │
                    └─────────────────────────┘
```

---

## 📁 Folder Structure

```text
CampusFind/
├── config/
│   └── db.js                        # MongoDB Atlas connection handler
├── controllers/
│   ├── authController.js           # Student registration, login, profile logic
│   └── itemController.js           # CRUD & resolution logic for lost & found items
├── middleware/
│   ├── auth.js                     # JWT verification & route protection middleware
│   └── errorMiddleware.js          # Custom 404 & global error response handler
├── models/
│   ├── Item.js                     # Item Mongoose schema (lost/found attributes)
│   └── User.js                     # User Mongoose schema (bcrypt password hashing)
├── postman/
│   ├── CampusFind.postman_collection.json   # Ready-to-import Postman test collection
│   └── CampusFind.postman_environment.json  # Postman environment variables
├── routes/
│   ├── authRoutes.js               # Authentication endpoint routes
│   └── itemRoutes.js               # Item CRUD endpoint routes
├── scripts/
│   └── test-server-probe.js        # Health check probe script
├── tests/
│   └── test-runner.js              # Unit and schema validation test suite
├── .env.example                    # Template for environment variables
├── .gitignore                      # Git ignore file for secrets and dependencies
├── package.json                    # Project dependencies and npm scripts
├── README.md                       # Complete documentation & tutorial guide
└── server.js                       # Express app entry point
```

---

## 🚀 Step a: Project Setup & Git Configuration

### 1. Initialize Project & Install Dependencies
The project was initialized with `npm init -y` and the required packages were installed:

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

### 2. Available Scripts in `package.json`
- `npm run dev`: Runs server with `nodemon` (auto-reloads on file changes).
- `npm start`: Runs the server with `node server.js` in production mode.
- `npm test`: Runs the automated unit and schema validation test suite.

---

## ☁️ Step b: MongoDB Atlas Setup Guide

To connect the application to an online MongoDB database, follow these steps:

1. **Sign Up / Log In to MongoDB Atlas:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Sign up for a free account or log in with Google/GitHub.

2. **Create a Free Cluster:**
   - Click **Create a Deployment / Database**.
   - Choose the **M0 Free Tier** (Shared cluster, 512MB free forever).
   - Select your preferred cloud provider (e.g., AWS) and region nearest to you.
   - Click **Create**.

3. **Set Up Database Access (User Credentials):**
   - In the left sidebar, navigate to **Security** -> **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Enter a username (e.g., `campus_admin`) and a secure password.
   - Built-in Role: **Read and write to any database**.
   - Click **Add User**. *(Remember your password!)*

4. **Set Up Network Access (IP Whitelist):**
   - In the left sidebar, navigate to **Security** -> **Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) so you can access it from your laptop or campus network.
   - Click **Confirm**.

5. **Obtain the Connection String:**
   - In the left sidebar, go to **Database** (or Clusters).
   - Click the **Connect** button on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xyzab.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Configure Your `.env` File:**
   - In the project root, create a file named `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `MONGO_URI` with your connection string (replace `<username>` and `<password>`, and append `/campusfind` as the database name):
     ```env
     PORT=5000
     MONGO_URI=mongodb+srv://campus_admin:MySecurePass123@cluster0.xyzab.mongodb.net/campusfind?retryWrites=true&w=majority
     JWT_SECRET=supersecretcampusfindjwtkey_2024
     JWT_EXPIRE=7d
     ```

---

## 📦 Step c: Database Models

### 1. User Model (`models/User.js`)
Stores registered campus students and staff:
- `name` (String, required): Full name of the user.
- `email` (String, required, unique): Validated campus email address.
- `password` (String, required): Hashed securely using `bcryptjs` before saving.
- `phone` (String, optional): Contact number for item inquiries.
- `studentId` (String, optional): Campus ID / Roll number.
- `department` (String, optional): Department (e.g., Computer Science).
- `role` (String, enum: `['student', 'staff', 'admin']`): User permissions.
- **Methods:** `matchPassword(enteredPassword)` compares plain text against the bcrypt hash.

### 2. Item Model (`models/Item.js`)
Represents lost or found belongings:
- `title` (String, required): Short descriptive title (e.g., "HP Pavilion 15 Laptop").
- `description` (String, required): Detailed item description, identifying marks.
- `category` (String, required, enum):
  - `Electronics`, `Books & Stationery`, `Clothing & Accessories`, `Cards & IDs`, `Keys`, `Bags & Wallets`, `Personal Belongings`, `Other`.
- `type` (String, required, enum): `'lost'` or `'found'`.
- `location` (String, required): Campus location (e.g., "Main Library 2nd Floor").
- `date` (Date, default `Date.now`): When the item was lost or found.
- `itemStatus` (String, enum, default `'open'`):
  - `'open'` (actively lost or unclaimed)
  - `'claimed'` (claimed by someone, awaiting verification)
  - `'resolved'` (successfully returned to rightful owner)
- `contactInfo` (String, required): How to reach the reporter.
- `imageUrl` (String, optional): Photo URL.
- `reportedBy` (ObjectId, ref: `User`, required): The student who reported the item.
- `resolvedBy` (ObjectId, ref: `User`, optional): User who verified/returned the item.
- `resolvedAt` (Date, optional): Timestamp when the report was marked resolved.
- `resolutionNotes` (String, optional): Notes on how the item was returned.

---

## ⚡ Step d: Express APIs & CRUD Operations

### 🔑 Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new student | `name`, `email`, `password`, `phone`, `studentId`, `department` |
| `POST` | `/api/auth/login` | Public | Authenticate student & receive JWT | `email`, `password` |
| `GET` | `/api/auth/profile` | Private | View current user's profile | Requires `Bearer <token>` header |
| `PUT` | `/api/auth/profile` | Private | Update user's profile info | `phone`, `department`, `name`, `password` |

### 🔍 Lost & Found Item CRUD Routes (`/api/items`)

| Method | Endpoint | Access | Description | Query / Body Parameters |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/items` | Public | Browse all items | `?type=lost`, `?category=Electronics`, `?status=open`, `?search=laptop`, `?page=1` |
| `GET` | `/api/items/stats` | Public | View campus lost & found statistics | Returns total items, lost count, found count, resolved count |
| `GET` | `/api/items/my-items` | Private | View items reported by logged-in student | Requires `Bearer <token>` header |
| `GET` | `/api/items/:id` | Public | Get details of a specific item report | ID in URL parameter |
| **`POST`** | `/api/items` | Private | **Create** a new lost/found report | `title`, `description`, `category`, `type`, `location`, `contactInfo` |
| **`PUT`** | `/api/items/:id` | Private | **Update** an item report (Reporter/Admin) | `title`, `description`, `location`, `category`, etc. |
| **`PATCH`**| `/api/items/:id/resolve`| Private | **Resolve** / mark returned | `status: "resolved"`, `resolutionNotes: "..."` |
| **`DELETE`**| `/api/items/:id` | Private | **Delete** an item report (Reporter/Admin) | ID in URL parameter |

---

## 📬 Step e: Testing with Postman Desktop App

A complete, pre-configured Postman Collection is included in the [`postman/`](./postman/) directory. It contains automatic test scripts that capture the JWT token and the created item's MongoDB ID so you do not have to copy and paste IDs manually!

### 1. Import Collection into Postman Desktop
1. Open the **Postman Desktop App**.
2. Click **Import** (top left).
3. Drag and drop `postman/CampusFind.postman_collection.json`.
4. (Optional) Drag and drop `postman/CampusFind.postman_environment.json`.

### 2. Suggested Step-by-Step Test Sequence
Follow this sequence to test all features:

1. **Check Server Health:**
   - Execute `1. Health & Server Info -> Server Health Check` (`GET http://localhost:5000/api/health`).
   - Expected status: `200 OK`.

2. **Register a Student:**
   - Execute `2. Authentication -> Register Student (Jane Doe)`.
   - The test script automatically saves the `authToken` collection variable.

3. **Login Student:**
   - Execute `2. Authentication -> Login Student (Jane Doe)`.
   - Confirms login and returns JWT.

4. **View Profile:**
   - Execute `2. Authentication -> Get User Profile (Protected)`.
   - Uses the saved `authToken` to fetch user details.

5. **Report a Lost Item (CREATE):**
   - Execute `3. Item CRUD Operations -> Report Lost Item (HP Pavilion Laptop)`.
   - The test script automatically saves the generated `itemId` variable.

6. **Report a Found Item (CREATE):**
   - Execute `3. Item CRUD Operations -> Report Found Item (Campus ID Card)`.

7. **Browse All Items (READ):**
   - Execute `3. Item CRUD Operations -> Get All Items (Public)`.
   - Returns all active reports.

8. **Filter and Search (READ):**
   - Execute `Filter Items by Type (Lost items only)`.
   - Execute `Filter Items by Category (Electronics)`.
   - Execute `Search Items by Keyword ('laptop')`.

9. **Get Single Item (READ):**
   - Execute `Get Single Item by ID (Public)` (`GET /api/items/{{itemId}}`).

10. **Update Item Details (UPDATE):**
    - Execute `Update Item Details (Protected - Reporter)` (`PUT /api/items/{{itemId}}`).
    - Updates title and location.

11. **Mark Item Resolved (UPDATE/RESOLVE):**
    - Execute `Mark Item as Resolved / Returned (Protected)` (`PATCH /api/items/{{itemId}}/resolve`).
    - Marks status as `resolved` and stores resolution notes.

12. **Delete Item Report (DELETE):**
    - Execute `Delete Item Report (Protected - Reporter)` (`DELETE /api/items/{{itemId}}`).
    - Removes the report from the database.

---

## 💻 Running the App Locally (3rd Evaluation Demo)

Follow these simple steps on your laptop to run and demonstrate the app:

### 1. Clone & Install
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd CampusFind
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Mac/Linux:
cp .env.example .env
```
Open `.env` and verify your `MONGO_URI` and `JWT_SECRET`.

### 3. Run Automated Tests
Before starting the server, run the built-in validation test suite to confirm everything is configured properly:
```bash
npm test
```
*Output: `8/8 Passed - All backend components and schema validations verified successfully!`*

### 4. Start the Server
```bash
# Development mode (with live reload):
npm run dev

# Or standard mode:
npm start
```
You will see:
```text
=============================================================
 🚀 CampusFind Server running on port 5000
 🌐 Health Check: http://localhost:5000/api/health
 📖 API Info:     http://localhost:5000/
=============================================================
✔ MongoDB Connected Successfully: cluster0-shard-00-00.xyzab.mongodb.net
```

### 5. Demonstrate in Evaluation
1. Open your browser to `http://localhost:5000/api/health` to show the server running and database connected.
2. Open **Postman Desktop**, select the **CampusFind API** collection, and click **Run Collection** or execute the requests sequentially.

---

## 🐙 Submitting to GitHub

To push this project to your public GitHub repository:

1. **Create a new public repository on GitHub:**
   - Go to [github.com/new](https://github.com/new).
   - Name your repository (e.g., `CampusFind` or `campusfind-backend`).
   - Set visibility to **Public**.
   - Do **NOT** initialize with README or .gitignore (we already have them).
   - Click **Create repository**.

2. **Stage and Commit all project files:**
   ```bash
   git add .
   git commit -m "feat: complete CampusFind backend with Auth, MongoDB models, CRUD APIs, and Postman suite"
   ```

3. **Link your local repository to GitHub and push:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/CampusFind.git
   git push -u origin main
   ```

4. **Submit your URL:**
   - Submit your repository link: `https://github.com/<YOUR_GITHUB_USERNAME>/CampusFind`
