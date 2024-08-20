import React, { useState, useEffect } from 'react';

function Leaderboard({ user }) {
    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        // Fetch leaderboard data here
        fetchLeaderboardData();
    }, []);

    const fetchLeaderboardData = async () => {
        // TODO: Implement fetching leaderboard data from your database
        // For now, we'll use mock data
        const mockData = [
            { username: 'User1', perfectStreaks: 5, bestTime: 115 },
            { username: 'User2', perfectStreaks: 3, bestTime: 118 },
            // ... more mock data
        ];
        setLeaderboardData(mockData);
    };

    return (
        <div className="leaderboard-container">
            <h2>Leaderboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Perfect Streaks</th>
                        <th>Best Time (seconds)</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboardData.map((entry, index) => (
                        <tr key={index} className={user && entry.username === user.displayName ? 'current-user' : ''}>
                            <td>{index + 1}</td>
                            <td>{entry.username}</td>
                            <td>{entry.perfectStreaks}</td>
                            <td>{entry.bestTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Leaderboard;