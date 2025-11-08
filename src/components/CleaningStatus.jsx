import React from "react";
import "./components.css";

export default function CleaningStatus() {
  return (
    <section className="card ">
      <h2>🧹 My Room Cleaning Status</h2>
      <div className="cleaning-box ">
        <div>
          <h3>Room C307</h3>
          <p>
            <b>Last cleaned:</b> Today, 10:00 AM
          </p>
          <p>
            <b>Next scheduled:</b> Tomorrow, 10:00 AM
          </p>
        </div>
        <span className="status cleaned ">Cleaned</span>
      </div>
    </section>
  );
}
