"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import AssignmentsManager from "./AssignmentsManager";

const API = "http://localhost:8080/api";

export default function CourseDetail({ course, onBack }) {
    const [assignments, setAssignments] = useState([]);
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentQuery, setStudentQuery] = useState("");
    const [studentResults, setStudentResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");
    const debounceRef = useRef(null);

    const getToken = () => localStorage.getItem("token");

    const fetchRoster = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/courses/${course.id}/students`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setRoster(await res.json());
        } finally {
            setLoading(false);
        }
    }, [course.id]);

    useEffect(() => { fetchRoster(); }, [fetchRoster]);

    const handleStudentSearch = (v) => {
        setStudentQuery(v);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!v.trim()) { setStudentResults([]); setShowResults(false); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            const res = await fetch(`${API}/users/search?name=${encodeURIComponent(v)}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) { setStudentResults(await res.json()); setShowResults(true); }
            setSearching(false);
        }, 300);
    };

    const handleEnroll = async (s) => {
        setError("");
        try {
            const res = await fetch(`${API}/admin/enrollments`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: s.id, courseId: course.id }),
            });
            if (!res.ok) throw new Error((await res.text()) || `(${res.status})`);
            setStudentQuery(""); setStudentResults([]); setShowResults(false);
            fetchRoster();
        } catch (err) { setError(err.message); }
    };

    const handleUnenroll = async (enrollmentId) => {
        if (!window.confirm("Pašalinti studentą?")) return;
        await fetch(`${API}/admin/enrollments/${enrollmentId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        fetchRoster();
    };

    const handleScoreChange = async (enrollmentId, assignmentId, raw) => {
        const score = raw === "" ? null : Number(raw);
        try {
            const res = await fetch(`${API}/admin/grades/${enrollmentId}/assignments/${assignmentId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
                body: JSON.stringify({ score }),
            });
            if (!res.ok) {
                const msg = await res.text();
                alert(msg || "Nepavyko išsaugoti pažymio");
                return;
            }
            // Refresh roster to recompute suggested grade
            fetchRoster();
        } catch (e) { alert(e.message); }
    };

    const handleFinalGradeChange = async (enrollmentId, raw) => {
        const grade = raw === "" ? null : Number(raw);
        try {
            const res = await fetch(`${API}/admin/grades/${enrollmentId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
                body: JSON.stringify({ grade }),
            });
            if (!res.ok) { alert(await res.text()); return; }
            fetchRoster();
        } catch (e) { alert(e.message); }
    };

    const enrolledIds = new Set(roster.map((r) => r.studentId));

    return (
        <div>
            <button onClick={onBack} className="text-sm text-blue-500 hover:text-blue-600 mb-4">
                &larr; Grįžti į kursų sąrašą
            </button>

            {/* Course header */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Studijų modulis</h2>
                <p className="text-sm text-gray-700">
                    <span className="font-mono font-semibold">{course.code || "-"}</span>{" "}
                    {course.name}; {course.credits} kr.
                </p>
                {course.semester && <p className="text-sm text-gray-600">{course.semester}</p>}
                {course.lecturer && <p className="text-sm text-gray-600">Koordinuojantysis dėstytojas: {course.lecturer}</p>}
            </div>

            {/* Assignments management */}
            <AssignmentsManager courseId={course.id} onChange={setAssignments} />

            {/* Enroll student */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3">Užregistruoti studentą</h3>
                <div className="relative">
                    <input
                        type="text"
                        value={studentQuery}
                        onChange={(e) => handleStudentSearch(e.target.value)}
                        placeholder="Ieškoti studento..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                            {searching ? (
                                <div className="p-3 text-sm text-gray-500 text-center">Ieškoma...</div>
                            ) : studentResults.length === 0 ? (
                                <div className="p-3 text-sm text-gray-400 text-center">Nerasta.</div>
                            ) : (
                                studentResults.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleEnroll(s)}
                                        disabled={enrolledIds.has(s.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-left border-b border-gray-100 last:border-b-0 ${enrolledIds.has(s.id) ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50"}`}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                                            {s.studyProgram && <p className="text-xs text-gray-600">{s.studyProgram}</p>}
                                        </div>
                                        <span className="text-xs text-blue-500">{enrolledIds.has(s.id) ? "Jau užregistruotas" : "+ Registruoti"}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            {/* Grade grid */}
            <h3 className="font-semibold text-gray-800 mb-3">Studentai ir pažymiai ({roster.length})</h3>
            {loading ? (
                <p className="text-gray-500 text-center">Kraunama...</p>
            ) : roster.length === 0 ? (
                <p className="text-gray-400 text-center">Studentų nėra.</p>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 text-gray-800">
                            <tr>
                                <th className="px-2 py-2 text-left sticky left-0 bg-gray-100 z-10">Studentas</th>
                                {assignments.map((a) => (
                                    <th key={a.id} className="px-2 py-2 text-center" title={`${a.name} (${a.weight}%, max ${a.maxScore})`}>
                                        <div className="font-bold font-mono">{a.code}</div>
                                        <div className="text-[10px] text-gray-500 font-normal">
                                            {a.week ? `S${a.week}` : ""} {a.weight}%
                                        </div>
                                    </th>
                                ))}
                                <th className="px-2 py-2 text-center bg-blue-50">Siūlomas</th>
                                <th className="px-2 py-2 text-center bg-blue-100">Galutinis</th>
                                <th className="px-2 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {roster.map((r) => {
                                const scoreById = {};
                                (r.assignmentScores || []).forEach((as) => { scoreById[as.assignmentId] = as.score; });
                                return (
                                    <tr key={r.id} className="border-t border-gray-200 text-gray-800">
                                        <td className="px-2 py-2 sticky left-0 bg-white z-10">
                                            <div className="font-medium">{r.studentName}</div>
                                            <div className="text-[10px] text-gray-500">{r.studentEmail}</div>
                                        </td>
                                        {assignments.map((a) => (
                                            <td key={a.id} className="px-1 py-1 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={a.maxScore}
                                                    step="0.1"
                                                    defaultValue={scoreById[a.id] ?? ""}
                                                    onBlur={(e) => {
                                                        const cur = scoreById[a.id];
                                                        if (String(e.target.value) !== String(cur ?? "")) {
                                                            handleScoreChange(r.id, a.id, e.target.value);
                                                        }
                                                    }}
                                                    placeholder="—"
                                                    className="w-14 border border-gray-300 rounded px-1 py-1 text-xs text-gray-900 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-2 py-1 text-center bg-blue-50 font-semibold">
                                            {r.suggestedGrade != null ? r.suggestedGrade.toFixed(2) : "—"}
                                        </td>
                                        <td className="px-1 py-1 text-center bg-blue-100">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                defaultValue={r.grade ?? ""}
                                                onBlur={(e) => {
                                                    if (String(e.target.value) !== String(r.grade ?? "")) {
                                                        handleFinalGradeChange(r.id, e.target.value);
                                                    }
                                                }}
                                                placeholder="—"
                                                className="w-14 border border-gray-300 rounded px-1 py-1 text-xs text-gray-900 text-center font-bold focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            />
                                        </td>
                                        <td className="px-2 py-1 text-right">
                                            <button onClick={() => handleUnenroll(r.id)} className="text-red-600 hover:text-red-800">
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Weight legend */}
            {assignments.length > 0 && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700">
                    <p className="font-semibold mb-1">Užduočių įtaka pažymiui:</p>
                    <ul className="space-y-0.5">
                        {assignments.map((a) => (
                            <li key={a.id}>
                                <span className="font-mono font-bold">{a.code}</span> — {a.name}: <span className="font-semibold">{a.weight}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
