"use client";
import { useEffect, useState } from "react";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/notifications", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch("http://localhost:8080/api/notifications/read-all", {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    const handleAccept = async (connectionId, notificationId) => {
        await fetch(`http://localhost:8080/api/connections/accept/${connectionId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        setNotifications(notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        ));
    };

    const handleReject = async (connectionId, notificationId) => {
        await fetch(`http://localhost:8080/api/connections/reject/${connectionId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        setNotifications(notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        ));
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
                                        {/* Show accept/reject only for unread connection requests */}
                                        {notification.type === "CONNECTION_REQUEST" && !notification.read && (
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