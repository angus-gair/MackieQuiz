import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiRequest<User>("/api/user");
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    const response = await apiRequest<{ message: string }>("/api/logout", {
      method: "POST",
    });
    const data = await response.json();
    if (data.message === "Logged out successfully" || data.message === "Already logged out") {
      window.location.reload();
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function assignTeam(team: string): Promise<User> {
  return await apiRequest<User>("/api/assign-team", {
    method: "POST",
    body: { team },
  });
}

export function isAdmin(user: User | null): boolean {
  return user?.isAdmin ?? false;
}