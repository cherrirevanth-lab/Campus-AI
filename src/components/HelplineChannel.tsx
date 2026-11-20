import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  author_name: string | null;
  author_role: string | null;
  author_ref: string | null;
}

export function HelplineChannel() {
  const { user, profile, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error: err } = await supabase
      .from("helpline_messages")
      .select("id,user_id,body,created_at,author_name,author_role,author_ref")
      .order("created_at", { ascending: true })
      .limit(200);
    if (err) {
      setError(err.message);
      return;
    }
    setMessages((data ?? []) as Message[]);
  }

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("helpline")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "helpline_messages" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function send(e: FormEvent) {
    e.preventDefault();
    const body = text.trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 1000);
    if (!user || !body) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("helpline_messages").insert({
      user_id: user.id,
      body,
      author_name: profile?.name ?? "Member",
      author_role: profile?.role ?? "member",
      author_ref: profile?.roll_number ?? profile?.employee_id ?? null,
    });
    if (err) setError(err.message);
    else setText("");
    setBusy(false);
    void load();
  }


  async function remove(id: string) {
    await supabase.from("helpline_messages").delete().eq("id", id);
    void load();
  }

  return (
    <section className="card-elevated p-4">
      <h2 className="text-sm font-semibold">Helpline channel</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        A private line to campus staff. Your messages are visible only to you and the admin team,
        and each one shows your name, role and ID so staff know who is asking.
      </p>

      <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {messages.map((m) => {
          const identity = m.author_ref ?? "";
          const mine = m.user_id === user?.id;
          return (
            <li key={m.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">
                  {m.author_name ?? "Member"}
                  <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {m.author_role ?? "member"}
                    {identity ? ` - ${identity}` : ""}
                  </span>
                </p>

                <span className="text-[10px] text-muted-foreground">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{m.body}</p>
              {mine || isAdmin ? (
                <button
                  type="button"
                  onClick={() => void remove(m.id)}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" aria-hidden /> Delete
                </button>
              ) : null}
            </li>
          );
        })}
        {messages.length === 0 ? (
          <li className="text-sm text-muted-foreground">No messages yet. Start the conversation.</li>
        ) : null}
      </ul>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      <form className="mt-3 flex items-center gap-2" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Ask as ${profile?.name ?? "yourself"}...`}
          className="field flex-1"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          Send
        </button>
      </form>
    </section>
  );
}
