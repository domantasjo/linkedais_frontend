"use client";
import { useEffect, useState } from "react";

const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const getRecurrenceText = (recurrence, specificDate) => {
    switch(recurrence) {
        case "WEEKLY":
            return "Every week";
        case "BIWEEKLY":
            return "Every other week";
        case "ONCE":
            return specificDate ? `Once on ${specificDate}` : "One-time event";
        default:
            return "";
    }
};

export default function ScheduleView({ userId }) {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        async function fetchSchedule() {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8080/api/schedule/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setSchedule(data);
            } catch (error) {
                console.error("Failed to fetch schedule:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchSchedule();
    }, [userId]);

    const getScheduleForDay = (day) => {
        return schedule.filter(entry => entry.dayOfWeek === day);
    };

    const formatTime = (time) => {
        return time ? time.substring(0, 5) : "";
    };

    if (loading) return <p className="text-gray-500 text-sm">Loading schedule...</p>;
    if (error) return <p className="text-red-500 text-sm">Error: {error}</p>;

    if (schedule.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No schedule entries yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your courses to see your weekly schedule</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 min-w-[600px]">
                {daysOfWeek.map(day => (
                    <div key={day} className="bg-gray-50 rounded-lg p-2">
                        <h3 className="font-semibold text-black text-center mb-3 pb-2 border-b">
                            {day.substring(0, 3)}
                        </h3>
                        <div className="space-y-2">
                            {getScheduleForDay(day).map(entry => (
                                <div key={entry.id} className="bg-white rounded p-2 shadow-sm border-l-4 border-blue-500">
                                    <p className="font-medium text-black text-sm">{entry.courseName}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                    </p>
                                    {entry.location && (
                                        <p className="text-xs text-gray-500 mt-1"> {entry.location}</p>
                                    )}
                                    {entry.type && (
                                        <p className="text-xs text-blue-600 mt-1">{entry.type}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                        {getRecurrenceText(entry.recurrence, entry.specificDate)}
                                    </p>
                                </div>
                            ))}
                            {getScheduleForDay(day).length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-4">—</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}