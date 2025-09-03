export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fullUrl = url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_API_URL}${
        url.startsWith("/") ? url : `/${url}`
      }`;

  try {
    console.log(`Fetching from: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.log("Unauthorized request, redirecting to login");

      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth/login";
      }
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", errorData);
      throw new Error(errorData.message || "An error occurred");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

export const apiGet = (url: string, options?: RequestInit) =>
  fetchWithAuth(url, { method: "GET", ...options });

export const apiPost = (url: string, data: any, options?: RequestInit) =>
  fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });

export const apiPut = (url: string, data: any, options?: RequestInit) =>
  fetchWithAuth(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });

export const apiDelete = (url: string, options?: RequestInit) =>
  fetchWithAuth(url, { method: "DELETE", ...options });
