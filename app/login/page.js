"use client";
import { useState } from "react";

export default function LoginPage() {
    const[email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const[isLoggedIn, setIsLoggedIn] = useState("");
    const handleRegister = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setIsLoggedIn("Registered successfully!");
            } else {
                setIsLoggedIn(data.message || "Registration failed");
            }
        } catch (err) {
            setIsLoggedIn("Server error");
        }
    };

    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok && data.token) {
                localStorage.setItem("token", data.token);
                setIsLoggedIn("Logged in successfully!");
            } else {
                setIsLoggedIn(data.message || "Invalid credentials");
            }
        } catch (err) {
            setIsLoggedIn("Server error");
        }
    };
    return(
        /* 1. The Background */
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

            {/* 2. The Card */}
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full space-y-6">

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-gray-800">Prisijungti</h1>

                {/* Status Message */}
                {isLoggedIn && (
                    <div className="text-center text-sm font-medium text-red-600 bg-red-50 p-2 rounded">
                        {isLoggedIn}
                    </div>
                )}

                {/* The Form Fields */}
                <div className="space-y-4">

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
                            El. paštas:
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="įveskite el. paštą"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // This makes the input look nice with a border
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Slaptažodis:
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="įveskite slaptažodį"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={handleLogin}
                        className="w-full bg-gray-800 text-white font-semibold py-2 rounded-md hover:bg-gray-700 transition active:scale-95"
                    >
                        Prisijungti
                    </button>

                    <button
                        onClick={handleRegister}
                        className="w-full bg-white text-gray-800 border border-gray-300 font-semibold py-2 rounded-md hover:bg-gray-50 transition active:scale-95"
                    >
                        Registruotis
                    </button>
                </div>

            </div>
        </div>
    );
}