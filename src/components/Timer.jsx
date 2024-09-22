import React, { useState, useEffect, useCallback, useRef } from 'react';

const Timer = ({ initialTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const requestRef = useRef();
    const previousTimeRef = useRef();

    const updateTimer = useCallback((timestamp) => {
        if (previousTimeRef.current != null) {
            const deltaTime = (timestamp - previousTimeRef.current) / 1000;
            setTimeLeft((prevTime) => {
                const newTime = prevTime - deltaTime;
                if (newTime <= 0) {
                    cancelAnimationFrame(requestRef.current);
                    onTimeUp();
                    return 0;
                }
                return newTime;
            });
        }
        previousTimeRef.current = timestamp;
        requestRef.current = requestAnimationFrame(updateTimer);
    }, [onTimeUp]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateTimer);
        return () => cancelAnimationFrame(requestRef.current);
    }, [updateTimer]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60); // Ensure seconds are rounded
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer">
            Time left: {formatTime(Math.max(timeLeft, 0))}
        </div>
    );
};

export default Timer;