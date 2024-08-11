import { useState, useEffect } from 'react'
import {decode} from "html-entities"


export default function Quiz(props) {
    const question = props.question
    const answers = props.answers
    const correctAnswer = props.correctAnswer
    
    return (

      <div className="quiz">
        <h2>{question}</h2>
        <ul>
          {answers.map((answer, index) => (
            <li key={index}>{answer}</li>
          ))}
        </ul>
      </div>
    );
  }