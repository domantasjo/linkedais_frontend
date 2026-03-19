"use client";
import { useEffect, useState } from "react";
import PrivateRoute from "../components/PrivateRouter";
import ProfileSidebar from "../components/ProfileSidebar";
import Navbar from "../components/Navbar";

export default function Page() {
    const [profile, setProfile] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            // Only the name is real from backend, rest is mock
            setProfile({
                name: data.name,  // Real from backend
                role: "Programų sistemų studentas",
                email: "Petras.petrait@ktu.lt",
                bio: "Stropus studentas besidomintis programavimu.",
                course: "3 kursas"
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const handleNameUpdate = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/user/profile/name', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                setProfile({...profile, name: updatedProfile.name});
                setIsEditingName(false);
            }
        } catch (error) {
            console.error('Failed to update name:', error);
        }
    };

    if (!profile) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <p className="text-black">Loading profile...</p>
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
                    {/* Profile Header */}
                    <div id="dashboard" className="bg-white shadow rounded-lg p-6 flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600">
                            {profile.name?.charAt(0)}
                        </div>

                        <div className="flex-1">
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="border rounded px-3 py-1 text-black"
                                        placeholder="New name"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleNameUpdate}
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditingName(false)}
                                        className="bg-gray-300 text-black px-3 py-1 rounded text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl text-black font-semibold">{profile.name}</h1>
                                    <button
                                        onClick={() => {
                                            setNewName(profile.name);
                                            setIsEditingName(true);
                                        }}
                                        className="text-blue-500 text-sm hover:text-blue-700"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                            <p className="text-gray-600">{profile.role}</p>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Apie asmenį</h2>
                        <p className="text-black">{profile.bio}</p>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-4">Basic Information</h2>
                        <ul className="space-y-2 text-black">
                            <li>
                                <span className="font-medium">Paštas:</span> {profile.email}
                            </li>
                            <li>
                                <span className="font-medium">Kursas:</span> {profile.course}
                            </li>
                        </ul>
                    </div>

                    {/* Academic Record Section */}
                    <div id="academic-record" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Academic Record</h2>
                        <p className="text-black">Academic record details go here...</p>
                    </div>

                    {/* Current Courses Section */}
                    <div id="current-courses" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Current Courses</h2>
                        <p className="text-black">Current courses details go here...</p>
                    </div>

                    {/* Schedule Section */}
                    <div id="schedule" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Schedule</h2>
                        <p className="text-black">Schedule details go here...</p>
                    </div>

                    {/* Degree-progress Section */}
                    <div id="degree-progress" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Degree Progress</h2>
                        <p className="text-black">Degree progress details...</p>
                    </div>

                    {/* Scholarships Section */}
                    <div id="scholarships" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Scholarships</h2>
                        <p className="text-black">Scholarship details...</p>
                    </div>

                    {/* Enrollment Section */}
                    <div id="enrollment" className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg text-black font-semibold mb-2">Enrollment</h2>
                        <p className="text-black">Enrollment details...</p>
                    </div>
                </div>
            </div>
        </PrivateRoute>
    );
}