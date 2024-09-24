import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import './QuizResponsive.css'
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
  const [elapsedTime, setElapsedTime] = useState(0)
  const [user, setUser] = useState(null)
  const [perfectStreaks, setPerfectStreaks] = useState(0)
  const [bestTime, setBestTime] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [isRankedMode, setIsRankedMode] = useState(false)
  const [rankedDifficulty, setRankedDifficulty] = useState("easy")
  const [questionsLoaded, setQuestionsLoaded] = useState(false)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const timerRef = useRef(null)

  useEffect(() => {
    document.querySelector('html').style.filter = colorMode === "dark" ? "invert(100%) hue-rotate(180deg)" : "";
  }, [colorMode])

  useEffect(() => {
    if (startQuiz) {
      setQuestionsLoaded(false)
      fetchQuizData()
    }
  }, [startQuiz])

  useEffect(() => {
    if (startQuiz && !submitted) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [startQuiz, submitted]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !user) {
        setIsNewUser(true);
        setTimeout(() => setIsNewUser(false), 5000);
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
      setQuestionsLoaded(true)
    } catch (error) {
      console.log("Error fetching data:", error)
    }
  }

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5)

  const handleAnswerSelect = (index, answer) => {
    setSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[index] = answer;
      return newAnswers;
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      handleSubmit();
    }
  }

  const calculateScore = () => selectedAnswers.reduce((score, answer, index) =>
    answer === questions[index].correctAnswer ? score + 1 : score, 0)

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

  const handleSubmit = useCallback((isTimeUp = false) => {
    if (!submitted) {
      const currentScore = calculateScore();
      setScore(currentScore);
      setSubmitted(true);
      clearInterval(timerRef.current);

      if (currentScore === quizLength && elapsedTime <= 120) {
        setPerfectStreaks(prevStreaks => prevStreaks + 1);
        if (!bestTime || elapsedTime < bestTime) {
          setBestTime(elapsedTime);
        }
        updateUserScore(user.uid, perfectStreaks + 1, elapsedTime);
      } else {
        setPerfectStreaks(0);
      }
    }
    if (isTimeUp) {
      setElapsedTime(180);
    }
  }, [submitted, calculateScore, elapsedTime, quizLength, user, perfectStreaks, bestTime, updateUserScore]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

  const DarkModeToggle = () => !startQuiz ? (
    <button
      className={`modeButton darkness darkModeButton ${startQuiz ? POES : ""} ${colorMode === "dark" ? "darkMode" : "lightMode"}`}
      onClick={() => setColorMode(prev => prev === "dark" ? "light" : "dark")}
    >
      {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  ) : "";

  const LeaderboardButton = () => (
    <button
      onClick={toggleLeaderboard}
      className={`modeButton leaderboard-button-unique ${colorMode === "dark" ? "darkMode" : ""}`}
    >
      Leaderboard
    </button>
  );

  const TopButtons = () => (
    <div className={`topButtons ${showLeaderboard ? 'leaderboard-view' : ''}`}>
      <div className="buttonGroup">
        <DarkModeToggle />
        {user && !startQuiz && !isRankedMode && (
          <>
            <LeaderboardButton />
            <button onClick={handleSignOut} className="auth-button modeButton">
              Sign Out
            </button>
          </>
        )}
      </div>
    </div>
  );

  const quizSetup = (
    <>
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
      <p className="welcome">Your'e a wizard {user?.displayName || 'new user'}</p>
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
      <div className="quiz-container">
        {!submitted && questionsLoaded ? (
          questions.length > 0 && currentQuestionIndex < questions.length && (
            <Quiz
              key={currentQuestionIndex}
              question={questions[currentQuestionIndex].question}
              answers={questions[currentQuestionIndex].answers}
              correctAnswer={questions[currentQuestionIndex].correctAnswer}
              selectedAnswer={selectedAnswers[currentQuestionIndex]}
              onAnswerSelect={(answer) => handleAnswerSelect(currentQuestionIndex, answer)}
              submitted={submitted}
            />
          )
        ) : questionsLoaded ? (
          <div className='quiz-results'>
            <div className='quiz-results-container'>
              <h2>Quiz Results</h2>
              <p className='score'>You scored {score}/{quizLength} correct answers.</p>
              <p className='time'>Time taken: {formatTime(elapsedTime)}</p>
            </div>
            {questions.map((question, index) => (
              <Quiz
                key={index}
                question={question.question}
                answers={question.answers}
                correctAnswer={question.correctAnswer}
                selectedAnswer={selectedAnswers[index]}
                submitted={true}
              />
            ))}
            <div className="button-container" style={{ display: 'flex', justifyContent: 'center', gap: '0.5em' }}>
              <button
                onClick={() => {
                  setStartQuiz(false);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswers([]);
                  setSubmitted(false);
                  setScore(0);
                  setElapsedTime(0);
                }}
                style={{ flex: 1, minWidth: '140px', whiteSpace: 'nowrap' }}
              >
                Play New Game
              </button>
            </div>
          </div>
        ) : (
          <div>Loading questions...</div>
        )}
        {!submitted && questionsLoaded && (
          <button onClick={() => handleSubmit()} className="submit-button">
            Submit Quiz
          </button>
        )}
      </div>
    </>
  )

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
    if (showLeaderboard) {
      setStartQuiz(false);
      setIsRankedMode(false);
    }
  };

  const getContainerClassName = () => {
    let className = "app-container";
    if (!user || (!startQuiz && !isRankedMode)) {
      className += " noMargin";
    }
    return className;
  };

  return (
    <div className={getContainerClassName()}>
      <TopButtons />
      {isNewUser && (
        <div className="welcome-message">
          Welcome, {user?.displayName || 'new user'}! Ready to start quizzing?
        </div>
      )}
      {showLeaderboard ? (
        <Leaderboard user={user} onBackToMenu={toggleLeaderboard} />
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