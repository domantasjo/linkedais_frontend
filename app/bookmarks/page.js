"use client";
import { useEffect, useState } from "react";
import PrivateRoute from "../components/PrivateRouter";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";

export default function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/user/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUserId(data.id);
            }
        } catch (error) {
            console.error("Failed to fetch current user:", error);
        }
    };

    const fetchBookmarks = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("Fetching bookmarks with token:", token); // ADD THIS

            const response = await fetch("http://localhost:8080/api/bookmarks", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            console.log("Bookmarks response status:", response.status); // ADD THIS

            if (!response.ok) {
                console.log("Bookmarks request failed with status:", response.status);
                setLoading(false);
                return;
            }

            const text = await response.text(); // Get as text first
            console.log("Bookmarks response text:", text.substring(0, 200)); // ADD THIS - shows first 200 chars

            try {
                const data = JSON.parse(text); // Try to parse
                console.log("Bookmarks data:", data); // ADD THIS

                const bookmarkedIds = new Set(data.content.map(post => post.id));

                // Fetch all posts
                const postsResponse = await fetch("http://localhost:8080/api/posts?page=0&size=100", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (postsResponse.ok) {
                    const postsData = await postsResponse.json();
                    const bookmarkedWithDetails = postsData
                        .filter(post => bookmarkedIds.has(post.id))
                        .map(post => ({
                            ...post,
                            isBookmarked: true
                        }));
                    setBookmarks(bookmarkedWithDetails);
                }
            } catch (parseError) {
                console.error("Failed to parse JSON:", parseError);
                console.log("Raw response:", text);
            }
        } catch (error) {
            console.error("Failed to fetch bookmarks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchBookmarks();
    }, []);

    const handleLike = async (postId, isLiked) => {
        const token = localStorage.getItem("token");
        const method = isLiked ? "DELETE" : "POST";
        await fetch(`http://localhost:8080/api/posts/${postId}/likes`, {
            method: method,
            headers: { "Authorization": `Bearer ${token}` }
        });

        setBookmarks(bookmarks.map(post =>
            post.id === postId
                ? { ...post, likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1 }
                : post
        ));
    };

    const handleBookmark = async (postId, isBookmarked) => {
        const token = localStorage.getItem("token");
        if (isBookmarked) {
            await fetch(`http://localhost:8080/api/bookmarks/${postId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setBookmarks(bookmarks.filter(post => post.id !== postId));
        }
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
        setBookmarks(bookmarks.filter(post => post.id !== postId));
    };

    if (loading) {
        return (
            <PrivateRoute>
                <Navbar />
                <div className="min-h-screen bg-gray-100 p-8">
                    <div className="max-w-2xl mx-auto text-center text-gray-500">
                        Kraunama...
                    </div>
                </div>
            </PrivateRoute>
        );
    }

    return (
        <PrivateRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <h1 className="text-3xl font-bold text-blue-500 mb-8 text-center">
                        Išsaugoti įrašai
                    </h1>

                    {bookmarks.length === 0 ? (
                        <div className="bg-white shadow rounded-lg p-12 text-center">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                Nėra išsaugotų įrašų
                            </h2>
                            <p className="text-gray-500">
                                Pradėkite išsaugoti įdomius įrašus!
                            </p>
                            <button
                                onClick={() => window.location.href = "/feed"}
                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Peržiūrėti įrašus
                            </button>
                        </div>
                    ) : (
                        bookmarks.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onDelete={handleDelete}
                                onLike={handleLike}
                                onBookmark={handleBookmark}
                                currentUserId={currentUserId}
                            />
                        ))
                    )}
                </div>
            </div>
        </PrivateRoute>
    );
}