import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/admin";
import {
    getCurrentUser,
    logOut,
    isUserAdmin,
    createEventAsAdmin,
    createBoardAsAdmin,
    updateBoardScoresAsAdmin,
    completeBoardMatchAsAdmin,
    getAllEvents,
    onEventBoardsUpdate,
    generateTournamentBracketAsAdmin,
} from "../src/firebase";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Admin Panel | CACA" },
        {
            name: "description",
            content: "Admin panel for managing events and scores.",
        },
    ];
}

export default function AdminPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"events" | "boards">("events");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Event creation form
    const [eventName, setEventName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventFormat, setEventFormat] = useState("");
    const [createEventLoading, setCreateEventLoading] = useState(false);

    // Board creation form
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [boardName, setBoardName] = useState("");
    const [player1Name, setPlayer1Name] = useState("");
    const [player2Name, setPlayer2Name] = useState("");
    const [createBoardLoading, setCreateBoardLoading] = useState(false);

    // Score update form
    const [boards, setBoards] = useState<any[]>([]);
    const [selectedBoardId, setSelectedBoardId] = useState("");
    const [player1Score, setPlayer1Score] = useState("0");
    const [player2Score, setPlayer2Score] = useState("0");
    const [updateScoreLoading, setUpdateScoreLoading] = useState(false);

    // Bracket generation
    const [generateBracketLoading, setGenerateBracketLoading] = useState(false);

    useEffect(() => {
        const checkUserAndAdmin = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    navigate("/login");
                    return;
                }
                setUser(currentUser);

                const adminStatus = await isUserAdmin(currentUser.uid);
                if (!adminStatus) {
                    navigate("/");
                    return;
                }
                setIsAdmin(true);

                // Fetch events
                const allEvents = await getAllEvents();
                setEvents(allEvents);
                if (allEvents.length > 0) {
                    setSelectedEventId(allEvents[0].id);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUserAndAdmin();
    }, [navigate]);

    // Subscribe to board updates when event is selected
    useEffect(() => {
        if (!selectedEventId || !user) return;

        const unsubscribe = onEventBoardsUpdate(selectedEventId, (updatedBoards: any[]) => {
            setBoards(updatedBoards);
        });

        return () => unsubscribe();
    }, [selectedEventId, user]);

    const handleLogout = async () => {
        try {
            await logOut();
            setUser(null);
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setCreateEventLoading(true);

        try {
            if (!user) throw new Error("User not found");
            if (!eventName || !eventDate) throw new Error("Event name and date are required");

            await createEventAsAdmin(user.uid, {
                name: eventName,
                date: eventDate,
                format: eventFormat,
            });

            setSuccess("Event created successfully!");
            setEventName("");
            setEventDate("");
            setEventFormat("");

            // Refresh events
            const allEvents = await getAllEvents();
            setEvents(allEvents);
        } catch (err: any) {
            setError(err.message || "Failed to create event");
        } finally {
            setCreateEventLoading(false);
        }
    };

    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setCreateBoardLoading(true);

        try {
            if (!user) throw new Error("User not found");
            if (!selectedEventId) throw new Error("Event not selected");
            if (!boardName || !player1Name || !player2Name)
                throw new Error("Board name and player names are required");

            await createBoardAsAdmin(user.uid, selectedEventId, {
                name: boardName,
                player1: { name: player1Name, score: 0 },
                player2: { name: player2Name, score: 0 },
            });

            setSuccess("Board created successfully!");
            setBoardName("");
            setPlayer1Name("");
            setPlayer2Name("");
        } catch (err: any) {
            setError(err.message || "Failed to create board");
        } finally {
            setCreateBoardLoading(false);
        }
    };

    const handleUpdateScore = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setUpdateScoreLoading(true);

        try {
            if (!user) throw new Error("User not found");
            if (!selectedEventId || !selectedBoardId) throw new Error("Event and board not selected");

            await updateBoardScoresAsAdmin(
                user.uid,
                selectedEventId,
                selectedBoardId,
                parseInt(player1Score),
                parseInt(player2Score)
            );

            setSuccess("Score updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to update score");
        } finally {
            setUpdateScoreLoading(false);
        }
    };

    const handleCompleteBoard = async (boardId: string) => {
        setError("");
        setSuccess("");

        try {
            if (!user) throw new Error("User not found");
            if (!selectedEventId) throw new Error("Event not selected");

            await completeBoardMatchAsAdmin(user.uid, selectedEventId, boardId);
            setSuccess("Board marked as completed!");
        } catch (err: any) {
            setError(err.message || "Failed to complete board");
        }
    };

    const handleGenerateBracket = async () => {
        setError("");
        setSuccess("");
        setGenerateBracketLoading(true);

        try {
            if (!user) throw new Error("User not found");
            if (!selectedEventId) throw new Error("Event not selected");

            const result = await generateTournamentBracketAsAdmin(user.uid, selectedEventId);
            setSuccess(`Tournament bracket generated! Created ${result.matchesCreated} matches across ${result.rounds} rounds.`);

            // Refresh boards display
            const event = events.find((e) => e.id === selectedEventId);
            if (event) {
                setSelectedEventId(selectedEventId); // Trigger refresh
            }
        } catch (err: any) {
            setError(err.message || "Failed to generate bracket");
        } finally {
            setGenerateBracketLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="caca-page min-h-screen flex items-center justify-center">
                <p style={{ color: "var(--caca-ink-soft)" }}>Loading...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="caca-page min-h-screen flex items-center justify-center">
                <p style={{ color: "var(--caca-accent)" }}>Admin access required</p>
            </div>
        );
    }

    return (
        <main className="caca-page min-h-screen">
            {/* Header */}
            <div className="sticky-header-wrapper">
                <header className="sticky-header mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface)] px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-[var(--caca-ink-soft)]">
                                CACA Admin
                            </p>
                            <p className="font-display text-2xl leading-none text-[var(--caca-ink)]">
                                Control Panel
                            </p>
                        </div>
                    </Link>
                    <nav aria-label="Primary actions" className="flex flex-wrap gap-2">
                        <span className="flex items-center px-3 py-2 text-sm text-[var(--caca-ink-soft)]">
                            {user?.email}
                        </span>
                        <button onClick={handleLogout} className="caca-btn caca-btn-muted">
                            Logout
                        </button>
                        <Link className="caca-btn caca-btn-primary" to="/">
                            Home
                        </Link>
                    </nav>
                </header>
            </div>

            {/* Hero Section */}
            <section className="hero-shell">
                <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
                    <div className="fade-up">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--caca-accent)]">
                            Admin Access
                        </p>
                        <h1 className="font-display text-5xl leading-none text-[var(--caca-ink)] sm:text-6xl">
                            Management
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--caca-ink-soft)]">
                            Create events, manage boards, and update live scores
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Notifications */}
                {error && (
                    <div
                        className="mb-6 p-4 rounded-lg border"
                        style={{
                            backgroundColor: "rgba(179, 58, 47, 0.1)",
                            borderColor: "var(--caca-accent)",
                            color: "var(--caca-accent)",
                        }}
                    >
                        {error}
                    </div>
                )}
                {success && (
                    <div
                        className="mb-6 p-4 rounded-lg border"
                        style={{
                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                            borderColor: "#22c55e",
                            color: "#22c55e",
                        }}
                    >
                        {success}
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-8 flex gap-3 border-b border-[var(--caca-border)]">
                    <button
                        onClick={() => setActiveTab("events")}
                        className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                            activeTab === "events"
                                ? "border-[var(--caca-accent)] text-[var(--caca-accent)]"
                                : "border-transparent text-[var(--caca-ink-soft)] hover:text-[var(--caca-ink)]"
                        }`}
                    >
                        Create Events
                    </button>
                    <button
                        onClick={() => setActiveTab("boards")}
                        className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                            activeTab === "boards"
                                ? "border-[var(--caca-accent)] text-[var(--caca-accent)]"
                                : "border-transparent text-[var(--caca-ink-soft)] hover:text-[var(--caca-ink)]"
                        }`}
                    >
                        Manage Boards & Scores
                    </button>
                </div>

                {/* Create Events Tab */}
                {activeTab === "events" && (
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6">
                            <h2 className="font-display text-2xl text-[var(--caca-ink)] mb-4">
                                Create New Event
                            </h2>
                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Event Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        style={{ borderColor: "var(--caca-border)" }}
                                        placeholder="e.g., Spring Championship 2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Event Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        style={{ borderColor: "var(--caca-border)" }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Format
                                    </label>
                                    <input
                                        type="text"
                                        value={eventFormat}
                                        onChange={(e) => setEventFormat(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        style={{ borderColor: "var(--caca-border)" }}
                                        placeholder="e.g., Singles + Doubles"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={createEventLoading}
                                    className="w-full py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: "var(--caca-accent)" }}
                                >
                                    {createEventLoading ? "Creating..." : "Create Event"}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface)] p-6">
                            <h3 className="font-display text-xl text-[var(--caca-ink)] mb-4">
                                Existing Events
                            </h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {events.length > 0 ? (
                                    events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="p-3 rounded-lg border"
                                            style={{
                                                borderColor: "var(--caca-border)",
                                                backgroundColor: "var(--caca-surface-strong)",
                                            }}
                                        >
                                            <p className="font-semibold text-sm">{event.name}</p>
                                            <p className="text-xs text-[var(--caca-ink-soft)]">
                                                {event.date} • {event.format}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[var(--caca-ink-soft)]">No events created yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Manage Boards Tab */}
                {activeTab === "boards" && (
                    <div>
                        {/* Generate Bracket Section */}
                        <div className="mb-8 grid gap-8 md:grid-cols-2">
                            <div className="rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6">
                                <h2 className="font-display text-2xl text-[var(--caca-ink)] mb-4">
                                    Generate Tournament Bracket
                                </h2>
                                {events.length > 0 ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Select Event *
                                            </label>
                                            <select
                                                value={selectedEventId}
                                                onChange={(e) => setSelectedEventId(e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg mb-4"
                                                style={{ borderColor: "var(--caca-border)" }}
                                            >
                                                {events.map((event) => (
                                                    <option key={event.id} value={event.id}>
                                                        {event.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-sm text-[var(--caca-ink-soft)]">
                                            Automatically generates a double-elimination bracket for all registered players in the event. Winners brackets and loser brackets will be created.
                                        </p>
                                        <button
                                            onClick={handleGenerateBracket}
                                            disabled={generateBracketLoading || !selectedEventId}
                                            className="w-full py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                            style={{ backgroundColor: "var(--caca-wood)" }}
                                        >
                                            {generateBracketLoading ? "Generating..." : "Generate Bracket"}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-[var(--caca-ink-soft)]">Create an event first</p>
                                )}
                            </div>
                        </div>

                        {/* Manual Board Management Section */}
                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Create Board */}
                            <div className="rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6">
                                <h2 className="font-display text-2xl text-[var(--caca-ink)] mb-4">
                                    Create Board Manually
                                </h2>
                            {events.length > 0 ? (
                                <form onSubmit={handleCreateBoard} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Event *
                                        </label>
                                        <select
                                            value={selectedEventId}
                                            onChange={(e) => setSelectedEventId(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            style={{ borderColor: "var(--caca-border)" }}
                                        >
                                            {events.map((event) => (
                                                <option key={event.id} value={event.id}>
                                                    {event.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Board Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={boardName}
                                            onChange={(e) => setBoardName(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border rounded-lg"
                                            style={{ borderColor: "var(--caca-border)" }}
                                            placeholder="e.g., Board 1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Player 1 Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={player1Name}
                                            onChange={(e) => setPlayer1Name(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border rounded-lg"
                                            style={{ borderColor: "var(--caca-border)" }}
                                            placeholder="Player name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Player 2 Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={player2Name}
                                            onChange={(e) => setPlayer2Name(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 border rounded-lg"
                                            style={{ borderColor: "var(--caca-border)" }}
                                            placeholder="Player name"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={createBoardLoading}
                                        className="w-full py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ backgroundColor: "var(--caca-accent)" }}
                                    >
                                        {createBoardLoading ? "Creating..." : "Create Board"}
                                    </button>
                                </form>
                            ) : (
                                <p className="text-[var(--caca-ink-soft)]">Create an event first</p>
                            )}
                        </div>

                        {/* Update Scores */}
                        <div className="rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6">
                            <h2 className="font-display text-2xl text-[var(--caca-ink)] mb-4">
                                Update Scores
                            </h2>
                            {boards.length > 0 ? (
                                <form onSubmit={handleUpdateScore} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Board *
                                        </label>
                                        <select
                                            value={selectedBoardId}
                                            onChange={(e) => setSelectedBoardId(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            style={{ borderColor: "var(--caca-border)" }}
                                        >
                                            <option value="">Choose a board...</option>
                                            {boards.map((board) => (
                                                <option key={board.id} value={board.id}>
                                                    {board.name}: {board.player1?.name || "P1"} vs{" "}
                                                    {board.player2?.name || "P2"} ({board.status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {selectedBoardId && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">
                                                    Player 1 Score *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={player1Score}
                                                    onChange={(e) => setPlayer1Score(e.target.value)}
                                                    required
                                                    min="0"
                                                    className="w-full px-4 py-2 border rounded-lg"
                                                    style={{ borderColor: "var(--caca-border)" }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">
                                                    Player 2 Score *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={player2Score}
                                                    onChange={(e) => setPlayer2Score(e.target.value)}
                                                    required
                                                    min="0"
                                                    className="w-full px-4 py-2 border rounded-lg"
                                                    style={{ borderColor: "var(--caca-border)" }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={updateScoreLoading}
                                                    className="py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                                    style={{ backgroundColor: "var(--caca-accent)" }}
                                                >
                                                    {updateScoreLoading ? "Updating..." : "Update Score"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCompleteBoard(selectedBoardId)
                                                    }
                                                    className="py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--caca-ink-soft)",
                                                    }}
                                                >
                                                    Mark as Complete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            ) : (
                                <p className="text-[var(--caca-ink-soft)]">
                                    Create a board first or select an event with boards
                                </p>
                            )}
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </main>
    );
}
