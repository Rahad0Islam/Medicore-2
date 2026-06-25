// src/pages/admin/AdminDashboard.jsx
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 40 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin Portal</p>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Welcome, {user?.name}</h1>
        <div className="accent-line" />
        <div className="card" style={{ marginTop: 32, padding: 24 }}>
          <p style={{ color: "var(--text-muted)" }}>
            Admin features (doctor approval, user management) coming soon.
          </p>
        </div>
      </div>
    </>
  );
}