import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import dayjs from "dayjs";

export default function ProviderAvailabilityCalendar({
  provider,
  onClose,
  onSlotSelect,
}) {
  const [view, setView] = useState("dayGridMonth");
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableRanges, setAvailableRanges] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const calendarRef = useRef(null);
  const [start, setStart] = useState(dayjs().startOf("month"));
  const [end, setEnd] = useState(dayjs().endOf("month"));
  const [currentViewType, setCurrentViewType] = useState("dayGridMonth");
  const [inlineMessage, setInlineMessage] = useState(null);

  useEffect(() => {
    if (inlineMessage) {
      const timeout = setTimeout(() => setInlineMessage(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [inlineMessage]);

  useEffect(() => {
    if (view === "dayGridMonth" && start && end) {
      const daysAvailable = provider.availability?.map((d) => d.day) || [];
      let evts = [];
      for (
        let d = start;
        d.isBefore(end) || d.isSame(end, "day");
        d = d.add(1, "day")
      ) {
        const weekday = d.format("dddd");
        evts.push({
          id: d.format("YYYY-MM-DD"),
          start: d.format("YYYY-MM-DD"),
          allDay: true,
          display: "background",
          backgroundColor: daysAvailable.includes(weekday)
            ? "#a7f3d0" // Tailwind green-200
            : "#fecaca", // Tailwind red-200
          borderColor: daysAvailable.includes(weekday)
            ? "#22c55e" // Tailwind green-500
            : "#ef4444", // Tailwind red-500,
        });
      }
      setEvents(evts);
    }
  }, [provider, view, start, end]);

  const getUnavailableRanges = (slots) => {
    const fullDayStart = "00:00";
    const fullDayEnd = "24:00";
    const ranges = [];
    let prevEnd = fullDayStart;

    for (let slot of slots) {
      if (slot.from > prevEnd) {
        ranges.push({ from: prevEnd, to: slot.from });
      }
      prevEnd = slot.to > prevEnd ? slot.to : prevEnd;
    }

    if (prevEnd < fullDayEnd) {
      ranges.push({ from: prevEnd, to: fullDayEnd });
    }

    return ranges;
  };

  const handleDateClick = async (info) => {
    const dateStr = info.dateStr;
    const weekday = dayjs(dateStr).format("dddd");
    const availDay = provider.availability?.find((d) => d.day === weekday);

    if (!availDay) {
      setInlineMessage({
        type: "error",
        text: "This provider is unavailable on selected date",
      });
      return;
    }

    setSelectedDate(dateStr);
    setView("timeGridDay");
    setAvailableRanges(availDay.slots);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/bookings/booked-slots?providerId=${provider._id}&date=${dateStr}`
      );
      setBookedSlots(res.data.bookedSlots || []);
    } catch (error) {
      setBookedSlots([]);
    }

    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.changeView("timeGridDay", dateStr);
    }
  };

  const timelineEvents =
    currentViewType === "timeGridDay"
      ? [
          ...(availableRanges || []).map((slot, idx) => ({
            id: `avail-${idx}`,
            start: `${selectedDate}T${slot.from}:00`,
            end: `${selectedDate}T${slot.to}:00`,
            backgroundColor: "#a7f3d0",
            borderColor: "#22c55e",
            display: "background",
            classNames: ["available-slot"],
          })),
          ...(getUnavailableRanges(availableRanges) || []).map((slot, idx) => ({
            id: `unavail-${idx}`,
            start: `${selectedDate}T${slot.from}:00`,
            end: `${selectedDate}T${slot.to}:00`,
            backgroundColor: "#fecaca",
            borderColor: "#ef4444",
            display: "background",
          })),
          ...(bookedSlots || []).map((slot, idx) => ({
            id: `booked-${idx}`,
            start: `${selectedDate}T${slot.from}:00`,
            end: `${selectedDate}T${slot.to}:00`,
            backgroundColor: "#ef4444",
            borderColor: "#dc2626",
            textColor: "white",
            classNames: ["booked-slot"],
          })),
        ]
      : events;

  // Handle slot selection (drag in green area)
  const handleSelect = (info) => {
    const from = dayjs(info.startStr).format("HH:mm");
    const to = dayjs(info.endStr).format("HH:mm");

    const isInAvailable = (availableRanges || []).some(
      (slot) => from >= slot.from && to <= slot.to && from < to
    );
    const isOverlapping = (bookedSlots || []).some(
      (slot) => from < slot.to && to > slot.from
    );

    //User selects outside availability
    if (!isInAvailable) {
      setInlineMessage({
        type: "warning",
        text: "Select a time within available hours of provider",
      });
      return;
    }

    // User clicks on a booked slot
    if (isOverlapping) {
      setInlineMessage({
        type: "warning",
        text: "This time overlaps with an existing booking time",
      });
      return;
    }

    onSlotSelect && onSlotSelect({ date: selectedDate, from, to });
  };

  // Handle clicking on available slots (for easier selection)
  const handleEventClick = (info) => {
    if (view !== "timeGridDay") return;

    // Only handle clicks on available background events
    if (info.event.id.startsWith("avail-")) {
      const slotIndex = parseInt(info.event.id.split("-")[1]);
      const slot = availableRanges[slotIndex];

      if (slot) {
        // Default to 1 hour slot or the full available slot
        const startTime = slot.from;
        const startMinutes =
          parseInt(startTime.split(":")[0]) * 60 +
          parseInt(startTime.split(":")[1]);
        const endMinutes = Math.min(
          startMinutes + 60,
          parseInt(slot.to.split(":")[0]) * 60 + parseInt(slot.to.split(":")[1])
        );
        const endTime =
          Math.floor(endMinutes / 60)
            .toString()
            .padStart(2, "0") +
          ":" +
          (endMinutes % 60).toString().padStart(2, "0");

        // Check if this default slot overlaps with existing bookings
        const isOverlapping = (bookedSlots || []).some(
          (bookedSlot) => startTime < bookedSlot.to && endTime > bookedSlot.from
        );

        if (!isOverlapping) {
          onSlotSelect &&
            onSlotSelect({
              date: selectedDate,
              from: startTime,
              to: endTime,
            });
        } else {
          setInlineMessage({
            type: "warning",
            text: "This time overlaps with an existing booking",
          });
        }
      }
    }
  };

  // Handle clicking outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-[95vw] sm:w-[90vw] md:max-w-3xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCloseClick}
          className="absolute top-2 right-2 px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white z-10"
        >
          ✕
        </button>

        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center">
          {provider.name}'s Availability Calendar
        </h3>

        {/* Message */}
        {inlineMessage && (
          <div
            className={`transition-all duration-300 ease-in-out my-4 text-sm px-3 py-2 rounded border w-fit text-center flex items-center justify-center gap-2 mx-auto ${
              inlineMessage.type === "error"
                ? "bg-red-100 text-red-700 border-red-300"
                : "bg-yellow-100 text-yellow-700 border-yellow-300"
            }`}
          >
            <i
              className={
                inlineMessage.type === "error"
                  ? "fas fa-exclamation-circle"
                  : "fas fa-exclamation-triangle"
              }
            ></i>
            {inlineMessage.text}
          </div>
        )}

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          customButtons={{
            myCustomToday: {
              text: "Today",
              click: () => {
                calendarRef.current?.getApi().today();
              },
            },
          }}
          headerToolbar={{
            left: "myCustomToday prev,next",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={timelineEvents}
          dateClick={view === "dayGridMonth" ? handleDateClick : undefined}
          eventClick={view === "timeGridDay" ? handleEventClick : undefined}
          selectable={view === "timeGridDay"}
          select={view === "timeGridDay" ? handleSelect : undefined}
          allDaySlot={false}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          height="500px"
          scrollTime="08:00:00"
          nowIndicator={true}
          selectMirror={true}
          selectOverlap={(event) => {
            // Allow selection over available slots but not booked slots
            return event.id && event.id.startsWith("avail-");
          }}
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          datesSet={async (arg) => {
            const newStart = dayjs(arg.start);
            const newEnd = dayjs(arg.end);
            const newViewType = arg.view.type;
            const newDateStr = dayjs(arg.start).format("YYYY-MM-DD");
            const weekday = dayjs(newDateStr).format("dddd");

            setStart(newStart);
            setEnd(newEnd);
            setCurrentViewType(newViewType);

            if (newViewType === "dayGridMonth") {
              setView("dayGridMonth");
              setSelectedDate(null);
              return;
            }

            if (newViewType === "timeGridDay") {
              const availDay = provider.availability?.find(
                (d) => d.day === weekday
              );
              setSelectedDate(newDateStr);

              if (!availDay) {
                setAvailableRanges([]);
                setBookedSlots([]);
                setInlineMessage({
                  type: "error",
                  text: "This provider is unavailable on selected date.",
                });
                return;
              }

              setAvailableRanges(availDay.slots);

              try {
                const res = await axios.get(
                  `http://localhost:5000/api/bookings/booked-slots?providerId=${provider._id}&date=${newDateStr}`
                );
                setBookedSlots(res.data.bookedSlots || []);
              } catch (err) {
                setBookedSlots([]);
              }
            }
          }}
        />

        <div className="text-xs text-[var(--secondary)] mt-2 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <div className="flex gap-4">
            <div className="flex gap-1 items-center">
              <span
                className="inline-block w-3 h-3"
                style={{
                  backgroundColor: "#a7f3d0",
                  border: "1px solid #22c55e",
                }}
              ></span>
              <span>Available</span>
            </div>
            <div className="flex gap-1 items-center">
              <span
                className="inline-block w-3 h-3"
                style={{
                  backgroundColor: "#fecaca",
                  border: "1px solid #ef4444",
                }}
              ></span>
              <span>Unavailable</span>
            </div>
            {view === "timeGridDay" && (
              <div className="flex gap-1 items-center">
                <span
                  className="inline-block w-3 h-3"
                  style={{
                    backgroundColor: "#ef4444",
                    border: "1px solid #dc2626",
                  }}
                ></span>
                <span>Booked</span>
              </div>
            )}
          </div>
          <div className="font-medium">
            {view === "timeGridDay"
              ? "💡 Click or drag to select custom time ranges"
              : "💡 Click on date to view and book available slots"}
          </div>
        </div>
      </div>
    </div>
  );
}
