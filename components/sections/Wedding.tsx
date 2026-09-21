"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { weddingInfo } from "@/data/wedding";

const DOWS = ["S", "M", "T", "W", "T", "F", "S"];

type CalendarCell =
  | { blank: true; key: string }
  | { blank: false; key: string; day: number; isTarget: boolean };

function buildCalendarDays(year: number, month: number, targetDay: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks: CalendarCell[] = Array.from({ length: firstDay }, (_, i) => ({ blank: true, key: `b${i}` }));
  const days: CalendarCell[] = Array.from({ length: daysInMonth }, (_, i) => ({
    blank: false,
    key: `d${i + 1}`,
    day: i + 1,
    isTarget: i + 1 === targetDay,
  }));
  return [...blanks, ...days];
}

export default function Wedding() {
  const { date } = weddingInfo;
  const [ddayText, setDdayText] = useState("D-000");

  useEffect(() => {
    const weddingDate = new Date(date.year, date.month, date.day);
    const today = new Date();
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.round((weddingDate.getTime() - t0.getTime()) / 86400000);
    if (diffDays > 0) setDdayText(`D-${diffDays}`);
    else if (diffDays === 0) setDdayText("D-DAY");
    else setDdayText(`D+${Math.abs(diffDays)}`);
  }, [date]);

  const calendarDays = buildCalendarDays(date.year, date.month, date.day);

  return (
    <section id="wedding" className="section wedding section-pad" data-theme="light">
      <div className="wedding-body">
        <div>
          <Reveal as="p" className="eyebrow">
            03 — Wedding
          </Reveal>
          <Reveal as="h2" className="wedding-date">
            {weddingInfo.dateLabel}
            <span>{weddingInfo.dowLabel}</span>
          </Reveal>
          <Reveal as="p" className="wedding-time">
            {weddingInfo.timeLabel}
          </Reveal>
          <Reveal as="div" className="dday">
            <span id="ddayNumber">{ddayText}</span>
            <span className="dday-label">Until we say &quot;I do&quot;</span>
          </Reveal>
        </div>
        <Reveal as="div" className="calendar" aria-hidden="true">
          <div className="calendar-head">
            <span>DEC</span>
            <span>{date.year}</span>
          </div>
          <div className="calendar-grid" id="calendarGrid">
            {DOWS.map((d, i) => (
              <span className="cal-dow" key={`dow${i}`}>
                {d}
              </span>
            ))}
            {calendarDays.map((cell) =>
              cell.blank ? (
                <span className="cal-day is-blank" key={cell.key} />
              ) : (
                <span className={`cal-day${cell.isTarget ? " is-target" : ""}`} key={cell.key}>
                  {cell.day}
                </span>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
