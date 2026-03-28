import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/scoreboard";
import { getCurrentUser, logOut, getAllEvents, onEventBoardsUpdate } from "../src/firebase";
import Bracket from "../components/bracket";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Live Scoreboard | CACA" },
        {
            name: "description",
            content: "View live scoreboards and tournament brackets.",
        },
    ];
}

export default function Scoreboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [boards, setBoards] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"live" | "bracket">("live");
    let unsubscribeBoards: (() => void) | null = null;

    useEffect(() => {
        const checkUserAndFetchEvents = async () => {
            try {
                const currentUserData = await getCurrentUser();
                setUser(currentUserData);

                // Fetch available events
                const allEvents = await getAllEvents();
                setEvents(allEvents);
                if (allEvents.length > 0) {
                    setSelectedEventId(allEvents[0].id);
                }
            } catch (error) {
                console.error("Error checking user:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUserAndFetchEvents();
    }, []);

    // Subscribe to board updates when event is selected
    useEffect(() => {
        if (!selectedEventId) return;

        // Unsubscribe from previous event
        if (unsubscribeBoards) {
            unsubscribeBoards();
        }

        // Subscribe to new event boards
        unsubscribeBoards = onEventBoardsUpdate(selectedEventId, (updatedBoards) => {
            setBoards(updatedBoards);
        });

        return () => {
            if (unsubscribeBoards) {
                unsubscribeBoards();
            }
        };
    }, [selectedEventId]);

    const handleLogout = async () => {
        try {
            await logOut();
            setUser(null);
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const liveBoards = boards.filter((board) => board.status === "live");
    const completedBoards = boards.filter((board) => board.status === "completed");

    return (
        <main className="caca-page min-h-screen">
            {/* Header */}
            <div className="sticky-header-wrapper">
                <header className="sticky-header mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface)] px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-[var(--caca-ink-soft)]">
                                Capital Area Carrom Association
                            </p>
                            <p className="font-display text-2xl leading-none text-[var(--caca-ink)]">
                                CACA
                            </p>
                        </div>
                    </Link>
                    <nav aria-label="Primary actions" className="flex flex-wrap gap-2">
                        {user ? (
                            <>
                                <span className="flex items-center px-3 py-2 text-sm text-[var(--caca-ink-soft)]">
                                    Welcome, {user.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="caca-btn caca-btn-muted"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="caca-btn caca-btn-muted" to="/login">
                                    Log in
                                </Link>
                            </>
                        )}
                        <Link className="caca-btn caca-btn-secondary" to="/register-event">
                            Register Event
                        </Link>
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
                            Live Updates
                        </p>
                        <h1 className="font-display text-5xl leading-none text-[var(--caca-ink)] sm:text-6xl md:text-7xl">
                            Scoreboard
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--caca-ink-soft)] sm:text-lg">
                            Follow live matches and tournament brackets in real-time
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Event Selector */}
                {events.length > 0 && (
                    <div className="mb-8">
                        <label className="block text-sm font-semibold mb-3 text-[var(--caca-ink)]">
                            Select Event:
                        </label>
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                            style={{
                                borderColor: "var(--caca-border)",
                                color: "var(--caca-ink)",
                                backgroundColor: "white",
                            }}
                        >
                            {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.name || `Event ${event.id}`} ({event.date})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-8 flex gap-3 border-b border-[var(--caca-border)]">
                    <button
                        onClick={() => setActiveTab("live")}
                        className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                            activeTab === "live"
                                ? "border-[var(--caca-accent)] text-[var(--caca-accent)]"
                                : "border-transparent text-[var(--caca-ink-soft)] hover:text-[var(--caca-ink)]"
                        }`}
                    >
                        Live Boards
                    </button>
                    <button
                        onClick={() => setActiveTab("bracket")}
                        className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                            activeTab === "bracket"
                                ? "border-[var(--caca-accent)] text-[var(--caca-accent)]"
                                : "border-transparent text-[var(--caca-ink-soft)] hover:text-[var(--caca-ink)]"
                        }`}
                    >
                        Tournament Bracket
                    </button>
                </div>

                {/* Live Boards Tab */}
                {activeTab === "live" && (
                    <div className="space-y-4">
                        {liveBoards.length > 0 ? (
                            liveBoards.map((board) => (
                                <div
                                    key={board.id}
                                    className="rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-display text-xl text-[var(--caca-ink)]">
                                                {board.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                LIVE
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                        {/* Player 1 */}
                                        <div className="border-r border-[var(--caca-border)] pr-4">
                                            <p className="text-sm text-[var(--caca-ink-soft)] mb-1">
                                                {board.player1?.name || "Player 1"}
                                            </p>
                                            <p className="font-display text-4xl text-[var(--caca-ink)]">
                                                {board.player1?.score || 0}
                                            </p>
                                        </div>

                                        {/* VS */}
                                        <div className="text-center text-[var(--caca-ink-soft)] font-semibold px-4">
                                            VS
                                        </div>

                                        {/* Player 2 */}
                                        <div className="border-l border-[var(--caca-border)] pl-4">
                                            <p className="text-sm text-[var(--caca-ink-soft)] mb-1">
                                                {board.player2?.name || "Player 2"}
                                            </p>
                                            <p className="font-display text-4xl text-[var(--caca-ink)]">
                                                {board.player2?.score || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface)] p-8 text-center">
                                <p className="text-[var(--caca-ink-soft)]">
                                    No live boards at the moment
                                </p>
                            </div>
                        )}

                        {/* Completed Boards */}
                        {completedBoards.length > 0 && (
                            <div className="mt-12">
                                <h3 className="font-display text-2xl text-[var(--caca-ink)] mb-4">
                                    Completed Matches
                                </h3>
                                <div className="space-y-3">
                                    {completedBoards.map((board) => (
                                        <div
                                            key={board.id}
                                            className="rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface)] p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm text-[var(--caca-ink-soft)] font-semibold">
                                                        {board.player1.name}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 px-4">
                                                    <span className="font-display text-xl text-[var(--caca-ink)]">
                                                        {board.player1.score}
                                                    </span>
                                                    <span className="text-[var(--caca-ink-soft)]">-</span>
                                                    <span className="font-display text-xl text-[var(--caca-ink)]">
                                                        {board.player2.score}
                                                    </span>
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <p className="text-sm text-[var(--caca-ink-soft)] font-semibold">
                                                        {board.player2.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bracket Tab */}
                {activeTab === "bracket" && (
                    <div className="rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-8">
                        <Bracket boards={boards} />
                    </div>
                )}
            </div>
        </main>
    );
}
