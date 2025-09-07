# 🎨 Micro-Freelance - Frontend 🎨

Welcome to the frontend of the **Micro-Freelance** marketplace! This is where the user experience comes to life, with a beautiful, responsive, and feature-rich interface. ✨

**Live URL:** [https://micro-freelance.vercel.app/](https://micro-freelance.vercel.app/)

## ✨ Features

*   **Modern UI/UX:** A visually stunning and intuitive interface built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).
*   **📱 Fully Responsive:** Looks great on any device, from desktops to mobile phones.
*   **✅ Role-Based Dashboards:** Separate, tailored dashboards for clients, freelancers, and administrators.
*   **📝 Easy Task Management:** Create, browse, and manage tasks with just a few clicks.
*   **💬 Real-Time Chat:** Communicate with clients and freelancers in real-time.
*   **🔒 Secure Authentication:** A complete authentication flow, including registration, login, and password reset.
*   **...and much more!**

## 🛠️ Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
*   **Data Fetching:** [React Query](https://tanstack.com/query/v4)

## 🚀 Getting Started

Ready to bring the frontend to life? Here's how:

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version)
*   [npm](https://www.npmjs.com/) (or [yarn](https://yarnpkg.com/))
*   The [backend server](https://micro-freelance.onrender.com/) must be running.

### Setup

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/ChristianRukundo/micro_freelance.git
    cd micro_freelance/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    ```bash
    cp .env.local.example .env.local
    ```
    Then, open the `.env.local` file and fill in the required values (API base URL, WebSocket URL, etc.).

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

The frontend will be running at `http://localhost:3000`.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.

---

<p align="center">
  Enjoy the beautiful interface! 🎨
</p>