// frontend/lib/api-server.ts
import axios from "axios";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

/**
 * Creates an Axios instance for use in Server Components.
 * It automatically reads and forwards authentication cookies from the incoming request.
 */
export const getApiWithAuth = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let cookieHeader = "";
  if (accessToken) cookieHeader += `accessToken=${accessToken}; `;
  if (refreshToken) cookieHeader += `refreshToken=${refreshToken};`;

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      // Forward cookies to the backend API
      Cookie: cookieHeader,
    },
  });

  return api;
};
