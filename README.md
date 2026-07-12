# Asset Management System

A fast hackathon-friendly full-stack app for managing assets, allocations, bookings, maintenance, audits, and notifications.

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
- SQLite for fast development and demo
- Can be migrated to PostgreSQL later

## Frontend Structure

frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── OrganizationSetup.jsx
│   │   ├── AssetDirectory.jsx
│   │   ├── AllocationTransfer.jsx
│   │   ├── ResourceBooking.jsx
│   │   ├── Maintenance.jsx
│   │   ├── Audit.jsx
│   │   ├── Reports.jsx
│   │   └── Notifications.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── AssetForm.jsx
│   │   ├── AllocationForm.jsx
│   │   ├── BookingForm.jsx
│   │   ├── MaintenanceForm.jsx
│   │   ├── AuditForm.jsx
│   │   ├── NotificationCard.jsx
│   │   ├── DashboardCards.jsx
│   │   └── Charts.jsx
│   ├── services/
│   │   ├── authService.js
│   │   ├── assetService.js
│   │   ├── allocationService.js
│   │   ├── bookingService.js
│   │   ├── maintenanceService.js
│   │   ├── auditService.js
│   │   ├── reportService.js
│   │   └── notificationService.js
│   ├── App.jsx
│   └── main.jsx

## Notes

Focus on a working demo first. Extra features and database scaling can be added after the core flow is complete.
