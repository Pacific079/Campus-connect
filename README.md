# Campus Connect - Academic Management System

A comprehensive campus management system with separate backend and frontend components for managing academic activities, events, clubs, and student services.

## Project Structure


campus connect/
├── backend/                    # Node.js/Express Backend
│   ├── middleware/            # Authentication & authorization middleware
│   ├── model/                 # MongoDB/Mongoose schemas
│   ├── routes/                # API route handlers
│   ├── tmp/                   # Temporary files
│   ├── app.js                 # Main application file
│   ├── server.js              # Server startup file
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
└── frontend/                  # React/TypeScript Frontend
    ├── components/            # Reusable UI components
    ├── contexts/              # React context providers
    ├── pages/                 # Page components
    ├── services/              # API service functions
    ├── App.tsx                # Main React app
    ├── index.tsx              # React entry point
    ├── package.json           # Frontend dependencies
    └── vite.config.ts         # Vite configuration


## Features

### Backend (Node.js/Express + MongoDB)
- *Authentication & Authorization*: JWT-based auth with role-based permissions
- *User Management*: Student, club coordinator, admin, and seating manager roles
- *Event Management*: Create, approve, and manage campus events
- *Club Management*: Club creation requests with admin approval workflow
- *Course Management*: Syllabus upload and management
- *Fee Management*: Student fee tracking and management

### Frontend (React + TypeScript + Vite)
- *Dashboard*: Overview of events, statistics, and quick actions
- *Calendar*: Interactive calendar showing upcoming events
- *Event Management*: Role-based event creation and approval
- *Club Management*: Club creation requests and management
- *Student Services*: Hall ticket generation, syllabus viewing
- *Admin Panel*: Event approvals, club management, system oversight

## Technology Stack

### Backend
- *Runtime*: Node.js
- *Framework*: Express.js
- *Database*: MongoDB with Mongoose ODM
- *Authentication*: JWT (JSON Web Tokens)
- *File Upload*: Multer for syllabus uploads
- *Validation*: Custom middleware for role-based access

### Frontend
- *Framework*: React 18 with TypeScript
- *Build Tool*: Vite
- *Styling*: Tailwind CSS
- *Routing*: React Router DOM
- *Calendar*: React Calendar component
- *State Management*: React Context API
- *HTTP Client*: Axios (implied through services)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- npm or yarn package manager

### Backend Setup
bash
cd backend
npm install
# Configure your .env file with database connection and JWT secrets
npm start


### Frontend Setup
bash
cd frontend
npm install
npm run dev


## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - User registration

### Events
- GET /api/events - Get all events
- POST /api/events - Create new event (club coordinators)
- PUT /api/events/:id/approve - Approve event (admins)

### Clubs
- GET /api/clubs - Get all clubs
- POST /api/clubs - Request club creation
- PUT /api/clubs/:id/approve - Approve club (admins)

### Students
- GET /api/students - Get student data
- POST /api/students/hall-ticket - Generate hall ticket

### Syllabus
- GET /api/syllabus - Get syllabus data
- POST /api/syllabus/upload - Upload syllabus (with file)

## User Roles & Permissions

1. *Student*: View events, access syllabus, generate hall tickets
2. *Club Coordinator*: Create events and club requests, manage club activities
3. *Admin*: Approve events/clubs, manage system-wide settings
4. *Seating Manager*: Manage exam seating arrangements

## Development

### Running in Development
- Backend: npm run dev (with nodemon)
- Frontend: npm run dev (with Vite hot reload)

### Building for Production
- Backend: npm start (production server)
- Frontend: npm run build (creates dist folder)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
