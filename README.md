# 🦏 RhinoVoyage — Travel & Cab Booking Management System

A premium, full-stack travel booking application focused on cab rentals, bus tours, and itinerary management in Sivasagar, Assam, India. Built with a responsive client-side interface and a secure Express.js REST API backend, this platform supports user bookings, driver management, and an administrative CMS console.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19+-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vercel](https://img.shields.io/badge/Vercel-Hosted-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 🌟 Key Features

### 1. User Application (Client Portal)
* **Interactive Booking Engine:** A multi-step vehicle selection form that allows users to book Sedan, SUV, Luxury cabs, or Buses with real-time package options.
* **Tourism Guides & Itineraries:** Discover Sivasagar's historical locations, such as the ancient Rang Ghar and Sivadol, with curated travel details.
* **Role-Based Portal Dashboards:**
  * **User Dashboard:** View reservation details, track active travel itineraries, view invoices, and submit cancellation or refund requests.
  * **Driver Dashboard:** Manage assigned vehicles, check booking schedules, and update trip coordinates and status.
  * **Admin Operations Dashboard:** Monitor the booking queue, issue billing transactions, handle customer refunds, review cancellations, and issue system-wide notifications.
* **Modern CSS Styling:** Formatted with modular layouts (Navbar, Hero, Testimonials, About, and Footer components).

### 2. Backend API Server
* **RESTful Endpoints:** Custom routers handling authentication (`/api/auth`), bookings (`/api/bookings`), notifications (`/api/notifications`), users (`/api/users`), and vehicle inventory (`/api/cars`).
* **Authentication & Authorization:** Secure password hashing via `bcryptjs` and token verification with cookie/header-based `jsonwebtoken` (JWT).
* **Automated Admin Seeding:** On first run, the server auto-seeds a default administrator account if none exists.
* **JSON Collection Database:** Custom, high-speed filesystem database manager (`db.js`) supporting complete CRUD functions on structured JSON collections:
  * `users.json`
  * `bookings.json`
  * `notifications.json`
  * `cars.json`
* **Vercel Static Sync:** Deployment configuration (`vercel.json`) that rewrites URLs and maps paths, ensuring modular CSS/JS resources load properly.

---

## 🛠️ Technology Stack

* **Client:** Vanilla HTML5, CSS3, ES6+ Javascript.
* **Server:** Node.js, Express.js.
* **Database:** Local JSON File-System Database (`JsonDatabase`).
* **Dependencies:** `bcryptjs`, `jsonwebtoken` (JWT), `cookie-parser`, `cors`, `dotenv`.
* **Deployment:** Pre-configured for hosting the client on Vercel and the backend on Node.js/Express.

---

## 📁 Project Structure

```bash
Rhinovoyage/
├── client/                      # Static Frontend Application
│   ├── public/                  # Public assets, static HTML pages and views
│   │   ├── index.html           # Main Landing Page
│   │   ├── admin-dashboard.html # Admin CMS Console
│   │   ├── user-dashboard.html  # User Portal
│   │   ├── driver-dashboard.html# Driver Console
│   │   └── ...                  # Billing, cancellation, refund, login views
│   ├── src/                     # Modular assets
│   │   ├── css/                 # Component-specific styles
│   │   ├── js/                  # Form interactions and API drivers
│   │   └── components/          # Reusable layouts
│   ├── vercel.json              # Rewrites and cleanUrls mapping for static hosts
│   ├── build.js                 # Builder script to sync public files
│   └── package.json             # Frontend script configuration
├── server/                      # Express.js API Backend
│   ├── config/                  # Database connections
│   │   └── db.js                # Custom JSON CRUD database driver
│   ├── controllers/             # Business logic controllers
│   ├── routes/                  # Express Router configurations
│   ├── server.js                # API Entry point and middleware setup
│   └── package.json             # Server packages & configurations
├── database/                    # Storage directory for users, bookings, and cars JSON files
├── restore.py                   # Python helper script to extract HTML templates from logs
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### 1. Database Setup
The custom database initializes its files inside `/database` folder automatically on backend startup. No external DBMS installation is required.

### 2. Running the Server (API Backend)
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` folder with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=rhinovoyagesecretkey12345
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
   ```
4. Run in development mode:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

### 3. Running the Client (Frontend)
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Build the project (syncs source files):
   ```bash
   npm run build
   ```
3. Open `client/public/index.html` in your browser (or serve the `client/public` folder using a local server like `live-server` or `serve`).

---

## 🔑 Default Credentials

Upon running the backend API for the first time, a default system administrator account is seeded automatically:
* **Admin Email:** `admin@rhinovoyage.com`
* **Admin Password:** `adminpassword123`

Drivers and standard users can register accounts directly through the registration form on the application frontend.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
