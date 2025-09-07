import { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/lib/types";
import { ClientProjectsClient } from "@/components/dashboard/ClientProjectsClient";

export const metadata: Metadata = {
  title: "My Projects - Client Dashboard",
  description:
    "Manage your posted projects on the Micro Freelance Marketplace.",
};

export default function ClientProjectsPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
      <ClientProjectsClient />
    </ProtectedRoute>
  );
}
