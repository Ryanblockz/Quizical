import React from 'react';
import Quiz from './components/Quiz';
import { Question } from './types/Question';

const App: React.FC = () => {
    const questions: Question[] = [/* Your questions array */];

    return (
        <div className="App">
            <Quiz questions={questions} />
        </div>
    );
};

export default App;