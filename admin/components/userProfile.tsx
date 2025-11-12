import { useEffect, useState } from "react";

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
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/users');

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const text = await response.text();
        const user = text ? JSON.parse(text) : null;

        setData(user);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { data, loading, error };
}
