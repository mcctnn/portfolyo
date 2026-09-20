import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/** Supabase oturumu ve yönetici olup olmadığı. isAdmin: null = henüz bilinmiyor. */
export function useAuth() {
  const [session, setSession] = useState(undefined); // undefined = yükleniyor
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!supabase) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) { setIsAdmin(null); return; }
    let alive = true;
    // admins tablosunda yalnızca kendi e-postanı görebilirsin; satır geliyorsa yöneticisin
    supabase.from("admins").select("email").limit(1).then(({ data, error }) => {
      if (alive) setIsAdmin(!error && data.length > 0);
    });
    return () => { alive = false; };
  }, [userId]);

  const signIn = useCallback(
    (email, password) => supabase.auth.signInWithPassword({ email, password }),
    [],
  );
  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return { session, isAdmin, signIn, signOut };
}
