"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function normalizeConnections(payload, currentUserId) {
    if (!Array.isArray(payload)) return [];

    const byId = new Map();

    payload.forEach((item) => {
        let user = null;
        const status = item?.status || "ACCEPTED";

        if (item?.user?.id) {
            user = item.user;
        } else if (item?.id && item?.name && !item?.requesterId && !item?.receiverId) {
            user = item;
        } else if (item?.requesterId && item?.receiverId) {
            const requester = {
                id: item.requesterId,
                name: item.requesterName,
                studyProgram: item.requesterStudyProgram,
            };
            const receiver = {
                id: item.receiverId,
                name: item.receiverName,
                studyProgram: item.receiverStudyProgram,
            };
            user = Number(item.requesterId) === Number(currentUserId) ? receiver : requester;
        }

        if (!user || !user.id || Number(user.id) === Number(currentUserId)) return;
        if (status && status !== "ACCEPTED") return;

        byId.set(Number(user.id), {
            id: Number(user.id),
            name: user.name || "Nežinomas vartotojas",
            studyProgram: user.studyProgram || "",
        });
    });

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function ConnectionsPage() {
    const router = useRouter();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = useMemo(
        () => (typeof window !== "undefined" ? localStorage.getItem("token") : null),
        []
    );

    useEffect(() => {
        async function loadConnections() {
            if (!token) {
                setError("Nepavyko nustatyti prisijungimo. Prisijunkite iš naujo.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const profileRes = await fetch(`${API_BASE}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!profileRes.ok) throw new Error("Nepavyko gauti vartotojo profilio.");
                const profile = await profileRes.json();

                const endpoints = [
                    `${API_BASE}/api/connections/accepted`,
                    `${API_BASE}/api/connections`,
                ];

                let rawConnections = null;
                for (const endpoint of endpoints) {
                    try {
                        const res = await fetch(endpoint, {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        if (res.ok) {
                            rawConnections = await res.json();
                            break;
                        }

                        console.warn(`Connections endpoint failed: ${endpoint} (${res.status})`);
                    } catch (endpointError) {
                        console.warn(`Connections endpoint unreachable: ${endpoint}`, endpointError);
                    }
                }

                if (!rawConnections) {
                    throw new Error("Nepavyko gauti ryšių sąrašo.");
                }

                setConnections(normalizeConnections(rawConnections, profile.id));
            } catch (err) {
                setError(err.message || "Įvyko klaida kraunant ryšius.");
            } finally {
                setLoading(false);
            }
        }

        loadConnections();
    }, [token]);

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto space-y-4">
                    <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">Ryšiai</h1>

                    {loading && (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="bg-white shadow rounded-lg p-4 animate-pulse h-20" />
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-100">
                            {error}
                        </div>
                    )}

                    {!loading && !error && connections.length === 0 && (
                        <div className="bg-white shadow rounded-lg p-12 text-center">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nėra ryšių</h2>
                            <p className="text-gray-500">Priimti ryšiai čia bus rodomi automatiškai.</p>
                        </div>
                    )}

                    {!loading && !error && connections.length > 0 && (
                        <div className="space-y-3">
                            {connections.map((connection) => (
                                <div
                                    key={connection.id}
                                    className="bg-white shadow rounded-lg p-4 flex items-center justify-between gap-3"
                                >
                                    <button
                                        onClick={() => router.push(`/profile/${connection.id}`)}
                                        className="flex items-center gap-3 min-w-0 text-left"
                                    >
                                        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
                                            {connection.name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{connection.name}</p>
                                            {connection.studyProgram && (
                                                <p className="text-sm text-gray-500 truncate">{connection.studyProgram}</p>
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => router.push(`/messages/${connection.id}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition"
                                    >
                                        Rašyti žinutę
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PrivateRoute>
    );
}
