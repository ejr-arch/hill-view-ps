import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>School Report Management System</h1>
        <p>
          Secure, automated reporting for Nursery and Primary levels. Role-based
          access is enforced automatically from the logged-in account.
        </p>
        <div className="cta-row">
          <Link className="button primary" href="/login">
            Sign In
          </Link>
          <Link className="button ghost" href="/dashboard">
            Open Dashboard
          </Link>
        </div>
      </div>
      <div className="hero-panel">
        <div className="panel-card">
          <h3>Teacher View</h3>
          <p>Enter marks, edit before submission, and review class performance.</p>
        </div>
        <div className="panel-card">
          <h3>Admin View</h3>
          <p>Manage classes, monitor submissions, and generate report cards.</p>
        </div>
      </div>
    </section>
  );
}
