import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { type User } from "firebase/auth";
import { getDatabase, ref, push, set, get, onValue, update } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCqFT43zEqJQ_uqat5MYkxOQNVT0LRdpG4",
    authDomain: "carrom-scoreboard.firebaseapp.com",
    projectId: "carrom-scoreboard",
    storageBucket: "carrom-scoreboard.firebasestorage.app",
    messagingSenderId: "862163575261",
    appId: "1:862163575261:web:e0ce2b920af7d48e661634"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export async function signUp(
    email: string,
    password: string,
    displayName: string
) {
    try {
        const displayNameToSave = displayName.trim();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update auth profile with displayName
        await updateProfile(user, {
            displayName: displayNameToSave,
        });
        
        // Save user profile to database
        await set(ref(db, `players/${user.uid}`), {
            email: email,
            displayName: displayNameToSave,
            uid: user.uid,
            points: 0,
            createdAt: new Date().toISOString(),
        });
        
        return user;
    } catch (error: any) {
        const errorMessage = error.message;
        console.error(`SignUp Error: ${errorMessage}`);
        throw error;
    }
}

export async function signIn(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        const errorMessage = error.message;
        console.error(`SignIn Error: ${errorMessage}`);
        throw error;
    }
}

export function getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                resolve(null);
            }
        });
    });
}

export async function logOut() {
    try {
        await signOut(auth);
        console.log("User signed out successfully");
    } catch (error: any) {
        const errorMessage = error.message;
        console.error(`Sign Out Error: ${errorMessage}`);
        throw error;
    }
}


export function createEvent(eventId: string) {
    const eventsRef = ref(db, "events/");
    get(ref(db, "events/" + eventId)).then((snapshot) => {
        if (snapshot.exists()) {
            console.error("Event with this ID already exists.");
            return;
        }
    }).catch((error) => {
        console.error("Error checking event existence: ", error);
    });
    const updates: { [key: string]: any } = {};
    updates["/events/" + eventId] = {
        players: []
    };
    return update(ref(db), updates);
}

export function addUserToEvent(eventId: string, user: User, options: { [key: string]: any }) {
    const eventsRef = ref(db, "events/");
    get(ref(db, "events/" + eventId + "/players/" + user.uid)).then((snapshot) => {
        if (snapshot.exists()) {
            console.error("User is already registered for this event.");
            return;
        }
    }).catch((error) => {
        console.error("Error checking user registration: ", error);
    });
    const updates: { [key: string]: any } = {};
    updates["/events/" + eventId + "/players/" + user.uid] = {
        name: user.displayName,
        email: user.email,
        food: options.food,
        type: options.type
    };
    return update(ref(db), updates);
}

export function addScoreToEvent(eventId: string, userId: string, score: number) {}

// Get all available events from Firebase
export async function getAllEvents(): Promise<any[]> {
    try {
        const snapshot = await get(ref(db, "events"));
        if (snapshot.exists()) {
            const eventsData = snapshot.val();
            return Object.keys(eventsData).map((key) => ({
                id: key,
                ...eventsData[key],
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

// Get a specific event with all details
export async function getEvent(eventId: string): Promise<any | null> {
    try {
        const snapshot = await get(ref(db, `events/${eventId}`));
        if (snapshot.exists()) {
            return {
                id: eventId,
                ...snapshot.val(),
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching event:", error);
        return null;
    }
}

// Get event boards (matches with scores)
export function onEventBoardsUpdate(
    eventId: string,
    callback: (boards: any[]) => void
): () => void {
    const boardsRef = ref(db, `events/${eventId}/boards`);
    const unsubscribe = onValue(boardsRef, (snapshot) => {
        if (snapshot.exists()) {
            const boardsData = snapshot.val();
            const boards = Object.keys(boardsData).map((key) => ({
                id: key,
                ...boardsData[key],
            }));
            callback(boards);
        } else {
            callback([]);
        }
    });
    return unsubscribe;
}

// Create a new board/match for an event
export async function createBoard(
    eventId: string,
    boardData: { name: string; player1: any; player2: any }
): Promise<string> {
    try {
        const boardsRef = ref(db, `events/${eventId}/boards`);
        const newBoardRef = push(boardsRef);
        await set(newBoardRef, {
            ...boardData,
            status: "live",
            createdAt: new Date().toISOString(),
        });
        return newBoardRef.key || "";
    } catch (error) {
        console.error("Error creating board:", error);
        throw error;
    }
}

// Update scores for a board
export async function updateBoardScores(
    eventId: string,
    boardId: string,
    player1Score: number,
    player2Score: number
): Promise<void> {
    try {
        await update(ref(db, `events/${eventId}/boards/${boardId}`), {
            "player1/score": player1Score,
            "player2/score": player2Score,
        });
    } catch (error) {
        console.error("Error updating board scores:", error);
        throw error;
    }
}

// Complete a board match
export async function completeBoardMatch(
    eventId: string,
    boardId: string
): Promise<void> {
    try {
        await update(ref(db, `events/${eventId}/boards/${boardId}`), {
            status: "completed",
            completedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error completing board match:", error);
        throw error;
    }
}

// Get all players for rankings
export async function getPlayerRankings(): Promise<any[]> {
    try {
        const snapshot = await get(ref(db, "players"));
        if (snapshot.exists()) {
            const playersData = snapshot.val();
            const players = Object.keys(playersData)
                .map((key) => ({
                    uid: key,
                    ...playersData[key],
                }))
                .sort((a, b) => (b.points || 0) - (a.points || 0))
                .map((player, index) => ({
                    ...player,
                    rank: index + 1,
                }));
            return players;
        }
        return [];
    } catch (error) {
        console.error("Error fetching player rankings:", error);
        return [];
    }
}

// Update player points
export async function updatePlayerPoints(
    userId: string,
    pointsToAdd: number
): Promise<void> {
    try {
        const playerRef = ref(db, `players/${userId}`);
        const snapshot = await get(playerRef);
        const currentPoints = snapshot.exists() ? snapshot.val().points || 0 : 0;
        await update(playerRef, {
            points: currentPoints + pointsToAdd,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error updating player points:", error);
        throw error;
    }
}

// Update user profile
export async function updateUserProfile(
    user: User,
    profileData: { displayName?: string; [key: string]: any }
): Promise<void> {
    try {
        const userRef = ref(db, `players/${user.uid}`);
        await update(userRef, {
            ...profileData,
            email: user.email,
            uid: user.uid,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}
// Get user profile including admin status
export async function getUserProfile(userId: string): Promise<any | null> {
    try {
        const snapshot = await get(ref(db, `players/${userId}`));
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
    try {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === userId) {
            const authEmail = String(currentUser.email || "").trim().toLowerCase();
            const authDisplayName = String(currentUser.displayName || "")
                .trim()
                .toLowerCase();

            if (authEmail === "admin@caca.com" && authDisplayName === "admin") {
                return true;
            }
        }

        const profile = await getUserProfile(userId);
        if (!profile) {
            return false;
        }

        const normalizedEmail = String(profile.email || "").trim().toLowerCase();
        const normalizedDisplayName = String(profile.displayName || "").trim().toLowerCase();

        return normalizedEmail === "admin@caca.com" && normalizedDisplayName === "admin";
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

// Admin-only: Create a new event
export async function createEventAsAdmin(
    adminUserId: string,
    eventData: { name: string; date: string; format?: string; [key: string]: any }
): Promise<string> {
    try {
        const isAdmin = await isUserAdmin(adminUserId);
        if (!isAdmin) {
            throw new Error("Only admins can create events");
        }

        const eventsRef = ref(db, "events");
        const newEventRef = push(eventsRef);
        await set(newEventRef, {
            ...eventData,
            createdBy: adminUserId,
            createdAt: new Date().toISOString(),
            boards: {},
        });
        return newEventRef.key || "";
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
}

// Admin-only: Update board scores
export async function updateBoardScoresAsAdmin(
    adminUserId: string,
    eventId: string,
    boardId: string,
    player1Score: number,
    player2Score: number
): Promise<void> {
    try {
        const isAdmin = await isUserAdmin(adminUserId);
        if (!isAdmin) {
            throw new Error("Only admins can update scores");
        }

        await update(ref(db, `events/${eventId}/boards/${boardId}`), {
            "player1/score": player1Score,
            "player2/score": player2Score,
            lastUpdatedBy: adminUserId,
            lastUpdatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error updating board scores:", error);
        throw error;
    }
}

// Admin-only: Complete a board match
export async function completeBoardMatchAsAdmin(
    adminUserId: string,
    eventId: string,
    boardId: string
): Promise<void> {
    try {
        const isAdmin = await isUserAdmin(adminUserId);
        if (!isAdmin) {
            throw new Error("Only admins can complete matches");
        }

        await update(ref(db, `events/${eventId}/boards/${boardId}`), {
            status: "completed",
            completedBy: adminUserId,
            completedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error completing board match:", error);
        throw error;
    }
}

// Admin-only: Create a new board/match in an event
export async function createBoardAsAdmin(
    adminUserId: string,
    eventId: string,
    boardData: { name: string; player1: any; player2: any }
): Promise<string> {
    try {
        const isAdmin = await isUserAdmin(adminUserId);
        if (!isAdmin) {
            throw new Error("Only admins can create boards");
        }

        const boardsRef = ref(db, `events/${eventId}/boards`);
        const newBoardRef = push(boardsRef);
        await set(newBoardRef, {
            ...boardData,
            status: "live",
            createdBy: adminUserId,
            createdAt: new Date().toISOString(),
        });
        return newBoardRef.key || "";
    } catch (error) {
        console.error("Error creating board:", error);
        throw error;
    }
}

// Generate automatic double-elimination tournament bracket
export async function generateTournamentBracketAsAdmin(
    adminUserId: string,
    eventId: string
): Promise<{ matchesCreated: number; rounds: number }> {
    try {
        const isAdmin = await isUserAdmin(adminUserId);
        if (!isAdmin) {
            throw new Error("Only admins can generate brackets");
        }

        // Get all registered players for the event
        const eventRef = ref(db, `events/${eventId}`);
        const eventSnapshot = await get(eventRef);
        if (!eventSnapshot.exists()) {
            throw new Error("Event not found");
        }

        const eventData = eventSnapshot.val();
        const registeredPlayersData = eventData.players || {};
        const registeredPlayerUids = Object.keys(registeredPlayersData);

        if (registeredPlayerUids.length < 2) {
            throw new Error("At least 2 players needed for a bracket");
        }

        // Get player details and sort by points (seeding)
        const playersRef = ref(db, "players");
        const playersSnapshot = await get(playersRef);
        const allPlayersData = playersSnapshot.val() || {};

        const players = registeredPlayerUids
            .map((uid) => ({
                uid,
                displayName: allPlayersData[uid]?.displayName || "Unknown",
                points: allPlayersData[uid]?.points || 0,
            }))
            .sort((a, b) => b.points - a.points); // Higher points first

        // Generate brackets
        const bracket = generateBracketStructure(players);
        let matchesCreated = 0;

        // Create all matches as boards
        for (const round of bracket.rounds) {
            for (const match of round.matches) {
                // Skip matches with missing players
                if (!match.player1 || !match.player2) {
                    console.warn(
                        `Skipping match with missing player in ${round.name}`
                    );
                    continue;
                }

                const boardRef = push(ref(db, `events/${eventId}/boards`));
                await set(boardRef, {
                    name: `${round.name} - Match ${round.matches.indexOf(match) + 1}`,
                    matchType: round.type,
                    round: round.number,
                    bracket: round.bracket, // "winners" or "losers"
                    player1: {
                        uid: match.player1.uid || "unknown",
                        name: match.player1.displayName || "Unknown Player",
                        score: 0,
                    },
                    player2: {
                        uid: match.player2.uid || "unknown",
                        name: match.player2.displayName || "Unknown Player",
                        score: 0,
                    },
                    status: "live",
                    createdBy: adminUserId,
                    createdAt: new Date().toISOString(),
                });
                matchesCreated++;
            }
        }

        return {
            matchesCreated,
            rounds: bracket.rounds.length,
        };
    } catch (error) {
        console.error("Error generating tournament bracket:", error);
        throw error;
    }
}

// Helper: Generate bracket structure with winner and loser brackets
function generateBracketStructure(seededPlayers: any[]) {
    const n = seededPlayers.length;
    const rounds: any[] = [];
    let roundNum = 1;

    // Ensure we can build a proper bracket - round n to nearest power of 2
    let targetSize = 1;
    while (targetSize < n) {
        targetSize *= 2;
    }

    // If odd number of players, add a bye (but we'll eliminate it later)
    let activePlayers = [...seededPlayers];

    // Calculate number of rounds needed
    const numRounds = Math.ceil(Math.log2(n));

    // WINNER'S BRACKET
    const winnersRounds: any[][] = [];

    for (let round = 0; round < numRounds; round++) {
        const matches: any[] = [];

        // Pair up players for this round
        for (let i = 0; i < activePlayers.length - 1; i += 2) {
            matches.push({
                player1: activePlayers[i],
                player2: activePlayers[i + 1],
                winner: null,
                loser: null,
            });
        }

        if (matches.length === 0) break;
        winnersRounds.push(matches);

        // Prepare players for next round (use placeholder winners)
        activePlayers = [];
        for (let i = 0; i < matches.length; i++) {
            activePlayers.push({
                uid: `winner-w${round}-${i}`,
                displayName: `Winner W${round + 1}-${i + 1}`,
                points: 0,
            });
        }
    }

    // Add winners bracket rounds
    winnersRounds.forEach((matches, index) => {
        rounds.push({
            number: roundNum++,
            name: `Winners Round ${index + 1}`,
            type: "winners",
            bracket: "winners",
            matches,
        });
    });

    // LOSERS BRACKET - Collect losers from first round of winners bracket
    if (winnersRounds.length > 0 && winnersRounds[0].length >= 2) {
        const losersFromWinners: any[] = [];

        // Every loser from first round of winners bracket enters losers bracket
        winnersRounds[0].forEach((match) => {
            // Add the lower-seeded player (player2) as the loser
            losersFromWinners.push(match.player2);
        });

        if (losersFromWinners.length >= 2) {
            const losersRounds: any[][] = [];
            let currentRoundLosers = [...losersFromWinners];

            while (currentRoundLosers.length >= 2) {
                const matches: any[] = [];

                // Pair up losers for this round
                for (let i = 0; i < currentRoundLosers.length - 1; i += 2) {
                    matches.push({
                        player1: currentRoundLosers[i],
                        player2: currentRoundLosers[i + 1],
                        winner: null,
                        loser: null,
                    });
                }

                if (matches.length === 0) break;
                losersRounds.push(matches);

                // Prepare for next loser round (placeholder winners)
                currentRoundLosers = [];
                for (let i = 0; i < matches.length; i++) {
                    currentRoundLosers.push({
                        uid: `winner-l${losersRounds.length - 1}-${i}`,
                        displayName: `Winner L${losersRounds.length}-${i + 1}`,
                        points: 0,
                    });
                }
            }

            // Add loser bracket rounds
            losersRounds.forEach((matches, index) => {
                rounds.push({
                    number: roundNum++,
                    name: `Losers Round ${index + 1}`,
                    type: "losers",
                    bracket: "losers",
                    matches,
                });
            });
        }
    }

    return { rounds };
}
