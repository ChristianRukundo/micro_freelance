export interface ApiError {
  status: number;
  message: string;
  data?: any;
  requiresLogin?: boolean;
}

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
    refreshToken = localStorage.getItem("refreshToken");
  }

  const fullUrl = url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_API_URL}${
        url.startsWith("/") ? url : `/${url}`
      }`;

  const makeRequest = async (token: string | null): Promise<Response> => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || "Request failed",
          data: errorData,
        } as ApiError;
      }

      return response;
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  };

  try {
    let response = await makeRequest(accessToken);

    
    if (response.status === 401 && refreshToken) {
      try {
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (!refreshResponse.ok) {
          throw new Error("Failed to refresh token");
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          await refreshResponse.json();

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        response = await makeRequest(newAccessToken);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        throw {
          status: 401,
          message: "Session expired. Please log in again.",
          requiresLogin: true,
        } as ApiError;
      }
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}


export const apiGet = <T>(url: string, options?: RequestInit): Promise<T> =>
  fetchWithAuth<T>(url, { method: "GET", ...options });

export const apiPost = <T>(
  url: string,
  data: any,
  options?: RequestInit
): Promise<T> =>
  fetchWithAuth<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });

export const apiPut = <T>(
  url: string,
  data: any,
  options?: RequestInit
): Promise<T> =>
  fetchWithAuth<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });

export const apiPatch = <T>(
  url: string,
  data: any,
  options?: RequestInit
): Promise<T> =>
  fetchWithAuth<T>(url, {
    method: "PATCH",
    body: JSON.stringify(data),
    ...options,
  });

export const apiDelete = <T>(url: string, options?: RequestInit): Promise<T> =>
  fetchWithAuth<T>(url, { method: "DELETE", ...options });
