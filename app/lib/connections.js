const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function toArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.connections)) return payload.connections;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
}

export function normalizeConnections(payload, currentUserId) {
    const list = toArray(payload);
    const byId = new Map();

    list.forEach((item) => {
        let user = null;
        const status = item?.status;

        if (item?.user?.id) {
            user = item.user;
        } else if (item?.id && item?.name && !item?.requesterId && !item?.receiverId) {
            user = item;
        } else if (item?.requesterId && item?.receiverId) {
            const isRequester = Number(item.requesterId) === Number(currentUserId);
            user = isRequester
                ? {
                    id: item.receiverId,
                    name: item.receiverName,
                    studyProgram: item.receiverStudyProgram,
                    avatar: item.receiverAvatar || null,
                }
                : {
                    id: item.requesterId,
                    name: item.requesterName,
                    studyProgram: item.requesterStudyProgram,
                    avatar: item.requesterAvatar || null,
                };
        }

        const normalizedUserId = Number(user?.id);
        if (!normalizedUserId) return;
        if (normalizedUserId === Number(currentUserId)) return;
        if (status && status !== "ACCEPTED") return;

        byId.set(normalizedUserId, {
            id: normalizedUserId,
            name: user?.name || "Nežinomas vartotojas",
            studyProgram: user?.studyProgram || "",
            avatar: user?.avatar || null,
        });
    });

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCurrentUser(token) {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error("Nepavyko gauti vartotojo profilio.");
    }

    return response.json();
}

export async function loadAcceptedConnections(token, currentUserId, targetUserId) {
    const userId = Number(targetUserId || currentUserId);
    const endpoints = [
        `${API_BASE}/api/users/${userId}/connections`,
        `${API_BASE}/api/connections/user/${userId}`,
        `${API_BASE}/api/connections/accepted/${userId}`,
        `${API_BASE}/api/connections/accepted?userId=${userId}`,
        `${API_BASE}/api/connections/accepted`,
        `${API_BASE}/api/connections`,
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                continue;
            }

            const payload = await response.json();
            const normalized = normalizeConnections(payload, userId);
            if (normalized.length > 0 || Array.isArray(payload) || Array.isArray(payload?.data) || Array.isArray(payload?.content) || Array.isArray(payload?.connections) || Array.isArray(payload?.items)) {
                return normalized;
            }
        } catch (error) {
            console.warn(`Connections endpoint unreachable: ${endpoint}`, error);
        }
    }

    throw new Error("Nepavyko gauti ryšių sąrašo.");
}

export { API_BASE };

