import { useState, useEffect } from 'react'
import { decode } from "html-entities"

export default function Quiz({ question, answers, selectedAnswer, onAnswerSelect, correctAnswer, submitted }) {
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
      <h2>{question}</h2>
      <ul className="quizAnswersContainer">
        {answers.map((answer, index) => (
          <li
            key={index}
            className={`answers ${getAnswerClass(answer)}`}
            onClick={() => onAnswerSelect(answer)}
          >
            {answer}
          </li>
        ))}
      </ul>
      <hr style={{ width: "100%" }} />
    </div>

  );
}