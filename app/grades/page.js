"use client";
import { useEffect, useState } from "react";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";

export default function GradesPage() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(new Set());

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8080/api/user/grades", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setEnrollments(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, []);

    const toggle = (id) => {
        setExpanded((prev) => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id); else n.add(id);
            return n;
        });
    };

    const finalOf = (e) => e.grade ?? e.suggestedGrade;
    const graded = enrollments.filter((e) => finalOf(e) != null);
    const average = graded.length > 0
        ? graded.reduce((acc, e) => acc + finalOf(e), 0) / graded.length
        : 0;

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">
                        Mano pažymiai
                    </h1>

                    {loading ? (
                        <p className="text-center text-gray-500">Kraunama...</p>
                    ) : enrollments.length === 0 ? (
                        <div className="bg-white shadow rounded-lg p-12 text-center">
                            <p className="text-gray-500">Nesate užregistruotas į kursus.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white shadow rounded-lg p-6 mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Vidurkis</p>
                                    <p className="text-3xl font-bold text-blue-500">
                                        {average > 0 ? average.toFixed(2) : "—"}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400 text-right max-w-xs">
                                    Skaičiuojant naudojami galutiniai pažymiai arba, jei galutinis nenustatytas, siūlomas svertinis vidurkis.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {enrollments.map((e) => {
                                    const isOpen = expanded.has(e.id);
                                    const finalGrade = finalOf(e);
                                    return (
                                        <div key={e.id} className="bg-white shadow rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => toggle(e.id)}
                                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                                            >
                                                <div className="text-left">
                                                    <p className="font-mono text-xs text-gray-500">{e.courseCode || ""}</p>
                                                    <p className="font-semibold text-gray-900">{e.courseName}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-[10px] uppercase text-gray-500">
                                                            {e.grade != null ? "Galutinis" : "Siūlomas"}
                                                        </p>
                                                        <p className={`text-2xl font-bold ${e.grade != null ? "text-blue-600" : "text-gray-600"}`}>
                                                            {finalGrade != null ? finalGrade.toFixed(2) : "—"}
                                                        </p>
                                                    </div>
                                                    <svg className={`h-5 w-5 text-gray-400 transition ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            {isOpen && (
                                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                                    {(!e.assignmentScores || e.assignmentScores.length === 0) ? (
                                                        <p className="text-sm text-gray-500 italic">Kursui dar nepriskirta užduočių.</p>
                                                    ) : (
                                                        <table className="w-full text-sm">
                                                            <thead className="text-xs text-gray-600 uppercase">
                                                                <tr>
                                                                    <th className="text-left py-2">Kodas</th>
                                                                    <th className="text-left py-2">Užduotis</th>
                                                                    <th className="text-center py-2">Savaitė</th>
                                                                    <th className="text-center py-2">Svoris</th>
                                                                    <th className="text-right py-2">Pažymys</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {e.assignmentScores.map((a) => (
                                                                    <tr key={a.assignmentId} className="border-t border-gray-200 text-gray-800">
                                                                        <td className="py-2 font-mono font-bold">{a.code}</td>
                                                                        <td className="py-2">{a.name}</td>
                                                                        <td className="py-2 text-center">{a.week ?? "-"}</td>
                                                                        <td className="py-2 text-center">{a.weight}%</td>
                                                                        <td className="py-2 text-right">
                                                                            {a.score != null ? (
                                                                                <span className="font-semibold">
                                                                                    {a.score} <span className="text-xs text-gray-500">/ {a.maxScore}</span>
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-gray-400">—</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PrivateRoute>
    );
}
