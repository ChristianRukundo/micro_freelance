import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSignIcon } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

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
  return (
    <div className="flex flex-col space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-display-md font-extrabold text-neutral-800 dark:text-neutral-100"
      >
        Spending History
      </motion.h1>
      <p className="text-body-md text-neutral-600">
        Track all your transactions and payments made on the platform.
      </p>

      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-h3 font-bold text-neutral-800">
            Transaction History
          </CardTitle>
          <DollarSignIcon className="h-6 w-6 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium">
                      {formatDate(txn.date)}
                    </TableCell>
                    <TableCell>{txn.description}</TableCell>
                    <TableCell>{txn.type.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${txn.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          txn.status === "SUCCEEDED" &&
                            "bg-success-50 text-success-600 border-success-200",
                          txn.status === "PENDING" &&
                            "bg-warning-50 text-warning-600 border-warning-200",
                          txn.status === "FAILED" &&
                            "bg-error-50 text-error-600 border-error-200"
                        )}
                      >
                        {txn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {sampleTransactions.length === 0 && (
            <div className="py-6 text-center text-body-md text-neutral-500">
              No transactions recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
