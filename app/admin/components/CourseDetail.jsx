"use client";
import { useEffect, useState, useRef } from "react";

const API = "http://localhost:8080/api";

export default function CourseDetail({ course, onBack }) {
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentQuery, setStudentQuery] = useState("");
    const [studentResults, setStudentResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");
    const debounceRef = useRef(null);

    const getToken = () => localStorage.getItem("token");

    const fetchRoster = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/courses/${course.id}/students`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setRoster(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRoster(); }, [course.id]);

    const handleStudentSearch = (value) => {
        setStudentQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!value.trim()) {
            setStudentResults([]);
            setShowResults(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`${API}/users/search?name=${encodeURIComponent(value)}`, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                if (res.ok) {
                    setStudentResults(await res.json());
                    setShowResults(true);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setSearching(false);
            }
        }, 300);
    };

    const handleEnroll = async (student) => {
        setError("");
        try {
            const res = await fetch(`${API}/admin/enrollments`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ studentId: student.id, courseId: course.id }),
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Nepavyko užregistruoti studento.");
            }
            setStudentQuery("");
            setStudentResults([]);
            setShowResults(false);
            fetchRoster();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGradeChange = async (enrollmentId, grade) => {
        try {
            const parsed = grade === "" ? null : Number(grade);
            await fetch(`${API}/admin/grades/${enrollmentId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ grade: parsed }),
            });
            setRoster((prev) => prev.map((r) => (r.id === enrollmentId ? { ...r, grade: parsed } : r)));
        } catch (e) { console.error(e); }
    };

    const handleUnenroll = async (enrollmentId) => {
        if (!window.confirm("Pašalinti studentą iš kurso?")) return;
        try {
            await fetch(`${API}/admin/enrollments/${enrollmentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            fetchRoster();
        } catch (e) { console.error(e); }
    };

    const enrolledIds = new Set(roster.map((r) => r.studentId));

    return (
        <div>
            <button onClick={onBack} className="text-sm text-blue-500 hover:text-blue-600 mb-4">
                &larr; Grįžti į kursų sąrašą
            </button>

            <h2 className="text-xl font-bold mb-1 text-gray-800">{course.name}</h2>
            <p className="text-sm text-gray-500 mb-6">
                {course.code || "-"} · {course.credits} kreditai · {course.semester || "-"} · {course.lecturer || "-"}
            </p>

            {/* Enroll new student */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Užregistruoti studentą</h3>
                <div className="relative">
                    <input
                        type="text"
                        value={studentQuery}
                        onChange={(e) => handleStudentSearch(e.target.value)}
                        placeholder="Ieškoti studento pagal vardą..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                            {searching ? (
                                <div className="p-3 text-sm text-gray-500 text-center">Ieškoma...</div>
                            ) : studentResults.length === 0 ? (
                                <div className="p-3 text-sm text-gray-400 text-center">Vartotojų nerasta.</div>
                            ) : (
                                studentResults.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleEnroll(s)}
                                        disabled={enrolledIds.has(s.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-left border-b border-gray-100 last:border-b-0 ${enrolledIds.has(s.id) ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50"}`}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                                            {s.studyProgram && <p className="text-xs text-gray-500">{s.studyProgram}</p>}
                                        </div>
                                        {enrolledIds.has(s.id) ? (
                                            <span className="text-xs">Jau užregistruotas</span>
                                        ) : (
                                            <span className="text-xs text-blue-500">+ Registruoti</span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>

            {/* Roster */}
            <h3 className="font-semibold text-gray-700 mb-3">Studentų sąrašas ({roster.length})</h3>
            {loading ? (
                <p className="text-gray-500 text-center">Kraunama...</p>
            ) : roster.length === 0 ? (
                <p className="text-gray-400 text-center">Kurse nėra užregistruotų studentų.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-2">Studentas</th>
                                <th className="px-4 py-2">El. paštas</th>
                                <th className="px-4 py-2">Pažymys</th>
                                <th className="px-4 py-2 text-right">Veiksmai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roster.map((r) => (
                                <tr key={r.id} className="border-t border-gray-200">
                                    <td className="px-4 py-2 font-medium">{r.studentName}</td>
                                    <td className="px-4 py-2 text-gray-500">{r.studentEmail}</td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            defaultValue={r.grade ?? ""}
                                            onBlur={(e) => {
                                                if (String(e.target.value) !== String(r.grade ?? "")) {
                                                    handleGradeChange(r.id, e.target.value);
                                                }
                                            }}
                                            placeholder="—"
                                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => handleUnenroll(r.id)} className="text-red-500 hover:text-red-700 text-xs">
                                            Pašalinti
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
