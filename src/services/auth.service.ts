import { supabase } from "@/integrations/supabase/client";
import { CAMPUS } from "@/data/campus";
import type { Profile, UserRole } from "@/types";

/**
 * Accounts are created with a real email address. Legacy accounts created
 * before this change used `<identifier>@sietk.edu.in`, so a bare identifier
 * typed into the sign-in box still resolves to that address.
 */
export function toLoginEmail(input: string): string {
  const clean = input.trim().toLowerCase();
  return clean.includes("@") ? clean : `${clean}${CAMPUS.emailDomain}`;
}

export interface SignUpInput {
  email: string;
  identifier: string;
  password: string;
  name: string;
  role: Exclude<UserRole, "admin">;
  department: string;
  year?: string;
}

export const authService = {
  async signIn(emailOrIdentifier: string, password: string) {
    return supabase.auth.signInWithPassword({
      email: toLoginEmail(emailOrIdentifier),
      password,
    });
  },

  async signUp(input: SignUpInput) {
    const isStudent = input.role === "student";
    return supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: input.name,
          role: input.role,
          department: input.department,
          year: isStudent ? (input.year ?? "") : "",
          roll_number: isStudent ? input.identifier.trim().toUpperCase() : "",
          employee_id: isStudent ? "" : input.identifier.trim().toUpperCase(),
        },
      },
    });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data as Profile) ?? null;
  },

  async updateProfile(userId: string, patch: Partial<Profile>) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) throw error;
  },
};
