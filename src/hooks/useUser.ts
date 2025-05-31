import { useState, useEffect } from "react";

interface User {
  UserId: number;
  FullName: string;
  BirthDate: string;
  Phone: string;
  DNI: string;
  Email: string;
  Role: string;
}

export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed.user);
    }
  }, []);

  return user;
}
