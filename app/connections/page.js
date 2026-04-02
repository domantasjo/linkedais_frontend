"use client";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";

export default function ConnectionsPage() {
    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto space-y-4">
                    <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">
                        Ryšiai
                    </h1>
                    <div className="bg-white shadow rounded-lg p-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            Nėra ryšių
                        </h2>
                        <p className="text-gray-500">
                            Ryšių funkcija bus prieinama netrukus.
                        </p>
                    </div>
                </div>
            </div>
        </PrivateRoute>
    );
}
