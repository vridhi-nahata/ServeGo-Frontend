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

  // Mark available/unavailable days in month view
  useEffect(() => {
    if (view === "dayGridMonth" && start && end) {
      const daysAvailable = provider.availability?.map((d) => d.day) || [];
      let evts = [];
      for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
        const weekday = d.format("dddd");
        evts.push({
          id: d.format("YYYY-MM-DD"),
          start: d.format("YYYY-MM-DD"),
          allDay: true,
          display: "background",
          backgroundColor: daysAvailable.includes(weekday)
            ? "#bbf7d0"
            : "#fecaca",
          borderColor: daysAvailable.includes(weekday)
            ? "#22c55e"
            : "#f87171",
        });
      }
      setEvents(evts);
    }
  }, [provider, view, start, end]);

  // On date click, show 24hr timeline
  const handleDateClick = async (info) => {
    const dateStr = info.dateStr;
    const weekday = dayjs(dateStr).format("dddd");
    const availDay = provider.availability?.find((d) => d.day === weekday);

    if (!availDay) {
      alert("This provider is not available on selected date.");
      return;
    }

    setSelectedDate(dateStr);
    setView("timeGridDay");
    setAvailableRanges(availDay.slots);

    try {
      const res = await axios.get(
        `/api/bookings/booked-slots?providerId=${provider._id}&date=${dateStr}`
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

  // Prepare events for 24hr timeline - FIXED VERSION
  const timelineEvents =
    view === "timeGridDay"
      ? [
          // Available slots as background events
          ...(availableRanges || []).map((slot, idx) => ({
            id: `avail-${idx}`,
            title: "Available",
            start: `${selectedDate}T${slot.from}:00`,
            end: `${selectedDate}T${slot.to}:00`,
            backgroundColor: "#bbf7d0",
            borderColor: "#22c55e",
            display: "background",
            classNames: ['available-slot']
          })),
          // Booked slots as regular events (not background) so they show on top
          ...(bookedSlots || []).map((slot, idx) => ({
            id: `booked-${idx}`,
            title: "BOOKED",
            start: `${selectedDate}T${slot.from}:00`,
            end: `${selectedDate}T${slot.to}:00`,
            backgroundColor: "#ef4444",
            borderColor: "#dc2626",
            textColor: "white",
            classNames: ['booked-slot']
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
    
    if (!isInAvailable) {
      alert("Please select a time within available hours.");
      return;
    }
    
    if (isOverlapping) {
      alert("This time overlaps with an existing booking.");
      return;
    }

    onSlotSelect && onSlotSelect({ date: selectedDate, from, to });
  };

  // Handle clicking on available slots (for easier selection)
  const handleEventClick = (info) => {
    if (view !== "timeGridDay") return;
    
    // Only handle clicks on available background events
    if (info.event.id.startsWith('avail-')) {
      const slotIndex = parseInt(info.event.id.split('-')[1]);
      const slot = availableRanges[slotIndex];
      
      if (slot) {
        // Default to 1 hour slot or the full available slot
        const startTime = slot.from;
        const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const endMinutes = Math.min(startMinutes + 60, parseInt(slot.to.split(':')[0]) * 60 + parseInt(slot.to.split(':')[1]));
        const endTime = Math.floor(endMinutes / 60).toString().padStart(2, '0') + ':' + (endMinutes % 60).toString().padStart(2, '0');
        
        // Check if this default slot overlaps with existing bookings
        const isOverlapping = (bookedSlots || []).some(
          (bookedSlot) => startTime < bookedSlot.to && endTime > bookedSlot.from
        );
        
        if (!isOverlapping) {
          onSlotSelect && onSlotSelect({ 
            date: selectedDate, 
            from: startTime, 
            to: endTime 
          });
        } else {
          alert("This time overlaps with an existing booking. Please drag to select a specific time range.");
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
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCloseClick}
          className="absolute top-2 right-2 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 z-10"
        >
          ✕ 
        </button>
        
        <h3 className="text-lg font-semibold mb-4 text-center">
          {provider.name}'s Availability Calendar
        </h3>
        
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: view === "dayGridMonth" ? "prev,next today" : "prev,next",
            center: "title",
            right: view === "dayGridMonth" ? "" : "dayGridMonth",
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
            return event.id && event.id.startsWith('avail-');
          }}
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          datesSet={(arg) => {
            setStart(dayjs(arg.start));
            setEnd(dayjs(arg.end));
            if (arg.view.type === "dayGridMonth") {
              setView("dayGridMonth");
              setSelectedDate(null);
            }
          }}
        />
        
        {view === "timeGridDay" && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => {
                setView("dayGridMonth");
                if (calendarRef.current) {
                  calendarRef.current.getApi().changeView("dayGridMonth");
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ← Back to Month
            </button>
            
            <div className="text-sm">
              {selectedDate && (
                <span className="font-medium">
                  Viewing: {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-green-200 border border-green-600 mr-1"></span>
            Available
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-red-500 border border-red-600 mr-1"></span>
            Booked
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-red-200 border border-red-600 mr-1"></span>
            Unavailable
          </div>
          {view === "timeGridDay" && (
            <div className="text-blue-600 font-medium">
              💡 Click on green areas for 1-hour slots, or drag to select custom time ranges
            </div>
          )}
        </div>
      </div>
    </div>
  );
}