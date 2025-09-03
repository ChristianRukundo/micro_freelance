# Micro Freelance Marketplace - Backend

This project implements the backend for a comprehensive micro freelance marketplace platform. It connects clients with freelancers for project-based work, facilitating task posting, bidding, milestone tracking, payments, and real-time communication.

## Features

- **Authentication & User Management**: User registration, login, logout, email verification, password reset, profile management, role-based permissions (Client, Freelancer, Admin).
- **Task Management System**: Task creation with rich descriptions, categories, budget, deadline, file attachments, and status tracking.
- **Bidding System**: Freelancers submit proposals, clients review and select bids.
- **Milestone & Progress Management**: Break tasks into measurable milestones, track status, request revisions, and approve work.
- **Communication System**: Real-time chat per task, in-app and potentially email notifications.
- **Payment Integration**: Stripe Connect for secure escrow payments, milestone-based payouts, platform commission.
- **File Uploads**: Secure pre-signed URL uploads to AWS S3.
- **Admin Panel**: User management (suspend, delete, view), task moderation.
- **Scalable Architecture**: Modular design, PostgreSQL with Prisma ORM, Redis for caching (conceptual for this output, not implemented directly in this codebase), Socket.IO for real-time.
- **Robust Security**: JWT with refresh tokens, Bcrypt for passwords, Zod for input validation, Helmet, CORS, Rate Limiting.
- **Email Notifications**: Powered by Nodemailer with Ethereal for dev.

## Technology Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Language**: TypeScript
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Validation**: Zod
-   **Authentication**: JWT (Access & Refresh Tokens)
-   **Real-time**: Socket.IO
-   **Payments**: Stripe SDK (Connect, PaymentIntents, Transfers)
-   **Emailing**: Nodemailer (Ethereal for dev)
-   **File Storage**: AWS S3 (Pre-signed URLs)
-   **Security**: `bcryptjs`, `helmet`, `express-rate-limit`, `cookie-parser`, `cors`
-   **API Documentation**: Swagger/OpenAPI

## Getting Started (Local Development)

### Prerequisites

*   Node.js (LTS version, e.g., 18.x or 20.x)
*   npm (or yarn)
*   Docker (for running PostgreSQL locally)

### Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/micro-freelance-marketplace-backend.git
    cd micro-freelance-marketplace-backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Start PostgreSQL Database with Docker:**
    Ensure Docker is running on your machine.
    ```bash
    docker-compose up -d db
    ```
    This will start a PostgreSQL container named `db` on port `5432`.

4.  **Environment Configuration:**
    Copy the example environment file and fill in your details:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and update the following:

    *   **`DATABASE_URL`**: This should match your Docker setup. The default `postgresql://user:password@localhost:5432/microfreelance?schema=public` works with the `docker-compose.yml`.
    *   **`JWT_SECRET`, `JWT_REFRESH_SECRET`**: Generate strong, unique random strings for these. You can use an online tool or a simple script like `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    *   **`FRONTEND_URL`**: Set this to the URL of your frontend application (e.g., `http://localhost:3000`). This is used for CORS and email links.
    *   **`CORS_ORIGIN`**: Should be the same as `FRONTEND_URL`.
    *   **`EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`**:
        For **development**, the `NodemailerService` is configured to use [Ethereal Email](https://ethereal.email/). When you run the server, it will log a generated Ethereal test account and a URL to view sent emails. You can also manually create an Ethereal account and put those credentials here.
        For **production**, you would configure this with your actual SMTP provider's details.
    *   **`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_RETURN_URL`**:
        Obtain these from your [Stripe Dashboard](https://dashboard.stripe.com/).
        *   `STRIPE_SECRET_KEY`: Found under Developers -> API keys.
        *   `STRIPE_WEBHOOK_SECRET`: Create a new webhook endpoint (e.g., `http://localhost:5000/api/stripe/webhook` for local testing with `stripe listen`) in your Stripe dashboard and get the signing secret.
        *   `STRIPE_CONNECT_RETURN_URL`: This is the URL on your frontend where Stripe will redirect the user after they complete the Connect onboarding process (e.g., `http://localhost:3000/dashboard/payouts`).
    *   **`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`**:
        These are required for file uploads to AWS S3. Create an S3 bucket and an IAM user with programmatic access (and `s3:PutObject`, `s3:GetObject` permissions for your bucket). Ensure the region matches your bucket.

5.  **Run Prisma Migrations and Seed Database:**
    ```bash
    npx prisma migrate dev --name init
    npx ts-node prisma/seed.ts # Seed initial categories and demo users
    ```
    The `prisma:migrate` command will create the database tables based on `prisma/schema.prisma`.
    The `prisma:seed` command will populate the database with some initial data.

6.  **Start the Development Server:**
    ```bash
    npm run dev
    # or yarn dev
    ```
    The server will start on `http://localhost:5000` (or your specified `PORT`). You will see logs indicating the server status and, if in development, the Ethereal email URLs.

### API Documentation (Swagger)

Once the server is running, you can access the interactive API documentation (Swagger UI) at:
[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Example Credentials (from `prisma/seed.ts`)

You can log in with these users after seeding the database:

*   **Admin User**:
    *   Email: `admin@example.com`
    *   Password: `password123`
*   **Client User**:
    *   Email: `client@example.com`
    *   Password: `password123`
*   **Freelancer User**:
    *   Email: `freelancer@example.com`
    *   Password: `password123`

## API Endpoints Summary

| Module          | Method | Endpoint                                   | Description                                                     | Authentication                                     |
| :-------------- | :----- | :----------------------------------------- | :-------------------------------------------------------------- | :------------------------------------------------- |
| **Auth**        | `POST` | `/api/auth/register`                       | Register a new user account                                     | None                                               |
|                 | `POST` | `/api/auth/verify-email`                   | Verify user email with OTP                                      | None                                               |
|                 | `POST` | `/api/auth/resend-verification-email`      | Resend email verification OTP                                   | None                                               |
|                 | `POST` | `/api/auth/login`                          | Login user and set authentication cookies                       | None                                               |
|                 | `POST` | `/api/auth/logout`                         | Logout user and clear authentication cookies                    | User                                               |
|                 | `POST` | `/api/auth/refresh-token`                  | Refresh access token using refresh token cookie                 | User (via refresh token)                           |
|                 | `POST` | `/api/auth/forgot-password`                | Request password reset OTP                                      | None                                               |
|                 | `POST` | `/api/auth/reset-password`                 | Reset password using OTP                                        | None                                               |
| **User**        | `GET`  | `/api/users/me`                            | Get current authenticated user's profile                        | User                                               |
|                 | `PUT`  | `/api/users/me`                            | Update current authenticated user's profile                     | User                                               |
| **Categories**  | `GET`  | `/api/categories`                          | Get all available task categories                               | None                                               |
|                 | `POST` | `/api/categories`                          | Create a new task category                                      | Admin                                              |
|                 | `PUT`  | `/api/categories/:id`                      | Update a task category                                          | Admin                                              |
|                 | `DELETE` | `/api/categories/:id`                    | Delete a task category                                          | Admin                                              |
| **Tasks**       | `POST` | `/api/tasks`                               | Create a new task                                               | Client                                             |
|                 | `GET`  | `/api/tasks`                               | Get a list of tasks with filtering and pagination               | None                                               |
|                 | `GET`  | `/api/tasks/:id`                           | Get a single task by ID                                         | None                                               |
|                 | `PUT`  | `/api/tasks/:id`                           | Update an existing task                                         | Client (task owner)                                |
|                 | `DELETE` | `/api/tasks/:id`                         | Delete a task (if OPEN and no bids)                             | Client (task owner)                                |
|                 | `PATCH`| `/api/tasks/:id/cancel`                    | Cancel a task                                                   | Client (task owner) / Admin                        |
| **Bids**        | `POST` | `/api/tasks/:taskId/bids`                  | Submit a bid for a task                                         | Freelancer                                         |
|                 | `GET`  | `/api/tasks/:taskId/bids`                  | Get all bids for a specific task                                | Client (task owner)                                |
|                 | `POST` | `/api/bids/:bidId/accept`                  | Accept a freelancer's bid                                       | Client (task owner)                                |
| **Milestones**  | `POST` | `/api/tasks/:taskId/milestones`            | Create milestones for a task                                    | Client (task owner)                                |
|                 | `GET`  | `/api/tasks/:taskId/milestones`            | Get all milestones for a task                                   | Client (task owner) / Freelancer (assigned)        |
|                 | `PATCH`| `/api/milestones/:milestoneId/submit`      | Freelancer submits a milestone for review                       | Freelancer (assigned)                              |
|                 | `PATCH`| `/api/milestones/:milestoneId/request-revision` | Client requests revision for a submitted milestone        | Client (task owner)                                |
|                 | `PATCH`| `/api/milestones/:milestoneId/approve`     | Client approves a milestone and triggers payout                 | Client (task owner)                                |
| **Payments**    | `POST` | `/api/stripe/connect-account`              | Create/Onboard a Stripe Connect account for a freelancer        | Freelancer                                         |
|                 | `GET`  | `/api/stripe/account-status`               | Get the onboarding status of the freelancer's Stripe Connect account | Freelancer                                         |
|                 | `POST` | `/api/tasks/:taskId/create-payment-intent` | Client creates a Stripe Payment Intent to fund a task (escrow)  | Client (task owner)                                |
|                 | `POST` | `/api/stripe/webhook`                      | Stripe webhook endpoint for event notifications                 | None (Stripe signature verification)               |
| **Messaging**   | `GET`  | `/api/messages/tasks/:taskId`              | Get message history for a task chat                             | Client (task owner) / Freelancer (assigned)        |
|                 | `POST` | `/api/messages/tasks/:taskId`              | Send a message to a task chat (REST, for non-real-time fallback)| Client (task owner) / Freelancer (assigned)        |
| **Notifications**|`GET`  | `/api/notifications`                       | Get user's notifications                                        | User                                               |
|                 | `PATCH`| `/api/notifications/:notificationId/read`  | Mark a specific notification as read                            | User (notification owner)                          |
|                 | `PATCH`| `/api/notifications/read-all`              | Mark all unread notifications for the user as read              | User                                               |
| **Uploads**     | `POST` | `/api/uploads/signed-url`                  | Get a pre-signed S3 URL for direct file uploads                 | User                                               |
| **Admin**       | `GET`  | `/api/admin/users`                         | Get all users with filtering and pagination                     | Admin                                              |
|                 | `PATCH`| `/api/admin/users/:userId/status`          | Update user suspension status or role                           | Admin                                              |
|                 | `DELETE` | `/api/admin/users/:userId`               | Delete a user (cannot delete other admins)                      | Admin                                              |

## Important Notes

*   **Security**: All sensitive endpoints are protected with JWT authentication and appropriate role-based authorization. Input is validated using Zod. HTTPS and other security headers are enforced (though HTTPS needs to be configured at a proxy level for production).
*   **Real-time**: The Socket.IO server is integrated for real-time messaging and notifications. The client-side application will need to establish a WebSocket connection and handle `join_room`, `send_message`, `receive_message`, `typing_start`, `typing_stop`, and `new_notification` events.
*   **Stripe**: The payment system uses Stripe Connect for onboarding freelancers and handling payouts. Clients fund tasks via Payment Intents. Webhooks are crucial for confirming payment success and account updates.
*   **Error Handling**: A centralized error handling middleware ensures consistent and informative error responses.
*   **Development Email**: During development, all emails will be sent via Ethereal, and the URLs to view these emails will be logged in the console.

```