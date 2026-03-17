"use client";
import {useEffect, useState} from "react";
import PrivateRoute from "../components/PrivateRouter";
import PostCard from "../components/PostCard";

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

                    {/* Cards - Using PostCard Component */}
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>
        </PrivateRoute>
    );
}