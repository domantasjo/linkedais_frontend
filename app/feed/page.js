"use client";
import {useCallback, useEffect, useRef, useState} from "react";
import PrivateRoute from "../components/PrivateRouter";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";

export default function FeedPage(){
    const [posts, setPosts] = useState([]);
    const [newContent, setNewContent] = useState("");
    const [image, setImage] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Refs used inside the IntersectionObserver closure — always current without re-creating the observer
    const hasMoreRef = useRef(true);
    const pageRef = useRef(0);
    const bookmarkedIdsRef = useRef(new Set());
    const isFetchingRef = useRef(false);
    const observerRef = useRef(null);
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
        const response = await fetch(`http://localhost:8080/api/posts?page=${pageNum}&size=10`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        const reachedEnd = data.length < 10;
        if (reachedEnd) {
            setHasMore(false);
            hasMoreRef.current = false;
        }
        const postsWithBookmarkStatus = data.map(post => ({
            ...post,
            isBookmarked: bookmarkedSetParam.has(post.id)
        }));
        if (pageNum === 0) {
            setPosts(postsWithBookmarkStatus);
            setLoading(false);
        } else {
            setPosts(prev => [...prev, ...postsWithBookmarkStatus]);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    };

    // Keep refs in sync with state so the observer always reads the latest values
    useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
    useEffect(() => { bookmarkedIdsRef.current = bookmarkedIds; }, [bookmarkedIds]);

    useEffect(() => {
        const init = async () => {
            await fetchCurrentUser();
            const bookmarkedSet = await fetchBookmarks();
            await fetchPosts(0, bookmarkedSet);
        };
        init();
    }, []);

    // Callback ref: observer wires up the moment the sentinel element mounts
    const sentinelRef = useCallback((node) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (!node) return;
        observerRef.current = new IntersectionObserver(
            async ([entry]) => {
                if (!entry.isIntersecting || !hasMoreRef.current || isFetchingRef.current) return;
                isFetchingRef.current = true;
                setLoadingMore(true);
                const nextPage = pageRef.current + 1;
                pageRef.current = nextPage;
                await fetchPosts(nextPage, bookmarkedIdsRef.current);
            },
            { rootMargin: "200px" }
        );
        observerRef.current.observe(node);
    }, []); // stable — all mutable values accessed via refs

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Paveikslėlis per didelis. Maksimalus dydis: 5MB");
                return;
            }
            if (!file.type.startsWith("image/")) {
                alert("Galima įkelti tik paveikslėlių failus");
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleCreatePost = async () => {
        if (!newContent.trim() && !image) return;

        setUploading(true);
        let imageBase64 = null;

        if (image) {
            const formData = new FormData();
            formData.append("image", image);

            const uploadRes = await fetch("http://localhost:8080/api/images/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            });

            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                imageBase64 = uploadData.imageBase64;
            } else {
                const errorData = await uploadRes.json();
                throw new Error(errorData.error || "Nepavyko įkelti paveikslėlio");
            }
        }

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/posts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: newContent, imageBase64: imageBase64 })
        });

        const newPost = await response.json();
        setPosts([{ ...newPost, isBookmarked: false }, ...posts]);
        setNewContent("");
        setImageBase64(null);
        setImagePreview(null);
        setUploading(false);
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
                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative mt-3 inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-48 rounded-lg border"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-3">
                            <label className="cursor-pointer bg-gray-200 text-black px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition">
                                Pridėti paveikslėlį
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </label>

                            <button
                                onClick={handleCreatePost}
                                disabled={uploading}
                                className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                {uploading ? "Skelbiama..." : "Skelbti"}
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

                            {/* Infinite scroll sentinel */}
                            <div ref={sentinelRef} className="h-4" />

                            {/* Spinner shown while fetching next page */}
                            {loadingMore && (
                                <div className="flex justify-center py-6">
                                    <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {!hasMore && posts.length > 0 && (
                                <p className="text-center text-sm text-gray-400 py-4">Visi įrašai parodyti</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PrivateRoute>
    );
}