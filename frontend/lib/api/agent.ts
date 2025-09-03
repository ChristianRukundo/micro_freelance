import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/api-utils";
import type {
  Property,
  User,
  Booking,
  AgentStats,
  PropertyFormData,
  ApiResponse,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useAgentStats() {
  const { toast } = useToast();

  return useQuery<ApiResponse<AgentStats>, Error>({
    queryKey: ["agentStats"],
    queryFn: async () => {
      try {
        const res = await apiGet<ApiResponse<AgentStats>>("/agent/stats");
        if (res?.error) {
          throw new Error(res.error);
        }
        return res;
      } catch (error) {
        toast({
          title: "Error fetching agent stats",
          description: (error as Error).message || "An unknown error occurred.",
          variant: "destructive",
        });
        throw error; // Re-throw to propagate the error for useQuery to mark as failed
      }
    },
  });
}

export function useAgentProperties() {
  const { toast } = useToast();

  return useQuery<ApiResponse<Property[]>, Error>({
    queryKey: ["agentProperties"],
    queryFn: async () => {
      try {
        const res = await apiGet<ApiResponse<Property[]>>("/agent/properties");
        if (res?.error) {
          throw new Error(res.error);
        }
        return res;
      } catch (error) {
        toast({
          title: "Error fetching agent properties",
          description: (error as Error).message || "An unknown error occurred.",
          variant: "destructive",
        });
        throw error;
      }
    },
  });
}

// Renamed to follow convention and indicate it's not a hook
const getAgentBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const res = await apiGet<ApiResponse<Booking[]>>("/agent/bookings");
  if (res?.error) {
    throw new Error(res.error);
  }
  return res;
};

export function useAgentBookings() {
  const { toast } = useToast();

  return useQuery<ApiResponse<Booking[]>, Error>({
    queryKey: ["agentBookings"],
    queryFn: async () => {
      try {
        return await getAgentBookings();
      } catch (error) {
        toast({
          title: "Error fetching agent bookings",
          description: (error as Error).message || "An unknown error occurred.",
          variant: "destructive",
        });
        throw error;
      }
    },
  });
}

// Renamed to follow convention and indicate it's not a hook
const getAgentUsers = async (): Promise<ApiResponse<User[]>> => {
  const res = await apiGet<ApiResponse<User[]>>("/agent/users");
  if (res?.error) {
    throw new Error(res.error);
  }
  return res;
};

export function useAgentUsers() {
  const { toast } = useToast();

  return useQuery<ApiResponse<User[]>, Error>({
    queryKey: ["agentUsers"],
    queryFn: async () => {
      try {
        return await getAgentUsers();
      } catch (error) {
        toast({
          title: "Error fetching agent users",
          description: (error as Error).message || "An unknown error occurred.",
          variant: "destructive",
        });
        throw error;
      }
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Property>, Error, PropertyFormData>({
    mutationFn: async (propertyData: PropertyFormData) => {
      const res = await apiPost<ApiResponse<Property>>(
        "/agent/properties",
        propertyData
      );
      if (res?.error) {
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentProperties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Property created",
        description: "Property has been successfully created.",
      });
    },
    onError: (error) => {
      console.error("Error creating property:", error);
      toast({
        title: "Error creating property",
        description: (error as Error)?.message || "Failed to create property.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ApiResponse<Property>,
    Error,
    { id: string; data: Partial<PropertyFormData> }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await apiPut<ApiResponse<Property>>(
        `/agent/properties/${id}`,
        data
      );
      if (res?.error) {
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentProperties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Property updated",
        description: "Property has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating property:", error);
      toast({
        title: "Error updating property",
        description: (error as Error)?.message || "Failed to update property.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async (id: string) => {
      const res = await apiDelete<ApiResponse<void>>(`/agent/properties/${id}`);
      if (res?.error) {
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentProperties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Property deleted",
        description: "Property has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error("Error deleting property:", error);
      toast({
        title: "Error deleting property",
        description: (error as Error)?.message || "Failed to delete property.",
        variant: "destructive",
      });
    },
  });
}

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ApiResponse<Booking>,
    Error,
    { id: string; status: BookingStatus }
  >({
    mutationFn: async ({ id, status }) => {
      const res = await apiPut<ApiResponse<Booking>>(
        `/agent/bookings/${id}/status`,
        { status }
      );
      if (res?.error) {
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentBookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Booking status updated",
        description: "Booking status has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating booking status:", error);
      toast({
        title: "Error updating booking status",
        description:
          (error as Error)?.message || "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });
}

type UserRole = "USER" | "AGENT";

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<User>, Error, { id: string; role: UserRole }>({
    mutationFn: async ({ id, role }) => {
      const res = await apiPut<ApiResponse<User>>(`/agent/users/${id}/role`, {
        role,
      });
      if (res?.error) {
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentUsers"] });
      toast({
        title: "User role updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      toast({
        title: "Error updating user role",
        description: (error as Error)?.message || "Failed to update user role.",
        variant: "destructive",
      });
    },
  });
}