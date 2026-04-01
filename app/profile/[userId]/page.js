"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PrivateRoute from "../../components/PrivateRouter";
import Navbar from "../../components/Navbar";

export default function UserProfilePage({ params }) {
    const { userId } = use(params);
    const cleanUserId = userId?.toString().split(":")[0];
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [academic, setAcademic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState("NONE");

    useEffect(() => {
        fetchUserProfile();
        fetchConnectionStatus();
        fetchAcademicDashboard();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/users/${Number(cleanUserId)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAcademicDashboard = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/users/${Number(cleanUserId)}/academic`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setAcademic(data);
            }
        } catch (error) {
            console.error("Failed to fetch academic dashboard:", error);
        }
    };

    const fetchConnectionStatus = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/connections/status/${Number(cleanUserId)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            if (response.ok) {
                const data = await response.text();
                setConnectionStatus(data);
            }
        } catch (error) {
            console.error("Failed to fetch connection status:", error);
        }
    };

    const handleConnect = async () => {
        try {
            await fetch(
                `http://localhost:8080/api/connections/send/${Number(cleanUserId)}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setConnectionStatus("PENDING");
        } catch (error) {
            console.error("Failed to send connection request:", error);
        }
    };

    const getConnectButton = () => {
        if (connectionStatus === "ACCEPTED") {
            return <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">Sujungti ✓</span>;
        }
        if (connectionStatus === "PENDING") {
            return <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">Laukiama...</span>;
        }
        return (
            <button
                onClick={handleConnect}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
                Pridėti į kontaktus
            </button>
        );
    };

    if (loading) {
        return (
            <PrivateRoute>
                <Navbar />
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Kraunama...</p>
                </div>
            </PrivateRoute>
        );
    }

    if (!profile) {
        return (
            <PrivateRoute>
                <Navbar />
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Vartotojas nerastas.</p>
                </div>
            </PrivateRoute>
        );
    }

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Profile Header */}
                    <div className="bg-white shadow rounded-lg p-6 flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600">
                            {profile.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl text-black font-semibold">
                                {profile.name}
                            </h1>
                            {profile.studyProgram && (
                                <p className="text-gray-600">{profile.studyProgram}</p>
                            )}
                            {profile.university && (
                                <p className="text-gray-500 text-sm">{profile.university}</p>
                            )}
                        </div>
                        <div>
                            {getConnectButton()} {}
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Apie asmenį</h2>
                        <p className="text-black">{profile.bio || <span className="text-gray-400 text-sm">Bio nenurodyta.</span>}</p>
                    </div>

                    {/* Skills */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-3">Įgūdžiai</h2>
                        {profile.skills && profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">Įgūdžių nenurodyta.</p>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-4">Pagrindinė informacija</h2>
                        <ul className="space-y-2 text-black">
                            <li>
                                <span className="font-medium">Universitetas:</span>{" "}
                                <span className="text-gray-700">{profile.university || "Nenurodyta"}</span>
                            </li>
                            <li>
                                <span className="font-medium">Studijų programa:</span>{" "}
                                <span className="text-gray-700">{profile.studyProgram || "Nenurodyta"}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Academic Dashboard */}
                    {academic && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg text-black font-semibold mb-4">Akademinė informacija</h2>

                            {/* Degree Progress */}
                            <div className="mb-4">
                                <h3 className="text-base text-gray-700 font-medium mb-1">Studijų progresas</h3>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${academic.degreeProgress || 0}%` }}></div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{academic.degreeProgress || 0}% baigta</p>
                            </div>

                            {/* Upcoming Schedule */}
                            <div className="mb-4">
                                <h3 className="text-base text-gray-700 font-medium mb-1">Artėjantis tvarkaraštis</h3>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{academic.upcomingSchedule || "Nėra artėjančių užsiėmimų"}</p>
                            </div>

                            {/* Academic Record Summary */}
                            <div className="mb-4">
                                <h3 className="text-base text-gray-700 font-medium mb-1">Akademinė suvestinė</h3>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{academic.academicRecordSummary || "Nėra informacijos"}</p>
                            </div>

                            {/* Current Courses */}
                            {academic.courses && academic.courses.length > 0 && (
                                <div>
                                    <h3 className="text-base text-gray-700 font-medium mb-3">Dabartiniai kursai</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {academic.courses.map(course => (
                                            <div key={course.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                                                <h4 className="font-semibold text-black mb-1">{course.name}</h4>
                                                <p className="text-gray-600 text-sm">Dėstytojas: {course.instructor}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Back button */}
                    <button
                        onClick={() => router.back()}
                        className="text-blue-500 hover:text-blue-700 text-sm transition"
                    >
                        ← Grįžti atgal
                    </button>
                </div>
            </div>
        </PrivateRoute>
    );
}
