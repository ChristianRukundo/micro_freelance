"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSignIcon,
  BriefcaseIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FileTextIcon,
  PlusCircleIcon,
  TriangleAlertIcon,
} from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/zustand";
import { motion, AnimatePresence, Variants } from "framer-motion"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Task, TaskStatus } from "@/lib/types"; 
import { formatRelativeTime } from "@/lib/date";
import { TaskCardSkeleton } from "@/components/common/SkeletonLoaders";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// FIX: Added Framer Motion variants definition
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10, duration: 0.5 },
  },
};

// Client Dashboard page
export default function ClientDashboardPage() {
  const { user } = useAuthStore();
  const { clientStats, isLoadingClientStats, isErrorClientStats } =
    useDashboardStats();

  const displayName =
    user?.profile?.firstName || user?.email?.split("@")[0] || "Client";

  const stats = [
    {
      title: "Total Projects Posted",
      value: clientStats?.totalProjects,
      icon: <BriefcaseIcon className="h-6 w-6 text-primary-500" />,
      link: "/dashboard/client/projects",
    },
    {
      title: "Active Projects",
      value: clientStats?.activeProjects,
      icon: <UsersIcon className="h-6 w-6 text-warning-500" />,
      link: "/dashboard/client/projects?status=IN_PROGRESS",
    },
    {
      title: "Completed Projects",
      value: clientStats?.completedProjects,
      icon: <CheckCircleIcon className="h-6 w-6 text-success-500" />,
      link: "/dashboard/client/projects?status=COMPLETED",
    },
    {
      title: "Total Spending",
      value: `$${clientStats?.totalSpending?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`,
      icon: <DollarSignIcon className="h-6 w-6 text-purple-500" />,
      link: "/dashboard/client/spending",
    },
  ];

  if (isLoadingClientStats) {
    return (
      <div className="flex flex-col space-y-8">
        <h1 className="text-display-md font-extrabold">
          Welcome, <LoadingSpinner size="md" className="inline-block ml-2" />
        </h1>
        <p className="text-body-md">Your client dashboard overview.</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="h-40 p-6 shadow-medium dark:shadow-medium-dark animate-pulse bg-gradient-to-br from-card to-muted/10 border-border/50"
            />
          ))}
        </div>
        <div className="space-y-6">
          <h2 className="text-h3 font-bold">
            <LoadingSpinner size="sm" className="mr-2" /> Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="h-24 shadow-medium dark:shadow-medium-dark animate-pulse bg-gradient-to-br from-card to-muted/10 border-border/50"
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-h3 font-bold">
            <LoadingSpinner size="sm" className="mr-2" /> Your Recent Projects
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isErrorClientStats) {
    return (
      <Alert variant="destructive" className="mx-auto my-8">
        <TriangleAlertIcon className="h-4 w-4" />
        <AlertTitle>Error loading dashboard!</AlertTitle>
        <AlertDescription>
          Failed to fetch client dashboard data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col space-y-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-display-md font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-300 dark:to-primary-500 drop-shadow-md"
      >
        Welcome, {displayName}!
      </motion.h1>
      <p className="text-body-lg text-muted-foreground max-w-2xl">
        Your personalized command center for all client-side activities. Stay on
        top of your projects, spending, and team.
      </p>

      {/* Stats Section */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group"
          >
            <Link href={stat.link || "#"} passHref className="block h-full">
              <Card className="flex flex-col p-6 h-full rounded-2xl shadow-xl dark:shadow-hard-dark bg-gradient-to-br from-card to-primary-50/20 dark:to-neutral-900/20 border-border/50 transition-all duration-300 ease-in-out-quad hover:scale-[1.02] hover:border-primary-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-4 border-b border-border/30 mb-4">
                  <CardTitle className="text-h5 font-semibold text-foreground">
                    {stat.title}
                  </CardTitle>
                  <motion.div
                    className="p-2 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300 shadow-inner group-hover:rotate-6 transition-transform duration-300"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    {stat.icon}
                  </motion.div>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex items-center justify-between">
                  <div className="text-display-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-300 dark:to-primary-500">
                    {stat.value}
                  </div>
                  <ArrowRightIcon className="h-6 w-6 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-h3 font-bold flex items-center gap-2 text-foreground"
        >
          <SparklesIcon className="h-6 w-6 text-primary-500" /> Quick Actions
        </motion.h2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/tasks/new" passHref>
              <Button
                variant="gradient"
                size="lg"
                className="h-auto py-5 shadow-primary dark:shadow-primary-dark group w-full rounded-xl hover:scale-[1.01]"
              >
                <BriefcaseIcon className="mr-3 h-6 w-6" />
                <span className="text-h5">Post a New Project</span>
              </Button>
            </Link>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Link href="/freelancers" passHref>
              <Button
                variant="primary-outline"
                size="lg"
                className="h-auto py-5 border-neutral-300 shadow-soft dark:shadow-soft-dark group w-full rounded-xl hover:scale-[1.01]"
              >
                <UsersIcon className="mr-3 h-6 w-6 text-primary-500" />
                <span className="text-h5">Find Freelancers</span>
              </Button>
            </Link>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/client/spending" passHref>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-5 border-neutral-300 shadow-soft dark:shadow-soft-dark group w-full rounded-xl hover:scale-[1.01]"
              >
                <DollarSignIcon className="mr-3 h-6 w-6 text-primary-500" />
                <span className="text-h5">View Spending History</span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Recent Projects (Tasks client posted) */}
      <section className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-h3 font-bold flex items-center gap-2 text-foreground"
        >
          <HistoryIcon className="h-6 w-6 text-primary-500" /> Your Recent
          Projects
        </motion.h2>
        <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200 bg-gradient-to-br from-card to-muted/10">
          <CardContent className="p-6">
            {clientStats?.recentProjects &&
            clientStats.recentProjects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {clientStats.recentProjects.map(
                    (
                      project: Task,
                      index: number // FIX: Explicitly type project and index
                    ) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          passHref
                        >
                          <Card className="p-4 flex flex-col sm:flex-row items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50/70 dark:bg-neutral-800/70 shadow-sm transition-all hover:bg-primary-50 dark:hover:bg-neutral-700">
                            <BriefcaseIcon className="h-8 w-8 text-primary-600 flex-shrink-0" />
                            <div className="flex-1 text-center sm:text-left">
                              <p className="text-h6 font-semibold truncate">
                                {project.title}
                              </p>
                              <div className="flex items-center justify-center sm:justify-start gap-2 text-caption text-muted-foreground mt-1">
                                <Badge
                                  variant="outline"
                                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                                >
                                  {project.status.replace(/_/g, " ")}
                                </Badge>
                                <span>
                                  {formatRelativeTime(project.createdAt)}
                                </span>
                              </div>
                            </div>
                            <ArrowRightIcon className="h-5 w-5 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </Card>
                        </Link>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-body-md text-muted-foreground">
                  You haven't posted any projects recently.
                </p>
                <Link
                  href="/dashboard/tasks/new"
                  passHref
                  className="mt-4 inline-block"
                >
                  <Button variant="gradient" className="group">
                    <PlusCircleIcon className="mr-2 h-4 w-4" /> Post Your First
                    Project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
