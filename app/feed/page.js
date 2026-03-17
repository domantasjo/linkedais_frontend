"use client";
import {useEffect, useState} from "react";
import PrivateRoute from "../components/PrivateRouter";

export default function FeedPage(){
    const [posts, setPosts] = useState([]);
    const [newContent, setNewContent] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/posts", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            setPosts(data);
        };
        fetchPosts();
    }, []);

    const handleCreatePost = async () => {
        if (!newContent.trim()) return;

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/posts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: newContent })
        });

        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setNewContent("");
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Ar tikrai norite ištrinti šį įrašą?")) return;

        const token = localStorage.getItem("token");
        await fetch("http://localhost:8080/api/posts/" + postId, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        setPosts(posts.filter(post => post.id !== postId));
    }

    return(
        <PrivateRoute>
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">
                        Naujienos
                    </h1>

                    {/* Create Post Box */}
                    <div className="bg-white shadow rounded-lg p-6">
                    <textarea
                        className="w-full border rounded-lg p-3 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={3}
                        placeholder="Ką galvojate?"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                    />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleCreatePost}
                                className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600"
                            >
                                Skelbti
                            </button>
                        </div>
                    </div>

                    {/* Cards */}
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white shadow rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-semibold text-gray-900 text-lg hover:text-gray-500">{post.authorName}</h2>
                                <span className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleString("lt-LT")}
            </span>
                            </div>
                            <p className="text-gray-700 mb-4">{post.content}</p>
                            <div className="flex items-center justify-between text-gray-500 border-t pt-3">
                                <button className="flex items-center gap-2 hover:text-gray-700">
                                    <span>Patinka (0)</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Ištrinti
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PrivateRoute>
    );
}