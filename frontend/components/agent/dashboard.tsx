"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentOverview } from "@/components/agent/overview";
import { AgentProperties } from "@/components/agent/properties";
import { AgentBookings } from "@/components/agent/bookings";


export function AgentDashboard() {
  const [_activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AgentOverview />
        </TabsContent>

        <TabsContent value="properties">
          <AgentProperties />
        </TabsContent>

        <TabsContent value="bookings">
          <AgentBookings />
        </TabsContent>

        {/* <TabsContent value="users">
          <AgentUsers />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
