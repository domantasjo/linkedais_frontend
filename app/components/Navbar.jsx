"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState("");
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    const getToken = () => localStorage.getItem("token");

    // Fetch current user name for profile picture
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/user/profile", {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserName(data.name || "");
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };
        fetchUser();
    }, []);

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

    const isActive = (path) => pathname === path;

    const navItems = [
        {
            label: "Kurti įrašą",
            path: "/feed",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            ),
        },
        {
            label: "Žinutės",
            path: "/messages",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
        },
        {
            label: "Ryšiai",
            path: "/connections",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            label: "Pranešimai",
            path: "/notifications",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
        },
    ];

    return (
        <nav className="bg-white shadow sticky top-0 z-50">
            <div className="max-w-[1200px] mx-auto px-6 py-2 flex items-center justify-between">
                {/* Logo / Brand */}
                <button
                    onClick={() => router.push("/feed")}
                    className="text-xl font-bold text-blue-500 hover:text-blue-600 transition shrink-0"
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

                {/* Nav Icons */}
                <div className="flex items-center gap-1">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`flex flex-col items-center px-3 py-1 rounded-md transition ${
                                isActive(item.path)
                                    ? "text-blue-500 border-b-2 border-blue-500"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                            title={item.label}
                        >
                            {item.icon}
                            <span className="text-[10px] mt-0.5">{item.label}</span>
                        </button>
                    ))}

                    {/* Profile Picture */}
                    <button
                        onClick={() => router.push("/profile-page")}
                        className={`flex flex-col items-center px-3 py-1 rounded-md transition ${
                            isActive("/profile-page")
                                ? "text-blue-500 border-b-2 border-blue-500"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        title="Profilis"
                    >
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {userName?.charAt(0) || "?"}
                        </div>
                        <span className="text-[10px] mt-0.5">Profilis</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
