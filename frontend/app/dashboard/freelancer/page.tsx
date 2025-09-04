"use client";
// import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSignIcon, BriefcaseIcon, StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/zustand';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// export const metadata: Metadata = {
//   title: 'Freelancer Dashboard - Micro Freelance Marketplace',
//   description: 'Manage your active projects, earnings, and profile.',
// };

// Freelancer Dashboard page (Client Component due to useAuthStore for user info)
export default function FreelancerDashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { title: 'Total Earnings', value: '$2,500', icon: <DollarSignIcon className="h-6 w-6 text-primary-500" /> },
    { title: 'Active Projects', value: '3', icon: <BriefcaseIcon className="h-6 w-6 text-primary-500" /> },
    { title: 'Average Rating', value: '4.8', icon: <StarIcon className="h-6 w-6 text-primary-500" /> },
  ];

  return (
    <div className="flex flex-col space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-display-md font-extrabold text-neutral-800"
      >
        Welcome, {user?.firstName || user?.email?.split('@')[0]}!
      </motion.h1>
      <p className="text-body-md text-neutral-600">Your freelancer dashboard overview.</p>

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
                <CardTitle className="text-h6 font-semibold text-neutral-700">{stat.title}</CardTitle>
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
          <Link href="/tasks" passHref>
            <Button variant="gradient" size="lg" className="h-auto py-5 shadow-primary group">
              <BriefcaseIcon className="mr-3 h-6 w-6" />
              <span className="text-h5">Browse New Tasks</span>
            </Button>
          </Link>
          <Link href="/dashboard/payouts" passHref>
            <Button variant="outline" size="lg" className="h-auto py-5 border-neutral-300 shadow-soft group">
              <DollarSignIcon className="mr-3 h-6 w-6 text-primary-500" />
              <span className="text-h5 text-neutral-700">Manage Payouts</span>
            </Button>
          </Link>
          <Link href="/dashboard/earnings" passHref>
            <Button variant="outline" size="lg" className="h-auto py-5 border-neutral-300 shadow-soft group">
              <StarIcon className="mr-3 h-6 w-6 text-primary-500" />
              <span className="text-h5 text-neutral-700">View Earnings History</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Placeholder for Active Projects */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-h3 font-bold text-neutral-800"
        >
          Your Active Projects
        </motion.h2>
        <Card className="shadow-medium border-neutral-200">
          <CardContent className="p-6">
            <p className="text-body-md text-neutral-600">
              Your active projects will appear here. For now, this is a placeholder.
            </p>
            <Link href="/dashboard/projects" passHref className="mt-4 inline-block">
              <Button variant="link">View All Your Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}