# AssetFlow

Enterprise Asset & Resource Management System built for the **Odoo Hackathon 2026**.

A full-stack application for managing organizational assets, resource bookings, maintenance workflows, audits, allocations, and notifications.

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- JWT Authentication

### Database
- SQLite

## Features

- JWT Authentication
- Role-Based Access Control
- Department & Employee Management
- Asset Registration & Tracking
- Asset Allocation & Transfer
- Resource Booking
- Maintenance Workflow
- Audit Management
- Dashboard & Reports
- Notifications

## Frontend Structure

```text
frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
```

## Backend Structure

```text
backend/
├── app/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── utils/
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   └── main.py
```
