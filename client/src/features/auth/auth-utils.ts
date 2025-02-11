import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { logError } from "@/lib/error-logger";

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiRequest<User>("/api/user");
  } catch (error) {
    await logError(error as Error, "getCurrentUser");
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>("/api/logout", {
      method: "POST",
    });
    window.location.reload();
  } catch (error) {
    await logError(error as Error, "logout");
    throw error;
  }
}

export async function assignTeam(team: string): Promise<User> {
  try {
    return await apiRequest<User>("/api/assign-team", {
      method: "POST",
      body: { team },
    });
  } catch (error) {
    await logError(error as Error, "assignTeam");
    throw error;
  }
}

export function isAdmin(user: User | null): boolean {
  return user?.isAdmin ?? false;
}