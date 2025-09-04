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

interface EarningsData {
  month: string;
  earnings: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  title?: string;
  description?: string;
}

export function EarningsChart({
  data,
  title = "Monthly Earnings Overview",
  description = "Your earnings performance over the last few months.",
}: EarningsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader>
          <CardTitle className="text-h3 font-bold text-neutral-800">
            {title}
          </CardTitle>
          <CardDescription className="text-body-md text-neutral-600">
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
                  className="text-body-sm text-neutral-600"
                />
                <YAxis className="text-body-sm text-neutral-600" />
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
    </motion.div>
  );
}
