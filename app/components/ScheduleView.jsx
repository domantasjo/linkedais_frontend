"use client";
import { useEffect, useState } from "react";

const daysOfWeek = ["PIRMADIENIS", "ANTRADIENIS", "TREČIADIENIS", "KETVIRTADIENIS", "PENKTADIENIS", "ŠEŠTADIENIS"];
const SEMESTER_START = new Date(2026, 2, 2);

const getRecurrenceText = (recurrence, specificDate, weekParity) => {
    switch(recurrence) {
        case "WEEKLY":
            return "Kiekvieną savaitę";
        case "BIWEEKLY":
            return weekParity === "EVEN" ? "Kas antrą savaitę (lyginėmis)" : "Kas antrą savaitę (nelyginėmis)";
        case "ONCE":
            if (specificDate) {
                const parts = specificDate.split('-');
                const formatted = `${parts[1]}-${parts[2]}`;
                return `Vieną kartą (${formatted})`;
            }
            return "Vienkartinis įvykis";
        default:
            return "";
    }
};

const getWeekNumber = (date) => {
    const diffTime = Math.abs(date - SEMESTER_START);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
};

const getCurrentWeekNumber = () => {
    const today = new Date();
    if (today < SEMESTER_START) return 1;
    const weekNum = getWeekNumber(today);
    return Math.min(weekNum, 16);
};

const shouldShowForWeek = (entry, weekNumber) => {
    if (entry.recurrence === "WEEKLY") return true;
    if (entry.recurrence === "ONCE") return true;
    if (entry.recurrence === "BIWEEKLY") {
        const isOddWeek = weekNumber % 2 === 1;
        if (entry.weekParity === "EVEN") return !isOddWeek;
        return isOddWeek;
    }
    return false;
};

export default function ScheduleView({ userId }) {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("weekly");
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeekNumber());

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

    const getScheduleForDayAndWeek = (day, weekNum) => {
        return schedule.filter(entry =>
            entry.dayOfWeek === day && shouldShowForWeek(entry, weekNum)
        );
    };

    const formatTime = (time) => {
        return time ? time.substring(0, 5) : "";
    };

    const getWeekLabel = (weekNum) => {
        const startDate = new Date(SEMESTER_START);
        startDate.setDate(startDate.getDate() + (weekNum - 1) * 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const formatDate = (date) => {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}-${day}`;
        };

        return `${weekNum} savaitė (${formatDate(startDate)} - ${formatDate(endDate)})`;
    };

    const renderWeeklyView = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-black"
                >
                    ← Praeita savaitė
                </button>
                <span className="font-semibold text-black">{getWeekLabel(currentWeek)}</span>
                <button
                    onClick={() => setCurrentWeek(prev => Math.min(16, prev + 1))}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-black"
                >
                    Kita savaitė →
                </button>
            </div>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-2 min-w-[600px]">
                    {daysOfWeek.map(day => (
                        <div key={day} className="bg-gray-50 rounded-lg p-2">
                            <h3 className="font-semibold text-black text-center mb-3 pb-2 border-b">
                                {day.substring(0, 3)}
                            </h3>
                            <div className="space-y-2">
                                {getScheduleForDayAndWeek(day, currentWeek).map(entry => (
                                    <div key={entry.id} className="bg-white rounded p-2 shadow-sm border-l-4 border-blue-500">
                                        <p className="font-medium text-black text-sm">{entry.courseName}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                        </p>
                                        {entry.location && (
                                            <p className="text-xs text-gray-500 mt-1">Vieta: {entry.location}</p>
                                        )}
                                        {entry.type && (
                                            <p className="text-xs text-blue-600 mt-1">{entry.type}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {getRecurrenceText(entry.recurrence, entry.specificDate, entry.weekParity)}
                                        </p>
                                    </div>
                                ))}
                                {getScheduleForDayAndWeek(day, currentWeek).length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-4">—</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSemesterView = () => (
        <div className="overflow-x-auto">
            <div className="space-y-6">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(weekNum => {
                    const hasEvents = daysOfWeek.some(day =>
                        getScheduleForDayAndWeek(day, weekNum).length > 0
                    );
                    if (!hasEvents) return null;

                    return (
                        <div key={weekNum} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-black mb-3 pb-2 border-b">
                                {getWeekLabel(weekNum)}
                            </h3>
                            <div className="grid grid-cols-6 gap-2">
                                {daysOfWeek.map(day => (
                                    <div key={day} className="bg-gray-50 rounded p-2">
                                        <h4 className="text-xs font-semibold text-black text-center mb-2">
                                            {day.substring(0, 3)}
                                        </h4>
                                        <div className="space-y-1">
                                            {getScheduleForDayAndWeek(day, weekNum).map(entry => (
                                                <div key={entry.id} className="bg-white rounded p-1 text-xs">
                                                    <p className="font-medium text-black">{entry.courseName}</p>
                                                    <p className="text-gray-600">{formatTime(entry.startTime)}</p>
                                                    {entry.location && (
                                                        <p className="text-gray-500 text-xs">{entry.location}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (loading) return <p className="text-gray-500 text-sm">Kraunamas tvarkaraštis...</p>;
    if (error) return <p className="text-red-500 text-sm">Klaida: {error}</p>;

    if (schedule.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Kol kas nėra tvarkaraščio įrašų</p>
                <p className="text-sm text-gray-400 mt-1">Pridėk kursus, kad pamatytum savo savaitinį tvarkaraštį</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("weekly")}
                        className={`px-4 py-2 rounded text-sm ${viewMode === "weekly" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                    >
                        Savaitinis vaizdas
                    </button>
                    <button
                        onClick={() => setViewMode("semester")}
                        className={`px-4 py-2 rounded text-sm ${viewMode === "semester" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                    >
                        Visas semestras (16 sav.)
                    </button>
                </div>
                {viewMode === "weekly" && (
                    <div className="text-sm text-gray-500">
                        Šiandien: {(() => {
                            const today = new Date();
                            const month = (today.getMonth() + 1).toString().padStart(2, '0');
                            const day = today.getDate().toString().padStart(2, '0');
                            return `${month}-${day}`;
                        })()}
                    </div>
                )}
            </div>

            {viewMode === "weekly" ? renderWeeklyView() : renderSemesterView()}
        </div>
    );
}