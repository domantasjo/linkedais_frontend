"use client";
import PrivateRoute from "../components/PrivateRouter";
import Navbar from "../components/Navbar";

export default function MessagesPage() {
    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto space-y-4">
                    <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">
                        Žinutės
                    </h1>
                    <div className="bg-white shadow rounded-lg p-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            Nėra žinučių
                        </h2>
                        <p className="text-gray-500">
                            Žinučių funkcija bus prieinama netrukus.
                        </p>
                    </div>
                </div>
            </div>
        </PrivateRoute>
    );
}
