import React from "react";

interface Player {
    uid?: string;
    name: string;
    score: number;
}

interface Board {
    id?: string;
    name: string;
    player1: Player;
    player2: Player;
    status: "live" | "completed";
    round?: number;
    bracket?: "winners" | "losers";
    matchType?: string;
}

interface BracketProps {
    boards: Board[];
}

// Organize boards into tournament rounds with proper bracket structure
const organizeBracket = (boards: Board[]): {
    winners: Board[][];
    losers: Board[][];
    hasMetadata: boolean;
} => {
    const winnersRounds: { [key: number]: Board[] } = {};
    const losersRounds: { [key: number]: Board[] } = {};

    // Check if any boards have bracket metadata
    const hasMetadata = boards.some((b) => b.bracket || b.round);

    if (!hasMetadata) {
        // Fallback for boards without metadata: group by score progression
        const allBoards = [...boards].sort((a, b) => {
            // Completed boards first, then live, then by player count
            if (a.status !== b.status)
                return a.status === "completed" ? -1 : 1;
            return 0;
        });

        // Split into reasonable chunks for display
        const roundSize = Math.max(1, Math.ceil(allBoards.length / 4));
        const rounds: Board[][] = [];
        for (let i = 0; i < allBoards.length; i += roundSize) {
            rounds.push(allBoards.slice(i, i + roundSize));
        }

        return {
            winners: rounds.length > 0 ? rounds : [[]],
            losers: [[]],
            hasMetadata: false,
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

    // Convert to array format, sorted by round
    const winnerRoundNums = Object.keys(winnersRounds)
        .map(Number)
        .sort((a, b) => a - b);
    const loserRoundNums = Object.keys(losersRounds)
        .map(Number)
        .sort((a, b) => a - b);

    const winnerRounds: Board[][] = [];
    const loserRounds: Board[][] = [];

    winnerRoundNums.forEach((round) => {
        winnerRounds.push(winnersRounds[round]);
    });
    loserRoundNums.forEach((round) => {
        loserRounds.push(losersRounds[round]);
    });

    return {
        winners: winnerRounds,
        losers: loserRounds,
        hasMetadata: true,
    };
};

const getRoundName = (roundIndex: number, totalRounds: number): string => {
    if (totalRounds === 1) return "Final";
    if (roundIndex === totalRounds - 1) return "Final";
    if (roundIndex === totalRounds - 2) return "Semi-Final";
    return `Round ${roundIndex + 1}`;
};

const BracketMatch = ({ board }: { board: Board }) => {
    const winner = board.player1.score > board.player2.score ? 1 : 2;
    const loser = winner === 1 ? 2 : 1;

    return (
        <div className="mb-4 rounded-lg border border-[var(--caca-border)] bg-white shadow-sm overflow-hidden">
            {/* Match Header */}
            <div className="bg-gradient-to-r from-[var(--caca-wood)]/10 to-transparent px-4 py-2 border-b border-[var(--caca-border)]">
                <p className="text-xs font-semibold text-[var(--caca-ink-soft)] uppercase tracking-wide">
                    {board.name}
                </p>
            </div>

            {/* Match Content */}
            <div className="p-4">
                {/* Player 1 */}
                <div
                    className={`flex items-center justify-between py-2 px-3 rounded transition-colors ${
                        winner === 1
                            ? "bg-green-50 border border-green-200"
                            : "bg-gray-50 border border-gray-200"
                    }`}
                >
                    <span
                        className={`text-sm font-medium ${
                            winner === 1
                                ? "text-[var(--caca-accent)] font-bold"
                                : "text-[var(--caca-ink)]"
                        }`}
                    >
                        {board.player1.name}
                    </span>
                    <span
                        className={`font-display text-lg ${
                            winner === 1
                                ? "text-green-600 font-bold"
                                : "text-[var(--caca-ink)]"
                        }`}
                    >
                        {board.player1.score}
                    </span>
                </div>

                {/* VS Divider */}
                <div className="my-1 text-center text-xs text-[var(--caca-ink-soft)] font-semibold">
                    vs
                </div>

                {/* Player 2 */}
                <div
                    className={`flex items-center justify-between py-2 px-3 rounded transition-colors ${
                        winner === 2
                            ? "bg-green-50 border border-green-200"
                            : "bg-gray-50 border border-gray-200"
                    }`}
                >
                    <span
                        className={`text-sm font-medium ${
                            winner === 2
                                ? "text-[var(--caca-accent)] font-bold"
                                : "text-[var(--caca-ink)]"
                        }`}
                    >
                        {board.player2.name}
                    </span>
                    <span
                        className={`font-display text-lg ${
                            winner === 2
                                ? "text-green-600 font-bold"
                                : "text-[var(--caca-ink)]"
                        }`}
                    >
                        {board.player2.score}
                    </span>
                </div>

                {/* Status Badge */}
                {board.status === "live" && (
                    <div className="mt-3 flex items-center justify-center gap-1 py-1 px-2 bg-green-100 rounded text-xs font-semibold text-green-700">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                )}
                {board.status === "completed" && (
                    <div className="mt-3 text-center py-1 px-2 bg-blue-100 rounded text-xs font-semibold text-blue-700">
                        COMPLETED
                    </div>
                )}
            </div>
        </div>
    );
};

const Bracket: React.FC<BracketProps> = ({ boards }) => {
    const bracketData = organizeBracket(boards);

    if (boards.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--caca-ink-soft)] mb-2">
                    No tournament data available yet
                </p>
                <p className="text-xs text-[var(--caca-ink-soft)]">
                    Boards will appear here as matches are created
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="mb-6">
                <h2 className="font-display text-2xl text-[var(--caca-ink)] mb-2">
                    Tournament Bracket
                </h2>
                <p className="text-sm text-[var(--caca-ink-soft)]">
                    {boards.length} total match{boards.length !== 1 ? "es" : ""} •{" "}
                    {boards.filter((b) => b.status === "completed").length} completed
                </p>
                {!bracketData.hasMetadata && (
                    <p className="text-xs text-[var(--caca-accent)] mt-2">
                        💡 Tip: Use "Generate Tournament Bracket" in the admin panel for an automatic double-elimination bracket
                    </p>
                )}
            </div>

            {/* Winners Bracket */}
            {bracketData.winners.length > 0 && (
                <div>
                    <h3 className="font-display text-xl text-[var(--caca-ink)] mb-6 flex items-center gap-2">
                        <span className="text-[var(--caca-wood)]">👑</span>
                        {bracketData.hasMetadata ? "Winners Bracket" : "All Matches"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {bracketData.winners.map((round, roundIndex) => (
                            <div key={`w-${roundIndex}`} className="space-y-4">
                                {/* Round Label */}
                                <div className="mb-4 pb-2 border-b border-[var(--caca-border)]">
                                    <h4 className="font-semibold text-[var(--caca-ink)] text-sm uppercase tracking-wide">
                                        {bracketData.hasMetadata
                                            ? getRoundName(
                                                  roundIndex,
                                                  bracketData.winners.length
                                              )
                                            : `Group ${roundIndex + 1}`}
                                    </h4>
                                    <p className="text-xs text-[var(--caca-ink-soft)] mt-1">
                                        {round.length} match{round.length !== 1 ? "es" : ""}
                                    </p>
                                </div>

                                {/* Matches in Round */}
                                <div className="space-y-4">
                                    {round.map((board) => (
                                        <BracketMatch
                                            key={board.id}
                                            board={board}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Losers Bracket */}
            {bracketData.hasMetadata && bracketData.losers.length > 0 && (
                <div className="mt-12 pt-12 border-t border-[var(--caca-border)]">
                    <h3 className="font-display text-xl text-[var(--caca-ink)] mb-6 flex items-center gap-2">
                        <span>🏆</span>
                        Losers Bracket
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {bracketData.losers.map((round, roundIndex) => (
                            <div key={`l-${roundIndex}`} className="space-y-4">
                                {/* Round Label */}
                                <div className="mb-4 pb-2 border-b border-[var(--caca-border)]">
                                    <h4 className="font-semibold text-[var(--caca-ink)] text-sm uppercase tracking-wide">
                                        {getRoundName(
                                            roundIndex,
                                            bracketData.losers.length
                                        )}
                                    </h4>
                                    <p className="text-xs text-[var(--caca-ink-soft)] mt-1">
                                        {round.length} match{round.length !== 1 ? "es" : ""}
                                    </p>
                                </div>

                                {/* Matches in Round */}
                                <div className="space-y-4">
                                    {round.map((board) => (
                                        <BracketMatch
                                            key={board.id}
                                            board={board}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-12 pt-8 border-t border-[var(--caca-border)]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                        <span className="text-[var(--caca-ink-soft)]">Winner</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[var(--caca-ink-soft)]">Live Match</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bracket;
