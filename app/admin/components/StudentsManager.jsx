"use client";
import { useEffect, useRef, useState } from "react";

const API = "http://localhost:8080/api";

export default function StudentsManager() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selected, setSelected] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/admin/courses`, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                if (res.ok) setCourses(await res.json());
            } catch (e) { console.error(e); }
        })();
    }, []);

    const fetchStudentEnrollments = async (studentId) => {
        setLoading(true);
        try {
            // Reuse roster endpoints to compose a student's enrollments by filtering all courses
            // Simpler: hit each course roster and filter — or use a dedicated endpoint.
            // Backend has only GET /api/user/grades for the current user; for an admin viewing
            // another student we iterate courses' rosters and filter by studentId.
            const all = [];
            for (const c of courses) {
                const res = await fetch(`${API}/admin/courses/${c.id}/students`, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                if (res.ok) {
                    const roster = await res.json();
                    roster.filter((r) => r.studentId === studentId).forEach((r) => all.push(r));
                }
            }
            setEnrollments(all);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (v) => {
        setQuery(v);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!v.trim()) { setResults([]); setShowResults(false); return; }
        debounceRef.current = setTimeout(async () => {
            const res = await fetch(`${API}/users/search?name=${encodeURIComponent(v)}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                setResults(await res.json());
                setShowResults(true);
            }
        }, 300);
    };

    const selectStudent = async (s) => {
        setSelected(s);
        setQuery(s.name);
        setShowResults(false);
        await fetchStudentEnrollments(s.id);
    };

    const handleEnroll = async () => {
        if (!selected || !selectedCourseId) {
            setError("Pasirinkite studentą ir kursą.");
            return;
        }
        setError("");
        try {
            const res = await fetch(`${API}/admin/enrollments`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: selected.id, courseId: Number(selectedCourseId) }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Nepavyko užregistruoti.");
            }
            setSelectedCourseId("");
            fetchStudentEnrollments(selected.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGradeChange = async (enrollmentId, grade) => {
        try {
            const parsed = grade === "" ? null : Number(grade);
            await fetch(`${API}/admin/grades/${enrollmentId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
                body: JSON.stringify({ grade: parsed }),
            });
            setEnrollments((prev) => prev.map((r) => (r.id === enrollmentId ? { ...r, grade: parsed } : r)));
        } catch (e) { console.error(e); }
    };

    const handleUnenroll = async (enrollmentId) => {
        if (!window.confirm("Pašalinti studentą iš kurso?")) return;
        try {
            await fetch(`${API}/admin/enrollments/${enrollmentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (selected) fetchStudentEnrollments(selected.id);
        } catch (e) { console.error(e); }
    };

    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
    const availableCourses = courses.filter((c) => c.active && !enrolledCourseIds.has(c.id));

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Studentai ir registracija</h2>

            {/* Search */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Ieškoti studento</label>
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Įveskite vardą..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                            {results.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500 text-center">Vartotojų nerasta.</div>
                            ) : (
                                results.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => selectStudent(s)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                                        {s.studyProgram && <p className="text-xs text-gray-600">{s.studyProgram}</p>}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selected && (
                <>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                        {selected.studyProgram && <p className="text-sm text-gray-600">{selected.studyProgram}</p>}
                    </div>

                    {/* Enroll */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Registruoti į kursą</h3>
                        {availableCourses.length === 0 ? (
                            <p className="text-sm text-gray-500">Nėra prieinamų aktyvių kursų.</p>
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">-- Pasirinkite kursą --</option>
                                    {availableCourses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.code ? `${c.code} · ` : ""}{c.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleEnroll}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                                >
                                    Registruoti
                                </button>
                            </div>
                        )}
                        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    </div>

                    {/* Enrollments + grades */}
                    <h3 className="font-semibold text-gray-800 mb-3">Kursai ir pažymiai</h3>
                    {loading ? (
                        <p className="text-gray-500 text-center">Kraunama...</p>
                    ) : enrollments.length === 0 ? (
                        <p className="text-gray-500 text-center">Studentas neužregistruotas į kursus.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-800">
                                    <tr>
                                        <th className="px-4 py-2">Kodas</th>
                                        <th className="px-4 py-2">Kursas</th>
                                        <th className="px-4 py-2">Pažymys</th>
                                        <th className="px-4 py-2 text-right">Veiksmai</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.map((r) => (
                                        <tr key={r.id} className="border-t border-gray-200 text-gray-800">
                                            <td className="px-4 py-2 font-mono">{r.courseCode || "-"}</td>
                                            <td className="px-4 py-2 font-medium">{r.courseName}</td>
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
                                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={() => handleUnenroll(r.id)} className="text-red-600 hover:text-red-800 text-xs">
                                                    Pašalinti
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
