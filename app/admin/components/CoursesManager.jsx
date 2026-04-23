"use client";
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api";
const emptyForm = { name: "", code: "", credits: 0, semester: "", lecturer: "", active: true };

export default function CoursesManager({ onSelectCourse }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    const getToken = () => localStorage.getItem("token");

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/courses`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setCourses(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const resetForm = () => { setForm(emptyForm); setEditingId(null); setError(""); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.name.trim()) { setError("Pavadinimas privalomas."); return; }
        try {
            const url = editingId ? `${API}/admin/courses/${editingId}` : `${API}/admin/courses`;
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...form, credits: Number(form.credits) }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || `Nepavyko išsaugoti kurso (${res.status}).`);
            }
            resetForm();
            fetchCourses();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (course) => {
        setEditingId(course.id);
        setForm({
            name: course.name || "",
            code: course.code || "",
            credits: course.credits || 0,
            semester: course.semester || "",
            lecturer: course.lecturer || "",
            active: course.active,
        });
    };

    const handleToggleActive = async (course) => {
        try {
            await fetch(`${API}/admin/courses/${course.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ active: !course.active }),
            });
            fetchCourses();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Ar tikrai norite ištrinti kursą?")) return;
        try {
            await fetch(`${API}/admin/courses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            fetchCourses();
        } catch (e) { console.error(e); }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Kursų valdymas</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">
                    {editingId ? "Redaguoti kursą" : "Sukurti naują kursą"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Pavadinimas"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        placeholder="Kodas (pvz. P170B115)"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="number"
                        min="0"
                        placeholder="Kreditai"
                        value={form.credits}
                        onChange={(e) => setForm({ ...form, credits: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        placeholder="Semestras (pvz. 2025 Ruduo)"
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        placeholder="Dėstytojas"
                        value={form.lecturer}
                        onChange={(e) => setForm({ ...form, lecturer: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm md:col-span-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                {error && <p className="text-sm text-red-600 mt-2 whitespace-pre-wrap">{error}</p>}
                <div className="flex gap-2 mt-3">
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
                        {editingId ? "Atnaujinti" : "Sukurti"}
                    </button>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                            Atšaukti
                        </button>
                    )}
                </div>
            </form>

            {/* List */}
            {loading ? (
                <p className="text-gray-500 text-center">Kraunama...</p>
            ) : courses.length === 0 ? (
                <p className="text-gray-400 text-center">Kursų nėra.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-800">
                            <tr>
                                <th className="px-4 py-2">Kodas</th>
                                <th className="px-4 py-2">Pavadinimas</th>
                                <th className="px-4 py-2">Kreditai</th>
                                <th className="px-4 py-2">Semestras</th>
                                <th className="px-4 py-2">Dėstytojas</th>
                                <th className="px-4 py-2">Statusas</th>
                                <th className="px-4 py-2 text-right">Veiksmai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c) => (
                                <tr key={c.id} className={`border-t border-gray-200 ${c.active ? "text-gray-800" : "bg-gray-50 text-gray-400"}`}>
                                    <td className="px-4 py-2 font-mono">{c.code || "-"}</td>
                                    <td className="px-4 py-2 font-medium">{c.name}</td>
                                    <td className="px-4 py-2">{c.credits}</td>
                                    <td className="px-4 py-2">{c.semester || "-"}</td>
                                    <td className="px-4 py-2">{c.lecturer || "-"}</td>
                                    <td className="px-4 py-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${c.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                                            {c.active ? "Aktyvus" : "Neaktyvus"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right whitespace-nowrap">
                                        <button onClick={() => onSelectCourse && onSelectCourse(c)} className="text-blue-500 hover:text-blue-700 text-xs mr-2">
                                            Studentai
                                        </button>
                                        <button onClick={() => handleEdit(c)} className="text-gray-600 hover:text-gray-900 text-xs mr-2">
                                            Redaguoti
                                        </button>
                                        <button onClick={() => handleToggleActive(c)} className="text-yellow-600 hover:text-yellow-800 text-xs mr-2">
                                            {c.active ? "Deaktyvuoti" : "Aktyvuoti"}
                                        </button>
                                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs">
                                            Ištrinti
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
