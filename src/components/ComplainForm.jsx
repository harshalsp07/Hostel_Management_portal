import React, { useState } from "react";
import "./components.css";

export default function ComplainForm({ onSubmit }) {
	const [name, setName] = useState("");
	const [room, setRoom] = useState("");
	const [type, setType] = useState("");
	const [details, setDetails] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		// basic validation
		if (!name.trim()) {
			setError("Please enter your name.");
			return;
		}
		if (!type) {
			setError("Please select a complaint type.");
			return;
		}

		const payload = {
			name: name.trim(),
			room: room.trim() || null,
			type,
			details: details.trim() || null,
			createdAt: new Date().toISOString(),
		};

		try {
			setLoading(true);
			// If parent provided an onSubmit handler, call it (can be async).
			if (onSubmit) {
				await onSubmit(payload);
			} else {
				// fallback: log to console (replace with API call as needed)
				console.log("Complaint submitted:", payload);
			}

			setSuccess("Complaint submitted successfully.");
			// reset form
			setName("");
			setRoom("");
			setType("");
			setDetails("");
		} catch (err) {
			console.error(err);
			setError("Failed to submit complaint. Try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card">
			<div className="complaint-header-bar">
				<h2>Submit a Complaint</h2>
			</div>

			<form className="complain-form" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
				{error && (
					<div style={{ color: "#b91c1c", marginBottom: 8 }}>{error}</div>
				)}
				{success && (
					<div style={{ color: "#16a34a", marginBottom: 8 }}>{success}</div>
				)}

				<div className="form-field" style={{ marginBottom: 10 }}>
					<label htmlFor="name">Name <span style={{ color: "#ef4444" }}>*</span></label>
					<input
						id="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Your full name"
						required
						style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
					/>
				</div>

				<div className="form-field" style={{ marginBottom: 10 }}>
					<label htmlFor="room">Room No. (optional)</label>
					<input
						id="room"
						type="text"
						value={room}
						onChange={(e) => setRoom(e.target.value)}
						placeholder="e.g., B307"
						style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
					/>
				</div>

				<div className="form-field" style={{ marginBottom: 10 }}>
					<label htmlFor="type">Type of Complaint <span style={{ color: "#ef4444" }}>*</span></label>
					<select
						id="type"
						value={type}
						onChange={(e) => setType(e.target.value)}
						required
						style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
					>
						<option value="">-- Select --</option>
						<option value="Electrician">Electrician</option>
						<option value="Plumber">Plumber</option>
						<option value="AC Issue">AC Issue</option>
						<option value="Carpenter">Carpenter</option>
						<option value="Other">Other</option>
					</select>
				</div>

				<div className="form-field" style={{ marginBottom: 10 }}>
					<label htmlFor="details">More info about the problem</label>
					<textarea
						id="details"
						value={details}
						onChange={(e) => setDetails(e.target.value)}
						placeholder="Describe the issue in a few lines"
						rows={4}
						style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
					/>
				</div>

				<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
					<button className="btn" type="submit" disabled={loading}>
						{loading ? "Submitting..." : "Submit"}
					</button>
				</div>
			</form>
		</div>
	);
}

