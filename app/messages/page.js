"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";
import { fetchCurrentUser, loadAcceptedConnections } from "../lib/connections";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function MessagesPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = useMemo(
        () => (typeof window !== "undefined" ? localStorage.getItem("token") : null),
        []
    );

    useEffect(() => {
        async function loadInbox() {
            if (!token) {
                setError("Prisijungimo sesija nerasta. Prisijunkite iš naujo.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const profile = await fetchCurrentUser(token);
                setCurrentUser(profile);

                const conversationsRes = await fetch(`${API_BASE}/api/messages/conversations?userId=${profile.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!conversationsRes.ok) {
                    setError("Nepavyko uzkrauti pokalbiu.");
                    setConversations([]);
                    return;
                }
                setConversations(await conversationsRes.json());

                try {
                    const acceptedConnections = await loadAcceptedConnections(token, profile.id);
                    setConnections(acceptedConnections);
                } catch {
                    setConnections([]);
                }
            } catch (err) {
                setError(err.message || "Failed to load conversations.");
            } finally {
                setLoading(false);
            }
        }

        loadInbox();
    }, [token]);

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto py-10 px-4">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Žinutės</h1>
                    <p className="text-sm text-gray-500 mt-1">Tavo pokalbiai ir greita nauja žinutė ryšiams</p>
                </div>

                {/* Quick connections actions */}
                {!loading && !error && connections.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ryšiai</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {connections.map((connection) => (
                                <Link
                                    key={connection.id}
                                    href={`/messages/${connection.id}`}
                                    className="px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-sm whitespace-nowrap"
                                >
                                    {connection.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* States */}
                {loading && (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-4 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
                        {error}
                    </div>
                )}

                {!loading && !error && conversations.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-4xl mb-3">✉️</p>
                        <p className="font-medium text-gray-600">Pokalbių dar nėra</p>
                        <p className="text-sm mt-1">Pasirink ryšį viršuje ir parašyk pirmą žinutę.</p>
                    </div>
                )}

                {/* Conversation list */}
                {!loading && !error && conversations.length > 0 && (
                    <ul className="space-y-2">
                        {conversations.map((convo) => {
                            const other =
                                convo.senderId === currentUser?.id
                                    ? { id: convo.receiverId, name: convo.receiverName }
                                    : { id: convo.senderId, name: convo.senderName };

                            const preview = convo.deleted
                                ? "This message was deleted."
                                : convo.content;

                            const time = new Date(convo.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                            });

                            return (
                                <li key={convo.id}>
                                    <Link
                                        href={`/messages/${other.id}`}
                                        className="flex items-center gap-4 bg-white hover:bg-blue-50 transition-colors rounded-xl px-4 py-3.5 shadow-sm border border-gray-100 group"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center flex-shrink-0">
                                            {other.name?.[0]?.toUpperCase() || "?"}
                                        </div>

                                        {/* Preview */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                                {other.name}
                                            </p>
                                            <p className="text-sm text-gray-400 truncate mt-0.5">{preview}</p>
                                        </div>

                                        {/* Time */}
                                        <span className="text-xs text-gray-400 flex-shrink-0">{time}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
                </div>
            </div>
        </PrivateRoute>
    );
}