import React, { useState } from 'react';
import QuizComponent from './QuizComponent';
import { Question } from '../types/Question';

interface QuizListProps {
    questions: Question[];
}

const QuizList: React.FC<QuizListProps> = ({ questions }) => {
    const [quizStarted, setQuizStarted] = useState(false);

    const handleStartQuiz = () => {
        setQuizStarted(true);
    };

    console.log('Rendering QuizList', { quizStarted, questionsCount: questions.length });

    if (!quizStarted) {
        return (
            <div>
                <h2>Quiz with {questions.length} questions</h2>
                <button onClick={handleStartQuiz}>Start Quiz</button>
            </div>
        );
    }

    return <QuizComponent questions={questions} />;
};

export default QuizList;