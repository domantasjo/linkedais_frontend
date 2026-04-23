"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import PrivateRoute from "../components/PrivateRouter";
import CoursesManager from "./components/CoursesManager";
import CourseDetail from "./components/CourseDetail";

export default function AdminPanel() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8080/api/user/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
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

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">
                        Administratoriaus Panelė
                    </h1>

                    <div className="bg-white shadow rounded-lg p-6 min-h-[400px]">
                        {selectedCourse ? (
                            <CourseDetail
                                course={selectedCourse}
                                onBack={() => setSelectedCourse(null)}
                            />
                        ) : (
                            <CoursesManager onSelectCourse={setSelectedCourse} />
                        )}
                    </div>
                </div>
            </div>
        </PrivateRoute>
    );
}
