import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/login";
import { signUp, signIn } from "../src/firebase";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Login | CACA Scoreboard" },
        {
            name: "description",
            content: "Log in or create an account for the Capital Area Carrom Association scoreboard.",
        },
    ];
}

export default function LoginPage() {
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

    const handleSignUp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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
            // Redirect to home after successful sign up
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (err: any) {
            setError(err.message || "Failed to sign up. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signIn(email, password);
            // Redirect to home after successful log in
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (err: any) {
            setError(err.message || "Failed to log in. Please check your email and password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="caca-page min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
                        <h1
                            className="text-5xl font-bold mb-2"
                            style={{ fontFamily: "var(--caca-font-display)" }}
                        >
                            CACA
                        </h1>
                    </Link>
                    <p className="text-lg" style={{ color: "var(--caca-accent)" }}>
                        Capital Area Carrom Association
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
                    {/* Tab Toggle */}
                    <div className="flex gap-2 mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(false);
                                setError("");
                                setDisplayName("");
                                setEmail("");
                                setPassword("");
                                setConfirmPassword("");
                                setShowPassword(false);
                                setShowConfirmPassword(false);
                            }}
                            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                                !isSignUp
                                    ? "text-white"
                                    : "text-gray-600 bg-gray-100"
                            }`}
                            style={{
                                backgroundColor: !isSignUp
                                    ? "var(--caca-accent)"
                                    : undefined,
                            }}
                        >
                            Log In
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(true);
                                setError("");
                                setDisplayName("");
                                setEmail("");
                                setPassword("");
                                setConfirmPassword("");
                                setShowPassword(false);
                                setShowConfirmPassword(false);
                            }}
                            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                                isSignUp
                                    ? "text-white"
                                    : "text-gray-600 bg-gray-100"
                            }`}
                            style={{
                                backgroundColor: isSignUp
                                    ? "var(--caca-accent)"
                                    : undefined,
                            }}
                        >
                            Sign Up
                        </button>
                    </div>

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
                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                        {/* Display Name (Sign Up Only) */}
                        {isSignUp && (
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Display Name *
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{
                                        borderColor: "var(--caca-border)",
                                    }}
                                    placeholder="Your full name"
                                />
                                <p className="text-xs mt-1" style={{ color: "var(--caca-ink-soft)" }}>
                                    This will be shown in rankings and matches
                                </p>
                            </div>
                        )}

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                style={{
                                    borderColor: "var(--caca-border)",
                                }}
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-4 pr-20 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{
                                        borderColor: "var(--caca-border)",
                                    }}
                                    placeholder={showPassword ? "Password" : "••••••••"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-2 my-1 px-3 rounded text-xs font-semibold"
                                    style={{
                                        color: "var(--caca-accent)",
                                        backgroundColor: "rgba(179, 58, 47, 0.08)",
                                    }}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {isSignUp && (
                                <p className="text-xs mt-1" style={{ color: "var(--caca-ink-soft)" }}>
                                    Must be at least 6 characters
                                </p>
                            )}
                        </div>

                        {/* Confirm Password (Sign Up Only) */}
                        {isSignUp && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full pl-4 pr-20 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                        style={{
                                            borderColor: "var(--caca-border)",
                                        }}
                                        placeholder={showConfirmPassword ? "Confirm Password" : "••••••••"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-2 my-1 px-3 rounded text-xs font-semibold"
                                        style={{
                                            color: "var(--caca-accent)",
                                            backgroundColor: "rgba(179, 58, 47, 0.08)",
                                        }}
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 rounded-md font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{
                                backgroundColor: "var(--caca-accent)",
                            }}
                        >
                            {loading
                                ? "Loading..."
                                : isSignUp
                                ? "Create Account"
                                : "Log In"}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-sm" style={{ color: "var(--caca-ink-soft)" }}>
                    {isSignUp
                        ? "Already have an account? Click Log In above."
                        : "Don't have an account? Click Sign Up above."}
                </p>
            </div>
        </div>
    );
}
