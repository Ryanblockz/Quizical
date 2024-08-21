import { useState, useEffect } from 'react'
import './App.css'
import './QuizResponsive.css'  // Add this line
import { decode } from "html-entities"
import Quiz from "./components/Quiz"
import Auth from "./components/Auth"
import { auth, rtdb } from './firebase'
import { onAuthStateChanged, signOut } from "firebase/auth"
import Leaderboard from './components/Leaderboard.jsx'
import { ref, update } from "firebase/database";
import RankedQuiz from "./components/RankedQuiz";

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
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [user, setUser] = useState(null)
  const [perfectStreaks, setPerfectStreaks] = useState(0)
  const [bestTime, setBestTime] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [isRankedMode, setIsRankedMode] = useState(false)
  const [rankedDifficulty, setRankedDifficulty] = useState("easy")

  useEffect(() => {
    document.querySelector('html').style.filter = colorMode === "dark" ? "invert(100%) hue-rotate(180deg)" : "";
  }, [colorMode])

  useEffect(() => {
    if (startQuiz) {
      fetchQuizData()
    }
  }, [startQuiz])

  useEffect(() => {
    let interval
    if (startQuiz && !submitted) {
      setStartTime(Date.now())
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [startQuiz, submitted, startTime])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !user) {
        setIsNewUser(true);
        setTimeout(() => setIsNewUser(false), 5000); // Reset after 5 seconds
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
      const currentScore = calculateScore();
      const currentTime = Date.now() - startTime;
      setScore(currentScore);
      setSubmitted(true);
      setElapsedTime(currentTime); // Use setElapsedTime instead of setEndTime

      if (currentScore === quizLength && currentTime <= 120000) { // 2 minutes in milliseconds
        setPerfectStreaks(prevStreaks => prevStreaks + 1);
        if (!bestTime || currentTime < bestTime) {
          setBestTime(currentTime);
        }
        updateUserScore(user.uid, perfectStreaks + 1, currentTime);
      } else {
        setPerfectStreaks(0);
      }
    } else {
      setStartQuiz(false);
      setQuestions([]);
      setSelectedAnswers([]);
      setScore(0);
      setStartTime(null);
      setElapsedTime(0); // Reset elapsedTime instead of endTime
    }
  }

  const updateUserScore = async (userId, streaks, time) => {
    try {
      const userRef = ref(rtdb, `users/${userId}`);
      await update(userRef, {
        perfectStreaks: streaks,
        bestTime: time < (user.bestTime || Infinity) ? time : user.bestTime
      });
      console.log(`Updated score for user ${userId}: ${streaks} streaks, ${time} ms`);
    } catch (error) {
      console.error("Error updating user score:", error);
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error("Error signing out", error);
    });
  };

  const DarkModeToggle = () => (
    <button
      className={`modeButton darkness darkModeButton ${colorMode === "dark" ? "darkMode" : "lightMode"}`}
      onClick={() => setColorMode(prev => prev === "dark" ? "light" : "dark")}
    >
      {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );

  const SignOutButton = () => (
    <button className={`modeButton signOutButton ${colorMode === "dark" ? "darkMode" : "lightMode"}`} onClick={handleSignOut}>
      Sign Out
    </button>
  );

  const LeaderboardButton = () => (
    user && (
      <button
        onClick={toggleLeaderboard}
        className={`modeButton leaderboard-button-unique ${colorMode === "dark" ? "darkMode" : ""}`}
      >
        Leaderboard
      </button>
    )
  );

  const quizSetup = (
    <>
      <div className="topButtons">
        <div className="leftButtons">
          <LeaderboardButton />
        </div>
        <div className="rightButtons">
          <DarkModeToggle />
          {user && <SignOutButton />}
        </div>
      </div>
      <h1>Quizey</h1>
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
        <button onClick={() => setIsRankedMode(true)}>Ranked</button>
      </div>
    </>
  )

  const quizContent = (
    <>
      <div className="timer fixed-timer">
        Time: {formatTime(elapsedTime)}
      </div>
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
        {submitted && (
          <>
            <p className='score'>You scored {score}/{quizLength} correct answers.</p>
            <p className='time'>Time taken: {formatTime(elapsedTime)}</p>
          </>
        )}
        <div className="button-container" style={{ display: 'flex', justifyContent: 'center', gap: '0.5em' }}>
          <button
            onClick={handleSubmit}
            style={{ flex: 1, minWidth: '140px', whiteSpace: 'nowrap' }}
          >
            {submitted ? 'Play New Game' : 'Submit Quiz'}
          </button>
          <button
            onClick={() => setStartQuiz(false)}
            className="exit-button"
            style={{ flex: 1, minWidth: '140px', whiteSpace: 'nowrap' }}
          >
            Exit Quiz
          </button>
        </div>
      </div>
    </>
  )

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <div className="app-container">
      {!isRankedMode && !startQuiz && (
        <div className="topButtons">
          <div className="leftButtons">
            <LeaderboardButton />
          </div>
          <div className="rightButtons">
            <DarkModeToggle />
            {/* {user && <SignOutButton />} */}
          </div>
        </div>
      )}
      {isNewUser && (
        <div className="welcome-message">
          Welcome, {user?.displayName || 'new user'}! Ready to start quizzing?
        </div>
      )}
      {showLeaderboard ? (
        <Leaderboard user={user} />
      ) : (
        !user ? (
          <Auth setUser={setUser} />
        ) : (
          isRankedMode ? (
            <RankedQuiz
              user={user}
              difficulty={rankedDifficulty}
              setDifficulty={setRankedDifficulty}
              setIsRankedMode={setIsRankedMode}
            />
          ) : (
            startQuiz ? quizContent : quizSetup
          )
        )
      )}
    </div>
  )
}