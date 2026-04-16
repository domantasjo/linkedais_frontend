"use client";
import { useEffect, useState } from "react";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function toArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actedIds, setActedIds] = useState(new Set());
    const [actionError, setActionError] = useState("");

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await fetch(`${API_BASE}/api/notifications`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            if (!response.ok) {
                throw new Error("Nepavyko gauti pranešimų.");
            }

            const data = toArray(await response.json());
            const initialActedIds = new Set(
                data
                    .filter((n) => n?.type === "CONNECTION_REQUEST" && n?.read)
                    .map((n) => n.id)
            );

            // If backend already moved request out of PENDING, don't show accept/reject again after refresh.
            try {
                const connectionsRes = await fetch(`${API_BASE}/api/connections`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (connectionsRes.ok) {
                    const connections = toArray(await connectionsRes.json());
                    const handledConnectionIds = new Set(
                        connections
                            .filter((c) => c?.id && c?.status && c.status !== "PENDING")
                            .map((c) => Number(c.id))
                    );

                    data.forEach((notification) => {
                        if (
                            notification?.type === "CONNECTION_REQUEST" &&
                            handledConnectionIds.has(Number(notification?.connectionId))
                        ) {
                            initialActedIds.add(notification.id);
                        }
                    });
                }
            } catch (connectionLookupError) {
                console.warn("Failed to verify connection request states:", connectionLookupError);
            }

            setActedIds(initialActedIds);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setNotifications((prev) => prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch(`${API_BASE}/api/notifications/read-all`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    const handleAccept = async (connectionId, notificationId) => {
        setActionError("");
        try {
            const acceptRes = await fetch(`${API_BASE}/api/connections/accept/${connectionId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            if (!acceptRes.ok) {
                throw new Error("Nepavyko priimti ryšio užklausos.");
            }

            await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            setActedIds(prev => new Set(prev).add(notificationId));
            setNotifications((prev) => prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to accept connection request:", error);
            setActionError(error.message || "Nepavyko atnaujinti užklausos.");
        }
    };

    const handleReject = async (connectionId, notificationId) => {
        setActionError("");
        try {
            const rejectRes = await fetch(`${API_BASE}/api/connections/reject/${connectionId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            if (!rejectRes.ok) {
                throw new Error("Nepavyko atmesti ryšio užklausos.");
            }

            await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            setActedIds(prev => new Set(prev).add(notificationId));
            setNotifications((prev) => prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to reject connection request:", error);
            setActionError(error.message || "Nepavyko atnaujinti užklausos.");
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-blue-500">
                            Pranešimai
                        </h1>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-500 hover:text-blue-600 font-medium transition"
                            >
                                Pažymėti visus kaip skaitytus ({unreadCount})
                            </button>
                        )}
                    </div>

                    {actionError && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-100">
                            {actionError}
                        </div>
                    )}

                    {loading ? (
                        <p className="text-center text-gray-500">Kraunama...</p>
                    ) : notifications.length === 0 ? (
                        <p className="text-center text-gray-400">Nėra pranešimų.</p>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`shadow rounded-lg p-6 transition ${
                                    notification.read
                                        ? "bg-white"
                                        : "bg-blue-50 border-l-4 border-blue-500"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {!notification.read && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                            )}
                                            <p className={`${notification.read ? "text-gray-500" : "text-gray-900 font-medium"}`}>
                                                {notification.message}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleString("lt-LT")}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {/* Show accept/reject for connection requests that haven't been acted on */}
                                        {notification.type === "CONNECTION_REQUEST" && !notification.read && !actedIds.has(notification.id) && (
                                            <>
                                                <button
                                                    onClick={() => handleAccept(notification.connectionId, notification.id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                                                >
                                                    Priimti
                                                </button>
                                                <button
                                                    onClick={() => handleReject(notification.connectionId, notification.id)}
                                                    className="bg-red-100 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-200"
                                                >
                                                    Atmesti
                                                </button>
                                            </>
                                        )}

                                        {/* Mark individual as read button */}
                                        {!notification.read && notification.type !== "CONNECTION_REQUEST" && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="text-xs text-gray-400 hover:text-blue-500 transition"
                                                title="Pažymėti kaip skaitytą"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        )}

                                        {notification.read && (
                                            <span className="text-xs text-gray-400">Skaityta</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PrivateRoute>
    );
}