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

  useEffect(() => {

    const fetchData = async () => {

      try {
        const response = await fetch(`https://opentdb.com/api.php?amount=${quizLength}&category=${selectedCategory}&type=multiple&difficulty=${difficulty}`)
        const data = await response.json()
        const results = data.results

        const questions = results.map(result => {
          const decodedQuestion = decode(result.question)
          const correctAnswer = decode(result.correct_answer)
          const incorrectAnswers = result.incorrect_answers.map(answer => decode(answer))
          const allAnswers = shuffleArray([correctAnswer, ...incorrectAnswers])

          return {
            question: decodedQuestion,
            correctAnswer,
            answers: allAnswers
          }
        })

        setQuestions(questions)
        setSelectedAnswers(new Array(questions.length).fill(null))
        setSubmitted(false)

      } catch (error) {
        console.log("Error fetching data:", error)
      }
    }

    if (startQuiz) {
      fetchData()
    }
  }, [startQuiz])


  const shuffleArray = (array) => {
    let shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }


  const handleAnswerSelect = (index, answer) => {
    const updatedAnswers = [...selectedAnswers]
    updatedAnswers[index] = answer
    setSelectedAnswers(updatedAnswers)
  }

  const calculateScore = () => {
    let score = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        score++
      }
    })
    return score
  }

  const handleSubmit = () => {
    if (!submitted) {
      const calculatedScore = calculateScore()
      setScore(calculatedScore)
      setSubmitted(true)
    } else {
      setStartQuiz(false)
      setQuestions([])
      setSelectedAnswers([])
      setScore(0)
    }
  }

  if (!startQuiz) {
    return (
      <>
        <h1>Quizzical</h1>
        <div className="selector-group">
          <label htmlFor="category-select">Select Category:</label>
          <select id="category-select" onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="quiz-length-select">Select Quiz Length:</label>
          <select id="quiz-length-select" onChange={(e) => setQuizLength(e.target.value)} value={quizLength}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(length => (
              <option key={length} value={length}>{length}</option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="difficulty-select">Select Difficulty:</label>
          <select id="difficulty-select" onChange={(e) => setDifficulty(e.target.value)} value={difficulty}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
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
            selectedAnswer={selectedAnswers[index]}
            onAnswerSelect={(answer) => handleAnswerSelect(index, answer)}
            submitted={submitted}
          />
        ))}
        {submitted && <p>You scored {score}/{quizLength}</p>}
        <div>
          <button onClick={handleSubmit}>{submitted ? 'Play New Game' : 'Submit Quiz'}</button>
        </div>
      </>
    )
  }
}


