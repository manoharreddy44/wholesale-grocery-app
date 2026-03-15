# B2B Wholesale Grocery Management

MERN stack app: Node/Express/MongoDB backend + React (Vite) frontend with Tailwind CSS.

## Quick start

1. **Environment**  
   Copy `backend/.env.example` to `backend/.env` and set:
   - `PORT` (default 5000)
   - `MONGO_URI` (e.g. `mongodb://localhost:27017/wholesale-grocery`)
   - `JWT_SECRET` (any long random string)

2. **Install dependencies**  
   From project root:
   ```bash
   npm install
   npm run install:all
   ```
   Or manually:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Seed database (first time)**  
   With MongoDB running:
   ```bash
   npm run seed
   ```
   This adds 5 sample products, 2 customers, and an admin user (phone: `9999999999`, password: `admin123`).

4. **Run the app**  
   From project root:
   ```bash
   npm start
   ```
   This starts both backend (port 5000) and frontend (port 3000). Open http://localhost:3000 and log in with the seeded credentials.

## Structure

- `backend/` – Express API, Mongoose models, auth/products/customers/orders
- `frontend/` – Vite + React, Tailwind, Dashboard, Products, Customers, POS

Frontend proxies `/api` to the backend when using `npm start` from root.
