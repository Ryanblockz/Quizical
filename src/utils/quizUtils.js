import React, { useState, useEffect } from 'react';
import { fetchQuizData } from '../utils/quizUtils';
import Quiz from './Quiz';
import { ref, update } from "firebase/database";
import { rtdb } from '../firebase';

function RankedQuiz({ user, difficulty, setIsRankedMode }) {
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        fetchQuizData(30, difficulty).then(setQuestions);
    }, [difficulty]);

    useEffect(() => {
        if (questions.length > 0) {
            setSelectedAnswers(new Array(questions.length).fill(null));
        }
    }, [questions]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Automatically submit when time runs out
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleAnswerSelect = (index, answer) => {
        setSelectedAnswers(prev => prev.map((item, i) => i === index ? answer : item));
    };

    const calculateScore = () => {
        return selectedAnswers.reduce((score, answer, index) =>
            answer === questions[index].correctAnswer ? score + 1 : score, 0);
    };

    const handleSubmit = () => {
        if (!submitted) {
            const finalScore = calculateScore();
            setScore(finalScore);
            setSubmitted(true);
            updateUserScore(user.uid, finalScore, 300 - timeLeft);
        }
    };

    const updateUserScore = async (userId, score, time) => {
        try {
            const userRef = ref(rtdb, `users/${userId}`);
            await update(userRef, {
                [`rankedScores/${difficulty}`]: score,
                [`rankedTimes/${difficulty}`]: time
            });
            console.log(`Updated ranked score for user ${userId}: ${score}, time: ${time}`);
        } catch (error) {
            console.error("Error updating user score:", error);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="ranked-quiz">
            <div className="timer fixed-timer">
                Time left: {formatTime(timeLeft)}
            </div>
            {questions.map((quiz, index) => (
                <Quiz
                    key={index}
                    question={quiz.question}
                    answers={quiz.answers}
                    correctAnswer={quiz.correctAnswer}
                    selectedAnswer={selectedAnswers[index]}
                    onAnswerSelect={(answer) => handleAnswerSelect(index, answer)}
                    submitted={submitted}
                />
            ))}
            <div className='bottomBox'>
                {submitted && (
                    <p className='score'>You scored {score}/30 correct answers.</p>
                )}
                <button onClick={handleSubmit} disabled={submitted}>
                    {submitted ? 'Submitted' : 'Submit Quiz'}
                </button>
                <button onClick={() => setIsRankedMode(false)}>Exit Ranked Mode</button>
            </div>
        </div>
    );
}

export default RankedQuiz;