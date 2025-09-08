"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { DollarSignIcon } from "lucide-react"; // ADDED
import { LoadingSpinner } from "../common/LoadingSpinner";

interface EarningsData {
  month: string;
  earnings: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  title?: string;
  description?: string;
  isLoading?: boolean; // ADDED
}

export function EarningsChart({
  data,
  title = "Monthly Earnings Overview",
  description = "Your earnings performance over the last few months.",
  isLoading = false, // ADDED
}: EarningsChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
            </div>
            <DollarSignIcon className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 rounded-lg animate-pulse">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader>
          <CardTitle className="text-h3 font-bold">{title}</CardTitle>
          <CardDescription className="text-body-md">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-body-md text-muted-foreground">
          No earnings data available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200 bg-gradient-to-br from-card to-muted/10">
        <CardHeader>
          <CardTitle className="text-h3 font-bold">{title}</CardTitle>
          <CardDescription className="text-body-md">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis
                  dataKey="month"
                  className="text-body-sm"
                  stroke="hsl(var(--muted-foreground))"
                />{" "}
                {/* ADDED stroke for visibility */}
                <YAxis
                  className="text-body-sm"
                  stroke="hsl(var(--muted-foreground))"
                />{" "}
                {/* ADDED stroke */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--neutral-200))" // Keep grid subtle
                  vertical={false} // Often cleaner with only horizontal grids
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-medium)", // Use theme shadow
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  cursor={{
                    stroke: "hsl(var(--primary-500))",
                    strokeWidth: 2,
                    strokeDasharray: "3 3",
                  }} // Custom cursor
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="url(#colorEarnings)" // Use gradient stroke
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "hsl(var(--primary-500))",
                    strokeWidth: 0,
                  }} // Solid dot
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--primary-600))",
                    stroke: "hsl(var(--primary-500))",
                    strokeWidth: 2,
                  }} // Larger active dot
                />
                <defs>
                  <linearGradient
                    id="colorEarnings"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary-500))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--success-500))"
                      stopOpacity={0.8}
                    />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
