"use client";

import { Bid, TaskStatus, UserRole } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSignIcon,
  ClockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  MessageSquareTextIcon,
  HammerIcon,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/date";
import Link from "next/link";
import { useAuthStore } from "@/lib/zustand";
import { useBids } from "@/hooks/useBids";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface BidCardProps {
  bid: Bid;
  isTaskOwner: boolean; // Indicates if the current logged-in user owns the task
  taskId: string;
}

export function BidCard({ bid, isTaskOwner, taskId }: BidCardProps) {
  const { user } = useAuthStore();
  const { acceptBid, isAcceptingBid } = useBids(taskId);
  const router = useRouter();

  const handleAcceptBid = async () => {
    try {
      await acceptBid(bid.id);
      toast.success(
        `Bid from ${bid.freelancer?.profile?.firstName || bid.freelancer?.email} accepted! Task status updated.`
      );
      router.push(`/dashboard/projects/${taskId}`); // Redirect to project workspace
    } catch (error) {
      // toast already handled by useBids hook
    }
  };

  const freelancerAvatarSeed =
    bid.freelancer?.profile?.firstName || bid.freelancer?.email || "Freelancer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-xl border border-neutral-200 bg-card shadow-soft dark:shadow-soft-dark transition-all duration-300 ease-in-out-quad hover:shadow-medium dark:shadow-medium-dark">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-neutral-200">
              <AvatarImage
                src={
                  bid.freelancer?.profile?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${freelancerAvatarSeed}`
                }
                alt={freelancerAvatarSeed}
              />
              <AvatarFallback>
                {freelancerAvatarSeed.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/freelancers/${bid.freelancerId}`}
                className="text-h6 font-semibold hover:text-primary-600 transition-colors"
              >
                {bid.freelancer?.profile?.firstName}{" "}
                {bid.freelancer?.profile?.lastName}
              </Link>
              <p className="text-caption">
                {bid.freelancer?.profile?.skills &&
                bid.freelancer.profile.skills.length > 0
                  ? bid.freelancer.profile.skills.slice(0, 2).join(", ")
                  : "No skills listed"}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`font-semibold text-body-sm ${
              bid.status === "ACCEPTED"
                ? "bg-success-50 text-success-600 border-success-200"
                : bid.status === "PENDING"
                  ? "bg-warning-50 text-warning-600 border-warning-200"
                  : "bg-neutral-100 border-neutral-300"
            }`}
          >
            {bid.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="flex items-center text-body-md">
            <DollarSignIcon className="mr-2 h-5 w-5 text-primary-500" />
            <span className="font-semibold">
              ${bid.amount.toLocaleString()}
            </span>
            <ClockIcon className="ml-4 mr-2 h-5 w-5" />
            <span>{formatRelativeTime(bid.createdAt)}</span>
          </div>
          <CardDescription className="text-body-sm">
            {bid.proposal.length > 200
              ? `${bid.proposal.substring(0, 200)}...`
              : bid.proposal}
            {bid.proposal.length > 200 && (
              <Link
                href={`/tasks/${taskId}`}
                className="text-primary-500 hover:underline ml-1"
              >
                Read more
              </Link>
            )}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-end">
          {isTaskOwner && bid.status === "PENDING" && (
            <Button
              onClick={handleAcceptBid}
              disabled={isAcceptingBid}
              className="shadow-primary dark:shadow-primary-dark group"
            >
              {isAcceptingBid ? (
                <>
                  <LoadingSpinner
                    size="sm"
                    color="text-primary-foreground"
                    className="mr-2"
                  />{" "}
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="mr-2 h-4 w-4" /> Accept Bid
                </>
              )}
            </Button>
          )}
          {isTaskOwner && bid.status === "ACCEPTED" && (
            <Badge
              variant="default"
              className="bg-success-500 text-white font-medium"
            >
              <CheckCircle2Icon className="mr-2 h-4 w-4" /> Bid Accepted
            </Badge>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
