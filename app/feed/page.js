"use client";
import { useState } from "react";
import PrivateRoute from "../components/PrivateRouter";

const tempPosts =[
    {
        id: 1,
        author: "Jonas Jonaitis",
        time: "Prieš 2 valandas",
        content: "Sveiki visi. Pradejau mokytis Next.js labaaai smagu.",
        likes:1
    },
    {
        id: 2,
        author: "Sigmas Petrutis",
        time: "Prieš 3 valandas",
        content: "sveiki visi.",
        likes:0
    },
    {
        id: 3,
        author: "Petras Lizdas",
        time: "Prieš 1 diena",
        content: "Jeskau darbo baigeu studijas.",
        likes:250
    },
    {
        id: 4,
        author: "Jonas Salonas",
        time: "Prieš 5 valandas",
        content: "testuoju.",
        likes:1
    },
];

export default function FeedPage(){
    const [posts, setPosts] = useState(tempPosts);

    return(
        <PrivateRoute>
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Feed Container */}
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Page Title */}
                <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">
                    Naujienos
                </h1>

                {/* Cards */}
                {posts.map((post) => (
                    // Design
                    <div key={post.id} className="bg-white shadow rounded-lg p-6">

                        {/* Card Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-900 text-lg hover:text-gray-500">{post.author}</h2>

                            <span className="text-sm text-gray-500">{post.time}</span>
                        </div>

                        {/* Card Body */}
                        <p className="text-gray-700 mb-4">
                            {post.content}
                        </p>

                        {/* Card Footer */}
                        <div className="flex items-center text-gray-500 border-t pt-3">
                            <button className="flex items-center gap-2 hover:text-gray-700">
                                <span> Patinka ({post.likes})</span>
                            </button>
                        </div>

                    </div>

                ))}

            </div>
        </div>
        </PrivateRoute>
    );
}