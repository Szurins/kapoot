import React from "react";

const Scoreboard = ({ results = {} }) => {
    // Convert results object into an array and sort descending by points
    const sortedResults = Object.entries(results)
        .map(([player, data]) => ({ name: player, points: data.points || 0 }))
        .sort((a, b) => b.points - a.points);

    return (
        <div className="flex flex-col items-center p-6 text-white">
            <h1 className="text-4xl font-bold mb-6 text-yellow-400">🏆 Final Scoreboard</h1>

            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {sortedResults.length === 0 ? (
                    <p className="text-center p-4 text-gray-400">No results yet</p>
                ) : (
                    <ul>
                        {sortedResults.map((player, index) => (
                            <li
                                key={player.name}
                                className={`flex justify-between items-center p-3 border-b border-gray-700 ${index === 0 ? "bg-yellow-500 text-black font-bold text-lg" : ""
                                    }`}
                            >
                                <span>
                                    {index + 1}. {player.name}
                                </span>
                                <span>{player.points} pts</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Scoreboard;
