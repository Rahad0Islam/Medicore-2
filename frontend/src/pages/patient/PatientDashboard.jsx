// src/pages/patient/PatientDashboard.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const CARDS = [
  {
    to: "/patient/doctors",
    icon: <i className="bi bi-heart-pulse-fill"></i>,
    title: "Find a Doctor",
    desc: "Browse and filter approved doctors by specialization or location.",
  },
  {
    to: "/patient/book",
    icon: <i className="bi bi-calendar-event-fill"></i>,
    title: "Book Appointment",
    desc: "Schedule a visit and get your serial number instantly.",
  },
  {
    to: "/patient/appointments",
    icon: <i className="bi bi-calendar3"></i>,
    title: "My Appointments",
    desc: "View all appointments you have booked in one place.",
  },
  {
    to: "/patient/prescriptions",
    icon: <i className="bi bi-file-earmark-text-fill"></i>,
    title: "My Prescriptions",
    desc: "View all prescriptions issued to you, with medicine details.",
  },
  {
    to: "/patient/chat",
    icon: <i className="bi bi-chat-dots-fill"></i>,
    title: "Chat with Doctor",
    desc: "Send messages directly to your doctor.",
  },
  {
    to: "/patient/donors",
    icon: <i className="bi bi-droplet-fill"></i>,
    title: "Blood Donors",
    desc: "Find compatible blood donors near you.",
  },
];

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Patient Portal</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Welcome, {user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <div className="accent-line" />
        </div>

        {/* Quick access cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20,
          alignItems: "stretch",
        }}>
          {CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              style={{ textDecoration: "none", display: "flex" }}
            >
              <div className="card" style={{
                padding: "24px 20px",
                cursor: "pointer",
                transition: "border-color 0.15s, box-shadow 0.15s",
                borderColor: "var(--border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  fontSize: 28,
                  marginBottom: 12,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--accent-light, rgba(37,99,235,0.08))",
                }}>
                  {card.icon}
                </div>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 6,
                  textAlign: "left",
                  alignSelf: "stretch",
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                  textAlign: "left",
                  alignSelf: "stretch",
                  margin: 0,
                }}>
                  {card.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}