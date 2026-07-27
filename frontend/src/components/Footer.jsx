// src/components/Footer.jsx

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mc-footer">
      <div className="container">
        <div className="mc-footer-grid">
          <div>
            <div className="mc-footer-brand">MediCore</div>
            <p className="mc-footer-blurb">
              A unified platform connecting patients, doctors, pharmacists,
              and admins for coordinated, everyday healthcare.
            </p>
          </div>

          <div>
            <div className="mc-footer-heading">Platform</div>
            <ul className="mc-footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Register</Link></li>
              <li><Link to="/">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <div className="mc-footer-heading">Resources</div>
            <ul className="mc-footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/about">Privacy Policy</Link></li>
              <li><Link to="/about">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          <div>
            <div className="mc-footer-heading">Contact</div>
            <div className="mc-footer-contact-item">
              <i className="bi bi-envelope"></i>
              <span>support@medicore.app</span>
            </div>
            <div className="mc-footer-contact-item">
              <i className="bi bi-telephone"></i>
              <span>+880 1XXX-XXXXXX</span>
            </div>
            <div className="mc-footer-contact-item">
              <i className="bi bi-geo-alt"></i>
              <span>Sylhet, Bangladesh</span>
            </div>
          </div>
        </div>

        <div className="mc-footer-bottom">
          &copy; {new Date().getFullYear()} MediCore - SWE Lab Project. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
