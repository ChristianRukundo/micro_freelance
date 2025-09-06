// frontend/components/cards/MyBidCard.tsx

"use client";

import React, { useState } from "react";
import { Bid } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DollarSignIcon,
  ClockIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/date";
import { useBids } from "@/hooks/useBids";
import { BidForm } from "@/components/forms/BidForm";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface MyBidCardProps {
  bid: Bid;
}

export function MyBidCard({ bid }: MyBidCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { withdrawBid, isWithdrawingBid } = useBids(bid.taskId);

  const handleWithdraw = async () => {
    await withdrawBid(bid.id);
  };

  return (
    <Card className="bg-primary-50 border-2 border-primary-200 shadow-md dark:bg-primary-950/30 dark:border-primary-800/50">
      <CardHeader>
        <CardTitle className="text-h5 text-primary-800 dark:text-primary-200">
          Your Bid
        </CardTitle>
        <CardDescription>
          You have submitted a proposal for this project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-body-md">
          <DollarSignIcon className="mr-2 h-5 w-5 text-primary-500" />
          <span className="font-semibold">${bid.amount.toLocaleString()}</span>
          <ClockIcon className="ml-4 mr-2 h-5 w-5" />
          <span>{formatRelativeTime(bid.createdAt)}</span>
        </div>
        <p className="text-body-sm text-muted-foreground line-clamp-4">
          {bid.proposal}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isWithdrawingBid}>
              {isWithdrawingBid ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash2Icon className="mr-2 h-4 w-4" />
              )}
              Withdraw
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to withdraw your bid?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. You can submit a new bid as long
                as the project is still open.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleWithdraw}>
                Withdraw Bid
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PencilIcon className="mr-2 h-4 w-4" /> Edit Bid
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Your Bid</DialogTitle>
              <DialogDescription>
                Update your proposal or amount. Your previous bid will be
                replaced.
              </DialogDescription>
            </DialogHeader>
            <BidForm taskId={bid.taskId} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
