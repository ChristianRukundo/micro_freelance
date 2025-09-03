"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ApiError, apiGet, apiPost } from "@/lib/api/api-utils";
import type { ApiResponse, FavoriteWithProperty } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  const { toast } = useToast();

  const queryOptions: UseQueryOptions<
    ApiResponse<FavoriteWithProperty[]>,
    ApiError,
    ApiResponse<FavoriteWithProperty[]>,
    string[]
  > = {
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<FavoriteWithProperty[]>>(
        "/favorites"
      );
      if (res?.error) {
        toast({
          title: "Error fetching favorites",
          description: res.error,
          variant: "destructive",
        });
        throw new Error(res.error);
      }
      return res;
    },
  };

  return useQuery(queryOptions);
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ApiResponse<FavoriteWithProperty>,
    ApiError,
    { propertyId: string }
  >({
    mutationFn: async ({ propertyId }) => {
      const res = await apiPost<ApiResponse<FavoriteWithProperty>>(
        "/favorites",
        { propertyId }
      );
      if (res?.error) {
        toast({
          title: "Error toggling favorite",
          description: res.error,
          variant: "destructive",
        });
        throw new Error(res.error);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["featuredProperties"] });
      toast({
        title: "Favorite updated",
        description: "The favorite status of this property has been updated.",
      });
    },
    onError: (error: ApiError) => {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Failed to update favorite",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });
}
