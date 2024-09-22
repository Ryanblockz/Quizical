import React from 'react';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Home } from './components/Home';
import { Quiz } from './components/Quiz';
import { Result } from './components/Result';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { useState } from 'react';

function App() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleAnswerSelected = () => {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    };

    return (
        <div className="app">
            <Header />
            <BrowserRouter>
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/quiz" render={() => (
                        <Quiz
                            currentQuestionIndex={currentQuestionIndex}
                            onAnswerSelected={handleAnswerSelected}
                        />
                    )} />
                    <Route path="/result" component={Result} />
                </Switch>
            </BrowserRouter>
            <Footer />
        </div>
    );
}

export default App;