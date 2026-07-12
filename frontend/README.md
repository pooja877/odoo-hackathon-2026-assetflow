# AssetFlow — Enterprise Asset & Resource Management System

A modern, dark-themed enterprise SaaS frontend for asset lifecycle management: allocation, resource booking, maintenance workflows, audits, and reporting.

## Tech Stack

- React 18 + Vite
- React Router DOM
- Axios
- Tailwind CSS
- Recharts
- React Hook Form
- Lucide React icons

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Login is in demo mode — any email/password combination signs you in (no backend required to explore the UI).

## Connecting a Backend

All API calls live in `src/services/`. The Axios instance (`src/services/api.js`) points to `http://localhost:8000` and auto-injects a JWT from `localStorage` on every request. Update the `BASE_URL` constant and wire up your real endpoints — the service method signatures are already shaped for standard REST responses.

## Project Structure

```
src/
  pages/        Route-level views (Dashboard, Assets, Bookings, ...)
  components/   Reusable UI building blocks (Sidebar, DataTable, Modal, ...)
  services/     Axios-based API clients, one per domain
  data/         Mock/dummy data used until the backend is connected
```

## Design System

- Background `#0B1120` · Surface `#111827` · Card `#1F2937` · Border `#374151`
- Primary `#3B82F6` · Success `#22C55E` · Warning `#F59E0B` · Danger `#EF4444`
- Font: Inter
