"use client";
import { useState } from "react";
import { API_BASE } from "../lib/connections";

export default function WorkExperience({ experiences, isOwnProfile, onUpdate }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        description: "",
    });

    const resetForm = () => {
        setFormData({
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            description: "",
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleAdd = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/profile/experience`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    ...formData,
                    endDate: formData.endDate || null,
                }),
            });

            if (response.ok) {
                resetForm();
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to add work experience:", error);
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await fetch(`${API_BASE}/api/profile/experience/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    ...formData,
                    endDate: formData.endDate || null,
                }),
            });

            if (response.ok) {
                resetForm();
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to update work experience:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Ar tikrai norite ištrinti šį darbo patirties įrašą?")) return;

        try {
            const response = await fetch(`${API_BASE}/api/profile/experience/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to delete work experience:", error);
        }
    };

    const startEdit = (exp) => {
        setFormData({
            company: exp.company,
            role: exp.role,
            startDate: exp.startDate,
            endDate: exp.endDate || "",
            description: exp.description || "",
        });
        setEditingId(exp.id);
        setIsAdding(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Dabar";
        const date = new Date(dateString);
        return date.toLocaleDateString("lt-LT", { year: "numeric", month: "long" });
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg text-black font-semibold">Darbo patirtis</h2>
                {isOwnProfile && !isAdding && !editingId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                        + Pridėti
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Įmonė *"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            placeholder="Pareigos *"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-600 block mb-1">Pradžios data *</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 block mb-1">Pabaigos data</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                        <textarea
                            placeholder="Aprašymas"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-300 text-black rounded-lg text-sm hover:bg-gray-400"
                            >
                                Atšaukti
                            </button>
                            <button
                                onClick={() => (editingId ? handleEdit(editingId) : handleAdd())}
                                disabled={!formData.company || !formData.role || !formData.startDate}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingId ? "Atnaujinti" : "Pridėti"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Experience List */}
            {experiences && experiences.length > 0 ? (
                <div className="space-y-4">
                    {experiences.map((exp) => (
                        <div key={exp.id} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-black font-semibold">{exp.role}</h3>
                                    <p className="text-gray-700 text-sm">{exp.company}</p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                                    </p>
                                    {exp.description && (
                                        <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                                    )}
                                </div>
                                {isOwnProfile && !isAdding && !editingId && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => startEdit(exp)}
                                            className="text-blue-500 hover:text-blue-700 text-xs"
                                        >
                                            Redaguoti
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exp.id)}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                            Ištrinti
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-sm">
                    {isOwnProfile
                        ? "Dar neturite darbo patirties įrašų. Spauskite 'Pridėti' norėdami sukurti naują."
                        : "Darbo patirties informacija nenurodyta."}
                </p>
            )}
        </div>
    );
}
