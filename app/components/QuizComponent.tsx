import React, { useState, useEffect } from 'react';
import { Question } from '../types/Question';

interface QuizComponentProps {
    questions: Question[];
    // ... other props
}

const QuizComponent: React.FC<QuizComponentProps> = ({ questions, /* other props */ }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answers, setAnswers] = useState<string[]>([]);

    const currentQuestion = questions[currentQuestionIndex];

    console.log('Rendering QuizComponent', { currentQuestionIndex, questionsCount: questions.length });

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleNextQuestion = () => {
        if (selectedAnswer) {
            setAnswers([...answers, selectedAnswer]);
            setSelectedAnswer(null);
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    return (
        <div>
            <h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
            <p>{currentQuestion.text}</p>
            <ul>
                {currentQuestion.options.map((option, index) => (
                    <li key={index}>
                        <button
                            onClick={() => handleAnswerSelect(option)}
                            disabled={selectedAnswer === option}
                        >
                            {option}
                        </button>
                    </li>
                ))}
            </ul>
            <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer || currentQuestionIndex === questions.length - 1}
            >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
        </div>
    );
};

export default QuizComponent;