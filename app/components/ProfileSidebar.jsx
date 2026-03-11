"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ProfileSidebar() {
    const router = useRouter();

    const scrollToSection = (id) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    }

    return (
        <div className="bg-white shadow rounded-lg p-4 sticky top-6 w-64 h-fit">
            <nav className="flex flex-col gap-3">
                <button onClick={() => scrollToSection("dashboard")}
                    className="text-black text-left px-2 py-1 rounded hover:bg-gray-200 hover:font-semibold transition-all duration-150">
                    Dashboard
                </button>
                <button onClick={() => scrollToSection("academic-record")}
                    className="text-black text-left px-2 py-1 rounded hover:bg-gray-200 hover:font-semibold transition-all duration-150">
                    Academic Record
                </button>
                <button onClick={() => scrollToSection("current-courses")}
                    className="text-black text-left px-2 py-1 rounded hover:bg-gray-200 hover:font-semibold transition-all duration-150">
                    Current Courses
                </button>
                <button onClick={() => scrollToSection("schedule")}
                    className="text-black text-left px-2 py-1 rounded hover:bg-gray-200 hover:font-semibold transition-all duration-150">
                    Schedule
                </button>
                <button onClick={() => scrollToSection("degree-progress")}
                    className="text-black text-left px-2 py-1 rounded hover:bg-gray-200 hover:font-semibold transition-all duration-150">
                    Degree Progress
                </button>
                <button onClick={() => scrollToSection("scholarships")}
                    className="text-black text-left px-2 py-1 rounded hover:bg-gray-200 hover:font-semibold transition-all duration-150">
                    Scholarships
                </button>
                <button onClick={() => scrollToSection("enrollment")}
                    className="text-black text-left px-2 py-1 rounded hover:bg-gray-200 hover:font-semibold transition-all duration-150">
                    Enrollment
                </button>
            </nav>

            {/* Logout button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-2 rounded text-red-600 hover:bg-red-50 hover:font-semibold transition-all duration-150">
                    Atsijungti
                </button>
            </div>
        </div>
    );
}