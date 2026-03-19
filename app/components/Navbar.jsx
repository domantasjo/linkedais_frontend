"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    const getToken = () => localStorage.getItem("token");

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const searchUsers = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/users/search?name=${encodeURIComponent(query)}`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );
            const data = await response.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (error) {
            console.error("Failed to search users:", error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Debounce the search
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            searchUsers(value);
        }, 300);
    };

    const handleUserClick = (userId) => {
        setShowResults(false);
        setSearchQuery("");
        setSearchResults([]);
        router.push(`/profile/${userId}`);
    };

    return (
        <nav className="bg-white shadow sticky top-0 z-50">
            <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo / Brand */}
                <button
                    onClick={() => router.push("/feed")}
                    className="text-xl font-bold text-blue-500 hover:text-blue-600 transition"
                >
                    LinkedAIS
                </button>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md mx-6" ref={searchRef}>
                    <div className="relative">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => {
                                if (searchResults.length > 0) setShowResults(true);
                            }}
                            placeholder="Ieškoti vartotojų..."
                            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                            {loading ? (
                                <div className="p-3 text-sm text-gray-500 text-center">
                                    Ieškoma...
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="p-3 text-sm text-gray-400 text-center">
                                    Vartotojų nerasta.
                                </div>
                            ) : (
                                searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleUserClick(user.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                                            {user.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {user.name}
                                            </p>
                                            {user.studyProgram && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user.studyProgram}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/feed")}
                        className="text-sm text-gray-600 hover:text-gray-900 transition"
                    >
                        Naujienos
                    </button>
                    <button
                        onClick={() => router.push("/profile-page")}
                        className="text-sm text-gray-600 hover:text-gray-900 transition"
                    >
                        Profilis
                    </button>
                </div>
            </div>
        </nav>
    );
}
