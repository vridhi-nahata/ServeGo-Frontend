import React, { useState, useEffect } from "react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilitySelector({ onChange }) {
  const [slotErrors, setSlotErrors] = useState({});
  const [availability, setAvailability] = useState(
    daysOfWeek.map((day) => ({ day, active: false, slots: [] }))
  );

  const doesOverlap = (newSlot, existingSlots, currentIndex = -1) => {
    const newFrom = newSlot.from;
    const newTo = newSlot.to;

    return existingSlots.some((slot, i) => {
      if (i === currentIndex) return false; // skip self on update

      return (
        slot.from &&
        slot.to &&
        newFrom &&
        newTo &&
        !(newTo <= slot.from || newFrom >= slot.to)
      );
    });
  };

  const validateDaySlots = (dayIndex, updatedSlots) => {
    const hasValidSlot = updatedSlots.some(
      (s) => s.from && s.to && s.from < s.to
    );

    const hasInvalidSlot = updatedSlots.some(
      (s) => !s.from || !s.to || s.from >= s.to
    );

    setSlotErrors((prev) => {
      const newErrors = { ...prev };

      if (!hasValidSlot && !hasInvalidSlot) {
        // Only show general warning if no valid and no invalid slot (i.e., all empty)
        if (!newErrors[dayIndex]) newErrors[dayIndex] = {};
        newErrors[dayIndex].general = {
          type: "warning",
          message: "Add time slot",
        };
      } else {
        if (newErrors[dayIndex]?.general) {
          delete newErrors[dayIndex].general;
          if (Object.keys(newErrors[dayIndex]).length === 0) {
            delete newErrors[dayIndex];
          }
        }
      }

      return newErrors;
    });
  };

  const toggleDay = (dayIndex) => {
    const updated = [...availability];
    updated[dayIndex].active = !updated[dayIndex].active;
    setAvailability(updated);

    if (!updated[dayIndex].active) {
      // Clear all errors for this day
      setSlotErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[dayIndex];
        return newErrors;
      });
    } else {
      // Validate if at least one valid slot exists
      validateDaySlots(dayIndex, updated[dayIndex].slots);
    }
  };

  const addSlot = (dayIndex) => {
    const updated = [...availability];
    const currentSlots = updated[dayIndex].slots;

    // Validate last slot before adding
    if (currentSlots.length > 0) {
      const lastSlot = currentSlots[currentSlots.length - 1];
      if (!lastSlot.from || !lastSlot.to) {
        setSlotErrors((prev) => ({
          ...prev,
          [dayIndex]: {
            ...prev[dayIndex],
            [currentSlots.length - 1]: {
              type: "error",
              message: "Both 'From' and 'To' times are required",
            },
          },
        }));
        return;
      }

      if (lastSlot.from >= lastSlot.to) {
        setSlotErrors((prev) => ({
          ...prev,
          [dayIndex]: {
            ...prev[dayIndex],
            [currentSlots.length - 1]: {
              type: "error",
              message: "'From' time must be earlier than 'To' time",
            },
          },
        }));
        return;
      }

      if (doesOverlap(lastSlot, currentSlots, currentSlots.length - 1)) {
        setSlotErrors((prev) => ({
          ...prev,
          [dayIndex]: {
            ...prev[dayIndex],
            [currentSlots.length - 1]: {
              type: "error",
              message: "This slot overlaps with an existing one",
            },
          },
        }));
        return;
      }
    }

    // Push new empty slot
    currentSlots.push({ from: "", to: "" });
    setAvailability(updated);
    validateDaySlots(dayIndex, currentSlots);
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const updated = [...availability];
    updated[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(updated);

    setSlotErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[dayIndex]) {
        delete newErrors[dayIndex][slotIndex];
        if (Object.keys(newErrors[dayIndex]).length === 0) {
          delete newErrors[dayIndex];
        }
      }
      return newErrors;
    });

    validateDaySlots(dayIndex, updated[dayIndex].slots);
  };

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const updated = [...availability];
    updated[dayIndex].slots[slotIndex][field] = value;
    setAvailability(updated);

    const slot = updated[dayIndex].slots[slotIndex];
    const { from, to } = slot;

    setSlotErrors((prev) => {
      const newErrors = { ...prev };
      if (!newErrors[dayIndex]) newErrors[dayIndex] = {};

      if (!from || !to) {
        newErrors[dayIndex][slotIndex] = {
          type: "error",
          message: "Both 'From' and 'To' times are required",
        };
      } else if (from >= to) {
        newErrors[dayIndex][slotIndex] = {
          type: "error",
          message: "'From' time must be earlier than 'To' time",
        };
      } else if (
        doesOverlap({ from, to }, updated[dayIndex].slots, slotIndex)
      ) {
        newErrors[dayIndex][slotIndex] = {
          type: "error",
          message: "This slot overlaps with an existing one",
        };
      } else {
        delete newErrors[dayIndex][slotIndex];
        if (Object.keys(newErrors[dayIndex]).length === 0) {
          delete newErrors[dayIndex];
        }
      }
      return newErrors;
    });
    validateDaySlots(dayIndex, updated[dayIndex].slots);
  };

  useEffect(() => {
    const filtered = availability
      .filter((day) => day.active)
      .map(({ day, slots }) => ({
        day,
        slots: slots.filter((s) => s.from && s.to && s.from < s.to),
      }))
      .filter(({ slots }) => slots.length > 0);

    onChange(filtered);
  }, [availability]);

  return (
    <div className="space-y-3 ml-2">
      {availability.map((dayObj, i) => (
        <div key={dayObj.day} className="border rounded p-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dayObj.active}
              onChange={() => toggleDay(i)}
              className="appearance-none w-4 h-4 rounded-sm bg-white checked:bg-gradient-to-bl from-[var(--secondary)] to-[var(--accent)] checked:text-white checked:after:content-['✔'] checked:after:text-xs checked:after:block checked:after:text-center checked:after:leading-4"
            />
            <span className="text-sm">{dayObj.day}</span>
          </label>

          {dayObj.active && (
            <div className="mt-3 space-y-2">
              {dayObj.slots.map((slot, j) => (
                <div key={j} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.from}
                      onChange={(e) => updateSlot(i, j, "from", e.target.value)}
                      className="border p-1 rounded text-xs text-[var(--secondary)] w-20 focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={slot.to}
                      onChange={(e) => updateSlot(i, j, "to", e.target.value)}
                      className="border p-1 rounded text-xs text-[var(--secondary)] w-20 focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(i, j)}
                      className="text-red-300 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>

                  {slotErrors[i]?.[j] && (
                    <p
                      className={`text-xs flex items-center gap-2 mt-1 ${
                        slotErrors[i][j].type === "error"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      <span>
                        {slotErrors[i][j].type === "error" ? (
                          <i className="fas fa-exclamation-circle"></i>
                        ) : (
                          <i className="fas fa-exclamation-triangle"></i>
                        )}
                      </span>
                      {slotErrors[i][j].message}
                    </p>
                  )}
                </div>
              ))}

              {slotErrors[i]?.general && (
                <p
                  className={`text-xs flex items-center gap-2 mt-1 ${
                    slotErrors[i].general.type === "error"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  <span>
                    {slotErrors[i].general.type === "error" ? (
                      <i className="fas fa-exclamation-circle"></i>
                    ) : (
                      <i className="fas fa-exclamation-triangle"></i>
                    )}
                  </span>
                  {slotErrors[i].general.message}
                </p>
              )}

              <button
                type="button"
                onClick={() => addSlot(i)}
                className="bg-gradient-to-bl from-[var(--secondary)] to-[var(--accent)] hover:scale-105 text-sm px-2 py-1 rounded shadow-lg shadow-slate-800"
              >
                <i className="fas fa-plus text-xs"></i> Add Slot
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
