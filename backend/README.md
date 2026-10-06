# Gourmet Haven - Restaurant Management System (Full Stack)

A complete full-stack web application for restaurant management and online ordering.

The system connects a **PostgreSQL** database through a **Prisma ORM** and **Express REST API** to a responsive, interactive **HTML, Tailwind CSS v4, and Vanilla JavaScript (Vite)** frontend.

---

## 🏗️ Architectural Data Flow

This project demonstrates the end-to-end data flow of a modern web application:

```text
┌────────────────────────┐
│  PostgreSQL Database   │  (Persistent storage for users, categories, menu, orders)
└───────────┬────────────┘
            │  SQL Relations & Constraints
            ▼
┌────────────────────────┐
│       Prisma ORM       │  (Type-safe queries, relational joins, transactions)
└───────────┬────────────┘
            │  Data layer
            ▼
┌────────────────────────┐
│    Express REST API    │  (Authentication, JWT, business logic, endpoints)
└───────────┬────────────┘
            │  HTTP JSON (GET, POST, PUT, PATCH, DELETE)
            ▼
┌────────────────────────┐
│  Frontend API Client   │  (fetch() wrapper, Bearer token attachment)
└───────────┬────────────┘
            │  DOM Updates & Reactive State
            ▼
┌────────────────────────┐
│ User Interface (Tailwind│  (Interactive menu, real-time cart, live order tracking)
│      CSS v4 + Vite)    │
└────────────────────────┘
```

---

## 💻 Technologies Used

### Backend
- **Node.js & Express 5**: Clean REST API with structured controllers, routes, and middleware.
- **PostgreSQL**: Relational database handling users, menu, tables, reservations, and orders.
- **Prisma ORM**: Modern database access, foreign key enforcement, migrations, and transactions.
- **bcrypt**: Secure password hashing with salt rounds.
- **jsonwebtoken (JWT)**: Stateless token-based authentication.
- **dotenv**: Environment variable management.

### Frontend
- **HTML5 & Vanilla JavaScript**: Clean, framework-free client-side application logic using standard `fetch()`, `async/await`, and ES Modules.
- **Tailwind CSS v4**: Utility-first modern CSS styling using `@tailwindcss/vite`.
- **Vite 6**: Fast development server and build tool configured with an API proxy to prevent CORS issues without altering backend code.

---

## Deployment configuration

- **Frontend (Vercel):** Set the project root to `frontend`, build command to `npm run build`, and output directory to `dist`. Set `VITE_API_URL` to the backend origin, for example `https://your-api-host.example` (no path required). Vite embeds this value at build time, so redeploy after changing it.
- **Backend (Render or another Node host):** Run from `backend` with `npm start`. Set `DATABASE_URL` to a reachable hosted PostgreSQL connection string, `JWT_SECRET` to a strong secret, and `CORS_ORIGIN` to the exact frontend origin (scheme and hostname, no trailing slash). Multiple origins can be comma-separated. Do not use `localhost` for the production database URL.
- Apply Prisma migrations to the hosted database before using database-backed API routes.


