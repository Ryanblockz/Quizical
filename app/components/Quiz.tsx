import React, { useState } from 'react';
import { Question } from '../types/Question';
import { decode } from 'html-entities';

interface QuizProps {
    questions: Question[];
    // Add other props as needed
}

const Quiz: React.FC<QuizProps> = ({ questions }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answers, setAnswers] = useState<string[]>([]);

    const currentQuestion = questions[currentQuestionIndex];

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

    if (currentQuestionIndex >= questions.length) {
        // Quiz finished, you can add logic to show results here
        return <div>Quiz Completed!</div>;
    }

    return (
        <div>
            <h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
            <p>{decode(currentQuestion.question)}</p>
            <ul>
                {currentQuestion.answers.map((answer, index) => (
                    <li key={index}>
                        <button
                            onClick={() => handleAnswerSelect(answer)}
                            disabled={selectedAnswer === answer}
                        >
                            {decode(answer)}
                        </button>
                    </li>
                ))}
            </ul>
            <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
            >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
        </div>
    );
};

export default Quiz;