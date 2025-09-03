import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSignIcon, BriefcaseIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/zustand"; // Client component
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Client Dashboard - Micro Freelance Marketplace",
  description: "Manage your posted projects and track your spending.",
};

// Client Dashboard page (Client Component due to useAuthStore for user info)
export default function ClientDashboardPage() {
  const { user } = useAuthStore(); // Access user info from Zustand store

  const stats = [
    {
      title: "Total Projects Posted",
      value: "5",
      icon: <BriefcaseIcon className="h-6 w-6 text-primary-500" />,
    },
    {
      title: "Active Projects",
      value: "2",
      icon: <UsersIcon className="h-6 w-6 text-primary-500" />,
    },
    {
      title: "Total Spending",
      value: "$1,250",
      icon: <DollarSignIcon className="h-6 w-6 text-primary-500" />,
    },
  ];

  return (
    <div className="flex flex-col space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-display-md font-extrabold text-neutral-800"
      >
        Welcome, {user?.firstName || user?.email?.split("@")[0]}!
      </motion.h1>
      <p className="text-body-md text-neutral-600">
        Your client dashboard overview.
      </p>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="flex flex-col p-6 shadow-medium border-neutral-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-3">
                <CardTitle className="text-h6 font-semibold text-neutral-700">
                  {stat.title}
                </CardTitle>
                <div className="text-neutral-500">{stat.icon}</div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="text-h2 font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions / Recent Activity */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-h3 font-bold text-neutral-800"
        >
          Quick Actions
        </motion.h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/tasks/new" passHref>
            <Button
              variant="gradient"
              size="lg"
              className="h-auto py-5 shadow-primary group"
            >
              <BriefcaseIcon className="mr-3 h-6 w-6" />
              <span className="text-h5">Post a New Project</span>
            </Button>
          </Link>
          <Link href="/tasks" passHref>
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-5 border-neutral-300 shadow-soft group"
            >
              <UsersIcon className="mr-3 h-6 w-6 text-primary-500" />
              <span className="text-h5 text-neutral-700">Find Freelancers</span>
            </Button>
          </Link>
          <Link href="/dashboard/spending" passHref>
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-5 border-neutral-300 shadow-soft group"
            >
              <DollarSignIcon className="mr-3 h-6 w-6 text-primary-500" />
              <span className="text-h5 text-neutral-700">
                View Spending History
              </span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Placeholder for Recent Projects (Tasks client posted) */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-h3 font-bold text-neutral-800"
        >
          Your Recent Projects
        </motion.h2>
        <Card className="shadow-medium border-neutral-200">
          <CardContent className="p-6">
            <p className="text-body-md text-neutral-600">
              Your recent projects will appear here. For now, this is a
              placeholder.
            </p>
            <Link href="/tasks" passHref className="mt-4 inline-block">
              <Button variant="link">View All Your Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
