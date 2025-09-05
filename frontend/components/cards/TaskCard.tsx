"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task, UserRole } from "@/lib/types";
import { formatDistanceToNowStrict, format } from "date-fns";
import {
  DollarSignIcon,
  ClockIcon,
  UsersIcon,
  FileTextIcon,
  MoveRightIcon,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
  showApplyButton?: boolean;
}

export function TaskCard({ task, showApplyButton = true }: TaskCardProps) {
  const timeSincePost = formatDistanceToNowStrict(new Date(task.createdAt), {
    addSuffix: true,
  });
  const deadlineDate = format(new Date(task.deadline), "MMM dd, yyyy");

  const avatarSeed =
    task.client?.profile?.firstName || task.client?.email || "Client";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-card shadow-soft dark:shadow-soft-dark transition-all duration-300 ease-in-out-quad hover:shadow-card-hover dark:shadow-card-hover-dark hover:border-primary-200">
        <Link
          href={`/tasks/${task.id}`}
          className="absolute inset-0 z-10"
          aria-label={`View task ${task.title}`}
        ></Link>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6">
          <div className="flex-1 space-y-2">
            <h3 className="text-h5 font-semibold transition-colors group-hover:text-primary-600">
              {task.title}
            </h3>
            <Badge
              variant="secondary"
              className="text-body-sm font-medium bg-primary-50 text-primary-600"
            >
              {task.category?.name || "Uncategorized"}
            </Badge>
          </div>
          <div className="relative z-20 flex-shrink-0">
            <Badge
              variant="outline"
              className={`font-semibold ${
                task.status === "OPEN"
                  ? "bg-success-50 text-success-600 border-success-200"
                  : task.status === "IN_PROGRESS"
                    ? "bg-warning-50 text-warning-600 border-warning-200"
                    : task.status === "COMPLETED"
                      ? "bg-neutral-100 border-neutral-300"
                      : "bg-neutral-100 border-neutral-300"
              }`}
            >
              {task.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="flex items-center text-body-sm">
            <DollarSignIcon className="mr-2 h-4 w-4 text-primary-500" />
            <span className="font-semibold">
              ${task.budget.toLocaleString()}
            </span>
            <span className="ml-2">|</span>
            <ClockIcon className="ml-2 mr-2 h-4 w-4 text-primary-500" />
            <span>Due by {deadlineDate}</span>
          </div>

          <CardDescription className="text-body-sm line-clamp-3">
            {task.description}
          </CardDescription>

          <div className="flex items-center justify-between text-caption">
            <div className="flex items-center space-x-2">
              {task.client?.profile?.avatarUrl ? (
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={task.client.profile.avatarUrl}
                    alt={task.client.profile.firstName || task.client.email}
                  />
                  <AvatarFallback>
                    {avatarSeed.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`}
                    alt={avatarSeed}
                  />
                  <AvatarFallback>
                    {avatarSeed.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <span>
                Posted by {task.client?.profile?.firstName || "Client"}
              </span>
            </div>
            <span>{timeSincePost}</span>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-6 pt-0 relative z-20">
          <div className="flex items-center text-body-sm">
            <UsersIcon className="mr-2 h-4 w-4 text-primary-500" />
            <span>{task._count?.bids || 0} Bids</span>
          </div>
          {showApplyButton && task.status === "OPEN" && (
            <Link href={`/tasks/${task.id}#bid`} passHref>
              <Button
                size="sm"
                className="group text-body-sm shadow-soft dark:shadow-soft-dark hover:shadow-medium dark:shadow-medium-dark"
              >
                Apply Now{" "}
                <MoveRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
