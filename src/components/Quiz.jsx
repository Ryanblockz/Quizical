import { useState, useEffect, useRef } from 'react'
import { decode } from "html-entities"

export default function Quiz({ question, answers, selectedAnswer, onAnswerSelect, correctAnswer, submitted }) {
  const questionRef = useRef(null);

  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.focus();
    }
  }, [question]);

  const getAnswerClass = (answer) => {
    if (submitted) {
      if (answer === correctAnswer) return 'correct'
      if (answer === selectedAnswer) return 'incorrect'
      return 'unselected';
    } else {
      if (answer === selectedAnswer) return 'selected'
      return ''
    }
  };

  return (
    <div className="quiz">
      <h2 className='question' ref={questionRef} tabIndex="-1">{question}</h2>
      <ul className="quizAnswersContainer">
        {answers.map((answer, index) => (
          <li
            key={index}
            className={`answers ${getAnswerClass(answer)}`}
            onClick={() => onAnswerSelect(answer)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onAnswerSelect(answer)
              }
            }}
            role="button"
            aria-selected={selectedAnswer === answer}
          >
            {answer}
          </li>
        ))}
      </ul>
      <hr style={{ width: "100%", zIndex: '1' }} />
    </div>
  );
}