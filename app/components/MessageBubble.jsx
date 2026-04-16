"use client";

import { useState } from "react";

/**
 * MessageBubble
 *
 * Props:
 *  - message      : MessageResponse DTO
 *  - isOwn        : boolean — true if the current user sent this message
 *  - onReply      : (message) => void
 *  - onDelete     : (messageId) => void
 *  - replyPreview : MessageResponse | null — the parent message, if this is a reply
 */
export default function MessageBubble({ message, isOwn, onReply, onDelete, replyPreview }) {
    const [showActions, setShowActions] = useState(false);

    const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div
            className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? "self-end items-end" : "self-start items-start"}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Reply preview */}
            {replyPreview && (
                <div
                    className={`text-xs px-3 py-1.5 rounded-lg border-l-2 border-blue-400 bg-gray-100 text-gray-500 truncate max-w-full ${
                        isOwn ? "bg-blue-50" : "bg-gray-100"
                    }`}
                >
          <span className="font-semibold text-blue-500">
            {replyPreview.senderName}
          </span>
                    <span className="ml-1">{replyPreview.content}</span>
                </div>
            )}

            <div className="flex items-end gap-2">
                {/* Action buttons — left side for own messages */}
                {isOwn && showActions && (
                    <div className="flex gap-1 mb-1">
                        <button
                            onClick={() => onReply(message)}
                            className="text-xs text-gray-400 hover:text-blue-500 transition-colors px-1"
                            title="Reply"
                        >
                            ↩
                        </button>
                        <button
                            onClick={() => onDelete(message.id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
                            title="Delete"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Bubble */}
                <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isOwn
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                    } ${message.deleted ? "opacity-40 italic" : ""}`}
                >
                    {message.deleted ? "This message was deleted." : message.content}
                </div>

                {/* Action buttons — right side for received messages */}
                {!isOwn && showActions && !message.deleted && (
                    <div className="flex gap-1 mb-1">
                        <button
                            onClick={() => onReply(message)}
                            className="text-xs text-gray-400 hover:text-blue-500 transition-colors px-1"
                            title="Reply"
                        >
                            ↩
                        </button>
                    </div>
                )}
            </div>

            {/* Timestamp */}
            <span className="text-[11px] text-gray-400 px-1">{formattedTime}</span>
        </div>
    );
}