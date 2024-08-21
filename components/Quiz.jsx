import React from 'react';
import './quiz.css';

function Quiz({ question, answers, correctAnswer, selectedAnswer, onAnswerSelect, submitted }) {
    const handleAnswerClick = (answer) => {
        if (!submitted && onAnswerSelect) {
            onAnswerSelect(answer);
        }
    };

    return (
        <div className="quiz">
            <div className="question">
                <h2>{question}</h2>
                <ul>
                    {answers.map((answer, index) => (
                        <li
                            key={index}
                            onClick={() => handleAnswerClick(answer)}
                            className={`answer ${submitted
                                    ? answer === correctAnswer
                                        ? 'correct'
                                        : answer === selectedAnswer
                                            ? 'incorrect'
                                            : ''
                                    : ''
                                }`}
                        >
                            {answer}
                            {submitted && answer === selectedAnswer && answer !== correctAnswer && ' ❌'}
                            {submitted && answer === correctAnswer && ' ✅'}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Quiz;