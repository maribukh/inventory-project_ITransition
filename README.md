# Inventoro - Inventory Management System

Inventoro is a full-stack web application for flexible and powerful inventory management. It allows users to create, manage, and share inventories with custom fields, supported by a modern tech stack including React, Node.js, and PostgreSQL.

This version features a key integration with Salesforce, enabling users to sync their profile data directly into a CRM for customer relationship management.

**Live Demo:** https://inventory-client-yh25.onrender.com/

*(Note: The first load might be slow as the free-tier services on Render spin up.)*

---

## Features

-   **User Authentication:** Secure user registration and login using Firebase Authentication (Email/Password & Google).
-   **Inventory Management (CRUD):** Create, read, update, and delete inventories.
-   **Custom Fields:** Define custom data structures for each inventory (supporting text, numbers, booleans, links).
-   **Item Management (CRUD):** Add, edit, and delete items within an inventory.
-   **Public & Private Inventories:** Share inventories publicly (read-only) or keep them private.
-   **Global Search:** Full-text search across all accessible inventories.
-   **Admin Panel:** A dedicated dashboard for administrators to manage users and view system statistics.
-   **Salesforce Integration:** Connect user profiles to Salesforce to create `Account` and `Contact` records via a secure OAuth 2.0 PKCE flow.
-   **Multilingual Support:** Switch between English and Russian languages.
-   **Dark/Light Mode:** Theme support for user comfort.

---

## Tech Stack

-   **Frontend:** React, React Router, TailwindCSS, Framer Motion, React Query, Firebase SDK, Axios
-   **Backend:** Node.js, Express.js, PostgreSQL, Firebase Admin SDK
-   **Deployment & Services:** Render (Static Site & Web Service), Render PostgreSQL, Firebase, Salesforce

---

## Local Setup Instructions

To run this project on your local machine, follow these steps.

### Prerequisites

-   Node.js (v18+)
-   npm
-   A running local instance of PostgreSQL

### 1. Clone the Repository

git clone https://github.com/maribukh/inventory-project_ITransition.git
cd inventory-project_ITransition

**2. Backend Setup (/server)**
Navigate to the server directory: cd server
Install dependencies: npm install
Create an .env file and populate it with your credentials for DATABASE_URL, FIREBASE_SERVICE_ACCOUNT, SF_CLIENT_ID, SF_CLIENT_SECRET, and CLIENT_URL.
Connect to your local PostgreSQL instance and run the script located at /server/setup.sql to create all tables and seed them with demo data.
Run the server: npm run dev (runs on http://localhost:4000)
**3. Frontend Setup (/client)**
Navigate to the client directory: cd client
Install dependencies: npm install
Create an .env file and populate it with VITE_API_BASE (your backend URL), VITE_CLIENT_URL (your frontend URL), and VITE_SALESFORCE_CLIENT_ID.
Run the client: npm run dev (runs on http://localhost:5173)
