import { apiRequest } from "./client";

export function getHealth() {
  return apiRequest("/api/health");
}