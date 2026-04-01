"use client";
import { useEffect, useState } from "react";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/notifications", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

    const handleAccept = async (connectionId, notificationId) => {
        await fetch(`http://localhost:8080/api/connections/accept/${connectionId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setNotifications(notifications.filter(n => n.id !== notificationId));
    };

    const handleReject = async (connectionId, notificationId) => {
        await fetch(`http://localhost:8080/api/connections/reject/${connectionId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setNotifications(notifications.filter(n => n.id !== notificationId));
    };

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto space-y-4">
                    <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">
                        Pranešimai
                    </h1>

                    {loading ? (
                        <p className="text-center text-gray-500">Kraunama...</p>
                    ) : notifications.length === 0 ? (
                        <p className="text-center text-gray-400">Nėra naujų pranešimų.</p>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification.id} className="bg-white shadow rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-900">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleString("lt-LT")}
                                        </p>
                                    </div>

                                    {/* Show accept/reject only for connection requests */}
                                    {notification.type === "CONNECTION_REQUEST" && (
                                        <div className="flex gap-2 ml-4">
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PrivateRoute>
    );
}