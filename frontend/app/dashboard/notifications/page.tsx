import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NotificationList } from "@/components/notifications/NotificationList"; // Client Component
import { BellIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications - Micro Freelance Marketplace",
  description: "View and manage all your notifications.",
};

export default function NotificationsPage() {
  return (
    <div className="container py-8">
      <Card className="w-full shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-h2 font-bold flex items-center">
            <BellIcon className="h-7 w-7 mr-3 text-primary-500" /> Notifications
          </CardTitle>
          <CardDescription className="text-body-md">
            Stay updated with your projects, bids, and platform activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6 bg-neutral-200" />
          <NotificationList />
        </CardContent>
      </Card>
    </div>
  );
}
