import React, { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, query, orderByChild, limitToLast } from "firebase/database";

function Leaderboard({ user }) {
    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        const leaderboardRef = query(ref(rtdb, 'users'), orderByChild('perfectStreaks'), limitToLast(10));
        const unsubscribe = onValue(leaderboardRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sortedData = Object.entries(data)
                    .map(([uid, userData]) => ({
                        uid,
                        ...userData
                    }))
                    .sort((a, b) => b.perfectStreaks - a.perfectStreaks);
                setLeaderboardData(sortedData);
            }
        });

        return () => unsubscribe();
    }, []);

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
                        <tr key={entry.uid} className={user && entry.uid === user.uid ? 'current-user' : ''}>
                            <td>{index + 1}</td>
                            <td>{entry.username}</td>
                            <td>{entry.perfectStreaks}</td>
                            <td>{entry.bestTime || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Leaderboard;