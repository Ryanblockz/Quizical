import { useState, useEffect } from 'react'
import './App.css'
import {decode} from "html-entities"
import Quiz from "./components/Quiz"

export default function App() {
  const [startQuiz, setStartQuiz] = useState(false)
  const [questions, setQuestions] = useState([])

  useEffect(()=>{

  const fetchData = async () => {
    try{
  const response = await fetch("https://opentdb.com/api.php?amount=5&type=multiple")
  const data = await response.json()
  const results = data.results

  const questions = results.map(result =>{
  const decodedQuestion = decode(result.question)
  const correctAnswer = decode(result.correct_answer)
  const incorrectAnswers = result.incorrect_answers.map(answer => decode(answer))
  const allAnswers = shuffleArray([correctAnswer, ...incorrectAnswers])
  
  return{
    question: decodedQuestion,
    correctAnswer,
    answers: allAnswers
  }
})

setQuestions(questions)

  } catch(error) {
    console.log("Error fetching data:", error)
  }}
 
  if(startQuiz){
    fetchData()
   }
},[startQuiz])


const shuffleArray = (array) => {
  let shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
};

  if(!startQuiz){
  return (
    <>
      <h1>Quizzical</h1>
      <p>Fancy yourself a brain? Click the button to find out</p>
      <div className="card">
        <button onClick={() => setStartQuiz(true)}>
          Start Quiz
        </button>
      </div>
      
    </>
  )
} else {
  return (
    <>
  {questions.map((quiz, index) => (
          <Quiz 
            key={index} 
            question={quiz.question} 
            answers={quiz.answers} 
            correctAnswer={quiz.correctAnswer} 
          />
        ))}
    </>
  )
}
}


