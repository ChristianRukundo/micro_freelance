import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSignIcon, TrendingUpIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatDate } from "@/lib/date";

export const metadata: Metadata = {
  title: "Freelancer Earnings - Micro Freelance Marketplace",
  description: "View your earnings history and financial performance.",
};

interface EarningsData {
  month: string;
  earnings: number;
}

// Sample data for Recharts - replace with actual data fetching later
const sampleEarnings: EarningsData[] = [
  { month: "Jan", earnings: 400 },
  { month: "Feb", earnings: 750 },
  { month: "Mar", earnings: 600 },
  { month: "Apr", earnings: 1100 },
  { month: "May", earnings: 900 },
  { month: "Jun", earnings: 1500 },
];

export default function FreelancerEarningsPage() {
  const totalEarnings = sampleEarnings.reduce(
    (sum, item) => sum + item.earnings,
    0
  );
  const averageMonthly = (totalEarnings / sampleEarnings.length).toFixed(2);

  return (
    <div className="flex flex-col space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-display-md font-extrabold"
      >
        My Earnings
      </motion.h1>
      <p className="text-body-md">
        Track your income and financial growth over time.
      </p>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200 p-6 flex flex-col items-start">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-h4 font-bold">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex items-center">
              <DollarSignIcon className="h-8 w-8 text-primary-500 mr-2" />
              <span className="text-display-sm font-bold">
                ${totalEarnings.toLocaleString()}
              </span>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200 p-6 flex flex-col items-start">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-h4 font-bold">
                Avg. Monthly Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-primary-500 mr-2" />
              <span className="text-display-sm font-bold">
                ${averageMonthly}
              </span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Earnings Chart */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
          <CardHeader>
            <CardTitle className="text-h3 font-bold">
              Monthly Earnings Overview
            </CardTitle>
            <CardDescription className="text-body-md">
              Your earnings performance over the last few months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sampleEarnings}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis dataKey="month" className="text-body-sm" />
                  <YAxis className="text-body-sm" />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--neutral-200))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(var(--primary-500))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Placeholder for Detailed Transactions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-6"
      >
        <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
          <CardHeader>
            <CardTitle className="text-h3 font-bold">
              Detailed Payout History
            </CardTitle>
            <CardDescription className="text-body-md">
              A full breakdown of all your payouts and fees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-md">
              Detailed payout history will be displayed here, with filtering and
              search capabilities. This is a placeholder.
            </p>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
