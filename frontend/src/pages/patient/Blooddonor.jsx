import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { apiRequest, getErrorMessage } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Standard gap required between whole-blood donations. Adjust here if the
// blood bank's policy differs.
const DONATION_COOLDOWN_MONTHS = 4;

function monthsBetween(fromDateStr, toDate) {
  const from = new Date(fromDateStr);
  if (Number.isNaN(from.getTime())) return Infinity;
  let months = (toDate.getFullYear() - from.getFullYear()) * 12 + (toDate.getMonth() - from.getMonth());
  if (toDate.getDate() < from.getDate()) months -= 1;
  return months;
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(d) {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function BloodDonor() {
  const { user } = useAuth();

  const [lastdate, setLastdate] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerAlert, setRegisterAlert] = useState({ type: "", message: "" });

  const [donorProfile, setDonorProfile] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [bloodGroup, setBloodGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchedOnce, setSearchedOnce] = useState(false);

  const [activeTab, setActiveTab] = useState("register");

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await apiRequest(ENDPOINTS.myDonation, { auth: true });
      const data = res?.data ?? (res && res.lastdate ? res : null);
      if (res?.success === false || !data || !data.lastdate) {
        setDonorProfile(null);
      } else {
        setDonorProfile(data);
      }
    } catch {
      setDonorProfile(null);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const monthsSinceLast = donorProfile?.lastdate ? monthsBetween(donorProfile.lastdate, new Date()) : null;
  const isEligibleAgain = monthsSinceLast === null ? true : monthsSinceLast >= DONATION_COOLDOWN_MONTHS;
  const nextEligibleDate = donorProfile?.lastdate ? addMonths(donorProfile.lastdate, DONATION_COOLDOWN_MONTHS) : null;
  const isReturningDonor = !!donorProfile;

  async function handleRegister(e) {
    e.preventDefault();
    if (!lastdate) {
      setRegisterAlert({ type: "error", message: "Please enter your last donation date." });
      return;
    }

    setRegisterAlert({ type: "", message: "" });
    setRegisterLoading(true);

    try {
      const endpoint = isReturningDonor ? ENDPOINTS.updateDonationDate : ENDPOINTS.donorRegister;
      const res = await apiRequest(endpoint, {
        method: "POST",
        body: { lastdate },
        auth: true,
      });
      if (res.success) {
        setDonorProfile(res.data ?? {
          bloodBankId: donorProfile?.bloodBankId ?? "—",
          name: user?.name ?? "Donor",
          contactNo: user?.contactNo ?? "—",
          donorId: user?.id ?? user?._id ?? "—",
          lastdate,
          bloodgroup: user?.blood_group ?? donorProfile?.bloodgroup ?? "—",
        });
        setRegisterAlert({
          type: "success",
          message: res.message ?? (isReturningDonor ? "Donation date updated — thank you!" : "Donor profile registered successfully!"),
        });
        setLastdate("");
      } else {
        setRegisterAlert({ type: "error", message: res.message ?? "Registration failed." });
      }
    } catch (err) {
      setRegisterAlert({ type: "error", message: getErrorMessage(err) });
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!bloodGroup) return;

    setSearchError("");
    setDonors([]);
    setSearchLoading(true);
    setSearchedOnce(false);

    try {
      const res = await apiRequest(ENDPOINTS.donorsByGroup(bloodGroup), { auth: true });
      if (res?.success) setDonors(res.data ?? []);
      else setSearchError(res?.message ?? "Failed to find donors.");
    } catch (err) {
      setSearchError(getErrorMessage(err));
    } finally {
      setSearchLoading(false);
      setSearchedOnce(true);
    }
  }

  function handleBloodGroupChange(e) {
    setBloodGroup(e.target.value);
    setDonors([]);
    setSearchError("");
    setSearchedOnce(false);
  }

  return (
    <>
      <Navbar />
      <div className="container donor-page">
        <div className="page-header">
          <p className="section-eyebrow role-patient">Patient Portal</p>
          <h1 className="page-title">Blood Donor</h1>
          <div className="accent-line"></div>
          <p className="page-subtitle">Register as a blood donor or find donors by blood group.</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            <i className="bi bi-droplet-fill" style={{ marginRight: 6 }}></i>
            Register as Donor
          </button>
          <button
            className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("search");
              setSearchError("");
              setDonors([]);
              setSearchedOnce(false);
            }}
          >
            <i className="bi bi-search" style={{ marginRight: 6 }}></i>
            Find Donors
          </button>
        </div>

        {activeTab === "register" && (
          <div className="tab-panel">
            {statusLoading ? (
              <p className="page-subtitle">Checking your donor status…</p>
            ) : (
              <>
                {isReturningDonor && (
                  <div className="donor-info-strip">
                    <span className="donor-info-strip__icon"><i className="bi bi-droplet-fill"></i></span>
                    <div>
                      <p className="donor-info-strip__label">Donor Status</p>
                      <p className="donor-info-strip__value">
                        {isEligibleAgain ? "Registered and eligible to donate again" : "Registered, thank you!"}
                      </p>
                    </div>
                  </div>
                )}

                {registerAlert.message && (
                  <div className={`alert ${registerAlert.type === "success" ? "alert-success" : "alert-error"}`} style={{ marginTop: isReturningDonor ? 12 : 0 }}>
                    {registerAlert.message}
                  </div>
                )}

                {isReturningDonor && !isEligibleAgain ? (
                  <>
                    <div className="alert alert-info" style={{ marginTop: 12 }}>
                      <i className="bi bi-hourglass-split" style={{ marginRight: 8 }}></i>
                      Your last donation was on {formatDate(donorProfile.lastdate)}. Since blood needs about
                      {" "}{DONATION_COOLDOWN_MONTHS} months to fully replenish, you can register again on{" "}
                      <strong>{formatDate(nextEligibleDate)}</strong>.
                    </div>

                    <div className="mc-table-wrap" style={{ marginTop: 16 }}>
                      <table className="mc-table">
                        <thead>
                          <tr>
                            <th>Blood Bank ID</th>
                            <th>Name</th>
                            <th>Blood Group</th>
                            <th>Contact</th>
                            <th>Last Donated</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{donorProfile.bloodBankId}</td>
                            <td>{donorProfile.name}</td>
                            <td><span className="badge role-patient">{donorProfile.bloodgroup}</span></td>
                            <td>{donorProfile.contactNo}</td>
                            <td>{formatDate(donorProfile.lastdate)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="form-max-width">
                    {isReturningDonor && isEligibleAgain && (
                      <div className="alert alert-success" style={{ marginTop: 12, marginBottom: 4 }}>
                        <i className="bi bi-check-circle-fill" style={{ marginRight: 8 }}></i>
                        It's been {monthsSinceLast} month{monthsSinceLast !== 1 ? "s" : ""} since your last donation —
                        you're eligible to update your record whenever you donate again.
                      </div>
                    )}

                    {!isReturningDonor && user?.blood_group && (
                      <div className="donor-info-strip">
                        <span className="donor-info-strip__icon"><i className="bi bi-droplet-fill"></i></span>
                        <div>
                          <p className="donor-info-strip__label">Your Blood Group</p>
                          <p className="donor-info-strip__value">{user.blood_group}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleRegister}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="lastdate">Last Donation Date</label>
                        <input
                          id="lastdate"
                          type="date"
                          className="form-control"
                          value={lastdate}
                          onChange={(e) => setLastdate(e.target.value)}
                          max={new Date().toISOString().split("T")[0]}
                        />
                        <p className="form-hint">
                          {isReturningDonor
                            ? "Enter the date of your most recent donation to update your record."
                            : "Enter when you last donated blood, or today if this is your first time."}
                        </p>
                      </div>

                      <button type="submit" className="btn btn-primary" disabled={registerLoading}>
                        {registerLoading
                          ? (isReturningDonor ? "Updating…" : "Registering…")
                          : (isReturningDonor ? "Update Donation Date" : "Register as Donor")}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "search" && (
          <div className="tab-panel">
            <form className="form-row" onSubmit={handleSearch}>
              <div className="form-group">
                <label className="form-label" htmlFor="blood_group_select">Blood Group</label>
                <select
                  id="blood_group_select"
                  className="form-control"
                  value={bloodGroup}
                  onChange={handleBloodGroupChange}
                >
                  <option value="">— Select blood group —</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={!bloodGroup || searchLoading}>
                {searchLoading ? "Searching…" : "Search"}
              </button>
            </form>

            {searchError && (
              <div className="alert alert-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span>{searchError}</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => bloodGroup && handleSearch({ preventDefault: () => {} })}
                >
                  Retry
                </button>
              </div>
            )}

            {searchedOnce && !searchLoading && !searchError && (
              <>
                <p className="search-meta">
                  {donors.length === 0
                    ? `No donors found for blood group ${bloodGroup}.`
                    : `${donors.length} donor${donors.length !== 1 ? "s" : ""} found for ${bloodGroup}`}
                </p>

                {donors.length > 0 && (
                  <div className="mc-table-wrap">
                    <table className="mc-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Blood Group</th>
                          <th>Contact</th>
                          <th>Last Donated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donors.map((donor) => (
                          <tr key={donor.bloodBankId}>
                            <td>{donor.name}</td>
                            <td><span className="badge role-patient">{donor.bloodgroup}</span></td>
                            <td>{donor.contactNo}</td>
                            <td>{donor.lastdate ? new Date(donor.lastdate).toLocaleDateString() : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}