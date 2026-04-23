"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../lib/supabaseBrowser";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <button className="btn-signout" onClick={handleLogout}>
      Sign Out
    </button>
  );
}