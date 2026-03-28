import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import type { Route } from "./+types/register-event";
import { getCurrentUser, getAllEvents, addUserToEvent, updateUserProfile } from "../src/firebase";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Register for Event | CACA Scoreboard" },
        {
            name: "description",
            content: "Register for a carrom event with your preferences.",
        },
    ];
}

// Helper function to check if event is in the past
const isPastEvent = (eventDate: string): boolean => {
    const event = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return event < today;
};

export default function RegisterEventPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [foodPreference, setFoodPreference] = useState("non-vegetarian");
    const [matchType, setMatchType] = useState("singles");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");

    // State for searchable event dropdown
    const [eventSearchOpen, setEventSearchOpen] = useState(false);
    const [eventSearch, setEventSearch] = useState("");
    const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
    const eventSearchRef = useRef<HTMLDivElement>(null);

    // Check user auth and fetch events
    useEffect(() => {
        const checkUserAndFetchEvents = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    navigate("/login");
                    return;
                }
                setUser(currentUser);

                // Fetch available events
                const allEvents = await getAllEvents();
                const availableEvents = allEvents.filter(
                    (event) => !isPastEvent(event.date)
                );
                setEvents(availableEvents);
                setFilteredEvents(availableEvents);
                if (availableEvents.length > 0) {
                    setSelectedEvent(availableEvents[0]);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setPageLoading(false);
            }
        };

        checkUserAndFetchEvents();
    }, [navigate]);

    // Filter events based on search input and availability
    useEffect(() => {
        const filtered = events.filter(
            (event) =>
                event.name.toLowerCase().includes(eventSearch.toLowerCase()) &&
                !isPastEvent(event.date)
        );
        setFilteredEvents(filtered);
    }, [eventSearch, events]);

    // Handle click outside dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                eventSearchRef.current &&
                !eventSearchRef.current.contains(event.target as Node)
            ) {
                setEventSearchOpen(false);
            }
        }

        if (eventSearchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [eventSearchOpen]);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (!user) {
                setError("You must be logged in to register.");
                setLoading(false);
                return;
            }

            if (!selectedEvent) {
                setError("Please select an event.");
                setLoading(false);
                return;
            }

            // Validate that the selected event is not in the past
            if (isPastEvent(selectedEvent.date)) {
                setError("This event has already passed. Please select an upcoming event.");
                setLoading(false);
                return;
            }

            // Add user to event in Firebase
            await addUserToEvent(selectedEvent.id, user, {
                food: foodPreference,
                type: matchType,
            });

            // Update user profile
            await updateUserProfile(user, {
                displayName: user.displayName || user.email,
            });

            // Show success message
            alert("Successfully registered for the event!");
            // Redirect to home after successful registration
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (err: any) {
            setError(
                err.message || "Failed to register. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="caca-page min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p style={{ color: "var(--caca-ink-soft)" }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="caca-page min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1
                        className="text-5xl font-bold mb-2"
                        style={{ fontFamily: "var(--caca-font-display)" }}
                    >
                        Register
                    </h1>
                    <p className="text-lg" style={{ color: "var(--caca-accent)" }}>
                        Join a Carrom Event
                    </p>
                </div>

                {/* Form Container */}
                <div
                    className="rounded-lg p-8 shadow-lg border"
                    style={{
                        backgroundColor: "var(--caca-surface-strong)",
                        borderColor: "var(--caca-border)",
                    }}
                >
                    {/* Error Message */}
                    {error && (
                        <div
                            className="mb-4 p-3 rounded-md text-sm"
                            style={{
                                backgroundColor: "rgba(179, 58, 47, 0.1)",
                                color: "var(--caca-accent)",
                                borderLeft: "4px solid var(--caca-accent)",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Event Dropdown with Search */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Event
                            </label>
                            <div className="relative" ref={eventSearchRef}>
                                <button
                                    type="button"
                                    onClick={() => setEventSearchOpen(!eventSearchOpen)}
                                    disabled={events.length === 0}
                                    className="w-full px-4 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition"
                                    style={{
                                        borderColor: "var(--caca-border)",
                                        color: "var(--caca-ink)",
                                        backgroundColor: "white",
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{selectedEvent?.name || "No events available"}</span>
                                        <span style={{ color: "var(--caca-ink-soft)" }}>▼</span>
                                    </div>
                                </button>

                                {eventSearchOpen && (
                                    <div
                                        className="absolute z-10 w-full mt-1 border rounded-md shadow-lg"
                                        style={{
                                            backgroundColor: "white",
                                            borderColor: "var(--caca-border)",
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Search events..."
                                            value={eventSearch}
                                            onChange={(e) => setEventSearch(e.target.value)}
                                            className="w-full px-4 py-2 border-b focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded-t-md"
                                            style={{
                                                borderColor: "var(--caca-border)",
                                                color: "var(--caca-ink)",
                                            }}
                                            autoFocus
                                        />
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredEvents.length > 0 ? (
                                                filteredEvents.map((event) => (
                                                    <button
                                                        key={event.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedEvent(event);
                                                            setEventSearchOpen(false);
                                                            setEventSearch("");
                                                        }}
                                                        className="w-full text-left px-4 py-2 transition"
                                                        style={{
                                                            backgroundColor:
                                                                selectedEvent?.id === event.id
                                                                    ? "rgba(179, 58, 47, 0.1)"
                                                                    : "transparent",
                                                            color:
                                                                selectedEvent?.id === event.id
                                                                    ? "var(--caca-accent)"
                                                                    : "var(--caca-ink)",
                                                            fontWeight:
                                                                selectedEvent?.id === event.id
                                                                    ? "600"
                                                                    : "400",
                                                        }}
                                                    >
                                                        <div>{event.name}</div>
                                                        <div
                                                            className="text-xs"
                                                            style={{ color: "var(--caca-ink-soft)" }}
                                                        >
                                                            {new Date(event.date).toLocaleDateString()}
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div
                                                    className="px-4 py-2 text-sm"
                                                    style={{ color: "var(--caca-ink-soft)" }}
                                                >
                                                    No events found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs mt-1" style={{ color: "var(--caca-ink-soft)" }}>
                                {selectedEvent?.date && `Date: ${new Date(selectedEvent.date).toLocaleDateString()}`}
                            </p>
                        </div>

                        {/* Food Preference Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Food Preference
                            </label>
                            <select
                                value={foodPreference}
                                onChange={(e) => setFoodPreference(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition"
                                style={{
                                    borderColor: "var(--caca-border)",
                                    color: "var(--caca-ink)",
                                    backgroundColor: "white",
                                }}
                            >
                                <option value="vegetarian">Vegetarian</option>
                                <option value="non-vegetarian">Non-Vegetarian</option>
                            </select>
                        </div>

                        {/* Match Type Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Match Type
                            </label>
                            <select
                                value={matchType}
                                onChange={(e) => setMatchType(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition"
                                style={{
                                    borderColor: "var(--caca-border)",
                                    color: "var(--caca-ink)",
                                    backgroundColor: "white",
                                }}
                            >
                                <option value="singles">Singles</option>
                                <option value="doubles">Doubles</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || events.length === 0}
                            className="w-full py-2 px-4 rounded-md font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-6"
                            style={{
                                backgroundColor: "var(--caca-accent)",
                            }}
                        >
                            {loading ? "Registering..." : events.length === 0 ? "No Upcoming Events" : "Register for Event"}
                        </button>
                    </form>
                    {events.length === 0 && (
                        <p className="mt-4 text-sm text-center" style={{ color: "var(--caca-ink-soft)" }}>
                            No upcoming events available. Please check back soon!
                        </p>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-sm" style={{ color: "var(--caca-ink-soft)" }}>
                    <Link to="/" className="transition" style={{ color: "var(--caca-accent)" }}>
                        Back to Home
                    </Link>
                </p>
            </div>
        </div>
    );
}
