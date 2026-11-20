import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types";

export interface SiteContent {
  id: string;
  slug: string;
  section: string;
  title: string;
  body: string;
  source_url: string | null;
  published: boolean;
  updated_at: string;
}

export type SiteContentPatch = Partial<
  Pick<SiteContent, "slug" | "section" | "title" | "body" | "source_url" | "published">
>;

export interface ActivityRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: string | null;
  created_at: string;
}

export const adminService = {
  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return false;
    return Boolean(data);
  },

  async listUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Profile[];
  },

  async listAdmins(): Promise<string[]> {
    const { data, error } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    if (error) throw error;
    return (data ?? []).map((r) => r.user_id as string);
  },

  async grantAdmin(userId: string) {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) throw error;
  },

  async revokeAdmin(userId: string) {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");
    if (error) throw error;
  },

  async listContent(): Promise<SiteContent[]> {
    const { data, error } = await supabase.from("site_content").select("*").order("section");
    if (error) throw error;
    return (data ?? []) as SiteContent[];
  },

  async saveContent(id: string, patch: SiteContentPatch) {
    const { error } = await supabase.from("site_content").update(patch).eq("id", id);
    if (error) throw error;
  },

  async createContent(row: Omit<SiteContent, "id" | "updated_at">) {
    const { error } = await supabase.from("site_content").insert(row);
    if (error) throw error;
  },

  async deleteContent(id: string) {
    const { error } = await supabase.from("site_content").delete().eq("id", id);
    if (error) throw error;
  },

  async listActivity(): Promise<ActivityRow[]> {
    const { data, error } = await supabase
      .from("site_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as ActivityRow[];
  },

  async log(actorId: string, action: string, entity: string, entityId?: string, detail?: string) {
    await supabase.from("site_activity").insert({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId ?? null,
      detail: detail ?? null,
    });
  },
};
