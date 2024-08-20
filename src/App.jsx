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

  const [quizState, setQuizState] = useState({
    startQuiz: false,
    questions: [],
    selectedAnswers: [],
    submitted: false,
    score: 0,
    selectedCategory: categories[0].id,
    quizLength: 5,
    difficulty: "easy",
    colorMode: "light"
  })

  useEffect(() => {
    document.querySelector('html').style.filter = quizState.colorMode === "dark" ? "invert(100%) hue-rotate(180deg)" : "";
  }, [quizState.colorMode])

  useEffect(() => {
    if (quizState.startQuiz) {
      fetchQuizData()
    }
  }, [quizState.startQuiz])

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`https://opentdb.com/api.php?amount=${quizState.quizLength}&category=${quizState.selectedCategory}&type=multiple&difficulty=${quizState.difficulty}`)
      const { results } = await response.json()

      const questions = results.map(({ question, correct_answer, incorrect_answers }) => ({
        question: decode(question),
        correctAnswer: decode(correct_answer),
        answers: shuffleArray([decode(correct_answer), ...incorrect_answers.map(decode)])
      }))

      setQuizState(prev => ({
        ...prev,
        questions,
        selectedAnswers: new Array(questions.length).fill(null),
        submitted: false
      }))
    } catch (error) {
      console.log("Error fetching data:", error)
    }
  }

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5)
  }

  const handleAnswerSelect = (index, answer) => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: prev.selectedAnswers.map((item, i) => i === index ? answer : item)
    }))
  }

  const calculateScore = () => {
    return quizState.selectedAnswers.reduce((score, answer, index) =>
      answer === quizState.questions[index].correctAnswer ? score + 1 : score, 0)
  }

  const handleSubmit = () => {
    if (!quizState.submitted) {
      setQuizState(prev => ({
        ...prev,
        score: calculateScore(),
        submitted: true
      }))
    } else {
      setQuizState(prev => ({
        ...prev,
        startQuiz: false,
        questions: [],
        selectedAnswers: [],
        score: 0
      }))
    }
  }

  const renderQuizSetup = () => (
    <>
      <button className='darkModeButton' onClick={() => setQuizState(prev => ({ ...prev, colorMode: prev.colorMode === "dark" ? "light" : "dark" }))} >
        Dark Mode
      </button>
      <h1>Quizzical</h1>
      {[
        { label: "Select Category:", id: "category-select", value: quizState.selectedCategory, onChange: e => setQuizState(prev => ({ ...prev, selectedCategory: e.target.value })), options: categories.map(category => ({ value: category.id, text: category.name })) },
        { label: "Select Quiz Length:", id: "quiz-length-select", value: quizState.quizLength, onChange: e => setQuizState(prev => ({ ...prev, quizLength: e.target.value })), options: Array.from({ length: 10 }, (_, i) => ({ value: i + 1, text: i + 1 })) },
        { label: "Select Difficulty:", id: "difficulty-select", value: quizState.difficulty, onChange: e => setQuizState(prev => ({ ...prev, difficulty: e.target.value })), options: [{ value: "easy", text: "Easy" }, { value: "medium", text: "Medium" }, { value: "hard", text: "Hard" }] }
      ].map(({ label, id, value, onChange, options }) => (
        <div key={id} className="selector-group">
          <label htmlFor={id}>{label}</label>
          <select id={id} onChange={onChange} value={value}>
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.text}</option>
            ))}
          </select>
        </div>
      ))}
      <p>Fancy yourself a brain? Click the button to find out</p>
      <div className="card">
        <button onClick={() => setQuizState(prev => ({ ...prev, startQuiz: true }))}>
          Start Quiz
        </button>
      </div>
    </>
  )

  const renderQuiz = () => (
    <>
      {quizState.questions.map((quiz, index) => (
        <Quiz
          key={index}
          question={quiz.question}
          answers={quiz.answers}
          correctAnswer={quiz.correctAnswer}
          selectedAnswer={quizState.selectedAnswers[index]}
          onAnswerSelect={(answer) => handleAnswerSelect(index, answer)}
          submitted={quizState.submitted}
        />
      ))}
      <div className='bottomBox'>
        {quizState.submitted && <p className='score'>You scored {quizState.score}/{quizState.quizLength} correct answers.</p>}
        <div>
          <button onClick={handleSubmit}>{quizState.submitted ? 'Play New Game' : 'Submit Quiz'}</button>
        </div>
      </div>
    </>
  )

  return quizState.startQuiz ? renderQuiz() : renderQuizSetup()
}
