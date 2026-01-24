import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface UseProfileResult {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useProfile(): UseProfileResult {
  const { data: session, status } = useSession();
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not authenticated, don't fetch profile
    if (status === "unauthenticated") {
      setLoading(false);
      setData(null);
      return;
    }

    // If still loading session, wait
    if (status === "loading") {
      return;
    }

    // If authenticated, use session data directly
    if (status === "authenticated" && session?.user) {
      const sessionUser = session.user as { id?: string; email?: string; name?: string; role?: string };
      setData({
        _id: sessionUser.id,
        name: sessionUser.name || undefined,
        email: sessionUser.email || undefined,
        role: sessionUser.role,
      });
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [session, status]);

  return { data, loading, error };
}
