Inventory Management System

This is a full-stack web application for inventory management, built with the PERN stack (PostgreSQL, Express, React, Node.js) and Firebase for authentication. It allows users to create custom inventories, define unique fields for them, and manage items within those inventories. The application also features a complete admin panel for user and system management.

Features

User Authentication: Secure user registration and login (Email/Password + Google Sign-In) managed by Firebase Authentication.

Inventory Management: Users can create, view, and manage their own inventories.

Public/Private Inventories: Users can set inventories as "Public" (read-only for all users) or "Private" (visible only to the creator).

Custom Field System: When creating an inventory, users can define a custom schema of up to 15 fields (3 for each type: string, text, number, boolean, link).

Item Management: Full CRUD (Create, Read, Update, Delete) functionality for items within an inventory.

Toolbar-Based Controls: Item editing and deletion are handled via a dynamic toolbar, supporting single and bulk operations.

Admin Dashboard: A separate, protected route for administrators (/admin) with features to:

View all users in the system with pagination.

Block, unblock, grant, or revoke admin privileges for any user.

View a complete list of all inventories created on the platform.

Full-Text Search: A global, high-performance search bar that uses PostgreSQL's full-text search (FTS) to find items across all accessible inventories.

Multi-Language Support: The UI supports both English (en) and Russian (ru), managed via a React Context.

Dark/Light Mode: Full application themeing for dark and light modes, with user preference saved to local storage.

Tech Stack

Frontend (Client)

React 18: For building the user interface.

React Router: For client-side routing.

React Query (TanStack Query): For server state management, caching, and data fetching.

Tailwind CSS: For all styling and UI components.

Firebase (Client SDK): For handling user authentication.

Backend (Server)

Node.js: JavaScript runtime environment.

Express.js: Web application framework for building the REST API.

PostgreSQL: Relational database for all application data.

node-postgres (pg): PostgreSQL client for Node.js.

Firebase Admin SDK: For verifying user tokens and managing users from the backend.

CORS, dotenv: Standard middleware and environment variable management.

Database Schema

The application relies on three main SQL tables:

users:

Stores user information linked to their Firebase UID.

Fields: uid, email, is_admin, is_blocked.

inventories:

Stores each inventory's details, ownership (user_id), and visibility (is_public).

Contains columns for all possible custom fields (custom_string1_name, custom_string1_state, etc.).

items:

Stores individual items linked to an inventory_id.

Contains all possible custom data columns (custom_string1, custom_text1, etc.) and a search_text column for FTS.

Getting Started

To run this project locally, you will need to set up the server, the client, and the database.

1. Prerequisites

Node.js (v18 or later)

npm

A running PostgreSQL database

A Firebase project with Authentication (Email/Password and Google) enabled.

2. Clone the Repository

git clone [https://github.com/maribukh/inventory-project_ITransition.git](https://github.com/maribukh/inventory-project_ITransition.git)
cd inventory-project_ITransition


3. Server Setup (Backend)

Navigate to the server directory:

cd server


Install dependencies:

npm install


Create a .env file in the server directory and add your environment variables:

# Example .env file
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/YOUR_DB_NAME"
PORT=4000


Download your serviceAccountKey.json from your Firebase project settings and place it in the server directory.

4. Database Setup

Connect to your PostgreSQL instance.

Run the SQL scripts provided in the repository (or in the project description) to create the users, inventories, and items tables.

Important: Run the following command to add the is_public column required by the application:

ALTER TABLE inventories
ADD COLUMN is_public BOOLEAN DEFAULT FALSE;


5. Client Setup (Frontend)

From the root directory, navigate to the client:

cd client


Install dependencies:

npm install


Rename firebase.config.js.example to firebase.config.js (or ensure firebase.config.js exists) and fill it with your Firebase project's client-side configuration.

6. Running the Application

Run the Server:

# From the /server directory
npm run dev

Demo: https://inventory-client-yh25.onrender.com/
Server: https://inventory-server-lb56.onrender.com/

The server will be running on http://localhost:4000.

Run the Client:

# From the /client directory
npm run dev
