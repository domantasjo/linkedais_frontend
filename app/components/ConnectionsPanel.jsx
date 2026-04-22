"use client";

export default function ConnectionsPanel({
    title = "Ryšiai",
    connections = [],
    loading = false,
    error = "",
    emptyTitle = "Nėra ryšių",
    emptyDescription = "Priimti ryšiai čia bus rodomi automatiškai.",
    onOpenProfile,
    onSendMessage,
}) {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg text-black font-semibold mb-4">{title}</h2>

            {loading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-100 rounded-lg p-4 animate-pulse h-20" />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-100">
                    {error}
                </div>
            )}

            {!loading && !error && connections.length === 0 && (
                <div className="text-center py-6">
                    <h3 className="text-base font-semibold text-gray-700 mb-1">{emptyTitle}</h3>
                    <p className="text-sm text-gray-500">{emptyDescription}</p>
                </div>
            )}

            {!loading && !error && connections.length > 0 && (
                <div className="space-y-3">
                    {connections.map((connection) => (
                        <div
                            key={connection.id}
                            className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between gap-3"
                        >
                            <button
                                onClick={() => onOpenProfile?.(connection.id)}
                                className="flex items-center gap-3 min-w-0 text-left"
                                type="button"
                            >
                                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
                                    {connection.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{connection.name}</p>
                                    {connection.studyProgram && (
                                        <p className="text-sm text-gray-500 truncate">{connection.studyProgram}</p>
                                    )}
                                </div>
                            </button>

                            {onSendMessage && (
                                <button
                                    onClick={() => onSendMessage(connection.id)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition"
                                    type="button"
                                >
                                    Siųsti žinutę
                                </button>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

