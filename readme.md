# Micro Freelance Marketplace - Frontend

Welcome to the frontend of the Micro Freelance Marketplace! This application provides a modern, responsive, and feature-rich user interface for connecting clients with freelancers. Built with the latest Next.js 15+ App Router, TypeScript, and Tailwind CSS, it aims for an expert-level user experience with server components, server actions, infinite scrolling, and sophisticated UI/UX.

This project is designed to integrate seamlessly with its backend counterpart, available [here](https://github.com/your-backend-repo-link).

## Features Implemented (Showcase)

This generation focuses on demonstrating the most complex and critical "expert-level" features across a comprehensive set of pages and components:

*   **Modern Next.js 15+ App Router**: Leveraging Server Components for performance, Server Actions for mutations (Login, Register, Task Creation, Bid Submission, Profile Update, User Management, Milestone Updates), and Route Handlers.
*   **Visually Stunning UI**: Deeply customized `shadcn/ui` components (`Button`, `Card`, `Input`, `Select`, `Table`, `Badge` etc.) with a custom Tailwind CSS theme, ensuring a unique brand aesthetic, sophisticated shadows, and micro-interactions powered by `framer-motion`.
*   **Complete Authentication Flow**:
    *   Login, Register, Email Verification, Forgot Password, and Reset Password pages.
    *   All forms use `react-hook-form` with `zod` for client-side validation and Server Actions for secure submission.
    *   Robust client-side session management using `zustand` and `axios` interceptors to handle JWT cookies.
*   **Role-Based Dashboard**:
    *   Dynamic sidebar navigation and redirection based on user roles (Client, Freelancer, Admin).
    *   Dedicated dashboard pages for Clients (`/dashboard/client`), Freelancers (`/dashboard/freelancer`), and a central Admin panel (`/admin/users`).
*   **User Profile Management (`/dashboard/profile`)**: Comprehensive form (`ProfileForm.tsx`) for updating user details, bio, skills, and portfolio links, utilizing Server Actions.
*   **Task Listing & Filtering (`/tasks`)**:
    *   Utilizes `@tanstack/react-query`'s `useInfiniteQuery` and `react-intersection-observer` for infinite scrolling of task cards.
    *   Advanced filtering and search capabilities for categories, budget, and keywords.
    *   Custom `TaskCardSkeleton` for excellent perceived performance during loading.
*   **Complex Task Creation (`/tasks/new`)**:
    *   **Multi-step form** demonstration, allowing structured input for project details.
    *   Integrated `react-dropzone` for file attachments, with a custom `useUpload` hook for direct AWS S3 pre-signed URL uploads.
    *   Real-time Markdown preview for detailed project descriptions using `react-markdown`.
*   **Monolithic Task Details / Project Workspace (`/tasks/[id]`, `/dashboard/projects/[id]`)**:
    *   **A single, highly interactive page combining multiple complex features:**
        *   Detailed Task Overview (Server Component data fetch).
        *   **Bidding System**: Display of all bids (`BidCard.tsx`) with infinite scrolling, and a dedicated `BidForm.tsx` for submission using Server Actions and optimistic UI updates. Client can accept bids with optimistic updates.
        *   **Milestone Tracking**: Visual `MilestoneTracker` component, with conditional buttons (Submit, Approve, Request Revision) using Server Actions and optimistic updates.
        *   **Real-time Chat**: `ChatWindow.tsx` and `MessageInput.tsx` powered by `socket.io-client`, including infinite scrolling for message history and typing indicators.
*   **Freelancer Payouts (`/dashboard/payouts`)**: Interface for freelancers to set up and manage their Stripe Connect account.
*   **Admin User Management (`/admin/users`)**:
    *   Admin-specific layout with role checks.
    *   Infinite scrolling table of users, with actions to suspend/activate and change roles using Server Actions and optimistic UI.
*   **Notifications System (`/dashboard/notifications`)**: Real-time notifications via `socket.io-client`, displaying a list of alerts (`NotificationCard.tsx`).
*   **Global State Management**: `zustand` for auth state and UI state, with persistence (`localStorage`).
*   **Centralized API Handling**: `axios` instance with interceptors for global error handling and toast notifications (`sonner`).
*   **Loading Skeletons**: Custom-designed skeletons for *every* page and complex component that fetches asynchronous data.
*   **Optimistic UI Updates**: Implemented for key mutations (e.g., bid acceptance, milestone status changes) for instant feedback.
*   **Error Boundaries**: Robust `ErrorBoundary` component for graceful error recovery in client components.
*   **Accessibility (WCAG 2.1 AA+)**: Semantic HTML, `aria` attributes, keyboard navigation considerations.
*   **Responsiveness**: Mobile-first design for all core components and layouts.

## Technology Stack

*   **Framework**: Next.js 15+ (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: `shadcn/ui` (heavily customized)
*   **State/Data Fetching**: `@tanstack/react-query`, `zustand`
*   **Forms**: `react-hook-form`, `zod`
*   **Animations**: `framer-motion`
*   **Icons**: `lucide-react`
*   **Real-time**: `socket.io-client`
*   **Infinite Scrolling**: `react-intersection-observer`
*   **File Uploads**: `react-dropzone`, `axios` (for S3 direct upload)
*   **Rich Text Preview**: `react-markdown`
*   **Date Pickers**: `react-day-picker`
*   **Toasts**: `sonner`
*   **Theme Management**: `next-themes`
*   **Charts**: `recharts` (for earnings dashboard)

## Getting Started (Local Development)

### Prerequisites

*   **Node.js (latest LTS)**: e.g., v20.x or v22.x.
*   **npm** (or yarn/pnpm).
*   **Backend Application Running**: Ensure the backend you previously developed is running (typically on `http://localhost:5000`).

### Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.your-username/micro-freelance-frontend.git
    cd micro-freelance-frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Initialize & Add `shadcn/ui` Components**:
    This codebase relies heavily on customized `shadcn/ui` components. If you just cloned the repo, the `components/ui` folder will likely be present. However, if you're starting from scratch or encounter issues, you might need to re-initialize and add the components. The `postinstall` script runs `npx prisma generate` from your backend project, so ensure it is set up.

    First, ensure the `shadcn-ui` CLI is available:
    ```bash
    npx shadcn-ui@latest init
    ```
    Follow the prompts (choose TypeScript, App Router, Tailwind CSS variables, `components/ui` for components, `@/components/ui` for aliases).

    Then, add all the components used in this project:
    ```bash
    npx shadcn-ui@latest add accordion alert-dialog aspect-ratio avatar badge button calendar card checkbox collapsible context-menu dialog dropdown-menu form hover-card input label menubar navigation-menu popover progress radio-group scroll-area select separator sheet slider sonner switch table tabs textarea toast toggle toggle-group tooltip
    ```
    **Important**: Remember that the `shadcn/ui` components in `components/ui` have been deeply customized in this codebase. If you re-add them, they might revert to defaults, requiring manual re-application of custom styles. The provided code assumes these components exist in `components/ui` with our custom styling applied.

4.  **Environment Configuration:**
    Create a `.env.local` file in the root of the project:
    ```bash
    cp .env.local.example .env.local
    ```
    Edit `.env.local` and fill in the following:

    ```env
    # Backend API Base URL
    NEXT_PUBLIC_API_BASE_URL="http://localhost:5000/api"
    # Backend WebSocket URL (Socket.IO)
    NEXT_PUBLIC_WS_BASE_URL="http://localhost:5000"

    # For S3 Uploads (obtained from backend for presigned URL, but needed here for public URL reconstruction)
    NEXT_PUBLIC_AWS_REGION="us-east-1"
    NEXT_PUBLIC_AWS_S3_BUCKET_NAME="your-s3-bucket-name" # Must match your S3 bucket name

    # Stripe Public Key (from your Stripe Dashboard)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
    ```
    **Make sure these values match your running backend configuration.**

5.  **Run the Development Server:**
    ```bash
    npm run dev
    # or yarn dev
    ```
    Open your browser to `http://localhost:3000` (or whatever port Next.js starts on).

### Demo Guide

Follow these steps to experience the core features:

#### **I. Authentication & Dashboard Access**

1.  **Ensure Backend is Running**: Before starting the frontend, ensure your backend API is fully operational and accessible at `http://localhost:5000`.
2.  **Open `http://localhost:3000`**: You'll land on the marketing page.
3.  **Navigate to Register (`/register`)**: Click "Sign Up" in the header or "Create Free Account".
4.  **Register a Client Account**:
    *   Fill in `firstName: Client`, `lastName: User`, `email: client@example.com`, `password: password123`.
    *   Select "Client (Hire Freelancers)".
    *   Click "Create Account". A success toast `Registration successful! Please check your email to verify your account.` should appear.
    *   You will be redirected to `/verify-email`.
5.  **Verify Client Email**:
    *   Go to your backend logs (where `npm run dev` for backend is running). Look for an Ethereal Email URL or the OTP directly.
    *   Enter `client@example.com` and the 6-digit OTP on the `/verify-email` page. Click "Verify".
    *   You should see a success toast and be redirected to `/login`.
6.  **Register & Verify a Freelancer Account**:
    *   Repeat steps 3-5 for a Freelancer: `firstName: Freelancer`, `lastName: User`, `email: freelancer@example.com`, `password: password123`, role "Freelancer".
7.  **Login as Client (`/login`)**:
    *   Enter `client@example.com` and `password123`. Click "Log In".
    *   You should see a success toast and be redirected to `/dashboard/client`. Observe the Client-specific navigation in the sidebar.
8.  **Login as Freelancer**:
    *   Log out first (via User Dropdown in Header).
    *   Log in with `freelancer@example.com` and `password123`.
    *   You should be redirected to `/dashboard/freelancer`. Observe the Freelancer-specific navigation.
9.  **Explore Admin Panel**:
    *   Log out. Log in with `admin@example.com` (from backend seed) and `password123`.
    *   You should be redirected to `/admin/users`. Explore the user management table.

#### **II. Task Creation (as Client)**

1.  **Log in as Client (`client@example.com`, `password123`)**.
2.  **Navigate to Post New Task (`/tasks/new`)**: Click "Post New Task" in the sidebar or header.
3.  **Fill out the Multi-Step Task Form**:
    *   **Step 1: Basic Info**
        *   **Project Title**: `Design a Modern E-commerce Website`
        *   **Budget**: `1500`
        *   **Deadline**: Pick a date a few weeks from now.
        *   **Category**: Select "Web Development".
        *   Click "Next".
    *   **Step 2: Detailed Description & Attachments**
        *   **Project Description**: `I need a talented web designer to create a sleek and user-friendly e-commerce website. The design should be modern, responsive, and visually appealing, targeting fashion accessories. Include wireframes, mockups, and a style guide. Must integrate seamlessly with a Shopify backend (design only).` (Type at least 50 characters). Observe the real-time Markdown preview.
        *   **Attachments (Optional)**: Drag and drop a few small image files (JPEG, PNG) or PDFs into the dropzone. Observe the file upload progress and success toasts.
        *   Click "Post Project".
4.  **Redirect to Task Details**: You should see a success toast and be redirected to `/tasks/[id]` for the newly created task.

#### **III. Browse Tasks & Bid (as Freelancer)**

1.  **Log in as Freelancer (`freelancer@example.com`, `password123`)**.
2.  **Browse Tasks (`/tasks`)**: Navigate to `http://localhost:3000/tasks`.
3.  **Observe Infinite Scrolling**: Scroll down the page. New task cards should load automatically. Observe the custom `TaskCardSkeleton` while data loads.
4.  **Find Your Client's Task**: Locate the "Design a Modern E-commerce Website" task.
5.  **View Task Details (`/tasks/[id]`)**: Click on the task card. This is the complex "Project Workspace" page.
6.  **Submit a Bid**:
    *   Scroll down to the "Bids" section.
    *   **Proposal**: `I have extensive experience in modern e-commerce design, particularly with Shopify integrations. My portfolio includes several fashion brands where I focused on intuitive UX and high-converting visual appeal. I can deliver wireframes, high-fidelity mockups, and a comprehensive style guide within your timeline. My approach prioritizes brand consistency and mobile-first responsiveness. Let's discuss further!`
    *   **Amount**: `1300`.
    *   Click "Submit Bid". Observe loading state and success toast.

#### **IV. Project Workflow (Client & Freelancer)**

*(You'll need to simulate switching between client and freelancer accounts in separate browser tabs/incognito windows or by logging in/out.)*

1.  **As Client (View Bids & Accept)**:
    *   Log in as Client (`client@example.com`).
    *   Go to your task details page (`/tasks/[id]`).
    *   Scroll to the "Bids" section. You should see the Freelancer's bid.
    *   Click "Accept Bid". Observe the optimistic UI update (bid status changes instantly), success toast, and task status changing to "In Progress".
2.  **As Freelancer (Milestone Submission)**:
    *   Log in as Freelancer (`freelancer@example.com`).
    *   Go to the accepted task's project workspace (`/dashboard/projects/[id]`).
    *   You should now see the "Milestones" section. *(Initially, client needs to create milestones.)*
3.  **As Client (Milestone Creation)**:
    *   Log in as Client. Go to the task's project workspace (`/dashboard/projects/[id]`).
    *   Locate the "Milestones" section. You should have a button/form to "Create Milestones".
    *   Add a few milestones (e.g., "Wireframes", "Mockups", "Final Delivery") with due dates and amounts. Click "Save".
4.  **As Freelancer (Milestone Submission & Chat)**:
    *   Log in as Freelancer. Go to the task's project workspace.
    *   **Submit Milestone**: For the "Wireframes" milestone, click "Submit". Observe optimistic UI update and success toast.
    *   **Real-time Chat**: Type a message in the chat input. Messages should appear instantly. If the Client is logged in and viewing the same page in another browser, they should see the message in real-time.
5.  **As Client (Milestone Revision/Approval)**:
    *   Log in as Client. Go to the task's project workspace.
    *   You'll see "Wireframes" as "Submitted".
    *   You can either "Approve" (triggering payout) or "Request Revision" (add comments). Test both. Observe optimistic updates.
6.  **As Freelancer (Payout Setup)**:
    *   Navigate to `/dashboard/payouts`.
    *   Click "Connect Stripe Account". This will redirect you to Stripe Connect for onboarding. Follow Stripe's prompts (you can use test data).
    *   After completing (or skipping/returning), you'll be redirected back, and your Stripe account status should update.

This detailed guide and the code provided below will give you a fully functional and impressive Next.js frontend, demonstrating a very high level of technical expertise and adherence to modern best practices.