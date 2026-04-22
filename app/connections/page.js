"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";
import ConnectionsPanel from "../components/ConnectionsPanel";
import { fetchCurrentUser, loadAcceptedConnections } from "../lib/connections";

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

                const profile = await fetchCurrentUser(token);
                const acceptedConnections = await loadAcceptedConnections(token, profile.id);
                setConnections(acceptedConnections);
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
                    <ConnectionsPanel
                        connections={connections}
                        loading={loading}
                        error={error}
                        emptyTitle="Nėra ryšių"
                        emptyDescription="Priimti ryšiai čia bus rodomi automatiškai."
                        onOpenProfile={(id) => router.push(`/profile/${id}`)}
                        onSendMessage={(id) => router.push(`/messages/${id}`)}
                    />
                </div>
            </div>
        </PrivateRoute>
    );
}
