"use client";

import LogoutButton from "../components/LogoutButton";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", view: "overview" },
  { href: "/dashboard/teacher", label: "Marks Entry", view: "marks" },
  { href: "/dashboard/admin", label: "Admin", view: "admin" },
  { href: "/reports", label: "Reports", view: "reports" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const isTeacher = pathname?.startsWith("/dashboard/teacher");
  const isAdmin = pathname?.startsWith("/dashboard/admin");

  return (
    <div id="app">
      <nav className="navbar">
        <div className="nav-brand">Hill View Primary School — Reports</div>
        <LogoutButton />
      </nav>
      <div className="main">
        <aside className="sidebar">
          <a href="/dashboard" className={`nav-item ${pathname === "/dashboard" ? "active" : ""}`}>
            <span>📊</span> <span>Overview</span>
          </a>
          <a href="/dashboard/teacher" className={`nav-item ${isTeacher ? "active" : ""}`}>
            <span>📝</span> <span>Marks Entry</span>
          </a>
          <a href="/dashboard/admin" className={`nav-item ${isAdmin ? "active" : ""}`}>
            <span>⚙️</span> <span>Admin</span>
          </a>
          <a href="/reports" className={`nav-item ${pathname === "/reports" ? "active" : ""}`}>
            <span>📄</span> <span>Reports</span>
          </a>
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}