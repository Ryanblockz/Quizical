import React, { useState, useEffect } from 'react'
import { ref, get } from "firebase/database"
import { rtdb } from '../firebase'

function Leaderboard({ user, onBackToMenu }) {
    const [leaderboardData, setLeaderboardData] = useState({})
    const [selectedDifficulty, setSelectedDifficulty] = useState('easy')

    useEffect(() => {
        fetchLeaderboardData()
    }, [])

    const fetchLeaderboardData = async () => {
        const leaderboardRef = ref(rtdb, 'leaderboard')
        const leaderboardSnapshot = await get(leaderboardRef)

        const leaderboard = { easy: [], medium: [], hard: [] }

        if (leaderboardSnapshot.exists()) {
            const leaderboardData = leaderboardSnapshot.val();
            ['easy', 'medium', 'hard'].forEach(difficulty => {
                if (leaderboardData[difficulty]) {
                    Object.entries(leaderboardData[difficulty]).forEach(([uid, entry]) => {
                        if (entry.score > 0) {
                            leaderboard[difficulty].push({
                                username: entry.username,
                                score: entry.score,
                                time: entry.time || 0
                            })
                        }
                    })
                }
            })
        }


        ['easy', 'medium', 'hard'].forEach(difficulty => {
            leaderboard[difficulty].sort((a, b) => b.score - a.score || a.time - b.time);
        })

        setLeaderboardData(leaderboard);
    }

    const renderLeaderboard = () => {
        const currentLeaderboard = leaderboardData[selectedDifficulty] || []
        return (
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Score</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {currentLeaderboard.map((entry, index) => (
                        <tr key={index} className={entry.username === user?.displayName ? 'current-user' : ''}>
                            <td>{index + 1}</td>
                            <td>{entry.username}</td>
                            <td>{entry.score}</td>
                            <td>{formatTime(entry.time)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    }

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    return (
        <div className="leaderboard-container">
            <button onClick={onBackToMenu} className="back-to-menu-button">Back to Main Menu</button>
            <h2>Leaderboard</h2>
            <div className="leaderboard-tabs">
                {['easy', 'medium', 'hard'].map(difficulty => (
                    <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={selectedDifficulty === difficulty ? 'active' : ''}
                    >
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </button>
                ))}
            </div>
            {renderLeaderboard()}
        </div>
    )
}

export default Leaderboard