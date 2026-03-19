"use client";
import React from "react";
import CommentSection from "./CommentSection";

export default function PostCard({ post, onDelete, currentUserId }) {
    // Format date nicely
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

    // Check if current user is the author (for delete button)
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
                <button className="flex items-center gap-2 hover:text-gray-700">
                    <span>Patinka (0)</span>
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

            <CommentSection postId={post.id} commentCount={post.commentCount} currentUserId={currentUserId} />
        </div>
    );
}