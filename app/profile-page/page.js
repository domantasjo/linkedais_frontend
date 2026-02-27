"use client";
import { useEffect, useState } from "react";

export default function Page() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            setProfile({
                name: "Petras Petraitis",
                role: "Programų sistemų studentas",
                email: "Petras.petrait@ktu.lt",
                bio: "Stropus studentas besidomintis programavimu.",
                course: "3 kursas"
            });
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (!profile) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Profile Header */}
            <div className="bg-white shadow rounded-lg p-6 flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600">
                    PP
                </div>

                <div>
                    <h1 className="text-2xl font-semibold">{profile.name}</h1>
                    <p className="text-gray-600">{profile.role}</p>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-2">Apie asmenį</h2>
                <p className="text-gray-700">{profile.bio}</p>
            </div>

            {/* Basic Info */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <ul className="space-y-2 text-gray-700">
                    <li>
                        <span className="font-medium">Paštas:</span> {profile.email}
                    </li>
                    <li>
                        <span className="font-medium">Kursas:</span> {profile.course}
                    </li>
                </ul>
            </div>
        </div>
    );
}