# 🏡 Tura Heza – Rwanda Real Estate Platform 🇷🇼

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Lucide Icons](https://img.shields.io/badge/Lucide-171717?style=for-the-badge&logo=lucide&logoColor=white)](https://lucide.dev/)
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query/latest)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logoColor=white)](https://ui.shadcn.com/)

> Discover your dream property in Rwanda! A full-stack real estate platform powered by modern technologies, real-time data, and responsive design.

---

## ✨ Key Features

### 🖼️ Frontend
- **Browse Listings** – Explore beautiful property listings with detailed data.
- **Advanced Search** – Filter by location, category, price, and more.
- **Favorites System** – Save and manage your favorite properties.
- **Responsive Design** – Works on phones, tablets, and desktops.
- **Authentication** – Register/Login securely.
- **Interactive Maps** – Visualize property locations on maps.
- **Modern UI** – Built with Shadcn UI + Lucide Icons.

### 🧠 Backend (Node.js + Express API)
- **Property Endpoints**
  - `GET /api/properties/` – List all properties
  - `GET /api/properties/featured` – Featured listings
  - `GET /api/properties/search` – Advanced search
  - `GET /api/properties/:id` – Single property
- **Creator Endpoints**
  - `GET /api/agent/` – All creators
  - `GET /api/agent/:id` – Get single creator
  - `GET /api/agent/:id/properties` – Properties by creator
- **Database** – MySQL/PostgreSQL (configurable)
- **Authentication** – JWT-secured routes

---

## 🛠️ Tech Stack

### 🌐 Frontend:
- **Next.js** – React framework
- **TypeScript** – Type-safe code
- **Tailwind CSS** – Utility-first styling
- **React Query** – API state management
- **Lucide Icons** – Beautiful SVG icons
- **Shadcn UI** – Accessible components
- **Framer Motion** – Animations

### 🔧 Backend:
- **Node.js** – Runtime
- **Express.js** – Web framework
- **MongoDB / PostgreSQL** – Flexible database choice
- **JWT** – Token-based auth
- **REST API** – Modular route system

---

## 📦 Installation Guide

### 🧰 Prerequisites
Make sure you have:
- Node.js >= 18
- npm / yarn / pnpm
- MongoDB / PostgreSQL running

---
## 🚀 Getting Started

Follow these steps to get your local development environment up and running:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ChristianRukundo/Tura-Heza.git
    cd Tura-Heza
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install or pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your environment variables. Here are some common ones you might need:

    ```env
    NEXT_PUBLIC_API_BASE_URL=your_api_endpoint
    # Add other environment variables as needed
    ```

4.  **Run the development server:**

    ```bash
    npm run dev  # or yarn dev or pnpm dev
    ```

    Open your browser and navigate to `http://localhost:3000` to see the platform in action!

## ⚙️ Configuration

- **API Base URL:** Ensure the `NEXT_PUBLIC_API_BASE_URL` in your `.env` file points to your backend API.
- **Database:** Configure your database connection details in your backend environment variables.
- **Authentication:** Set up any necessary authentication keys or secrets in your `.env` (for frontend) and backend environment variables.


## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -am 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a pull request on GitHub.

Please ensure your code follows the project's coding standards and includes appropriate tests.


---

Made with ❤️ in Rwanda 🇷🇼 by Your RUKUNDO SIBORUREMA Christian
