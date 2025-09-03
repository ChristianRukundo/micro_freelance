import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/api-utils";
import type {
  Property,
  ApiResponse,
  PropertySearchParams,
  PropertySearchResult,
} from "@/lib/types";


export async function getPropertyById(id: string): Promise<Property> {
  const response = await apiGet<ApiResponse<Property>>(`/properties/${id}`);
  return response.data;
}


export function useProperties(params: PropertySearchParams = {}) {
  return useQuery<ApiResponse<PropertySearchResult>>({
    queryKey: ["properties", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)));
        } else if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      return await apiGet<ApiResponse<PropertySearchResult>>(
        `/properties?${searchParams.toString()}`
      );
    },
  });
}

export function useProperty(id: string) {
  return useQuery<ApiResponse<Property>>({
    queryKey: ["property", id],
    queryFn: async () => {
      return await apiGet<ApiResponse<Property>>(`/properties/${id}`);
    },
    enabled: !!id,
  });
}

export function useFeaturedProperties() {
  return useQuery<ApiResponse<Property[]>>({
    queryKey: ["featuredProperties"],
    queryFn: async () => {
      return await apiGet<ApiResponse<Property[]>>("/properties/featured");
    },
  });
}
