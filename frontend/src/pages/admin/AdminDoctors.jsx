// src/pages/admin/AdminDoctors.jsx

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { apiRequest, getErrorMessage } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";

// Only the actionable buckets — "All Doctors" was removed because every row
// is either pending or approved, so this view stays focused on what the
// admin can act on.
const TABS = [
  { key: "pending",  label: "Pending Approval", path: ENDPOINTS.adminDoctorsPending },
  { key: "approved", label: "Approved",         path: ENDPOINTS.adminDoctorsApproved },
];

export default function AdminDoctors() {
  const [tab, setTab] = useState("pending");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [busy, setBusy] = useState({});

  async function loadDoctors(path) {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest(path, { auth: true });
      setDoctors(res?.data ?? res ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const active = TABS.find((t) => t.key === tab);
    if (active) loadDoctors(active.path);
  }, [tab]);

  async function handleAction(doctor, action) {
    const rowKey = doctor.doctorId ?? doctor.userId;
    setBusy((b) => ({ ...b, [rowKey]: action }));
    try {
      const path = action === "approve"
        ? ENDPOINTS.approveDoctor(doctor.doctorId ?? doctor.userId)
        : ENDPOINTS.disapproveDoctor(doctor.doctorId ?? doctor.userId);
      await apiRequest(path, { method: "PATCH", auth: true });
      const active = TABS.find((t) => t.key === tab);
      if (active) await loadDoctors(active.path);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next[rowKey];
        return next;
      });
    }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div>
            <p className="section-eyebrow role-admin">Admin Portal</p>
            <h1 className="page-title">Doctor Approvals</h1>
            <p className="page-subtitle">
              Review credentials, then approve or disapprove doctors.
            </p>
          </div>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span>{error}</span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                const active = TABS.find((t) => t.key === tab);
                if (active) loadDoctors(active.path);
              }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="page-subtitle">Loading doctors…</p>
        ) : doctors.length === 0 ? (
          <div className="card empty-state">
            <p className="empty-state__icon"><i className="bi bi-heart-pulse-fill"></i></p>
            <p>
              {tab === "pending"
                ? "No doctors are awaiting approval."
                : "No approved doctors yet."}
            </p>
          </div>
        ) : (
          <div className="mc-table-wrap">
            <table className="mc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Qualification</th>
                  <th>Location</th>
                  <th>Fee</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => {
                  const rowKey = doc.doctorId ?? doc.userId;
                  const isApproved = !!doc.approval;
                  const action = isApproved ? "disapprove" : "approve";
                  const busyForRow = busy[rowKey];
                  return (
                    <tr key={rowKey}>
                      <td>{doc.name ?? doc.userId ?? "—"}</td>
                      <td>
                        <span className="badge badge-accent">
                          {doc.specialization ?? "—"}
                        </span>
                      </td>
                      <td>{doc.qualification ?? "—"}</td>
                      <td>{doc.location ?? "—"}</td>
                      <td>${doc.visitingFee ?? doc.visiting_fee ?? "—"}</td>
                      <td>{doc.rating ?? "—"}</td>
                      <td>
                        <span className={`badge ${isApproved ? "badge-success" : "badge-warning"}`}>
                          {isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className={`btn btn-sm ${isApproved ? "btn-ghost" : "btn-primary"}`}
                          disabled={!!busyForRow}
                          onClick={() => handleAction(doc, action)}
                        >
                          {busyForRow === action
                            ? (isApproved ? "Disapproving…" : "Approving…")
                            : (isApproved ? "Disapprove" : "Approve")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
