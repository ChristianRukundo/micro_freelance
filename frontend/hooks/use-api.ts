import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  type ApiError,
} from "@/lib/api/api-utils";

export function useApiQuery<TData>(
  queryKey: readonly string[],
  url: string,
  options?: UseQueryOptions<TData, ApiError, TData, readonly string[]>
) {
  return useQuery<TData, ApiError, TData, readonly string[]>({
    queryKey,
    queryFn: () => apiGet<TData>(url),
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  url: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) => apiPost<TData>(url, variables),
    ...options,
  });
}

export function useApiPutMutation<TData, TVariables>(
  url: string,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) => apiPut<TData>(url, variables),
    ...options,
  });
}

export function useApiDeleteMutation<TData>(
  url: string,
  options?: UseMutationOptions<TData, ApiError, string>
) {
  return useMutation<TData, ApiError, string>({
    mutationFn: (id) => apiDelete<TData>(`${url}/${id}`),
    ...options,
  });
}
