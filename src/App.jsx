import { useState, useEffect } from 'react'
import './App.css'
import { decode } from "html-entities"
import Quiz from "./components/Quiz"

export default function App() {

  const categories = [
    { id: 9, name: 'General Knowledge' },
    { id: 10, name: 'Entertainment: Books' },
    { id: 11, name: 'Entertainment: Film' },
    { id: 12, name: 'Entertainment: Music' },
    { id: 13, name: 'Entertainment: Musicals & Theatres' },
    { id: 14, name: 'Entertainment: Television' },
    { id: 15, name: 'Entertainment: Video Games' },
    { id: 16, name: 'Entertainment: Board Games' },
    { id: 17, name: 'Science & Nature' },
    { id: 18, name: 'Science: Computers' },
    { id: 19, name: 'Science: Mathematics' },
    { id: 20, name: 'Mythology' },
    { id: 21, name: 'Sports' },
    { id: 22, name: 'Geography' },
    { id: 23, name: 'History' },
    { id: 24, name: 'Politics' },
    { id: 25, name: 'Art' },
    { id: 26, name: 'Celebrities' },
    { id: 27, name: 'Animals' },
    { id: 28, name: 'Vehicles' },
    { id: 29, name: 'Entertainment: Comics' },
    { id: 30, name: 'Science: Gadgets' },
    { id: 31, name: 'Entertainment: Japanese Anime & Manga' },
    { id: 32, name: 'Entertainment: Cartoon & Animations' }
  ]

  const [startQuiz, setStartQuiz] = useState(false)
  const [questions, setQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id)
  const [quizLength, setQuizLength] = useState(5)
  const [difficulty, setDifficulty] = useState("easy")
  const [colorMode, setColorMode] = useState("light")

  useEffect(() => {
    document.querySelector('html').style.filter = colorMode === "dark" ? "invert(100%) hue-rotate(180deg)" : "";
  }, [colorMode])

  useEffect(() => {
    if (startQuiz) {
      fetchQuizData()
    }
  }, [startQuiz])

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`https://opentdb.com/api.php?amount=${quizLength}&category=${selectedCategory}&type=multiple&difficulty=${difficulty}`)
      const { results } = await response.json()

      const questions = results.map(({ question, correct_answer, incorrect_answers }) => ({
        question: decode(question),
        correctAnswer: decode(correct_answer),
        answers: shuffleArray([decode(correct_answer), ...incorrect_answers.map(decode)])
      }))

      setQuestions(questions)
      setSelectedAnswers(new Array(questions.length).fill(null))
      setSubmitted(false)
    } catch (error) {
      console.log("Error fetching data:", error)
    }
  }

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5)

  const handleAnswerSelect = (index, answer) => {
    setSelectedAnswers(prev => prev.map((item, i) => i === index ? answer : item))
  }

  const calculateScore = () => selectedAnswers.reduce((score, answer, index) =>
    answer === questions[index].correctAnswer ? score + 1 : score, 0)

  const handleSubmit = () => {
    if (!submitted) {
      setScore(calculateScore())
      setSubmitted(true)
    } else {
      setStartQuiz(false)
      setQuestions([])
      setSelectedAnswers([])
      setScore(0)
    }
  }

  const renderSelector = (label, id, value, onChange, options) => (
    <div className="selector-group" key={id}>
      <label htmlFor={id}>{label}</label>
      <select id={id} onChange={onChange} value={value}>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.text}</option>
        ))}
      </select>
    </div>
  )

  const quizSetup = (
    <>
      <button className='darkModeButton' onClick={() => setColorMode(prev => prev === "dark" ? "light" : "dark")}>
        Dark Mode
      </button>
      <h1>Quizzical</h1>
      {renderSelector("Select Category:", "category-select", selectedCategory,
        (e) => setSelectedCategory(e.target.value),
        categories.map(category => ({ value: category.id, text: category.name })))}
      {renderSelector("Select Quiz Length:", "quiz-length-select", quizLength,
        (e) => setQuizLength(e.target.value),
        Array.from({ length: 10 }, (_, i) => ({ value: i + 1, text: i + 1 })))}
      {renderSelector("Select Difficulty:", "difficulty-select", difficulty,
        (e) => setDifficulty(e.target.value),
        [{ value: "easy", text: "Easy" }, { value: "medium", text: "Medium" }, { value: "hard", text: "Hard" }])}
      <p>Fancy yourself a brain? Click the button to find out</p>
      <div className="card">
        <button onClick={() => setStartQuiz(true)}>Start Quiz</button>
      </div>
    </>
  )

  const quizContent = (
    <>
      {questions.map((quiz, index) => (
        <Quiz
          key={index}
          question={quiz.question}
          answers={quiz.answers}
          correctAnswer={quiz.correctAnswer}
          selectedAnswer={selectedAnswers[index]}
          onAnswerSelect={(answer) => handleAnswerSelect(index, answer)}
          submitted={submitted}
        />
      ))}
      <div className='bottomBox'>
        {submitted && <p className='score'>You scored {score}/{quizLength} correct answers.</p>}
        <div>
          <button onClick={handleSubmit}>{submitted ? 'Play New Game' : 'Submit Quiz'}</button>
        </div>
      </div>
    </>
  )

  return startQuiz ? quizContent : quizSetup
}
