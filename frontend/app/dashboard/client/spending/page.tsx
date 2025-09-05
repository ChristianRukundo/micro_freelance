import { Metadata } from "next";
import { SpendingHistoryClient } from "./SpendingHistoryClient";

export const metadata: Metadata = {
  title: "Client Spending - Micro Freelance Marketplace",
  description: "View your transaction history and spending analytics.",
};

interface Transaction {
  id: string;
  amount: number;
  status: "SUCCEEDED" | "PENDING" | "FAILED";
  type: "ESCROW_FUNDING" | "ESCROW_RELEASE" | "PLATFORM_FEE";
  date: Date;
  description: string;
}

// Sample data - replace with actual data fetching later
const sampleTransactions: Transaction[] = [
  {
    id: "txn_001",
    amount: 500.0,
    status: "SUCCEEDED",
    type: "ESCROW_FUNDING",
    date: new Date("2023-10-26"),
    description: "Funding for Website Redesign",
  },
  {
    id: "txn_002",
    amount: 150.0,
    status: "SUCCEEDED",
    type: "ESCROW_RELEASE",
    date: new Date("2023-11-05"),
    description: "Milestone 1 approval - Landing Page UI",
  },
  {
    id: "txn_003",
    amount: 25.0,
    status: "SUCCEEDED",
    type: "PLATFORM_FEE",
    date: new Date("2023-11-05"),
    description: "Platform fee for Milestone 1",
  },
  {
    id: "txn_004",
    amount: 200.0,
    status: "PENDING",
    type: "ESCROW_FUNDING",
    date: new Date("2023-12-01"),
    description: "Funding for Mobile App Mockups",
  },
  {
    id: "txn_005",
    amount: 75.0,
    status: "FAILED",
    type: "ESCROW_RELEASE",
    date: new Date("2023-12-15"),
    description: "Milestone 2 payout - Blog Content",
  },
];

export default function ClientSpendingPage() {
  return <SpendingHistoryClient transactions={sampleTransactions} />;
}
