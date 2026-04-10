import LogoutButton from "../components/LogoutButton";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Hillview School Reports</div>
        <nav className="top-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/reports">Reports</a>
          <LogoutButton />
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
