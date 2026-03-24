"use client";
import React, { useState } from "react";
import CommentSection from "../components/CommentSection";

export default function PostCard({ post, onDelete, onLike, onBookmark, currentUserId }) {
    const [liked, setLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("lt-LT", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleLike = async () => {
        await onLike(post.id, liked);
        setLiked(!liked);
    };

    const handleBookmark = async () => {
        setIsBookmarkLoading(true);
        try {
            await onBookmark(post.id, isBookmarked);
            setIsBookmarked(!isBookmarked);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        } finally {
            setIsBookmarkLoading(false);
        }
    };

    const isAuthor = currentUserId === post.authorId;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-900 text-lg hover:text-gray-500">
                    {post.authorName}
                </h2>
                <span className="text-sm text-gray-500">
                    {formatDate(post.createdAt)}
                </span>
            </div>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <div className="flex items-center justify-between text-gray-500 border-t pt-3">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 hover:text-blue-500 ${liked ? "text-blue-500" : ""}`}
                >
                    <span>Patinka ({post.likeCount})</span>
                </button>

                <button
                    onClick={handleBookmark}
                    disabled={isBookmarkLoading}
                    className={`flex items-center gap-2 transition-colors ${
                        isBookmarked
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-500 hover:text-yellow-500'
                    } ${isBookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span>{isBookmarked ? 'Išsaugota' : 'Išsaugoti'}</span>
                </button>

                {isAuthor && (
                    <button
                        onClick={() => onDelete(post.id)}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                    >
                        Ištrinti
                    </button>
                )}
            </div>
            <CommentSection
                postId={post.id}
                currentUserId={currentUserId}
            />
        </div>
    );
}