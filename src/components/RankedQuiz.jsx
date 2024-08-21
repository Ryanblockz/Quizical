import React, { useState, useEffect, useCallback } from 'react';
import Quiz from './Quiz';
import { ref, update, get } from "firebase/database";
import { rtdb } from '../firebase';
import { decode } from "html-entities";

function RankedQuiz({ user, difficulty, setDifficulty, setIsRankedMode }) {
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
    const [isSetup, setIsSetup] = useState(true);

    useEffect(() => {
        if (questions.length > 0) {
            setSelectedAnswers(new Array(questions.length).fill(null));
        }
    }, [questions]);

    const calculateScore = useCallback(() => {
        return selectedAnswers.reduce((score, answer, index) =>
            answer === questions[index].correctAnswer ? score + 1 : score, 0);
    }, [selectedAnswers, questions]);

    const updateUserScore = useCallback(async (userId, newScore, time) => {
        try {
            const leaderboardRef = ref(rtdb, `leaderboard/${difficulty}/${userId}`);
            const userSnapshot = await get(leaderboardRef);
            const userData = userSnapshot.val() || {};

            if (newScore > (userData.score || 0) || (newScore === userData.score && time < userData.time)) {
                await update(leaderboardRef, {
                    username: user.displayName,
                    score: newScore,
                    time: time
                });
                console.log(`Updated ranked score for user ${userId}: ${newScore}, time: ${time}`);
            } else {
                console.log(`Score not updated. Current best: ${userData.score}, New score: ${newScore}`);
            }
        } catch (error) {
            console.error("Error updating user score:", error);
        }
    }, [difficulty, user.displayName]);

    const handleSubmit = useCallback((isTimeUp = false) => {
        if (!submitted) {
            const finalScore = calculateScore();
            setScore(finalScore);
            setSubmitted(true);
            updateUserScore(user.uid, finalScore, 180 - timeLeft);
            console.log(`Quiz submitted. Score: ${finalScore}, Time left: ${timeLeft}`);
        }
        if (isTimeUp) {
            setTimeLeft(0);
        }
    }, [submitted, calculateScore, updateUserScore, user.uid, timeLeft]);

    useEffect(() => {
        if (isSetup) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    handleSubmit(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSetup, handleSubmit]);

    const handleAnswerSelect = (index, answer) => {
        setSelectedAnswers(prev => prev.map((item, i) => i === index ? answer : item));
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const fetchQuizData = async (amount, difficulty) => {
        try {
            const response = await fetch(`https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=multiple`);
            const { results } = await response.json();

            return results.map(({ question, correct_answer, incorrect_answers }) => ({
                question: decode(question),
                correctAnswer: decode(correct_answer),
                answers: shuffleArray([decode(correct_answer), ...incorrect_answers.map(decode)])
            }));
        } catch (error) {
            console.error("Error fetching quiz data:", error);
            return [];
        }
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const startRankedQuiz = () => {
        setIsSetup(false);
        fetchQuizData(30, difficulty).then(setQuestions);
    };

    const renderSetup = () => (
        <div className="ranked-setup">
            <button onClick={() => setIsRankedMode(false)} className="back-button">Main Menu</button>
            <div className="ranked-content">
                <h2>Ranked Quiz</h2>
                <p>You will have 3 minutes to answer 30 questions. Your score and time will be recorded for the leaderboard.</p>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <button onClick={startRankedQuiz} className="ranked-start-button">Start Quiz</button>
            </div>
        </div>
    );

    return (
        <div className="ranked-quiz">
            {isSetup ? (
                renderSetup()
            ) : (
                <>
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
                        {!submitted && (
                            <button onClick={() => handleSubmit()} className="submit-button">
                                Submit Quiz
                            </button>
                        )}
                        <button onClick={() => setIsRankedMode(false)} className="exit-button">Exit Ranked</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default RankedQuiz;