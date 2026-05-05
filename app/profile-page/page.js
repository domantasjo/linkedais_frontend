"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrivateRoute from "../components/PrivateRouter";
import ProfileSidebar from "../components/ProfileSidebar";
import Navbar from "../components/Navbar";
import DegreeProgress from "../components/DegreeProgress";
import ScheduleView from "../components/ScheduleView";
import ConnectionsPanel from "../components/ConnectionsPanel";
import { API_BASE, loadAcceptedConnections } from "../lib/connections";

export default function Page() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        bio: "",
        university: "",
        studyProgram: "",
        skills: [],
    });
    const [newSkill, setNewSkill] = useState("");
    const [saveStatus, setSaveStatus] = useState(null);
    const [saving, setSaving] = useState(false);
    const [connections, setConnections] = useState([]);
    const [connectionsLoading, setConnectionsLoading] = useState(true);
    const [connectionsError, setConnectionsError] = useState("");

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/api/user/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();
            setProfile({
                id: data.id,
                name: data.name || "",
                email: data.email || "",
                bio: data.bio || "",
                headline: data.headline || "",
                university: data.university || "",
                studyProgram: data.studyProgram || "",
                skills: data.skills || [],
                courses: data.courses || [],
            });
            fetchProfileConnections(data.id, token);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setConnectionsLoading(false);
        }
    };

    const fetchProfileConnections = async (userId, token) => {
        try {
            setConnectionsLoading(true);
            setConnectionsError("");
            const acceptedConnections = await loadAcceptedConnections(token, userId);
            setConnections(acceptedConnections);
        } catch (error) {
            setConnections([]);
            setConnectionsError(error.message || "Nepavyko gauti ryšių sąrašo.");
        } finally {
            setConnectionsLoading(false);
        }
    };

    const startEditing = () => {
        setEditForm({
            name: profile.name,
            bio: profile.bio,
            headline: profile.headline,
            university: profile.university,
            studyProgram: profile.studyProgram,
            skills: [...profile.skills],
        });
        setIsEditing(true);
        setSaveStatus(null);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setSaveStatus(null);
        setNewSkill("");
    };

    const handleFormChange = (field, value) => {
        setEditForm({ ...editForm, [field]: value });
    };

    const handleAddSkill = () => {
        const trimmed = newSkill.trim();
        if (!trimmed) return;
        if (editForm.skills.includes(trimmed)) return;
        setEditForm({ ...editForm, skills: [...editForm.skills, trimmed] });
        setNewSkill("");
    };

    const handleRemoveSkill = (skillToRemove) => {
        setEditForm({
            ...editForm,
            skills: editForm.skills.filter((s) => s !== skillToRemove),
        });
    };

    const handleSaveProfile = async () => {
        if (!editForm.name.trim()) return;

        setSaving(true);
        setSaveStatus(null);

        try {
            const response = await fetch(`${API_BASE}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: editForm.name,
                    bio: editForm.bio,
                    headline: editForm.headline,
                    university: editForm.university,
                    studyProgram: editForm.studyProgram,
                    skills: editForm.skills,
                })
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                setProfile({
                    ...profile,
                    name: updatedProfile.name,
                    bio: updatedProfile.bio,
                    university: updatedProfile.university,
                    studyProgram: updatedProfile.studyProgram,
                    skills: updatedProfile.skills || [],
                });
                setIsEditing(false);
                setSaveStatus("success");
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus("error");
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            setSaveStatus("error");
        } finally {
            setSaving(false);
        }
    };

    if (!profile) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <p className="text-black">Kraunamas profilis...</p>
            </div>
        );
    }
    return (
        <PrivateRoute>
            <Navbar />
            <div className="flex w-full max-w-[1200px] mx-auto gap-6 p-6">
                {/* Sidebar */}
                <ProfileSidebar />

                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* Success / Error banner */}
                    {saveStatus === "success" && (
                        <div className="bg-green-50 text-green-700 text-sm font-medium p-3 rounded-lg">
                            Profilis sėkmingai atnaujintas!
                        </div>
                    )}
                    {saveStatus === "error" && (
                        <div className="bg-red-50 text-red-700 text-sm font-medium p-3 rounded-lg">
                            Nepavyko atnaujinti profilio. Bandykite dar kartą.
                        </div>
                    )}

                    {/* Profile Header */}
                    <div id="dashboard" className="bg-white shadow rounded-lg p-6 flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600">
                            {(isEditing ? editForm.name : profile.name)?.charAt(0)}
                        </div>

                        <div className="flex-1">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => handleFormChange("name", e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 text-black text-xl font-semibold w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Vardas"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        value={editForm.headline}
                                        onChange={(e) => handleFormChange("headline", e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-1 text-black text-sm w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Antraštė (pvz., AI Safety Researcher, Student)"
                                        maxLength={120}
                                    />
                                </>
                            ) : (
                                <>
                                    <h1 className="text-2xl text-black font-semibold">{profile.name}</h1>
                                    <p className="text-gray-600 text-md mt-1">
                                        {profile.headline || "Be antraštės"}
                                    </p>
                                </>
                            )}
                            <p className="text-gray-600 mt-1">{profile.studyProgram || "Studijų programa nenurodyta"}</p>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={startEditing}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition"
                            >
                                Redaguoti profilį
                            </button>
                        )}
                    </div>

                    {/* About Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Apie asmenį</h2>
                        {isEditing ? (
                            <textarea
                                value={editForm.bio}
                                onChange={(e) => handleFormChange("bio", e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                                rows={3}
                                placeholder="Parašykite apie save..."
                            />
                        ) : (
                            <p className="text-black">{profile.bio || "Bio nenurodyta."}</p>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-4">Pagrindinė informacija</h2>
                        <div className="space-y-3 text-black">
                            <div>
                                <span className="font-medium">Paštas:</span>{" "}
                                <span className="text-gray-700">{profile.email}</span>
                            </div>
                            <div>
                                <span className="font-medium">Universitetas:</span>{" "}
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.university}
                                        onChange={(e) => handleFormChange("university", e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 ml-1"
                                        placeholder="Pvz., Kauno technologijos universitetas"
                                    />
                                ) : (
                                    <span className="text-gray-700">{profile.university || "Nenurodyta"}</span>
                                )}
                            </div>
                            <div>
                                <span className="font-medium">Studijų programa:</span>{" "}
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.studyProgram}
                                        onChange={(e) => handleFormChange("studyProgram", e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 ml-1"
                                        placeholder="Pvz., Programų sistemos"
                                    />
                                ) : (
                                    <span className="text-gray-700">{profile.studyProgram || "Nenurodyta"}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-3">Įgūdžiai</h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {(isEditing ? editForm.skills : profile.skills).length === 0 && (
                                <p className="text-gray-400 text-sm">Įgūdžių dar nėra.</p>
                            )}
                            {(isEditing ? editForm.skills : profile.skills).map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                                >
                                    {skill}
                                    {isEditing && (
                                        <button
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="text-blue-500 hover:text-blue-800 ml-1 font-bold"
                                        >
                                            ×
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddSkill();
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-1 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Naujas įgūdis..."
                                />
                                <button
                                    onClick={handleAddSkill}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                >
                                    Pridėti
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Courses Section */}
                    {(!isEditing && profile.courses && profile.courses.length > 0) && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg text-black font-semibold mb-4">Mano kursai</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.courses.map(course => (
                                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                                        <h3 className="font-semibold text-black mb-1">{course.name}</h3>
                                        <p className="text-gray-600 text-sm">Dėstytojas: {course.instructor}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <ConnectionsPanel
                        title="Mano ryšiai"
                        connections={connections}
                        loading={connectionsLoading}
                        error={connectionsError}
                        emptyTitle="Dar neturite ryšių"
                        emptyDescription="Priimti ryšiai čia bus rodomi automatiškai."
                        onOpenProfile={(id) => router.push(`/profile/${id}`)}
                    />

                    {/* Edit action buttons */}
                    {isEditing && (
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelEditing}
                                className="bg-gray-300 text-black px-5 py-2 rounded-lg text-sm hover:bg-gray-400 transition"
                            >
                                Atšaukti
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="bg-blue-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Saugoma..." : "Išsaugoti"}
                            </button>
                        </div>
                    )}

                    {/* Academic Record Section */}
                    <div id="academic-record" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Akademiniai rezultatai</h2>
                        <p className="text-black">Akademinių rezultatų informacija...</p>
                    </div>

                    {/* Current Courses Section */}
                    <div id="current-courses" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Dabartiniai kursai</h2>
                        <p className="text-black">Dabartinių kursų informacija...</p>
                    </div>

                    {/* Schedule Section */}
                    <div id="schedule" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-4">Tvarkaraštis</h2>
                        {profile?.id ? (
                            <ScheduleView userId={profile.id} />
                        ) : (
                            <p className="text-gray-500 text-sm">Loading schedule...</p>
                        )}
                    </div>

                    {/* Degree-progress Section */}
                    <div id="degree-progress" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-4">Studijų progresas</h2>
                        {profile?.id ? (
                            <DegreeProgress userId={profile.id} />
                        ) : (
                            <p className="text-gray-500 text-sm">Loading profile...</p>
                        )}
                    </div>

                    {/* Scholarships Section */}
                    <div id="scholarships" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Stipendijos</h2>
                        <p className="text-black">Stipendijų informacija...</p>
                    </div>
                </div>
            </div>
        </PrivateRoute>
    );
}