# 🚀 Micro-Freelance - Backend 🚀

Welcome to the backend of the **Micro-Freelance** marketplace! This is where all the magic happens, from managing users and tasks to handling payments and real-time communication. 🤫

**Live URL:** [https://micro-freelance.onrender.com/](https://micro-freelance.onrender.com/)

## ✨ Features

*   **🔐 Authentication & User Management:** Secure user registration, login, and profile management with role-based access control (Client, Freelancer, Admin).
*   **📝 Task Management:** Create, manage, and track tasks with detailed descriptions, categories, budgets, and deadlines.
*   **💰 Bidding System:** Freelancers can bid on projects, and clients can review and accept the best proposals.
*   **📈 Milestone Tracking:** Break down large projects into manageable milestones to ensure smooth progress and timely payments.
*   **💬 Real-Time Communication:** A dedicated chat for each task, enabling seamless communication between clients and freelancers.
*   **💳 Secure Payments:** Integrated with [Stripe Connect](https://stripe.com/connect) for secure escrow payments and milestone-based payouts.
*   **📁 File Uploads:** Securely upload and manage project files.
*   **👑 Admin Panel:** A powerful dashboard for managing users and overseeing the platform.

## 🛠️ Technology Stack

*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Express.js](https://expressjs.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Real-time:** [Socket.IO](https://socket.io/)
*   **Payments:** [Stripe SDK](https://stripe.com/docs/api)
*   **And much more!**

## 🚀 Getting Started

Ready to get the backend up and running? Follow these simple steps:

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version)
*   [npm](https://www.npmjs.com/) (or [yarn](https://yarnpkg.com/))
*   [Docker](https://www.docker.com/)

### Setup

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/ChristianRukundo/micro_freelance.git
    cd micro_freelance/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the PostgreSQL database** using Docker:
    ```bash
    docker-compose up -d db
    ```

4.  **Set up your environment variables:**
    ```bash
    cp .env.example .env
    ```
    Then, open the `.env` file and fill in the required values (database URL, JWT secrets, Stripe keys, etc.).

5.  **Run the database migrations and seed the database:**
    ```bash
    npx prisma migrate dev --name init
    npx ts-node prisma/seed.ts
    ```

6.  **Start the development server:**
    ```bash
    npm run dev
    ```

The server will be running at `http://localhost:5000`. You can access the API documentation at `http://localhost:5000/api-docs`.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.

---

<p align="center">
  Happy coding! 💻
</p>