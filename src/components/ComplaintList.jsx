import React, { useMemo, useState } from "react";
import ComplaintCard from "./ComplaintCard";
import "./components.css";

const complaints = [
  {
    name: "Rahul Kumar",
    room: "C307",
    date: "Nov 8, 2025",
    tags: ["Urgent", "Open"],
    status: "In Progress",
    content: "Wi-Fi not working in my room since yesterday",
  },
  {
    name: "Priya Sharma",
    room: "C310",
    date: "Nov 7, 2025",
    tags: ["Open"],
    status: "Open",
    content: "Bathroom tap is leaking continuously",
  },
  {
    name: "Amit Singh",
    room: "C308",
    date: "Nov 6, 2025",
    tags: ["Resolved"],
    status: "Resolved",
    content: "Air conditioner not cooling properly",
  },
];

export default function ComplaintList() {
  const [activeTag, setActiveTag] = useState("All");

  // derive unique tags from complaints
  const tags = useMemo(() => {
    const s = new Set();
    complaints.forEach((c) => c.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const visibleComplaints = useMemo(() => {
    if (activeTag === "All") return complaints;
    return complaints.filter((c) => c.tags?.includes(activeTag));
  }, [activeTag]);

  return (
    <section className="card">
      <div className="complaint-header-bar">
        <h2>💬 Public Complaints</h2>
        <button className="btn">+ Add Complaint</button>
      </div>

      <div className="filter-buttons">
        {[["All"], tags].flat().map((f) => (
          <button
            key={f}
            onClick={() => setActiveTag(f)}
            className={`filter-btn ${f === activeTag ? "active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      {visibleComplaints.map((c) => (
        <ComplaintCard key={c.name} {...c} />
      ))}
    </section>
  );
}
