"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MessageBubble from "@/app/components/MessageBubble";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ConversationPage() {
    const { userId } = useParams();
    const router = useRouter();
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [input, setInput] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    const token = useMemo(
        () => (typeof window !== "undefined" ? localStorage.getItem("token") : null),
        []
    );

    useEffect(() => {
        async function loadCurrentUser() {
            if (!token) {
                setError("Prisijungimo sesija nerasta. Prisijunkite iš naujo.");
                setLoading(false);
                return;
            }

            try {
                const profileRes = await fetch(`${API_BASE}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!profileRes.ok) throw new Error("Nepavyko gauti vartotojo profilio.");
                setCurrentUser(await profileRes.json());
            } catch (err) {
                setError(err.message || "Nepavyko nustatyti vartotojo.");
                setLoading(false);
            }
        }

        loadCurrentUser();
    }, [token]);

    useEffect(() => {
        if (!currentUser?.id || !userId || !token) return;

        async function loadConversation() {
            try {
                setLoading(true);
                setError(null);

                const conversationRes = await fetch(
                    `${API_BASE}/api/messages/conversation?userAId=${currentUser.id}&userBId=${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!conversationRes.ok) throw new Error("Failed to load conversation.");
                const data = await conversationRes.json();
                setMessages(data);

                if (data.length > 0) {
                    const sample = data[0];
                    setOtherUser(
                        sample.senderId === currentUser.id
                            ? { id: sample.receiverId, name: sample.receiverName }
                            : { id: sample.senderId, name: sample.senderName }
                    );
                } else {
                    const userRes = await fetch(`${API_BASE}/api/users/${Number(userId)}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setOtherUser({ id: userData.id, name: userData.name });
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadConversation();
    }, [currentUser?.id, userId, token]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSend() {
        const content = input.trim();
        if (!content || sending || !currentUser?.id || !token) return;

        setSending(true);
        try {
            let res;

            if (replyingTo) {
                res = await fetch(`${API_BASE}/api/messages/${replyingTo.id}/reply`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ senderId: currentUser.id, content }),
                });
            } else {
                res = await fetch(`${API_BASE}/api/messages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        senderId: currentUser.id,
                        receiverId: Number(userId),
                        content,
                    }),
                });
            }

            if (!res.ok) throw new Error("Failed to send message.");
            const newMessage = await res.json();

            setMessages((prev) => [...prev, newMessage]);
            setOtherUser((prev) => {
                if (prev) return prev;
                return newMessage.senderId === currentUser.id
                    ? { id: newMessage.receiverId, name: newMessage.receiverName || "Vartotojas" }
                    : { id: newMessage.senderId, name: newMessage.senderName || "Vartotojas" };
            });
            setInput("");
            setReplyingTo(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }

    async function handleDelete(messageId) {
        if (!currentUser?.id || !token) return;

        try {
            const res = await fetch(
                `${API_BASE}/api/messages/${messageId}?requesterId=${currentUser.id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error("Failed to delete message.");

            setMessages((prev) =>
                prev.map((m) => (m.id === messageId ? { ...m, deleted: true } : m))
            );
        } catch (err) {
            setError(err.message);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        if (e.key === "Escape" && replyingTo) {
            setReplyingTo(null);
        }
    }

    const messageMap = Object.fromEntries(messages.map((m) => [m.id, m]));

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
                <button
                    onClick={() => router.push("/messages")}
                    className="text-gray-400 hover:text-gray-700 transition-colors text-xl"
                    aria-label="Back"
                >
                    ←
                </button>

                {otherUser ? (
                    <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                            {otherUser.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                            {otherUser.name}
                        </span>
                    </Link>
                ) : (
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                )}
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6">
                {loading && (
                    <div className="flex flex-col gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-10 rounded-2xl bg-gray-200 animate-pulse ${
                                    i % 2 === 0 ? "w-1/2 self-start" : "w-2/5 self-end"
                                }`}
                            />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100 mb-4">
                        {error}
                    </div>
                )}

                {!loading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                        <p className="text-3xl">💬</p>
                        <p className="text-sm">No messages yet. Say hello!</p>
                    </div>
                )}

                {!loading && (
                    <div className="flex flex-col gap-3">
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwn={message.senderId === currentUser?.id}
                                onReply={(msg) => {
                                    setReplyingTo(msg);
                                    inputRef.current?.focus();
                                }}
                                onDelete={handleDelete}
                                replyPreview={
                                    message.parentMessageId
                                        ? messageMap[message.parentMessageId] || null
                                        : null
                                }
                            />
                        ))}
                        <div ref={bottomRef} />
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-gray-200 px-4 py-3">
                {replyingTo && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-blue-400 font-bold">↩</span>
                            <span className="text-blue-600 font-semibold truncate">
                                {replyingTo.senderName}:
                            </span>
                            <span className="text-gray-500 truncate">{replyingTo.content}</span>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                            aria-label="Cancel reply"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-3">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
                        rows={1}
                        className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition max-h-32 overflow-y-auto"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                    >
                        {sending ? "..." : "Send"}
                    </button>
                </div>
            </footer>
        </div>
    );
}