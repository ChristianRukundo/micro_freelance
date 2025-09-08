import { Metadata } from "next";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole, TaskStats } from "@/lib/types";
import { FreelancerProjectsClient } from "@/components/dashboard/FreelancerProjectsClient";
import * as actions from "@/lib/actions";

export const metadata: Metadata = {
  title: "My Projects - Freelancer Dashboard",
  description:
    "Manage your assigned projects on the Micro Freelance Marketplace.",
};

// This is now a Server Component that fetches initial stats
export default async function FreelancerProjectsPage() {
  const statsResponse = await actions.getMyTaskStatsAction();

  const initialStats: TaskStats = statsResponse.data || {
    OPEN: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    TOTAL: 0,
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.FREELANCER]}>
      <FreelancerProjectsClient initialStats={initialStats} />
    </ProtectedRoute>
  );
}
