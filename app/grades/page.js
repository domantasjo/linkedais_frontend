"use client";
import { useEffect, useState } from "react";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";

export default function GradesPage() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const average = enrollments
        .filter((e) => e.grade != null)
        .reduce((acc, e, _, arr) => acc + e.grade / arr.length, 0);

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-3xl mx-auto">
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
                            <div className="bg-white shadow rounded-lg p-6 mb-4">
                                <p className="text-sm text-gray-500">Vidurkis</p>
                                <p className="text-3xl font-bold text-blue-500">
                                    {average > 0 ? average.toFixed(2) : "—"}
                                </p>
                            </div>

                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="px-4 py-3">Kodas</th>
                                            <th className="px-4 py-3">Kursas</th>
                                            <th className="px-4 py-3 text-right">Pažymys</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((e) => (
                                            <tr key={e.id} className="border-t border-gray-200">
                                                <td className="px-4 py-3 font-mono">{e.courseCode || "-"}</td>
                                                <td className="px-4 py-3 font-medium">{e.courseName}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {e.grade != null ? (
                                                        <span className="font-bold text-blue-500">{e.grade}</span>
                                                    ) : (
                                                        <span className="text-gray-400">Nevertinta</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PrivateRoute>
    );
}
