import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const startTimeRef = useRef(null);
    const animationFrameRef = useRef(null);

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
            const timeTaken = Math.min(180, Math.floor((Date.now() - startTimeRef.current) / 1000));
            updateUserScore(user.uid, finalScore, timeTaken);
            console.log(`Quiz submitted. Score: ${finalScore}, Time taken: ${timeTaken}`);
        }
        if (isTimeUp) {
            setTimeLeft(0);
        }
    }, [submitted, calculateScore, updateUserScore, user.uid]);

    const startTimer = useCallback(() => {
        if (startTimeRef.current === null) {
            startTimeRef.current = Date.now();
        }
        const animate = () => {
            const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const newTimeLeft = Math.max(180 - elapsedTime, 0);
            setTimeLeft(newTimeLeft);

            if (newTimeLeft > 0 && !submitted) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                handleSubmit(newTimeLeft === 0);
            }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [handleSubmit, submitted]);

    useEffect(() => {
        if (!isSetup && !submitted) {
            startTimer();
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isSetup, submitted, startTimer]);

    const handleAnswerSelect = useCallback((answer) => {
        setSelectedAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[currentQuestionIndex] = answer;
            return newAnswers;
        });

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
            handleSubmit();
        }
    }, [currentQuestionIndex, questions.length, handleSubmit]);

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

    const startRankedQuiz = async () => {
        const fetchedQuestions = await fetchQuizData(30, difficulty);
        setQuestions(fetchedQuestions);
        setIsSetup(false);
        setTimeLeft(180);
        startTimeRef.current = null; // Reset the start time
        startTimer();
    };

    const resetQuiz = () => {
        setQuestions([]);
        setSelectedAnswers([]);
        setSubmitted(false);
        setScore(0);
        setTimeLeft(180);
        setCurrentQuestionIndex(0);
        setIsSetup(true);
        startTimeRef.current = null;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
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
                    {!submitted && questions.length > 0 && currentQuestionIndex < questions.length && (
                        <Quiz
                            key={currentQuestionIndex}
                            question={questions[currentQuestionIndex].question}
                            answers={questions[currentQuestionIndex].answers}
                            correctAnswer={questions[currentQuestionIndex].correctAnswer}
                            selectedAnswer={selectedAnswers[currentQuestionIndex]}
                            onAnswerSelect={handleAnswerSelect}
                            submitted={false}
                        />
                    )}
                    {submitted && (
                        <div className='quiz-results'>
                            <div className='quiz-results-container'>
                                <h2>Quiz Results</h2>
                                <p className='score'>You scored {score}/30 correct answers.</p>
                                <p className='time'>Time taken: {formatTime(180 - timeLeft)}</p>
                            </div>
                            {questions.map((question, index) => (
                                <Quiz
                                    key={index}
                                    question={question.question}
                                    answers={question.answers}
                                    correctAnswer={question.correctAnswer}
                                    selectedAnswer={selectedAnswers[index]}
                                    submitted={true}
                                />
                            ))}
                        </div>
                    )}
                    <div className='bottomBox'>
                        {submitted ? (
                            <button onClick={() => setIsRankedMode(false)} className="exit-button">
                                Exit Ranked
                            </button>
                        ) : (
                            <button onClick={resetQuiz} className="reset-button">
                                Play New Game
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default RankedQuiz;