"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import PrivateRoute from "../components/PrivateRouter";

export default function AdminPanel() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("courses"); // courses | students | grades

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8080/api/user/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("DEBUG: Mano autoritetai:", data.authorities);

                    // Tikriname visas įmanomas ADMIN variacijas (su ROLE_ priedu ir be jo)
                    const hasAdminRole = data.authorities.some(auth => {
                        const a = auth.authority.toUpperCase();
                        return a === "ADMIN" || a === "ROLE_ADMIN";
                    });

                    if (hasAdminRole) {
                        setIsAdmin(true);
                    } else {
                        console.warn("Prieiga uždrausta: trūksta ADMIN rolės.");
                        router.push("/feed");
                    }
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Klaida tikrinant statusą:", error);
                router.push("/feed");
            } finally {
                setLoading(false);
            }
        };
        checkAdminStatus();
    }, [router]);

    if (loading) {
        return (
            <PrivateRoute>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">
                    Tikrinama apsauga...
                </div>
            </PrivateRoute>
        );
    }

    if (!isAdmin) return null;

    const tabs = [
        { id: "courses", label: "Kursai" },
        { id: "students", label: "Studentai" },
        { id: "grades", label: "Pažymiai" },
    ];

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">
                        Administratoriaus Panelė
                    </h1>

                    {/* Tab navigation */}
                    <div className="flex space-x-4 border-b border-gray-300 mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-4 font-semibold transition-colors ${
                                    activeTab === tab.id
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Section placeholder content */}
                    <div className="bg-white shadow rounded-lg p-6 min-h-[400px]">
                        {activeTab === "courses" && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-gray-800">
                                    Kursų valdymas
                                </h2>
                                <p className="text-gray-600">
                                    Čia bus kursų kūrimo ir valdymo forma.
                                </p>
                            </div>
                        )}
                        {activeTab === "students" && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-gray-800">
                                    Studentų registracija
                                </h2>
                                <p className="text-gray-600">
                                    Čia bus studentų priskyrimo prie kursų sąrašas.
                                </p>
                            </div>
                        )}
                        {activeTab === "grades" && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-gray-800">
                                    Pažymių knygelė
                                </h2>
                                <p className="text-gray-600">
                                    Čia bus pažymių įvedimo sistema.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PrivateRoute>
    );
}