import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import {
    getCurrentUser,
    logOut,
    getAllEvents,
    getPlayerRankings,
    isUserAdmin,
} from "../src/firebase";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "CACA | Capital Area Carrom Association" },
        {
            name: "description",
            content:
                "Official homepage of Capital Area Carrom Association with tournaments, rankings, and live scoreboard access.",
        },
    ];
}

const galleryTiles = [
    "Final Board Moments",
    "Junior Coaching Camp",
    "Doubles Medal Ceremony",
    "Association Volunteers",
    "Regional League Night",
    "Practice Session Highlights",
];

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [pastTournaments, setPastTournaments] = useState<any[]>([]);
    const [rankings, setRankings] = useState<any[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [rankingsLoading, setRankingsLoading] = useState(true);
    const [logoutSuccess, setLogoutSuccess] = useState("");
    const [showLogoutToast, setShowLogoutToast] = useState(false);
    const [hideLogoutToast, setHideLogoutToast] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUserData = await getCurrentUser();
                setUser(currentUserData);

                if (currentUserData) {
                    const adminStatus = await isUserAdmin(currentUserData.uid);
                    setIsAdmin(adminStatus);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error checking user:", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const allEvents = await getAllEvents();
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcoming = allEvents.filter((event) => {
                    const eventDate = new Date(event.date);
                    return eventDate >= today;
                });

                const past = allEvents.filter((event) => {
                    const eventDate = new Date(event.date);
                    return eventDate < today;
                });

                upcoming.sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                past.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                setUpcomingEvents(upcoming);
                setPastTournaments(past);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setEventsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const playerRankings = await getPlayerRankings();
                setRankings(playerRankings.slice(0, 4));
            } catch (error) {
                console.error("Error fetching rankings:", error);
            } finally {
                setRankingsLoading(false);
            }
        };

        fetchRankings();
    }, []);

    useEffect(() => {
        const flashMessage = (location.state as any)?.flashMessage;
        if (flashMessage) {
            setLogoutSuccess(flashMessage);
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        if (!logoutSuccess) return;

        setShowLogoutToast(false);
        setHideLogoutToast(false);

        const enterAnimationFrame = requestAnimationFrame(() => {
            setShowLogoutToast(true);
        });

        const fadeTimer = setTimeout(() => {
            setHideLogoutToast(true);
        }, 3200);

        const clearTimer = setTimeout(() => {
            setLogoutSuccess("");
            setShowLogoutToast(false);
            setHideLogoutToast(false);
        }, 4000);

        return () => {
            cancelAnimationFrame(enterAnimationFrame);
            clearTimeout(fadeTimer);
            clearTimeout(clearTimer);
        };
    }, [logoutSuccess]);

    const handleLogout = async () => {
        try {
            await logOut();
            setUser(null);
            setIsAdmin(false);
            setLogoutSuccess("Logged out successfully!");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const closeToast = () => {
        setLogoutSuccess("");
        setShowLogoutToast(false);
        setHideLogoutToast(false);
    };

    return (
        <main className="caca-page">
            <div className="sticky-header-wrapper">
                <header className="sticky-header mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface)] px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
                <Link to="/" className="hover:opacity-80 transition-opacity">
                    <p className="text-xs uppercase tracking-[0.28em] text-[var(--caca-ink-soft)]">
                        Capital Area Carrom Association
                    </p>
                    <p className="font-display text-2xl leading-none text-[var(--caca-ink)]">
                        CACA
                    </p>
                </Link>
                <nav aria-label="Primary actions" className="flex flex-wrap gap-2">
                    {user ? (
                        <>
                            <span className="flex items-center px-3 py-2 text-sm text-[var(--caca-ink-soft)]">
                                Welcome, {user.displayName || user.email}!
                            </span>
                            {isAdmin && (
                                <Link className="caca-btn caca-btn-secondary" to="/admin">
                                    Admin Panel
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="caca-btn caca-btn-muted"
                            >
                                Log out
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
                    <Link className="caca-btn caca-btn-primary" to="/scoreboard">
                        View Live Scoreboard
                    </Link>
                </nav>
            </header>
            </div>
            {logoutSuccess && (
                <div className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
                    <div
                        className={`rounded-xl border px-4 py-3 shadow-lg transition-all duration-500 ease-out ${
                            showLogoutToast
                                ? hideLogoutToast
                                    ? "opacity-0 -translate-y-2"
                                    : "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-8"
                        }`}
                        style={{
                            backgroundColor: "rgba(240, 253, 244, 0.98)",
                            borderColor: "#22c55e",
                            color: "#166534",
                        }}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span>{logoutSuccess}</span>
                            <button
                                type="button"
                                onClick={closeToast}
                                className="text-sm font-semibold hover:opacity-80"
                                aria-label="Dismiss notification"
                                style={{ color: "#166534" }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <section className="hero-shell" id="top">
                <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
                    <div className="fade-up max-w-3xl">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--caca-accent)]">
                            Official Home
                        </p>
                        <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
                            <h1 className="font-display text-6xl leading-none text-[var(--caca-ink)] sm:text-7xl md:text-8xl">
                                CACA
                            </h1>
                        </Link>
                        <p className="mt-2 text-lg font-semibold text-[var(--caca-ink-soft)] sm:text-xl">
                            Capital Area Carrom Association
                        </p>
                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--caca-ink-soft)] sm:text-lg">
                            Advancing disciplined, competitive, and community-driven carrom
                            across the capital region through structured tournaments, player
                            development, and transparent rankings.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link className="caca-btn caca-btn-primary" to="/scoreboard">
                                Open Scoreboard
                            </Link>
                            <Link className="caca-btn caca-btn-secondary" to="/register-event">
                                Register Event
                            </Link>
                            <a className="caca-btn caca-btn-muted" href="#contact">
                                Contact CACA
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16" id="about">
                <article className="section-surface fade-up grid gap-8 p-6 md:grid-cols-[1.35fr_1fr] md:p-8">
                    <div>
                        <p className="section-kicker">About The Association</p>
                        <h2 className="section-title">A formal platform for competitive carrom</h2>
                        <p className="mt-4 text-[var(--caca-ink-soft)]">
                            Capital Area Carrom Association (CACA) organizes sanctioned
                            tournaments, supports player development pathways, and promotes
                            fair play standards across clubs and independent athletes.
                        </p>
                        <p className="mt-4 text-[var(--caca-ink-soft)]">
                            The association maintains structured fixtures, transparent
                            standings, and a member-first ecosystem that encourages both elite
                            performance and grassroots participation.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--caca-ink-soft)]">
                            Association Focus
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-[var(--caca-ink-soft)] sm:text-base">
                            <li>Sanctioned tournaments and league standards</li>
                            <li>Junior and open division development programs</li>
                            <li>Transparent ranking methodology and player records</li>
                            <li>City-wide community participation initiatives</li>
                        </ul>
                    </div>
                </article>
            </section>

            <section
                className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8 lg:pb-12"
                id="upcoming-events"
            >
                <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                        <p className="section-kicker">Upcoming Tournaments</p>
                        <h2 className="section-title">Register for the next events</h2>
                    </div>
                    <Link className="caca-btn caca-btn-secondary" to="/register-event">
                        Register
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {upcomingEvents.map((event, index) => (
                        <article
                            className="section-surface fade-up p-5"
                            key={event.id || event.name || event.title || index}
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <h3 className="text-xl font-semibold text-[var(--caca-ink)]">
                                {event.name || event.title || "Untitled Event"}
                            </h3>
                            <p className="mt-3 text-sm text-[var(--caca-ink-soft)]">
                                Date: {event.date}
                            </p>

                            <p className="text-sm text-[var(--caca-ink-soft)]">Format: {event.format}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="mb-5">
                    <p className="section-kicker">Past Tournaments</p>
                    <h2 className="section-title">Past events list</h2>
                </div>
                <div className="section-surface p-4 sm:p-5">
                    {pastTournaments.length === 0 ? (
                        <p className="text-sm text-[var(--caca-ink-soft)]">
                            No past events available yet.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {pastTournaments.map((event, index) => (
                                <li
                                    className="rounded-xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] px-4 py-3"
                                    key={event.id || event.name || event.title || `${event.date}-${index}`}
                                >
                                    <p className="font-semibold text-[var(--caca-ink)]">
                                        {event.name || event.title || "Untitled Event"}
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--caca-ink-soft)]">
                                        Date: {event.date || "TBD"}
                                    </p>
                                    <p className="text-sm text-[var(--caca-ink-soft)]">
                                        Format: {event.format || "TBD"}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12">
                <article className="section-surface fade-up p-6" id="live-scoreboard">
                    <p className="section-kicker">Live Scoreboard Preview</p>
                    <h2 className="section-title">Match table snapshot</h2>
                    <div className="mt-5 rounded-xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-4">
                        <p className="text-sm text-[var(--caca-ink-soft)] italic">
                            Live match data populates here during active tournaments.
                        </p>
                        <p className="mt-3 text-sm text-[var(--caca-ink-soft)]">
                            View the full scoreboard to see all ongoing and completed matches.
                        </p>
                    </div>
                    <a className="caca-btn caca-btn-primary mt-6" href="/scoreboard" title="View live scoreboard">
                        Open Full Scoreboard
                    </a>
                </article>

                <article className="section-surface fade-up p-6">
                    <p className="section-kicker">Rankings</p>
                    <h2 className="section-title">Top players leaderboard</h2>
                    <ol className="mt-5 space-y-3">
                        {rankings.map((player) => (
                            <li
                                className="flex items-center justify-between rounded-xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] px-4 py-3"
                                key={player.uid}
                            >
                                <p className="font-medium text-[var(--caca-ink)]">
                                    #{player.rank} {player.displayName || player.email}
                                </p>
                                <p className="text-sm text-[var(--caca-ink-soft)]">{player.points} pts</p>
                            </li>
                        ))}
                    </ol>
                </article>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="mb-5">
                    <p className="section-kicker">Photo Gallery</p>
                    <h2 className="section-title">Association highlights</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {galleryTiles.map((tile) => (
                        <article className="gallery-tile" key={tile}>
                            <div className="gallery-tile-art" aria-hidden="true" />
                            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--caca-ink-soft)]">
                                {tile}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-16" id="contact">
                <div className="section-surface grid gap-6 p-6 md:grid-cols-2 md:p-8">
                    <article>
                        <p className="section-kicker">Contact + Location</p>
                        <h2 className="section-title">Reach Capital Area Carrom Association</h2>
                        <p className="mt-4 text-[var(--caca-ink-soft)]">
                            Email: office@caca.org (placeholder)<br />
                            Phone: +1 (000) 555-0144 (placeholder)
                        </p>
                        <p className="mt-4 text-[var(--caca-ink-soft)]">
                            Address: 101 Carrom Square, Capital District, CA 00000
                            (placeholder)
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3" id="auth">
                            <a className="caca-btn caca-btn-secondary" href="mailto:office@caca.org">
                                Contact Us
                            </a>
                        </div>
                    </article>
                    <article className="rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--caca-ink-soft)]">
                            Location Map
                        </p>
                        <div className="mt-3 grid min-h-56 place-items-center rounded-xl border border-dashed border-[var(--caca-border)] bg-[var(--caca-surface)] p-4 text-center text-sm text-[var(--caca-ink-soft)]">
                            Map placeholder for association venue and tournament hall.
                        </div>
                    </article>
                </div>
            </section>

            <footer className="border-t border-[var(--caca-border)] bg-[var(--caca-surface)]/80 py-6">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-[var(--caca-ink-soft)] sm:px-6 lg:px-8">
                    <p>© 2026 CACA. All rights reserved.</p>
                    <a className="font-medium text-[var(--caca-ink)] hover:text-[var(--caca-accent)]" href="#top">
                        Back to top
                    </a>
                </div>
            </footer>
        </main>
    );
}
