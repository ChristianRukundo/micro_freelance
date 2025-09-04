import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { useAuthStore } from "@/lib/zustand";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import { User, UserProfile } from "@/lib/types";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "Profile Settings - Micro Freelance Marketplace",
  description: "Manage your personal profile information.",
};

async function getUserProfileData(userId: string) {
  try {
    const response = await api.get(`/users/me`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

export default async function ProfileSettingsPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      return null;
    },
  });

  return (
    <div className="container py-8">
      <Card className="w-full shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-h2 font-bold text-neutral-800">
            Profile Settings
          </CardTitle>
          <CardDescription className="text-body-md text-neutral-600">
            Update your personal information, bio, skills, and portfolio links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6 bg-neutral-200" />
          {/* HydrationBoundary is used here if data was prefetched on server */}
          <HydrationBoundary state={dehydrate(queryClient)}>
            <ProfileForm />
          </HydrationBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
