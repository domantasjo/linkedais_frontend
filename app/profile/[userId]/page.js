"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PrivateRoute from "../../components/PrivateRouter";
import Navbar from "../../components/Navbar";

export default function UserProfilePage({ params }) {
    const { userId } = use(params);
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/users/${userId}`,
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
                        <div>
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
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg text-black font-semibold mb-2">Apie asmenį</h2>
                            <p className="text-black">{profile.bio}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg text-black font-semibold mb-3">Įgūdžiai</h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-4">Pagrindinė informacija</h2>
                        <ul className="space-y-2 text-black">
                            {profile.email && (
                                <li>
                                    <span className="font-medium">Paštas:</span>{" "}
                                    <span className="text-gray-700">{profile.email}</span>
                                </li>
                            )}
                            {profile.university && (
                                <li>
                                    <span className="font-medium">Universitetas:</span>{" "}
                                    <span className="text-gray-700">{profile.university}</span>
                                </li>
                            )}
                            {profile.studyProgram && (
                                <li>
                                    <span className="font-medium">Studijų programa:</span>{" "}
                                    <span className="text-gray-700">{profile.studyProgram}</span>
                                </li>
                            )}
                        </ul>
                    </div>

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
