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
  await apiRequest<void>("/api/logout", {
    method: "POST",
  });
  window.location.reload();
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