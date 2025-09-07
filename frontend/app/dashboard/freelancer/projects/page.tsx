import { Metadata } from "next";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/lib/types";
import { FreelancerProjectsClient } from "@/components/dashboard/FreelancerProjectsClient";

export const metadata: Metadata = {
  title: "My Projects - Freelancer Dashboard",
  description: "Manage your projects on the Micro Freelance Marketplace.",
};

export default function FreelancerProjectsPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.FREELANCER]}>
      <FreelancerProjectsClient />
    </ProtectedRoute>
  );
}
