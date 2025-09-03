import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/api-utils";
import type { Booking, ApiResponse } from "@/lib/types";


interface BookingFormData {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  cleaningFee: number;
  serviceFee: number;
}


export function useBookings() {
  return useQuery<ApiResponse<Booking[]>, Error>({
    queryKey: ["bookings"],
    queryFn: async () => {
      return await apiGet<ApiResponse<Booking[]>>("/bookings");
    },
  });
}

export function useBooking(id: string) {
  return useQuery<ApiResponse<Booking>, Error>({
    queryKey: ["booking", id],
    queryFn: async () => {
      return await apiGet<ApiResponse<Booking>>(`/bookings/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Booking>, Error, BookingFormData>({
    mutationFn: async (bookingData: BookingFormData) => {
      return await apiPost<ApiResponse<Booking>>("/bookings", bookingData);
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Booking>, Error, string>({
    mutationFn: async (id: string) => {
      return await apiPost<ApiResponse<Booking>>(`/bookings/${id}/cancel`, {});
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
