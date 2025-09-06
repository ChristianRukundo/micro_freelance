// frontend/components/cards/BidCard.tsx

"use client";

import { Bid } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSignIcon, ClockIcon, CheckCircle2Icon } from "lucide-react";
import { formatRelativeTime } from "@/lib/date";
import Link from "next/link";
import { useBids } from "@/hooks/useBids";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { motion } from "framer-motion";

interface BidCardProps {
  bid: Bid;
  isTaskOwner: boolean;
  taskId: string;
}

export function BidCard({ bid, isTaskOwner, taskId }: BidCardProps) {
  const { acceptBid, isAcceptingBid } = useBids(taskId);

  const handleAcceptBid = async () => {
    await acceptBid(bid.id);
  };

  const freelancerAvatarSeed =
    bid.freelancer?.profile?.firstName || bid.freelancer?.email || "F";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-xl border border-border/50 bg-card shadow-soft dark:shadow-soft-dark transition-all duration-300 ease-in-out-quad hover:shadow-medium dark:hover:shadow-medium-dark hover:border-primary-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border">
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
                {bid.freelancer?.profile?.skills?.slice(0, 2).join(", ") ||
                  "Experienced Professional"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`font-semibold text-body-sm`}>
            {bid.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="flex items-center text-body-sm">
            <DollarSignIcon className="mr-2 h-4 w-4 text-primary-500" />
            <span className="font-semibold">
              ${bid.amount.toLocaleString()}
            </span>
            <ClockIcon className="ml-4 mr-2 h-4 w-4" />
            <span>{formatRelativeTime(bid.createdAt)}</span>
          </div>
          <CardDescription className="text-body-sm line-clamp-3">
            {bid.proposal}
          </CardDescription>
        </CardContent>
        {isTaskOwner && bid.status === "PENDING" && (
          <CardFooter className="p-4 pt-0 flex justify-end">
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
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
