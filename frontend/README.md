# Luxury Real Estate Website

A full-stack application for a luxury real estate company, featuring property listings, bookings, user authentication, and an agent dashboard.

## Features

- **Modern UI with shadcn/ui components**
- **Responsive design** that works on all devices
- **Dark mode support** with theme toggle
- **Authentication** with NextAuth.js and JWT
- **Property listings** with filtering and pagination
- **Property details** with image gallery and booking functionality
- **Agent dashboard** with statistics, property management, bookings, and user management
- **Express backend** with TypeScript and Prisma ORM
- **PostgreSQL database** for data storage
- **Redux Toolkit** for state management
- **React Query** for API data fetching and caching
- **Animations** with Framer Motion

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Redux Toolkit
- React Query
- NextAuth.js
- Framer Motion

### Backend

- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Express Validator

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
   \`\`\`bash
   git clone https://github.com/yourusername/luxury-real-estate.git
   cd luxury-real-estate
   \`\`\`

2. Install dependencies
   \`\`\`bash

# Install frontend dependencies

npm install

# Install backend dependencies

cd backend
npm install
cd ..
\`\`\`

3. Set up environment variables
   \`\`\`bash

# Create .env file in the root directory

cp .env.example .env

# Create .env file in the backend directory

cp backend/.env.example backend/.env
\`\`\`

4. Set up the database
   \`\`\`bash

# Generate Prisma client

npx prisma generate

# Push the schema to your database

npx prisma db push

# Seed the database

npx prisma db seed
\`\`\`

5. Start the development servers
   \`\`\`bash

# Start the backend server

cd backend
npm run dev

# In a new terminal, start the frontend server

npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Login Credentials

For testing purposes, you can use these credentials:

- **Agent User**:

  - Email: agent@example.com
  - Password: agent123

- **Regular User**:
  - Email: user@example.com
  - Password: user123

## Project Structure

\`\`\`
├── app/ # Next.js app directory
│ ├── agent/ # Agent dashboard pages
│ ├── auth/ # Authentication pages
│ ├── villas/ # Property listing pages
│ ├── api/ # API routes
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page
├── components/ # React components
│ ├── agent/ # Agent dashboard components
│ ├── ui/ # UI components (shadcn)
│ └── ... # Other components
├── lib/ # Utility functions and hooks
│ ├── api/ # API service and functions
│ ├── redux/ # Redux store and slices
│ ├── types.ts # TypeScript types
│ └── utils.ts # Utility functions
├── prisma/ # Prisma schema and migrations
├── public/ # Static assets
├── backend/ # Express backend
│ ├── src/ # Source code
│ │ ├── controllers/ # Route controllers
│ │ ├── middleware/ # Express middleware
│ │ ├── routes/ # API routes
│ │ ├── utils/ # Utility functions
│ │ └── server.ts # Server entry point
│ ├── prisma/ # Prisma schema and migrations
│ └── package.json # Backend dependencies
└── package.json # Frontend dependencies
\`\`\`

## Deployment

### Frontend

The frontend can be deployed to Vercel:

\`\`\`bash
vercel
\`\`\`

### Backend

The backend can be deployed to a service like Heroku, Railway, or a VPS:

\`\`\`bash

# Build the backend

cd backend
npm run build

# Start the production server

npm start
\`\`\`

## License

MIT
\`\`\`

Let's create a .env.example file:
