# LeadFlow CRM

A full-stack Customer Relationship Management platform built for managing leads, tracking sales pipelines, and visualizing performance through analytics dashboards. LeadFlow provides a modern, dark-themed interface with Kanban boards, data import/export, and multi-tenant workspaces.

## Tech Stack

**Frontend**
- React 18 with React Router v6 for client-side routing
- TailwindCSS 3 with a custom teal/zinc dark theme
- Recharts for interactive analytics charts
- @hello-pangea/dnd for drag-and-drop Kanban boards
- Axios for API communication
- PapaParse for CSV parsing on the client side
- Lucide React for icons

**Backend**
- Node.js with Express 4
- MongoDB with Mongoose ODM
- JWT-based authentication using jsonwebtoken and bcryptjs
- Multer for file upload handling
- csv-parse for server-side CSV processing

**Deployment**
- Backend hosted on Render (configured via `render.yaml`)
- Frontend hosted on Netlify (configured via `netlify.toml`)

## Features

### Authentication
- User registration with password strength validation (minimum 8 characters, uppercase, lowercase, number, special character)
- Secure login with JWT tokens stored in localStorage
- Protected routes that redirect unauthenticated users to the login page
- Auto-logout on token expiration with 401 interceptors

### Lead Management
- Create, read, update, and delete leads with fields for name, email, phone, company, status, and notes
- Five lead statuses: **New**, **Contacted**, **Qualified**, **Converted**, and **Lost**
- Full-text search across lead name, email, and company
- Status history tracking with timestamps for every status change
- Sortable and filterable lead table with pagination

### Sheet Workspaces
- Organize leads into separate sheets (workspaces)
- Create and delete sheets independently
- Each sheet maintains its own set of leads, analytics, and Kanban board

### Kanban Board
- Visual pipeline view with drag-and-drop support for moving leads between status columns
- Real-time status updates when cards are moved across columns

### CSV Import & Export
- Bulk import leads from CSV files with field mapping
- Export leads to CSV for external analysis or backup

### Analytics Dashboard
- Visual breakdown of leads by status using interactive charts
- Pipeline performance metrics per sheet

## Repository Structure

```
leadflow-crm/
└── crm/
    ├── backend/
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── Sheet.js
    │   │   └── Lead.js
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── sheets.js
    │   │   └── leads.js
    │   ├── middleware/
    │   ├── server.js
    │   ├── render.yaml
    │   └── package.json
    ├── frontend/
    │   ├── public/
    │   │   └── index.html
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── layout/
    │   │   │   │   ├── AppLayout.jsx
    │   │   │   │   └── Sidebar.jsx
    │   │   │   ├── leads/
    │   │   │   │   ├── LeadsTable.jsx
    │   │   │   │   ├── LeadPanel.jsx
    │   │   │   │   └── ImportDropzone.jsx
    │   │   │   ├── kanban/
    │   │   │   │   └── KanbanBoard.jsx
    │   │   │   ├── analytics/
    │   │   │   │   └── AnalyticsDashboard.jsx
    │   │   │   └── shared/
    │   │   │       └── ProtectedRoute.jsx
    │   │   ├── context/
    │   │   │   ├── AuthContext.jsx
    │   │   │   └── SheetContext.jsx
    │   │   ├── pages/
    │   │   │   ├── AuthPage.jsx
    │   │   │   ├── LeadsPage.jsx
    │   │   │   └── AnalyticsPage.jsx
    │   │   ├── utils/
    │   │   │   ├── api.js
    │   │   │   └── status.jsx
    │   │   ├── hooks/
    │   │   ├── App.jsx
    │   │   ├── index.js
    │   │   └── index.css
    │   ├── tailwind.config.js
    │   ├── postcss.config.js
    │   ├── netlify.toml
    │   └── package.json
    └── README.md
```

## Prerequisites

- **Node.js** v18 or later (v20 LTS recommended)
- **npm** v9 or later
- **MongoDB** — either a local instance or a MongoDB Atlas cluster

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/leadflow-crm.git
cd leadflow-crm/crm
```

### 2. Set up the backend

```bash
cd backend
```

Create a `.env` file in the `backend/` directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/leadflow-crm
JWT_SECRET=your_jwt_secret_here
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Install dependencies and start the server:

```bash
npm install
npm run dev
```

The API server will start on `http://localhost:5000` with hot-reloading via nodemon.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm start
```

The React dev server will start on `http://localhost:3000`. API requests are automatically proxied to `http://localhost:8000` via the proxy setting in `package.json`. If your backend runs on a different port, update the `proxy` field accordingly.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT token |
| GET | `/api/auth/me` | Get the currently authenticated user |

### Sheets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sheets` | List all sheets for the authenticated user |
| POST | `/api/sheets` | Create a new sheet |
| DELETE | `/api/sheets/:id` | Delete a sheet and all its leads |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sheets/:sheetId/leads` | List leads in a sheet (supports search, filter, pagination) |
| POST | `/api/sheets/:sheetId/leads` | Create a new lead in a sheet |
| PUT | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead |
| GET | `/api/sheets/:sheetId/kanban` | Get leads grouped by status for the Kanban board |
| GET | `/api/sheets/:sheetId/stats` | Get analytics/statistics for a sheet |
| POST | `/api/sheets/:sheetId/import` | Bulk import leads from parsed CSV data |
| GET | `/api/sheets/:sheetId/export` | Export all leads in a sheet as CSV |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Returns server status and timestamp |

## Deployment

### Backend — Render

The `backend/render.yaml` file contains the Render service configuration. To deploy:

1. Push your code to GitHub
2. Connect the repository to Render
3. Render will detect the `render.yaml` and configure the service automatically
4. Set the following environment variables in the Render dashboard:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a secure random string for signing tokens
   - `FRONTEND_URL` — your Netlify deployment URL
   - `NODE_ENV` — set to `production`

### Frontend — Netlify

The `frontend/netlify.toml` file handles the Netlify build configuration. To deploy:

1. Connect the repository to Netlify
2. Set the base directory to `crm/frontend`
3. Add the `REACT_APP_BACKEND_URL` environment variable in the Netlify dashboard, pointing to your Render backend URL (e.g., `https://leadflow-crm-backend.onrender.com`)
4. Netlify will build the React app and handle client-side routing via the redirect rules in `netlify.toml`

## Scripts Reference

| Location | Script | Description |
|----------|--------|-------------|
| `backend/` | `npm start` | Start the production server |
| `backend/` | `npm run dev` | Start the development server with hot-reloading |
| `frontend/` | `npm start` | Start the React development server |
| `frontend/` | `npm run build` | Create an optimized production build |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/leadflow-crm` | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret key for signing JWT tokens |
| `PORT` | No | `5000` | Port the server listens on |
| `FRONTEND_URL` | No | `http://localhost:3000` | Allowed CORS origin |
| `NODE_ENV` | No | `development` | Set to `production` in deployed environments |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | No | `/api` | Backend API base URL (only needed when not using the proxy) |

## Live Demo

🔗 **Frontend:** https://leadlow.netlify.app/

🔗 **Backend API:** https://leadflow-crm-5fui.onrender.com/api
