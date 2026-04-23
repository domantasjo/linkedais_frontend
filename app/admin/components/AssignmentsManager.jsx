"use client";
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api";
const emptyForm = { code: "", name: "", weight: 0, week: "", maxScore: 10 };

export default function AssignmentsManager({ courseId, onChange }) {
    const [assignments, setAssignments] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem("token");

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/courses/${courseId}/assignments`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                const data = await res.json();
                setAssignments(data);
                onChange && onChange(data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAssignments(); }, [courseId]);

    const resetForm = () => { setForm(emptyForm); setEditingId(null); setError(""); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const url = editingId
                ? `${API}/admin/assignments/${editingId}`
                : `${API}/admin/courses/${courseId}/assignments`;
            const method = editingId ? "PUT" : "POST";
            const body = {
                code: form.code,
                name: form.name,
                weight: Number(form.weight),
                week: form.week === "" ? null : Number(form.week),
                maxScore: Number(form.maxScore),
            };
            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || `Nepavyko (${res.status})`);
            }
            resetForm();
            fetchAssignments();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (a) => {
        setEditingId(a.id);
        setForm({
            code: a.code,
            name: a.name,
            weight: a.weight,
            week: a.week ?? "",
            maxScore: a.maxScore,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Ištrinti užduotį ir visus jos pažymius?")) return;
        await fetch(`${API}/admin/assignments/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        fetchAssignments();
    };

    const totalWeight = assignments.reduce((acc, a) => acc + a.weight, 0);

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Užduotys ir svoriai</h3>
                <span className={`text-xs font-semibold ${totalWeight === 100 ? "text-green-700" : "text-orange-600"}`}>
                    Bendras svoris: {totalWeight}%
                </span>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Kodas (LB, TE, IR, E1)"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 placeholder-gray-400"
                />
                <input
                    type="text"
                    placeholder="Pavadinimas"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm col-span-2 text-gray-900 placeholder-gray-400"
                />
                <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Svoris %"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 placeholder-gray-400"
                />
                <input
                    type="number"
                    min="1"
                    placeholder="Savaitė"
                    value={form.week}
                    onChange={(e) => setForm({ ...form, week: e.target.value })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 placeholder-gray-400"
                />
                <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Max balas"
                    value={form.maxScore}
                    onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 placeholder-gray-400"
                />
                <div className="col-span-2 md:col-span-6 flex gap-2">
                    <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                        {editingId ? "Atnaujinti" : "+ Pridėti užduotį"}
                    </button>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
                            Atšaukti
                        </button>
                    )}
                </div>
                {error && <p className="text-xs text-red-600 col-span-2 md:col-span-6">{error}</p>}
            </form>

            {loading ? (
                <p className="text-xs text-gray-500">Kraunama...</p>
            ) : assignments.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Užduočių nėra. Pridėkite pirmą aukščiau.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-2 py-1">Kodas</th>
                                <th className="px-2 py-1">Pavadinimas</th>
                                <th className="px-2 py-1">Svoris</th>
                                <th className="px-2 py-1">Sav.</th>
                                <th className="px-2 py-1">Max</th>
                                <th className="px-2 py-1 text-right">Veiksmai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((a) => (
                                <tr key={a.id} className="border-t border-gray-200 text-gray-800">
                                    <td className="px-2 py-1 font-mono font-bold">{a.code}</td>
                                    <td className="px-2 py-1">{a.name}</td>
                                    <td className="px-2 py-1">{a.weight}%</td>
                                    <td className="px-2 py-1">{a.week ?? "-"}</td>
                                    <td className="px-2 py-1">{a.maxScore}</td>
                                    <td className="px-2 py-1 text-right whitespace-nowrap">
                                        <button onClick={() => handleEdit(a)} className="text-gray-600 hover:text-gray-900 mr-2">
                                            Redaguoti
                                        </button>
                                        <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800">
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
