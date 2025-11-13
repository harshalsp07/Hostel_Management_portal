
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function FullCalendarExample() {
  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={[{ title: "Conference", date: "2025-07-07" }]}
      height="auto"
    />
  );
}
