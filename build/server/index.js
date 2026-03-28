import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useNavigate, Link } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, set, ref, get, update, onValue, push } from "firebase/database";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
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
async function signUp(email, password, displayName) {
  try {
    const displayNameToSave = displayName.trim();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, {
      displayName: displayNameToSave
    });
    await set(ref(db, `players/${user.uid}`), {
      email,
      displayName: displayNameToSave,
      uid: user.uid,
      points: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return user;
  } catch (error) {
    const errorMessage = error.message;
    console.error(`SignUp Error: ${errorMessage}`);
    throw error;
  }
}
async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const errorMessage = error.message;
    console.error(`SignIn Error: ${errorMessage}`);
    throw error;
  }
}
function getCurrentUser() {
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
async function logOut() {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    const errorMessage = error.message;
    console.error(`Sign Out Error: ${errorMessage}`);
    throw error;
  }
}
function addUserToEvent(eventId, user, options) {
  ref(db, "events/");
  get(ref(db, "events/" + eventId + "/players/" + user.uid)).then((snapshot) => {
    if (snapshot.exists()) {
      console.error("User is already registered for this event.");
      return;
    }
  }).catch((error) => {
    console.error("Error checking user registration: ", error);
  });
  const updates = {};
  updates["/events/" + eventId + "/players/" + user.uid] = {
    name: user.displayName,
    email: user.email,
    food: options.food,
    type: options.type
  };
  return update(ref(db), updates);
}
async function getAllEvents() {
  try {
    const snapshot = await get(ref(db, "events"));
    if (snapshot.exists()) {
      const eventsData = snapshot.val();
      return Object.keys(eventsData).map((key) => ({
        id: key,
        ...eventsData[key]
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
function onEventBoardsUpdate(eventId, callback) {
  const boardsRef = ref(db, `events/${eventId}/boards`);
  const unsubscribe = onValue(boardsRef, (snapshot) => {
    if (snapshot.exists()) {
      const boardsData = snapshot.val();
      const boards = Object.keys(boardsData).map((key) => ({
        id: key,
        ...boardsData[key]
      }));
      callback(boards);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}
async function getPlayerRankings() {
  try {
    const snapshot = await get(ref(db, "players"));
    if (snapshot.exists()) {
      const playersData = snapshot.val();
      const players = Object.keys(playersData).map((key) => ({
        uid: key,
        ...playersData[key]
      })).sort((a, b) => (b.points || 0) - (a.points || 0)).map((player, index) => ({
        ...player,
        rank: index + 1
      }));
      return players;
    }
    return [];
  } catch (error) {
    console.error("Error fetching player rankings:", error);
    return [];
  }
}
async function updateUserProfile(user, profileData) {
  try {
    const userRef = ref(db, `players/${user.uid}`);
    await update(userRef, {
      ...profileData,
      email: user.email,
      uid: user.uid,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
async function getUserProfile(userId) {
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
async function isUserAdmin(userId) {
  try {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      const authEmail = String(currentUser.email || "").trim().toLowerCase();
      const authDisplayName = String(currentUser.displayName || "").trim().toLowerCase();
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
async function createEventAsAdmin(adminUserId, eventData) {
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      boards: {}
    });
    return newEventRef.key || "";
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}
async function updateBoardScoresAsAdmin(adminUserId, eventId, boardId, player1Score, player2Score) {
  try {
    const isAdmin = await isUserAdmin(adminUserId);
    if (!isAdmin) {
      throw new Error("Only admins can update scores");
    }
    await update(ref(db, `events/${eventId}/boards/${boardId}`), {
      "player1/score": player1Score,
      "player2/score": player2Score,
      lastUpdatedBy: adminUserId,
      lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error updating board scores:", error);
    throw error;
  }
}
async function completeBoardMatchAsAdmin(adminUserId, eventId, boardId) {
  try {
    const isAdmin = await isUserAdmin(adminUserId);
    if (!isAdmin) {
      throw new Error("Only admins can complete matches");
    }
    await update(ref(db, `events/${eventId}/boards/${boardId}`), {
      status: "completed",
      completedBy: adminUserId,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error completing board match:", error);
    throw error;
  }
}
async function createBoardAsAdmin(adminUserId, eventId, boardData) {
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return newBoardRef.key || "";
  } catch (error) {
    console.error("Error creating board:", error);
    throw error;
  }
}
async function generateTournamentBracketAsAdmin(adminUserId, eventId) {
  try {
    const isAdmin = await isUserAdmin(adminUserId);
    if (!isAdmin) {
      throw new Error("Only admins can generate brackets");
    }
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
    const playersRef = ref(db, "players");
    const playersSnapshot = await get(playersRef);
    const allPlayersData = playersSnapshot.val() || {};
    const players = registeredPlayerUids.map((uid) => ({
      uid,
      displayName: allPlayersData[uid]?.displayName || "Unknown",
      points: allPlayersData[uid]?.points || 0
    })).sort((a, b) => b.points - a.points);
    const bracket = generateBracketStructure(players);
    let matchesCreated = 0;
    for (const round of bracket.rounds) {
      for (const match of round.matches) {
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
          bracket: round.bracket,
          // "winners" or "losers"
          player1: {
            uid: match.player1.uid || "unknown",
            name: match.player1.displayName || "Unknown Player",
            score: 0
          },
          player2: {
            uid: match.player2.uid || "unknown",
            name: match.player2.displayName || "Unknown Player",
            score: 0
          },
          status: "live",
          createdBy: adminUserId,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        matchesCreated++;
      }
    }
    return {
      matchesCreated,
      rounds: bracket.rounds.length
    };
  } catch (error) {
    console.error("Error generating tournament bracket:", error);
    throw error;
  }
}
function generateBracketStructure(seededPlayers) {
  const n = seededPlayers.length;
  const rounds = [];
  let roundNum = 1;
  let activePlayers = [...seededPlayers];
  const numRounds = Math.ceil(Math.log2(n));
  const winnersRounds = [];
  for (let round = 0; round < numRounds; round++) {
    const matches = [];
    for (let i = 0; i < activePlayers.length - 1; i += 2) {
      matches.push({
        player1: activePlayers[i],
        player2: activePlayers[i + 1],
        winner: null,
        loser: null
      });
    }
    if (matches.length === 0) break;
    winnersRounds.push(matches);
    activePlayers = [];
    for (let i = 0; i < matches.length; i++) {
      activePlayers.push({
        uid: `winner-w${round}-${i}`,
        displayName: `Winner W${round + 1}-${i + 1}`,
        points: 0
      });
    }
  }
  winnersRounds.forEach((matches, index) => {
    rounds.push({
      number: roundNum++,
      name: `Winners Round ${index + 1}`,
      type: "winners",
      bracket: "winners",
      matches
    });
  });
  if (winnersRounds.length > 0 && winnersRounds[0].length >= 2) {
    const losersFromWinners = [];
    winnersRounds[0].forEach((match) => {
      losersFromWinners.push(match.player2);
    });
    if (losersFromWinners.length >= 2) {
      const losersRounds = [];
      let currentRoundLosers = [...losersFromWinners];
      while (currentRoundLosers.length >= 2) {
        const matches = [];
        for (let i = 0; i < currentRoundLosers.length - 1; i += 2) {
          matches.push({
            player1: currentRoundLosers[i],
            player2: currentRoundLosers[i + 1],
            winner: null,
            loser: null
          });
        }
        if (matches.length === 0) break;
        losersRounds.push(matches);
        currentRoundLosers = [];
        for (let i = 0; i < matches.length; i++) {
          currentRoundLosers.push({
            uid: `winner-l${losersRounds.length - 1}-${i}`,
            displayName: `Winner L${losersRounds.length}-${i + 1}`,
            points: 0
          });
        }
      }
      losersRounds.forEach((matches, index) => {
        rounds.push({
          number: roundNum++,
          name: `Losers Round ${index + 1}`,
          type: "losers",
          bracket: "losers",
          matches
        });
      });
    }
  }
  return { rounds };
}
function meta$4({}) {
  return [{
    title: "Login | CACA Scoreboard"
  }, {
    name: "description",
    content: "Log in or create an account for the Capital Area Carrom Association scoreboard."
  }];
}
const login = UNSAFE_withComponentProps(function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!displayName.trim()) {
      setError("Display name is required");
      setLoading(false);
      return;
    }
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    try {
      await signUp(email, password, displayName);
      setTimeout(() => {
        navigate("/");
      }, 1e3);
    } catch (err) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      setTimeout(() => {
        navigate("/");
      }, 1e3);
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", {
    className: "caca-page min-h-screen flex items-center justify-center px-4 py-12",
    children: /* @__PURE__ */ jsxs("div", {
      className: "w-full max-w-md",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "text-center mb-8",
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "inline-block hover:opacity-80 transition-opacity",
          children: /* @__PURE__ */ jsx("h1", {
            className: "text-5xl font-bold mb-2",
            style: {
              fontFamily: "var(--caca-font-display)"
            },
            children: "CACA"
          })
        }), /* @__PURE__ */ jsx("p", {
          className: "text-lg",
          style: {
            color: "var(--caca-accent)"
          },
          children: "Capital Area Carrom Association"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "rounded-lg p-8 shadow-lg border",
        style: {
          backgroundColor: "var(--caca-surface-strong)",
          borderColor: "var(--caca-border)"
        },
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex gap-2 mb-6",
          children: [/* @__PURE__ */ jsx("button", {
            type: "button",
            onClick: () => {
              setIsSignUp(false);
              setError("");
              setDisplayName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setShowPassword(false);
              setShowConfirmPassword(false);
            },
            className: `flex-1 py-2 px-4 rounded-md font-semibold transition-all ${!isSignUp ? "text-white" : "text-gray-600 bg-gray-100"}`,
            style: {
              backgroundColor: !isSignUp ? "var(--caca-accent)" : void 0
            },
            children: "Log In"
          }), /* @__PURE__ */ jsx("button", {
            type: "button",
            onClick: () => {
              setIsSignUp(true);
              setError("");
              setDisplayName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setShowPassword(false);
              setShowConfirmPassword(false);
            },
            className: `flex-1 py-2 px-4 rounded-md font-semibold transition-all ${isSignUp ? "text-white" : "text-gray-600 bg-gray-100"}`,
            style: {
              backgroundColor: isSignUp ? "var(--caca-accent)" : void 0
            },
            children: "Sign Up"
          })]
        }), error && /* @__PURE__ */ jsx("div", {
          className: "mb-4 p-3 rounded-md text-sm",
          style: {
            backgroundColor: "rgba(179, 58, 47, 0.1)",
            color: "var(--caca-accent)",
            borderLeft: "4px solid var(--caca-accent)"
          },
          children: error
        }), /* @__PURE__ */ jsxs("form", {
          onSubmit: isSignUp ? handleSignUp : handleSignIn,
          children: [isSignUp && /* @__PURE__ */ jsxs("div", {
            className: "mb-4",
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-semibold mb-2",
              children: "Display Name *"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              value: displayName,
              onChange: (e) => setDisplayName(e.target.value),
              required: true,
              className: "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50",
              style: {
                borderColor: "var(--caca-border)"
              },
              placeholder: "Your full name"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs mt-1",
              style: {
                color: "var(--caca-ink-soft)"
              },
              children: "This will be shown in rankings and matches"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-4",
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-semibold mb-2",
              children: "Email"
            }), /* @__PURE__ */ jsx("input", {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              className: "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50",
              style: {
                borderColor: "var(--caca-border)"
              },
              placeholder: "you@example.com"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mb-4",
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-semibold mb-2",
              children: "Password"
            }), /* @__PURE__ */ jsxs("div", {
              className: "relative",
              children: [/* @__PURE__ */ jsx("input", {
                type: showPassword ? "text" : "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                className: "w-full pl-4 pr-20 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50",
                style: {
                  borderColor: "var(--caca-border)"
                },
                placeholder: showPassword ? "Password" : "••••••••"
              }), /* @__PURE__ */ jsx("button", {
                type: "button",
                onClick: () => setShowPassword((prev) => !prev),
                className: "absolute inset-y-0 right-2 my-1 px-3 rounded text-xs font-semibold",
                style: {
                  color: "var(--caca-accent)",
                  backgroundColor: "rgba(179, 58, 47, 0.08)"
                },
                children: showPassword ? "Hide" : "Show"
              })]
            }), isSignUp && /* @__PURE__ */ jsx("p", {
              className: "text-xs mt-1",
              style: {
                color: "var(--caca-ink-soft)"
              },
              children: "Must be at least 6 characters"
            })]
          }), isSignUp && /* @__PURE__ */ jsxs("div", {
            className: "mb-6",
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-semibold mb-2",
              children: "Confirm Password"
            }), /* @__PURE__ */ jsxs("div", {
              className: "relative",
              children: [/* @__PURE__ */ jsx("input", {
                type: showConfirmPassword ? "text" : "password",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                required: true,
                className: "w-full pl-4 pr-20 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50",
                style: {
                  borderColor: "var(--caca-border)"
                },
                placeholder: showConfirmPassword ? "Confirm Password" : "••••••••"
              }), /* @__PURE__ */ jsx("button", {
                type: "button",
                onClick: () => setShowConfirmPassword((prev) => !prev),
                className: "absolute inset-y-0 right-2 my-1 px-3 rounded text-xs font-semibold",
                style: {
                  color: "var(--caca-accent)",
                  backgroundColor: "rgba(179, 58, 47, 0.08)"
                },
                children: showConfirmPassword ? "Hide" : "Show"
              })]
            })]
          }), /* @__PURE__ */ jsx("button", {
            type: "submit",
            disabled: loading,
            className: "w-full py-2 px-4 rounded-md font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50",
            style: {
              backgroundColor: "var(--caca-accent)"
            },
            children: loading ? "Loading..." : isSignUp ? "Create Account" : "Log In"
          })]
        })]
      }), /* @__PURE__ */ jsx("p", {
        className: "text-center mt-6 text-sm",
        style: {
          color: "var(--caca-ink-soft)"
        },
        children: isSignUp ? "Already have an account? Click Log In above." : "Don't have an account? Click Sign Up above."
      })]
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: login,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
function meta$3({}) {
  return [{
    title: "Register for Event | CACA Scoreboard"
  }, {
    name: "description",
    content: "Register for a carrom event with your preferences."
  }];
}
const isPastEvent = (eventDate) => {
  const event = new Date(eventDate);
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  return event < today;
};
const registerEvent = UNSAFE_withComponentProps(function RegisterEventPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [foodPreference, setFoodPreference] = useState("non-vegetarian");
  const [matchType, setMatchType] = useState("singles");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventSearchOpen, setEventSearchOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const eventSearchRef = useRef(null);
  useEffect(() => {
    const checkUserAndFetchEvents = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate("/login");
          return;
        }
        setUser(currentUser);
        const allEvents = await getAllEvents();
        const availableEvents = allEvents.filter((event) => !isPastEvent(event.date));
        setEvents(availableEvents);
        setFilteredEvents(availableEvents);
        if (availableEvents.length > 0) {
          setSelectedEvent(availableEvents[0]);
        }
      } catch (error2) {
        console.error("Error:", error2);
      } finally {
        setPageLoading(false);
      }
    };
    checkUserAndFetchEvents();
  }, [navigate]);
  useEffect(() => {
    const filtered = events.filter((event) => event.name.toLowerCase().includes(eventSearch.toLowerCase()) && !isPastEvent(event.date));
    setFilteredEvents(filtered);
  }, [eventSearch, events]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (eventSearchRef.current && !eventSearchRef.current.contains(event.target)) {
        setEventSearchOpen(false);
      }
    }
    if (eventSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [eventSearchOpen]);
  const handleSubmit = async (e) => {
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
      if (isPastEvent(selectedEvent.date)) {
        setError("This event has already passed. Please select an upcoming event.");
        setLoading(false);
        return;
      }
      await addUserToEvent(selectedEvent.id, user, {
        food: foodPreference,
        type: matchType
      });
      await updateUserProfile(user, {
        displayName: user.displayName || user.email
      });
      alert("Successfully registered for the event!");
      setTimeout(() => {
        navigate("/");
      }, 1e3);
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (pageLoading) {
    return /* @__PURE__ */ jsx("div", {
      className: "caca-page min-h-screen flex items-center justify-center",
      children: /* @__PURE__ */ jsx("div", {
        className: "text-center",
        children: /* @__PURE__ */ jsx("p", {
          style: {
            color: "var(--caca-ink-soft)"
          },
          children: "Loading..."
        })
      })
    });
  }
  return /* @__PURE__ */ jsx("div", {
    className: "caca-page min-h-screen flex items-center justify-center px-4 py-12",
    children: /* @__PURE__ */ jsxs("div", {
      className: "w-full max-w-md",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "text-center mb-8",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-5xl font-bold mb-2",
          style: {
            fontFamily: "var(--caca-font-display)"
          },
          children: "Register"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-lg",
          style: {
            color: "var(--caca-accent)"
          },
          children: "Join a Carrom Event"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "rounded-lg p-8 shadow-lg border",
        style: {
          backgroundColor: "var(--caca-surface-strong)",
          borderColor: "var(--caca-border)"
        },
        children: [error && /* @__PURE__ */ jsx("div", {
          className: "mb-4 p-3 rounded-md text-sm",
          style: {
            backgroundColor: "rgba(179, 58, 47, 0.1)",
            color: "var(--caca-accent)",
            borderLeft: "4px solid var(--caca-accent)"
          },
          children: error
        }), /* @__PURE__ */ jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-5",
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-semibold mb-2",
              children: "Event"
            }), /* @__PURE__ */ jsxs("div", {
              className: "relative",
              ref: eventSearchRef,
              children: [/* @__PURE__ */ jsx("button", {
                type: "button",
                onClick: () => setEventSearchOpen(!eventSearchOpen),
                disabled: events.length === 0,
                className: "w-full px-4 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition",
                style: {
                  borderColor: "var(--caca-border)",
                  color: "var(--caca-ink)",
                  backgroundColor: "white"
                },
                children: /* @__PURE__ */ jsxs("div", {
                  className: "flex justify-between items-center",
                  children: [/* @__PURE__ */ jsx("span", {
                    children: selectedEvent?.name || "No events available"
                  }), /* @__PURE__ */ jsx("span", {
                    style: {
                      color: "var(--caca-ink-soft)"
                    },
                    children: "▼"
                  })]
                })
              }), eventSearchOpen && /* @__PURE__ */ jsxs("div", {
                className: "absolute z-10 w-full mt-1 border rounded-md shadow-lg",
                style: {
                  backgroundColor: "white",
                  borderColor: "var(--caca-border)"
                },
                children: [/* @__PURE__ */ jsx("input", {
                  type: "text",
                  placeholder: "Search events...",
                  value: eventSearch,
                  onChange: (e) => setEventSearch(e.target.value),
                  className: "w-full px-4 py-2 border-b focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded-t-md",
                  style: {
                    borderColor: "var(--caca-border)",
                    color: "var(--caca-ink)"
                  },
                  autoFocus: true
                }), /* @__PURE__ */ jsx("div", {
                  className: "max-h-48 overflow-y-auto",
                  children: filteredEvents.length > 0 ? filteredEvents.map((event) => /* @__PURE__ */ jsxs("button", {
                    type: "button",
                    onClick: () => {
                      setSelectedEvent(event);
                      setEventSearchOpen(false);
                      setEventSearch("");
                    },
                    className: "w-full text-left px-4 py-2 transition",
                    style: {
                      backgroundColor: selectedEvent?.id === event.id ? "rgba(179, 58, 47, 0.1)" : "transparent",
                      color: selectedEvent?.id === event.id ? "var(--caca-accent)" : "var(--caca-ink)",
                      fontWeight: selectedEvent?.id === event.id ? "600" : "400"
                    },
                    children: [/* @__PURE__ */ jsx("div", {
                      children: event.name
                    }), /* @__PURE__ */ jsx("div", {
                      className: "text-xs",
                      style: {
                        color: "var(--caca-ink-soft)"
                      },
                      children: new Date(event.date).toLocaleDateString()
                    })]
                  }, event.id)) : /* @__PURE__ */ jsx("div", {
                    className: "px-4 py-2 text-sm",
                    style: {
                      color: "var(--caca-ink-soft)"
                    },
                    children: "No events found"
                  })
                })]
              })]
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs mt-1",
              style: {
                color: "var(--caca-ink-soft)"
              },
              children: selectedEvent?.date && `Date: ${new Date(selectedEvent.date).toLocaleDateString()}`
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-semibold mb-2",
              children: "Food Preference"
            }), /* @__PURE__ */ jsxs("select", {
              value: foodPreference,
              onChange: (e) => setFoodPreference(e.target.value),
              className: "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition",
              style: {
                borderColor: "var(--caca-border)",
                color: "var(--caca-ink)",
                backgroundColor: "white"
              },
              children: [/* @__PURE__ */ jsx("option", {
                value: "vegetarian",
                children: "Vegetarian"
              }), /* @__PURE__ */ jsx("option", {
                value: "non-vegetarian",
                children: "Non-Vegetarian"
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-semibold mb-2",
              children: "Match Type"
            }), /* @__PURE__ */ jsxs("select", {
              value: matchType,
              onChange: (e) => setMatchType(e.target.value),
              className: "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition",
              style: {
                borderColor: "var(--caca-border)",
                color: "var(--caca-ink)",
                backgroundColor: "white"
              },
              children: [/* @__PURE__ */ jsx("option", {
                value: "singles",
                children: "Singles"
              }), /* @__PURE__ */ jsx("option", {
                value: "doubles",
                children: "Doubles"
              })]
            })]
          }), /* @__PURE__ */ jsx("button", {
            type: "submit",
            disabled: loading || events.length === 0,
            className: "w-full py-2 px-4 rounded-md font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-6",
            style: {
              backgroundColor: "var(--caca-accent)"
            },
            children: loading ? "Registering..." : events.length === 0 ? "No Upcoming Events" : "Register for Event"
          })]
        }), events.length === 0 && /* @__PURE__ */ jsx("p", {
          className: "mt-4 text-sm text-center",
          style: {
            color: "var(--caca-ink-soft)"
          },
          children: "No upcoming events available. Please check back soon!"
        })]
      }), /* @__PURE__ */ jsx("p", {
        className: "text-center mt-6 text-sm",
        style: {
          color: "var(--caca-ink-soft)"
        },
        children: /* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "transition",
          style: {
            color: "var(--caca-accent)"
          },
          children: "Back to Home"
        })
      })]
    })
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: registerEvent,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const organizeBracket = (boards) => {
  const winnersRounds = {};
  const losersRounds = {};
  const hasMetadata = boards.some((b) => b.bracket || b.round);
  if (!hasMetadata) {
    const allBoards = [...boards].sort((a, b) => {
      if (a.status !== b.status)
        return a.status === "completed" ? -1 : 1;
      return 0;
    });
    const roundSize = Math.max(1, Math.ceil(allBoards.length / 4));
    const rounds = [];
    for (let i = 0; i < allBoards.length; i += roundSize) {
      rounds.push(allBoards.slice(i, i + roundSize));
    }
    return {
      winners: rounds.length > 0 ? rounds : [[]],
      losers: [[]],
      hasMetadata: false
    };
  }
  boards.forEach((board) => {
    const round = board.round || 1;
    const bracketType = board.bracket || "winners";
    if (bracketType === "winners") {
      if (!winnersRounds[round]) winnersRounds[round] = [];
      winnersRounds[round].push(board);
    } else if (bracketType === "losers") {
      if (!losersRounds[round]) losersRounds[round] = [];
      losersRounds[round].push(board);
    }
  });
  const winnerRoundNums = Object.keys(winnersRounds).map(Number).sort((a, b) => a - b);
  const loserRoundNums = Object.keys(losersRounds).map(Number).sort((a, b) => a - b);
  const winnerRounds = [];
  const loserRounds = [];
  winnerRoundNums.forEach((round) => {
    winnerRounds.push(winnersRounds[round]);
  });
  loserRoundNums.forEach((round) => {
    loserRounds.push(losersRounds[round]);
  });
  return {
    winners: winnerRounds,
    losers: loserRounds,
    hasMetadata: true
  };
};
const getRoundName = (roundIndex, totalRounds) => {
  if (totalRounds === 1) return "Final";
  if (roundIndex === totalRounds - 1) return "Final";
  if (roundIndex === totalRounds - 2) return "Semi-Final";
  return `Round ${roundIndex + 1}`;
};
const BracketMatch = ({ board }) => {
  const winner = board.player1.score > board.player2.score ? 1 : 2;
  return /* @__PURE__ */ jsxs("div", { className: "mb-4 rounded-lg border border-[var(--caca-border)] bg-white shadow-sm overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-[var(--caca-wood)]/10 to-transparent px-4 py-2 border-b border-[var(--caca-border)]", children: /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-[var(--caca-ink-soft)] uppercase tracking-wide", children: board.name }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex items-center justify-between py-2 px-3 rounded transition-colors ${winner === 1 ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`,
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `text-sm font-medium ${winner === 1 ? "text-[var(--caca-accent)] font-bold" : "text-[var(--caca-ink)]"}`,
                children: board.player1.name
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `font-display text-lg ${winner === 1 ? "text-green-600 font-bold" : "text-[var(--caca-ink)]"}`,
                children: board.player1.score
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "my-1 text-center text-xs text-[var(--caca-ink-soft)] font-semibold", children: "vs" }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex items-center justify-between py-2 px-3 rounded transition-colors ${winner === 2 ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`,
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `text-sm font-medium ${winner === 2 ? "text-[var(--caca-accent)] font-bold" : "text-[var(--caca-ink)]"}`,
                children: board.player2.name
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `font-display text-lg ${winner === 2 ? "text-green-600 font-bold" : "text-[var(--caca-ink)]"}`,
                children: board.player2.score
              }
            )
          ]
        }
      ),
      board.status === "live" && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-center gap-1 py-1 px-2 bg-green-100 rounded text-xs font-semibold text-green-700", children: [
        /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" }),
        "LIVE"
      ] }),
      board.status === "completed" && /* @__PURE__ */ jsx("div", { className: "mt-3 text-center py-1 px-2 bg-blue-100 rounded text-xs font-semibold text-blue-700", children: "COMPLETED" })
    ] })
  ] });
};
const Bracket = ({ boards }) => {
  const bracketData = organizeBracket(boards);
  if (boards.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[var(--caca-ink-soft)] mb-2", children: "No tournament data available yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--caca-ink-soft)]", children: "Boards will appear here as matches are created" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl text-[var(--caca-ink)] mb-2", children: "Tournament Bracket" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-[var(--caca-ink-soft)]", children: [
        boards.length,
        " total match",
        boards.length !== 1 ? "es" : "",
        " •",
        " ",
        boards.filter((b) => b.status === "completed").length,
        " completed"
      ] }),
      !bracketData.hasMetadata && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--caca-accent)] mt-2", children: '💡 Tip: Use "Generate Tournament Bracket" in the admin panel for an automatic double-elimination bracket' })
    ] }),
    bracketData.winners.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-display text-xl text-[var(--caca-ink)] mb-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[var(--caca-wood)]", children: "👑" }),
        bracketData.hasMetadata ? "Winners Bracket" : "All Matches"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: bracketData.winners.map((round, roundIndex) => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 pb-2 border-b border-[var(--caca-border)]", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-[var(--caca-ink)] text-sm uppercase tracking-wide", children: bracketData.hasMetadata ? getRoundName(
            roundIndex,
            bracketData.winners.length
          ) : `Group ${roundIndex + 1}` }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-[var(--caca-ink-soft)] mt-1", children: [
            round.length,
            " match",
            round.length !== 1 ? "es" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: round.map((board) => /* @__PURE__ */ jsx(
          BracketMatch,
          {
            board
          },
          board.id
        )) })
      ] }, `w-${roundIndex}`)) })
    ] }),
    bracketData.hasMetadata && bracketData.losers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-12 pt-12 border-t border-[var(--caca-border)]", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-display text-xl text-[var(--caca-ink)] mb-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "🏆" }),
        "Losers Bracket"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: bracketData.losers.map((round, roundIndex) => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 pb-2 border-b border-[var(--caca-border)]", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-[var(--caca-ink)] text-sm uppercase tracking-wide", children: getRoundName(
            roundIndex,
            bracketData.losers.length
          ) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-[var(--caca-ink-soft)] mt-1", children: [
            round.length,
            " match",
            round.length !== 1 ? "es" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: round.map((board) => /* @__PURE__ */ jsx(
          BracketMatch,
          {
            board
          },
          board.id
        )) })
      ] }, `l-${roundIndex}`)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-12 pt-8 border-t border-[var(--caca-border)]", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-green-100 border border-green-200 rounded" }),
        /* @__PURE__ */ jsx("span", { className: "text-[var(--caca-ink-soft)]", children: "Winner" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" }),
        /* @__PURE__ */ jsx("span", { className: "text-[var(--caca-ink-soft)]", children: "Live Match" })
      ] })
    ] }) })
  ] });
};
function meta$2({}) {
  return [{
    title: "Live Scoreboard | CACA"
  }, {
    name: "description",
    content: "View live scoreboards and tournament brackets."
  }];
}
const scoreboard = UNSAFE_withComponentProps(function Scoreboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [boards, setBoards] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  let unsubscribeBoards = null;
  useEffect(() => {
    const checkUserAndFetchEvents = async () => {
      try {
        const currentUserData = await getCurrentUser();
        setUser(currentUserData);
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
  useEffect(() => {
    if (!selectedEventId) return;
    if (unsubscribeBoards) {
      unsubscribeBoards();
    }
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
  return /* @__PURE__ */ jsxs("main", {
    className: "caca-page min-h-screen",
    children: [/* @__PURE__ */ jsx("div", {
      className: "sticky-header-wrapper",
      children: /* @__PURE__ */ jsxs("header", {
        className: "sticky-header mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface)] px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6",
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "flex items-center gap-2 hover:opacity-80 transition-opacity",
          children: /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-xs uppercase tracking-[0.28em] text-[var(--caca-ink-soft)]",
              children: "Capital Area Carrom Association"
            }), /* @__PURE__ */ jsx("p", {
              className: "font-display text-2xl leading-none text-[var(--caca-ink)]",
              children: "CACA"
            })]
          })
        }), /* @__PURE__ */ jsxs("nav", {
          "aria-label": "Primary actions",
          className: "flex flex-wrap gap-2",
          children: [user ? /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsxs("span", {
              className: "flex items-center px-3 py-2 text-sm text-[var(--caca-ink-soft)]",
              children: ["Welcome, ", user.email]
            }), /* @__PURE__ */ jsx("button", {
              onClick: handleLogout,
              className: "caca-btn caca-btn-muted",
              children: "Logout"
            })]
          }) : /* @__PURE__ */ jsx(Fragment, {
            children: /* @__PURE__ */ jsx(Link, {
              className: "caca-btn caca-btn-muted",
              to: "/login",
              children: "Log in"
            })
          }), /* @__PURE__ */ jsx(Link, {
            className: "caca-btn caca-btn-secondary",
            to: "/register-event",
            children: "Register Event"
          }), /* @__PURE__ */ jsx(Link, {
            className: "caca-btn caca-btn-primary",
            to: "/",
            children: "Home"
          })]
        })]
      })
    }), /* @__PURE__ */ jsx("section", {
      className: "hero-shell",
      children: /* @__PURE__ */ jsx("div", {
        className: "mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 lg:px-8",
        children: /* @__PURE__ */ jsxs("div", {
          className: "fade-up",
          children: [/* @__PURE__ */ jsx("p", {
            className: "mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--caca-accent)]",
            children: "Live Updates"
          }), /* @__PURE__ */ jsx("h1", {
            className: "font-display text-5xl leading-none text-[var(--caca-ink)] sm:text-6xl md:text-7xl",
            children: "Scoreboard"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-4 max-w-2xl text-base leading-relaxed text-[var(--caca-ink-soft)] sm:text-lg",
            children: "Follow live matches and tournament brackets in real-time"
          })]
        })
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8",
      children: [events.length > 0 && /* @__PURE__ */ jsxs("div", {
        className: "mb-8",
        children: [/* @__PURE__ */ jsx("label", {
          className: "block text-sm font-semibold mb-3 text-[var(--caca-ink)]",
          children: "Select Event:"
        }), /* @__PURE__ */ jsx("select", {
          value: selectedEventId,
          onChange: (e) => setSelectedEventId(e.target.value),
          className: "px-4 py-2 border rounded-lg focus:outline-none focus:ring-2",
          style: {
            borderColor: "var(--caca-border)",
            color: "var(--caca-ink)",
            backgroundColor: "white"
          },
          children: events.map((event) => /* @__PURE__ */ jsxs("option", {
            value: event.id,
            children: [event.name || `Event ${event.id}`, " (", event.date, ")"]
          }, event.id))
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mb-8 flex gap-3 border-b border-[var(--caca-border)]",
        children: [/* @__PURE__ */ jsx("button", {
          onClick: () => setActiveTab("live"),
          className: `px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === "live" ? "border-[var(--caca-accent)] text-[var(--caca-accent)]" : "border-transparent text-[var(--caca-ink-soft)] hover:text-[var(--caca-ink)]"}`,
          children: "Live Boards"
        }), /* @__PURE__ */ jsx("button", {
          onClick: () => setActiveTab("bracket"),
          className: `px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === "bracket" ? "border-[var(--caca-accent)] text-[var(--caca-accent)]" : "border-transparent text-[var(--caca-ink-soft)] hover:text-[var(--caca-ink)]"}`,
          children: "Tournament Bracket"
        })]
      }), activeTab === "live" && /* @__PURE__ */ jsxs("div", {
        className: "space-y-4",
        children: [liveBoards.length > 0 ? liveBoards.map((board) => /* @__PURE__ */ jsxs("div", {
          className: "rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6 shadow-sm hover:shadow-md transition-shadow",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center justify-between mb-4",
            children: [/* @__PURE__ */ jsx("div", {
              children: /* @__PURE__ */ jsx("h3", {
                className: "font-display text-xl text-[var(--caca-ink)]",
                children: board.name
              })
            }), /* @__PURE__ */ jsx("div", {
              className: "flex items-center gap-2",
              children: /* @__PURE__ */ jsxs("span", {
                className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold",
                children: [/* @__PURE__ */ jsx("span", {
                  className: "w-2 h-2 bg-green-500 rounded-full animate-pulse"
                }), "LIVE"]
              })
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-[1fr_auto_1fr] gap-4 items-center",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "border-r border-[var(--caca-border)] pr-4",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-[var(--caca-ink-soft)] mb-1",
                children: board.player1?.name || "Player 1"
              }), /* @__PURE__ */ jsx("p", {
                className: "font-display text-4xl text-[var(--caca-ink)]",
                children: board.player1?.score || 0
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "text-center text-[var(--caca-ink-soft)] font-semibold px-4",
              children: "VS"
            }), /* @__PURE__ */ jsxs("div", {
              className: "border-l border-[var(--caca-border)] pl-4",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-[var(--caca-ink-soft)] mb-1",
                children: board.player2?.name || "Player 2"
              }), /* @__PURE__ */ jsx("p", {
                className: "font-display text-4xl text-[var(--caca-ink)]",
                children: board.player2?.score || 0
              })]
            })]
          })]
        }, board.id)) : /* @__PURE__ */ jsx("div", {
          className: "rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface)] p-8 text-center",
          children: /* @__PURE__ */ jsx("p", {
            className: "text-[var(--caca-ink-soft)]",
            children: "No live boards at the moment"
          })
        }), completedBoards.length > 0 && /* @__PURE__ */ jsxs("div", {
          className: "mt-12",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "font-display text-2xl text-[var(--caca-ink)] mb-4",
            children: "Completed Matches"
          }), /* @__PURE__ */ jsx("div", {
            className: "space-y-3",
            children: completedBoards.map((board) => /* @__PURE__ */ jsx("div", {
              className: "rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface)] p-4",
              children: /* @__PURE__ */ jsxs("div", {
                className: "flex items-center justify-between",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "flex-1",
                  children: /* @__PURE__ */ jsx("p", {
                    className: "text-sm text-[var(--caca-ink-soft)] font-semibold",
                    children: board.player1.name
                  })
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-3 px-4",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "font-display text-xl text-[var(--caca-ink)]",
                    children: board.player1.score
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-[var(--caca-ink-soft)]",
                    children: "-"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "font-display text-xl text-[var(--caca-ink)]",
                    children: board.player2.score
                  })]
                }), /* @__PURE__ */ jsx("div", {
                  className: "flex-1 text-right",
                  children: /* @__PURE__ */ jsx("p", {
                    className: "text-sm text-[var(--caca-ink-soft)] font-semibold",
                    children: board.player2.name
                  })
                })]
              })
            }, board.id))
          })]
        })]
      }), activeTab === "bracket" && /* @__PURE__ */ jsx("div", {
        className: "rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-8",
        children: /* @__PURE__ */ jsx(Bracket, {
          boards
        })
      })]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: scoreboard,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
function meta$1({}) {
  return [{
    title: "Admin Panel | CACA"
  }, {
    name: "description",
    content: "Admin panel for managing events and scores."
  }];
}
const admin = UNSAFE_withComponentProps(function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventFormat, setEventFormat] = useState("");
  const [createEventLoading, setCreateEventLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [boardName, setBoardName] = useState("");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [createBoardLoading, setCreateBoardLoading] = useState(false);
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [player1Score, setPlayer1Score] = useState("0");
  const [player2Score, setPlayer2Score] = useState("0");
  const [updateScoreLoading, setUpdateScoreLoading] = useState(false);
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
        const allEvents = await getAllEvents();
        setEvents(allEvents);
        if (allEvents.length > 0) {
          setSelectedEventId(allEvents[0].id);
        }
      } catch (error2) {
        console.error("Error:", error2);
      } finally {
        setLoading(false);
      }
    };
    checkUserAndAdmin();
  }, [navigate]);
  useEffect(() => {
    if (!selectedEventId || !user) return;
    const unsubscribe = onEventBoardsUpdate(selectedEventId, (updatedBoards) => {
      setBoards(updatedBoards);
    });
    return () => unsubscribe();
  }, [selectedEventId, user]);
  const handleLogout = async () => {
    try {
      await logOut();
      setUser(null);
      navigate("/");
    } catch (error2) {
      console.error("Error logging out:", error2);
    }
  };
  const handleCreateEvent = async (e) => {
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
        format: eventFormat
      });
      setSuccess("Event created successfully!");
      setEventName("");
      setEventDate("");
      setEventFormat("");
      const allEvents = await getAllEvents();
      setEvents(allEvents);
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setCreateEventLoading(false);
    }
  };
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreateBoardLoading(true);
    try {
      if (!user) throw new Error("User not found");
      if (!selectedEventId) throw new Error("Event not selected");
      if (!boardName || !player1Name || !player2Name) throw new Error("Board name and player names are required");
      await createBoardAsAdmin(user.uid, selectedEventId, {
        name: boardName,
        player1: {
          name: player1Name,
          score: 0
        },
        player2: {
          name: player2Name,
          score: 0
        }
      });
      setSuccess("Board created successfully!");
      setBoardName("");
      setPlayer1Name("");
      setPlayer2Name("");
    } catch (err) {
      setError(err.message || "Failed to create board");
    } finally {
      setCreateBoardLoading(false);
    }
  };
  const handleUpdateScore = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUpdateScoreLoading(true);
    try {
      if (!user) throw new Error("User not found");
      if (!selectedEventId || !selectedBoardId) throw new Error("Event and board not selected");
      await updateBoardScoresAsAdmin(user.uid, selectedEventId, selectedBoardId, parseInt(player1Score), parseInt(player2Score));
      setSuccess("Score updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update score");
    } finally {
      setUpdateScoreLoading(false);
    }
  };
  const handleCompleteBoard = async (boardId) => {
    setError("");
    setSuccess("");
    try {
      if (!user) throw new Error("User not found");
      if (!selectedEventId) throw new Error("Event not selected");
      await completeBoardMatchAsAdmin(user.uid, selectedEventId, boardId);
      setSuccess("Board marked as completed!");
    } catch (err) {
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
      const event = events.find((e) => e.id === selectedEventId);
      if (event) {
        setSelectedEventId(selectedEventId);
      }
    } catch (err) {
      setError(err.message || "Failed to generate bracket");
    } finally {
      setGenerateBracketLoading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", {
      className: "caca-page min-h-screen flex items-center justify-center",
      children: /* @__PURE__ */ jsx("p", {
        style: {
          color: "var(--caca-ink-soft)"
        },
        children: "Loading..."
      })
    });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsx("div", {
      className: "caca-page min-h-screen flex items-center justify-center",
      children: /* @__PURE__ */ jsx("p", {
        style: {
          color: "var(--caca-accent)"
        },
        children: "Admin access required"
      })
    });
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "caca-page min-h-screen",
    children: [/* @__PURE__ */ jsx("div", {
      className: "sticky-header-wrapper",
      children: /* @__PURE__ */ jsxs("header", {
        className: "sticky-header mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface)] px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6",
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "flex items-center gap-2 hover:opacity-80 transition-opacity",
          children: /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-xs uppercase tracking-[0.28em] text-[var(--caca-ink-soft)]",
              children: "CACA Admin"
            }), /* @__PURE__ */ jsx("p", {
              className: "font-display text-2xl leading-none text-[var(--caca-ink)]",
              children: "Control Panel"
            })]
          })
        }), /* @__PURE__ */ jsxs("nav", {
          "aria-label": "Primary actions",
          className: "flex flex-wrap gap-2",
          children: [/* @__PURE__ */ jsx("span", {
            className: "flex items-center px-3 py-2 text-sm text-[var(--caca-ink-soft)]",
            children: user?.email
          }), /* @__PURE__ */ jsx("button", {
            onClick: handleLogout,
            className: "caca-btn caca-btn-muted",
            children: "Logout"
          }), /* @__PURE__ */ jsx(Link, {
            className: "caca-btn caca-btn-primary",
            to: "/",
            children: "Home"
          })]
        })]
      })
    }), /* @__PURE__ */ jsx("section", {
      className: "hero-shell",
      children: /* @__PURE__ */ jsx("div", {
        className: "mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 lg:px-8",
        children: /* @__PURE__ */ jsxs("div", {
          className: "fade-up",
          children: [/* @__PURE__ */ jsx("p", {
            className: "mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--caca-accent)]",
            children: "Admin Access"
          }), /* @__PURE__ */ jsx("h1", {
            className: "font-display text-5xl leading-none text-[var(--caca-ink)] sm:text-6xl",
            children: "Management"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-4 max-w-2xl text-base leading-relaxed text-[var(--caca-ink-soft)]",
            children: "Create events, manage boards, and update live scores"
          })]
        })
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8",
      children: [error && /* @__PURE__ */ jsx("div", {
        className: "mb-6 p-4 rounded-lg border",
        style: {
          backgroundColor: "rgba(179, 58, 47, 0.1)",
          borderColor: "var(--caca-accent)",
          color: "var(--caca-accent)"
        },
        children: error
      }), success && /* @__PURE__ */ jsx("div", {
        className: "mb-6 p-4 rounded-lg border",
        style: {
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderColor: "#22c55e",
          color: "#22c55e"
        },
        children: success
      }), /* @__PURE__ */ jsxs("div", {
        className: "mb-8 flex gap-3 border-b border-[var(--caca-border)]",
        children: [/* @__PURE__ */ jsx("button", {
          onClick: () => setActiveTab("events"),
          className: `px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === "events" ? "border-[var(--caca-accent)] text-[var(--caca-accent)]" : "border-transparent text-[var(--caca-ink-soft)] hover:text-[var(--caca-ink)]"}`,
          children: "Create Events"
        }), /* @__PURE__ */ jsx("button", {
          onClick: () => setActiveTab("boards"),
          className: `px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === "boards" ? "border-[var(--caca-accent)] text-[var(--caca-accent)]" : "border-transparent text-[var(--caca-ink-soft)] hover:text-[var(--caca-ink)]"}`,
          children: "Manage Boards & Scores"
        })]
      }), activeTab === "events" && /* @__PURE__ */ jsxs("div", {
        className: "grid gap-8 md:grid-cols-2",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "font-display text-2xl text-[var(--caca-ink)] mb-4",
            children: "Create New Event"
          }), /* @__PURE__ */ jsxs("form", {
            onSubmit: handleCreateEvent,
            className: "space-y-4",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                className: "block text-sm font-semibold mb-2",
                children: "Event Name *"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                value: eventName,
                onChange: (e) => setEventName(e.target.value),
                required: true,
                className: "w-full px-4 py-2 border rounded-lg",
                style: {
                  borderColor: "var(--caca-border)"
                },
                placeholder: "e.g., Spring Championship 2026"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                className: "block text-sm font-semibold mb-2",
                children: "Event Date *"
              }), /* @__PURE__ */ jsx("input", {
                type: "date",
                value: eventDate,
                onChange: (e) => setEventDate(e.target.value),
                required: true,
                className: "w-full px-4 py-2 border rounded-lg",
                style: {
                  borderColor: "var(--caca-border)"
                }
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                className: "block text-sm font-semibold mb-2",
                children: "Format"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                value: eventFormat,
                onChange: (e) => setEventFormat(e.target.value),
                className: "w-full px-4 py-2 border rounded-lg",
                style: {
                  borderColor: "var(--caca-border)"
                },
                placeholder: "e.g., Singles + Doubles"
              })]
            }), /* @__PURE__ */ jsx("button", {
              type: "submit",
              disabled: createEventLoading,
              className: "w-full py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50",
              style: {
                backgroundColor: "var(--caca-accent)"
              },
              children: createEventLoading ? "Creating..." : "Create Event"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface)] p-6",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "font-display text-xl text-[var(--caca-ink)] mb-4",
            children: "Existing Events"
          }), /* @__PURE__ */ jsx("div", {
            className: "space-y-2 max-h-96 overflow-y-auto",
            children: events.length > 0 ? events.map((event) => /* @__PURE__ */ jsxs("div", {
              className: "p-3 rounded-lg border",
              style: {
                borderColor: "var(--caca-border)",
                backgroundColor: "var(--caca-surface-strong)"
              },
              children: [/* @__PURE__ */ jsx("p", {
                className: "font-semibold text-sm",
                children: event.name
              }), /* @__PURE__ */ jsxs("p", {
                className: "text-xs text-[var(--caca-ink-soft)]",
                children: [event.date, " • ", event.format]
              })]
            }, event.id)) : /* @__PURE__ */ jsx("p", {
              className: "text-[var(--caca-ink-soft)]",
              children: "No events created yet"
            })
          })]
        })]
      }), activeTab === "boards" && /* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("div", {
          className: "mb-8 grid gap-8 md:grid-cols-2",
          children: /* @__PURE__ */ jsxs("div", {
            className: "rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "font-display text-2xl text-[var(--caca-ink)] mb-4",
              children: "Generate Tournament Bracket"
            }), events.length > 0 ? /* @__PURE__ */ jsxs("div", {
              className: "space-y-4",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-sm font-semibold mb-2",
                  children: "Select Event *"
                }), /* @__PURE__ */ jsx("select", {
                  value: selectedEventId,
                  onChange: (e) => setSelectedEventId(e.target.value),
                  className: "w-full px-4 py-2 border rounded-lg mb-4",
                  style: {
                    borderColor: "var(--caca-border)"
                  },
                  children: events.map((event) => /* @__PURE__ */ jsx("option", {
                    value: event.id,
                    children: event.name
                  }, event.id))
                })]
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-[var(--caca-ink-soft)]",
                children: "Automatically generates a double-elimination bracket for all registered players in the event. Winners brackets and loser brackets will be created."
              }), /* @__PURE__ */ jsx("button", {
                onClick: handleGenerateBracket,
                disabled: generateBracketLoading || !selectedEventId,
                className: "w-full py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50",
                style: {
                  backgroundColor: "var(--caca-wood)"
                },
                children: generateBracketLoading ? "Generating..." : "Generate Bracket"
              })]
            }) : /* @__PURE__ */ jsx("p", {
              className: "text-[var(--caca-ink-soft)]",
              children: "Create an event first"
            })]
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "grid gap-8 md:grid-cols-2",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "font-display text-2xl text-[var(--caca-ink)] mb-4",
              children: "Create Board Manually"
            }), events.length > 0 ? /* @__PURE__ */ jsxs("form", {
              onSubmit: handleCreateBoard,
              className: "space-y-4",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-sm font-semibold mb-2",
                  children: "Select Event *"
                }), /* @__PURE__ */ jsx("select", {
                  value: selectedEventId,
                  onChange: (e) => setSelectedEventId(e.target.value),
                  className: "w-full px-4 py-2 border rounded-lg",
                  style: {
                    borderColor: "var(--caca-border)"
                  },
                  children: events.map((event) => /* @__PURE__ */ jsx("option", {
                    value: event.id,
                    children: event.name
                  }, event.id))
                })]
              }), /* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-sm font-semibold mb-2",
                  children: "Board Name *"
                }), /* @__PURE__ */ jsx("input", {
                  type: "text",
                  value: boardName,
                  onChange: (e) => setBoardName(e.target.value),
                  required: true,
                  className: "w-full px-4 py-2 border rounded-lg",
                  style: {
                    borderColor: "var(--caca-border)"
                  },
                  placeholder: "e.g., Board 1"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-sm font-semibold mb-2",
                  children: "Player 1 Name *"
                }), /* @__PURE__ */ jsx("input", {
                  type: "text",
                  value: player1Name,
                  onChange: (e) => setPlayer1Name(e.target.value),
                  required: true,
                  className: "w-full px-4 py-2 border rounded-lg",
                  style: {
                    borderColor: "var(--caca-border)"
                  },
                  placeholder: "Player name"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-sm font-semibold mb-2",
                  children: "Player 2 Name *"
                }), /* @__PURE__ */ jsx("input", {
                  type: "text",
                  value: player2Name,
                  onChange: (e) => setPlayer2Name(e.target.value),
                  required: true,
                  className: "w-full px-4 py-2 border rounded-lg",
                  style: {
                    borderColor: "var(--caca-border)"
                  },
                  placeholder: "Player name"
                })]
              }), /* @__PURE__ */ jsx("button", {
                type: "submit",
                disabled: createBoardLoading,
                className: "w-full py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50",
                style: {
                  backgroundColor: "var(--caca-accent)"
                },
                children: createBoardLoading ? "Creating..." : "Create Board"
              })]
            }) : /* @__PURE__ */ jsx("p", {
              className: "text-[var(--caca-ink-soft)]",
              children: "Create an event first"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "rounded-lg border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-6",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "font-display text-2xl text-[var(--caca-ink)] mb-4",
              children: "Update Scores"
            }), boards.length > 0 ? /* @__PURE__ */ jsxs("form", {
              onSubmit: handleUpdateScore,
              className: "space-y-4",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("label", {
                  className: "block text-sm font-semibold mb-2",
                  children: "Select Board *"
                }), /* @__PURE__ */ jsxs("select", {
                  value: selectedBoardId,
                  onChange: (e) => setSelectedBoardId(e.target.value),
                  className: "w-full px-4 py-2 border rounded-lg",
                  style: {
                    borderColor: "var(--caca-border)"
                  },
                  children: [/* @__PURE__ */ jsx("option", {
                    value: "",
                    children: "Choose a board..."
                  }), boards.map((board) => /* @__PURE__ */ jsxs("option", {
                    value: board.id,
                    children: [board.name, ": ", board.player1?.name || "P1", " vs", " ", board.player2?.name || "P2", " (", board.status, ")"]
                  }, board.id))]
                })]
              }), selectedBoardId && /* @__PURE__ */ jsxs(Fragment, {
                children: [/* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("label", {
                    className: "block text-sm font-semibold mb-2",
                    children: "Player 1 Score *"
                  }), /* @__PURE__ */ jsx("input", {
                    type: "number",
                    value: player1Score,
                    onChange: (e) => setPlayer1Score(e.target.value),
                    required: true,
                    min: "0",
                    className: "w-full px-4 py-2 border rounded-lg",
                    style: {
                      borderColor: "var(--caca-border)"
                    }
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("label", {
                    className: "block text-sm font-semibold mb-2",
                    children: "Player 2 Score *"
                  }), /* @__PURE__ */ jsx("input", {
                    type: "number",
                    value: player2Score,
                    onChange: (e) => setPlayer2Score(e.target.value),
                    required: true,
                    min: "0",
                    className: "w-full px-4 py-2 border rounded-lg",
                    style: {
                      borderColor: "var(--caca-border)"
                    }
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "grid grid-cols-2 gap-2",
                  children: [/* @__PURE__ */ jsx("button", {
                    type: "submit",
                    disabled: updateScoreLoading,
                    className: "py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50",
                    style: {
                      backgroundColor: "var(--caca-accent)"
                    },
                    children: updateScoreLoading ? "Updating..." : "Update Score"
                  }), /* @__PURE__ */ jsx("button", {
                    type: "button",
                    onClick: () => handleCompleteBoard(selectedBoardId),
                    className: "py-2 px-4 rounded-lg font-semibold text-white transition-all hover:opacity-90",
                    style: {
                      backgroundColor: "var(--caca-ink-soft)"
                    },
                    children: "Mark as Complete"
                  })]
                })]
              })]
            }) : /* @__PURE__ */ jsx("p", {
              className: "text-[var(--caca-ink-soft)]",
              children: "Create a board first or select an event with boards"
            })]
          })]
        })]
      })]
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: admin,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
function meta({}) {
  return [{
    title: "CACA | Capital Area Carrom Association"
  }, {
    name: "description",
    content: "Official homepage of Capital Area Carrom Association with tournaments, rankings, and live scoreboard access."
  }];
}
const galleryTiles = ["Final Board Moments", "Junior Coaching Camp", "Doubles Medal Ceremony", "Association Volunteers", "Regional League Night", "Practice Session Highlights"];
const home = UNSAFE_withComponentProps(function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastTournaments, setPastTournaments] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [rankingsLoading, setRankingsLoading] = useState(true);
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
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = allEvents.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= today;
        });
        const past = allEvents.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate < today;
        });
        upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
  const handleLogout = async () => {
    try {
      await logOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return /* @__PURE__ */ jsxs("main", {
    className: "caca-page",
    children: [/* @__PURE__ */ jsx("div", {
      className: "sticky-header-wrapper",
      children: /* @__PURE__ */ jsxs("header", {
        className: "sticky-header mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface)] px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6",
        children: [/* @__PURE__ */ jsxs(Link, {
          to: "/",
          className: "hover:opacity-80 transition-opacity",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-xs uppercase tracking-[0.28em] text-[var(--caca-ink-soft)]",
            children: "Capital Area Carrom Association"
          }), /* @__PURE__ */ jsx("p", {
            className: "font-display text-2xl leading-none text-[var(--caca-ink)]",
            children: "CACA"
          })]
        }), /* @__PURE__ */ jsxs("nav", {
          "aria-label": "Primary actions",
          className: "flex flex-wrap gap-2",
          children: [user ? /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsxs("span", {
              className: "flex items-center px-3 py-2 text-sm text-[var(--caca-ink-soft)]",
              children: ["Welcome, ", user.displayName || user.email]
            }), isAdmin && /* @__PURE__ */ jsx(Link, {
              className: "caca-btn caca-btn-secondary",
              to: "/admin",
              children: "Admin Panel"
            }), /* @__PURE__ */ jsx("button", {
              onClick: handleLogout,
              className: "caca-btn caca-btn-muted",
              children: "Logout"
            })]
          }) : /* @__PURE__ */ jsxs(Fragment, {
            children: [/* @__PURE__ */ jsx(Link, {
              className: "caca-btn caca-btn-muted",
              to: "/login",
              children: "Log in"
            }), /* @__PURE__ */ jsx(Link, {
              className: "caca-btn caca-btn-muted",
              to: "/login",
              children: "Sign up"
            })]
          }), /* @__PURE__ */ jsx(Link, {
            className: "caca-btn caca-btn-secondary",
            to: "/register-event",
            children: "Register Event"
          }), /* @__PURE__ */ jsx(Link, {
            className: "caca-btn caca-btn-primary",
            to: "/scoreboard",
            children: "View Live Scoreboard"
          })]
        })]
      })
    }), /* @__PURE__ */ jsx("section", {
      className: "hero-shell",
      id: "top",
      children: /* @__PURE__ */ jsx("div", {
        className: "mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8",
        children: /* @__PURE__ */ jsxs("div", {
          className: "fade-up max-w-3xl",
          children: [/* @__PURE__ */ jsx("p", {
            className: "mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--caca-accent)]",
            children: "Official Home"
          }), /* @__PURE__ */ jsx("h1", {
            className: "font-display text-6xl leading-none text-[var(--caca-ink)] sm:text-7xl md:text-8xl",
            children: "CACA"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 text-lg font-semibold text-[var(--caca-ink-soft)] sm:text-xl",
            children: "Capital Area Carrom Association"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-5 max-w-2xl text-base leading-relaxed text-[var(--caca-ink-soft)] sm:text-lg",
            children: "Advancing disciplined, competitive, and community-driven carrom across the capital region through structured tournaments, player development, and transparent rankings."
          }), /* @__PURE__ */ jsxs("div", {
            className: "mt-8 flex flex-wrap gap-3",
            children: [/* @__PURE__ */ jsx(Link, {
              className: "caca-btn caca-btn-primary",
              to: "/scoreboard",
              children: "Open Scoreboard"
            }), /* @__PURE__ */ jsx(Link, {
              className: "caca-btn caca-btn-secondary",
              to: "/register-event",
              children: "Register Event"
            }), /* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-muted",
              href: "#contact",
              children: "Contact CACA"
            })]
          })]
        })
      })
    }), /* @__PURE__ */ jsx("section", {
      className: "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16",
      id: "about",
      children: /* @__PURE__ */ jsxs("article", {
        className: "section-surface fade-up grid gap-8 p-6 md:grid-cols-[1.35fr_1fr] md:p-8",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "section-kicker",
            children: "About The Association"
          }), /* @__PURE__ */ jsx("h2", {
            className: "section-title",
            children: "A formal platform for competitive carrom"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-4 text-[var(--caca-ink-soft)]",
            children: "Capital Area Carrom Association (CACA) organizes sanctioned tournaments, supports player development pathways, and promotes fair play standards across clubs and independent athletes."
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-4 text-[var(--caca-ink-soft)]",
            children: "The association maintains structured fixtures, transparent standings, and a member-first ecosystem that encourages both elite performance and grassroots participation."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-5",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "text-sm font-semibold uppercase tracking-[0.2em] text-[var(--caca-ink-soft)]",
            children: "Association Focus"
          }), /* @__PURE__ */ jsxs("ul", {
            className: "mt-4 space-y-3 text-sm text-[var(--caca-ink-soft)] sm:text-base",
            children: [/* @__PURE__ */ jsx("li", {
              children: "Sanctioned tournaments and league standards"
            }), /* @__PURE__ */ jsx("li", {
              children: "Junior and open division development programs"
            }), /* @__PURE__ */ jsx("li", {
              children: "Transparent ranking methodology and player records"
            }), /* @__PURE__ */ jsx("li", {
              children: "City-wide community participation initiatives"
            })]
          })]
        })]
      })
    }), /* @__PURE__ */ jsxs("section", {
      className: "mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8 lg:pb-12",
      id: "upcoming-events",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-5 flex items-end justify-between gap-3",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "section-kicker",
            children: "Upcoming Tournaments"
          }), /* @__PURE__ */ jsx("h2", {
            className: "section-title",
            children: "Register for the next events"
          })]
        }), /* @__PURE__ */ jsx(Link, {
          className: "caca-btn caca-btn-secondary",
          to: "/register-event",
          children: "Register"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "grid gap-4 md:grid-cols-3",
        children: upcomingEvents.map((event, index) => /* @__PURE__ */ jsxs("article", {
          className: "section-surface fade-up p-5",
          style: {
            animationDelay: `${index * 80}ms`
          },
          children: [/* @__PURE__ */ jsx("h3", {
            className: "text-xl font-semibold text-[var(--caca-ink)]",
            children: event.name || event.title || "Untitled Event"
          }), /* @__PURE__ */ jsxs("p", {
            className: "mt-3 text-sm text-[var(--caca-ink-soft)]",
            children: ["Date: ", event.date]
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-sm text-[var(--caca-ink-soft)]",
            children: ["Format: ", event.format]
          })]
        }, event.id || event.name || event.title || index))
      })]
    }), /* @__PURE__ */ jsxs("section", {
      className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-5",
        children: [/* @__PURE__ */ jsx("p", {
          className: "section-kicker",
          children: "Past Tournaments"
        }), /* @__PURE__ */ jsx("h2", {
          className: "section-title",
          children: "Past events list"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "section-surface p-4 sm:p-5",
        children: pastTournaments.length === 0 ? /* @__PURE__ */ jsx("p", {
          className: "text-sm text-[var(--caca-ink-soft)]",
          children: "No past events available yet."
        }) : /* @__PURE__ */ jsx("ul", {
          className: "space-y-3",
          children: pastTournaments.map((event, index) => /* @__PURE__ */ jsxs("li", {
            className: "rounded-xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] px-4 py-3",
            children: [/* @__PURE__ */ jsx("p", {
              className: "font-semibold text-[var(--caca-ink)]",
              children: event.name || event.title || "Untitled Event"
            }), /* @__PURE__ */ jsxs("p", {
              className: "mt-1 text-sm text-[var(--caca-ink-soft)]",
              children: ["Date: ", event.date || "TBD"]
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-sm text-[var(--caca-ink-soft)]",
              children: ["Format: ", event.format || "TBD"]
            })]
          }, event.id || event.name || event.title || `${event.date}-${index}`))
        })
      })]
    }), /* @__PURE__ */ jsxs("section", {
      className: "mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12",
      children: [/* @__PURE__ */ jsxs("article", {
        className: "section-surface fade-up p-6",
        id: "live-scoreboard",
        children: [/* @__PURE__ */ jsx("p", {
          className: "section-kicker",
          children: "Live Scoreboard Preview"
        }), /* @__PURE__ */ jsx("h2", {
          className: "section-title",
          children: "Match table snapshot"
        }), /* @__PURE__ */ jsxs("div", {
          className: "mt-5 rounded-xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-4",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm text-[var(--caca-ink-soft)] italic",
            children: "Live match data populates here during active tournaments."
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-3 text-sm text-[var(--caca-ink-soft)]",
            children: "View the full scoreboard to see all ongoing and completed matches."
          })]
        }), /* @__PURE__ */ jsx("a", {
          className: "caca-btn caca-btn-primary mt-6",
          href: "/scoreboard",
          title: "View live scoreboard",
          children: "Open Full Scoreboard"
        })]
      }), /* @__PURE__ */ jsxs("article", {
        className: "section-surface fade-up p-6",
        children: [/* @__PURE__ */ jsx("p", {
          className: "section-kicker",
          children: "Rankings"
        }), /* @__PURE__ */ jsx("h2", {
          className: "section-title",
          children: "Top players leaderboard"
        }), /* @__PURE__ */ jsx("ol", {
          className: "mt-5 space-y-3",
          children: rankings.map((player) => /* @__PURE__ */ jsxs("li", {
            className: "flex items-center justify-between rounded-xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] px-4 py-3",
            children: [/* @__PURE__ */ jsxs("p", {
              className: "font-medium text-[var(--caca-ink)]",
              children: ["#", player.rank, " ", player.displayName || player.email]
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-sm text-[var(--caca-ink-soft)]",
              children: [player.points, " pts"]
            })]
          }, player.uid))
        })]
      })]
    }), /* @__PURE__ */ jsxs("section", {
      className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-5",
        children: [/* @__PURE__ */ jsx("p", {
          className: "section-kicker",
          children: "Photo Gallery"
        }), /* @__PURE__ */ jsx("h2", {
          className: "section-title",
          children: "Association highlights"
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        children: galleryTiles.map((tile) => /* @__PURE__ */ jsxs("article", {
          className: "gallery-tile",
          children: [/* @__PURE__ */ jsx("div", {
            className: "gallery-tile-art",
            "aria-hidden": "true"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--caca-ink-soft)]",
            children: tile
          })]
        }, tile))
      })]
    }), /* @__PURE__ */ jsx("section", {
      className: "mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-16",
      id: "contact",
      children: /* @__PURE__ */ jsxs("div", {
        className: "section-surface grid gap-6 p-6 md:grid-cols-2 md:p-8",
        children: [/* @__PURE__ */ jsxs("article", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "section-kicker",
            children: "Contact + Location"
          }), /* @__PURE__ */ jsx("h2", {
            className: "section-title",
            children: "Reach Capital Area Carrom Association"
          }), /* @__PURE__ */ jsxs("p", {
            className: "mt-4 text-[var(--caca-ink-soft)]",
            children: ["Email: office@caca.org (placeholder)", /* @__PURE__ */ jsx("br", {}), "Phone: +1 (000) 555-0144 (placeholder)"]
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-4 text-[var(--caca-ink-soft)]",
            children: "Address: 101 Carrom Square, Capital District, CA 00000 (placeholder)"
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-6 flex flex-wrap gap-3",
            id: "auth",
            children: /* @__PURE__ */ jsx("a", {
              className: "caca-btn caca-btn-secondary",
              href: "mailto:office@caca.org",
              children: "Contact Us"
            })
          })]
        }), /* @__PURE__ */ jsxs("article", {
          className: "rounded-2xl border border-[var(--caca-border)] bg-[var(--caca-surface-strong)] p-4",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-sm font-semibold uppercase tracking-[0.18em] text-[var(--caca-ink-soft)]",
            children: "Location Map"
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-3 grid min-h-56 place-items-center rounded-xl border border-dashed border-[var(--caca-border)] bg-[var(--caca-surface)] p-4 text-center text-sm text-[var(--caca-ink-soft)]",
            children: "Map placeholder for association venue and tournament hall."
          })]
        })]
      })
    }), /* @__PURE__ */ jsx("footer", {
      className: "border-t border-[var(--caca-border)] bg-[var(--caca-surface)]/80 py-6",
      children: /* @__PURE__ */ jsxs("div", {
        className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-[var(--caca-ink-soft)] sm:px-6 lg:px-8",
        children: [/* @__PURE__ */ jsx("p", {
          children: "© 2026 CACA. All rights reserved."
        }), /* @__PURE__ */ jsx("a", {
          className: "font-medium text-[var(--caca-ink)] hover:text-[var(--caca-accent)]",
          href: "#top",
          children: "Back to top"
        })]
      })
    })]
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BbYKsvpg.js", "imports": ["/assets/chunk-UVKPFVEO-CfC16BP_.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-DAM48Fom.js", "imports": ["/assets/chunk-UVKPFVEO-CfC16BP_.js"], "css": ["/assets/root-DmPc4NGP.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/login-BuEoQAPF.js", "imports": ["/assets/chunk-UVKPFVEO-CfC16BP_.js", "/assets/firebase-bMAOWYEq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/register-event": { "id": "routes/register-event", "parentId": "root", "path": "register-event", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/register-event-DE7YmYzS.js", "imports": ["/assets/chunk-UVKPFVEO-CfC16BP_.js", "/assets/firebase-bMAOWYEq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/scoreboard": { "id": "routes/scoreboard", "parentId": "root", "path": "scoreboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/scoreboard-CmKQPWs2.js", "imports": ["/assets/chunk-UVKPFVEO-CfC16BP_.js", "/assets/firebase-bMAOWYEq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin": { "id": "routes/admin", "parentId": "root", "path": "admin", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/admin-CBYzrYBN.js", "imports": ["/assets/chunk-UVKPFVEO-CfC16BP_.js", "/assets/firebase-bMAOWYEq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/home-BIo-BH0D.js", "imports": ["/assets/chunk-UVKPFVEO-CfC16BP_.js", "/assets/firebase-bMAOWYEq.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-01b539a5.js", "version": "01b539a5", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_passThroughRequests": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/register-event": {
    id: "routes/register-event",
    parentId: "root",
    path: "register-event",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/scoreboard": {
    id: "routes/scoreboard",
    parentId: "root",
    path: "scoreboard",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/admin": {
    id: "routes/admin",
    parentId: "root",
    path: "admin",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route5
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
