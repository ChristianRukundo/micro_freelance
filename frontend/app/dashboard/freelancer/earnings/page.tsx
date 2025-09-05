import { Metadata } from "next";
import FreelancerEarningsClientPage from "./earnings-client";

export const metadata: Metadata = {
  title: "Freelancer Earnings - Micro Freelance Marketplace",
  description: "View your earnings history and financial performance.",
};

export default function FreelancerEarningsPage() {
  return <FreelancerEarningsClientPage />;
}