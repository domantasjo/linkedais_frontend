"use client";
import {useEffect, useState} from "react";
import PrivateRoute from "../components/PrivateRouter";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";

export default function FeedPage(){
    const [posts, setPosts] = useState([]);
    const [newContent, setNewContent] = useState("");
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

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
            const response = await fetch("http://localhost:8080/api/bookmarks", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const bookmarkedSet = new Set(data.content.map(post => post.id));
                setBookmarkedIds(bookmarkedSet);
                return bookmarkedSet;
            }
        } catch (error) {
            console.error("Failed to fetch bookmarks:", error);
        }
        return new Set();
    };

    const fetchPosts = async (pageNum = 0, bookmarkedSetParam) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/posts?page=${pageNum}&size=5`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.length < 5) setHasMore(false);

        const postsWithBookmarkStatus = data.map(post => ({...post, isBookmarked: bookmarkedSetParam.has(post.id)}));

        if (pageNum === 0) setPosts(postsWithBookmarkStatus);
        else setPosts(prev => [...prev, ...postsWithBookmarkStatus]);
        setLoading(false);
    };

    useEffect(() => {
        const init = async () => {
            await fetchCurrentUser();
            const bookmarkedSet = await fetchBookmarks();
            await fetchPosts(0, bookmarkedSet);
        };
        init();
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
        setPosts([{ ...newPost, isBookmarked: false }, ...posts]);
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
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage, bookmarkedIds);
    };

    const handleLike = async (postId, isLiked) => {
        const token = localStorage.getItem("token");
        const method = isLiked ? "DELETE" : "POST";
        await fetch(`http://localhost:8080/api/posts/${postId}/likes`, {
            method: method,
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Update like count in UI
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1 }
                : post
        ));
    };

    const handleBookmark = async (postId, isBookmarked) => {
        const token = localStorage.getItem("token");
        try {
            if (isBookmarked) {
                // Remove bookmark
                await fetch(`http://localhost:8080/api/bookmarks/${postId}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setBookmarkedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(postId);
                    return newSet;
                });
            } else {
                // Add bookmark
                await fetch(`http://localhost:8080/api/bookmarks/${postId}`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setBookmarkedIds(prev => new Set(prev).add(postId));
            }

            // Update posts state
            setPosts(posts.map(post =>
                post.id === postId
                    ? { ...post, isBookmarked: !isBookmarked  }
                    : post
            ));
        } catch (error) {
            console.error("Failed to toggle bookmark:", error);
        }
    };

    return(
        <PrivateRoute>
            <Navbar />
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

                    {/* Loading state */}
                    {loading ? (
                        <p className="text-center text-gray-500">Kraunama...</p>
                    ) : (
                        <>
                            {/* Cards */}
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onDelete={handleDelete}
                                    onLike={handleLike}
                                    onBookmark={handleBookmark}
                                    currentUserId={currentUserId}
                                />
                            ))}

                            {/* Load more button */}
                            {hasMore && (
                                <button
                                    onClick={handleLoadMore}
                                    className="w-full bg-white shadow rounded-lg p-4 text-blue-500 hover:text-blue-600"
                                >
                                    Rodyti daugiau
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PrivateRoute>
    );
}