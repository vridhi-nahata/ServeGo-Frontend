import React, { useState } from "react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilitySelector({ onSave }) {
  const [availability, setAvailability] = useState(
    daysOfWeek.map((day) => ({ day, active: false, slots: [] }))
  );

  const toggleDay = (dayIndex) => {
    const updated = [...availability];
    updated[dayIndex].active = !updated[dayIndex].active;
    setAvailability(updated);
  };

  const addSlot = (dayIndex) => {
    const updated = [...availability];
    updated[dayIndex].slots.push({ from: "", to: "" });
    setAvailability(updated);
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const updated = [...availability];
    updated[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(updated);
  };

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const updated = [...availability];
    updated[dayIndex].slots[slotIndex][field] = value;
    setAvailability(updated);
  };

  const handleSave = () => {
    const filtered = availability
      .filter((day) => day.active && day.slots.length > 0)
      .map(({ day, slots }) => ({ day, slots }));
    onSave(filtered);
  };

  return (
    <div className="space-y-2">
      {availability.map((dayObj, i) => (
        <div key={dayObj.day} className="border rounded p-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dayObj.active}
              onChange={() => toggleDay(i)}
            />
            <span className="font-semibold text-lg">{dayObj.day}</span>
          </label>

          {dayObj.active && (
            <div className="mt-3 space-y-2">
              {dayObj.slots.map((slot, j) => (
                <div key={j} className="flex items-center gap-3">
                  <input
                    type="time"
                    value={slot.from}
                    onChange={(e) => updateSlot(i, j, "from", e.target.value)}
                    className="border p-1 rounded bg-blue-500 text-white"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={slot.to}
                    onChange={(e) => updateSlot(i, j, "to", e.target.value)}
                    className="border p-1 rounded bg-blue-500 text-white"
                  />
                  <button
                    onClick={() => removeSlot(i, j)}
                    className="text-red-600 font-bold px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSlot(i)}
                className="bg-blue-500 text-white text-sm px-3 py-1 rounded shadow"
              >
                + Add Slot
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-5 py-2 rounded font-semibold shadow"
      >
        Save Availability
      </button>
    </div>
  );
}
