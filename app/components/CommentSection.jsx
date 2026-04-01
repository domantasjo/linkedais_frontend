"use client";
import React, { useState, useEffect } from "react";

export default function CommentSection({ postId, commentCount = 0, currentUserId }) {
    const [comments, setComments] = useState([]);
    const [localCount, setLocalCount] = useState(commentCount);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        setLocalCount(commentCount);
    }, [commentCount]);

    const getToken = () => localStorage.getItem("token");

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/posts/${postId}/comments`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );
            const data = await response.json();
            setComments(data);
            setLocalCount(data.length); // ← pridėkite šitą
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showComments) {
            fetchComments();
        }
    }, [showComments]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/posts/${postId}/comments`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content: newComment }),
                }
            );
            const created = await response.json();
            setComments([...comments, created]);
            setLocalCount((c) => c + 1);
            setNewComment("");
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim()) return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/posts/${postId}/comments/${commentId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content: editContent }),
                }
            );
            const updated = await response.json();
            setComments(
                comments.map((c) => (c.id === commentId ? updated : c))
            );
            setEditingCommentId(null);
            setEditContent("");
        } catch (error) {
            console.error("Failed to edit comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Ar tikrai norite ištrinti šį komentarą?")) return;

        try {
            await fetch(
                `http://localhost:8080/api/posts/${postId}/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );
            setComments(comments.filter((c) => c.id !== commentId));
            setLocalCount((c) => c - 1);
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("lt-LT", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="border-t pt-3 mt-3">
            <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-3"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
                Komentarai ({showComments ? comments.length : localCount})
            </button>

            {showComments && (
                <div className="space-y-3">
                    {loading ? (
                        <p className="text-sm text-gray-500">Kraunama...</p>
                    ) : (
                        <>
                            {/* Comment list */}
                            {comments.length === 0 && (
                                <p className="text-sm text-gray-400">
                                    Komentarų dar nėra. Būkite pirmas!
                                </p>
                            )}

                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="bg-gray-50 rounded-lg p-3"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-semibold text-gray-800">
                                            {comment.authorName}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>

                                    {editingCommentId === comment.id ? (
                                        <div className="mt-2">
                                            <textarea
                                                className="w-full border rounded-lg p-2 text-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                rows={2}
                                                value={editContent}
                                                onChange={(e) =>
                                                    setEditContent(
                                                        e.target.value
                                                    )
                                                }
                                                autoFocus
                                            />
                                            <div className="flex gap-2 mt-1">
                                                <button
                                                    onClick={() =>
                                                        handleEditComment(
                                                            comment.id
                                                        )
                                                    }
                                                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                >
                                                    Išsaugoti
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingCommentId(
                                                            null
                                                        );
                                                        setEditContent("");
                                                    }}
                                                    className="text-xs bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                                                >
                                                    Atšaukti
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-700">
                                                {comment.content}
                                            </p>
                                            {currentUserId && currentUserId === comment.authorId && (
                                            <div className="flex gap-3 mt-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingCommentId(
                                                            comment.id
                                                        );
                                                        setEditContent(
                                                            comment.content
                                                        );
                                                    }}
                                                    className="text-xs text-blue-500 hover:text-blue-700"
                                                >
                                                    Redaguoti
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteComment(
                                                            comment.id
                                                        )
                                                    }
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    Ištrinti
                                                </button>
                                            </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Add comment input */}
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Rašyti komentarą..."
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleAddComment();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleAddComment}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                                >
                                    Siųsti
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
