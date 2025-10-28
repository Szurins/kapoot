import { useParams } from "react-router";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

function Quiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState({});
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState(0);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [questionResults, setQuestionResults] = useState(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const colors = ["bg-red-500 hover:bg-red-600", "bg-blue-500 hover:bg-blue-600", "bg-green-500 hover:bg-green-700", "bg-yellow-500 hover:bg-yellow-700"];

  // Fetch quiz data
  useEffect(() => {
    if (!id) return;
    const fetchQuiz = async () => {
      const res = await axios.get(`http://127.0.0.1:8000/api/quizzes/${id}`);
      setQuiz(res.data);
    };
    fetchQuiz();
  }, [id]);

  // Connect WebSocket and create room
  useEffect(() => {
    if (!quiz.id || socketRef.current) return;

    const createRoom = async () => {
      const res = await axios.post(`http://127.0.0.1:8000/api/create-room/${quiz.id}/`);
      const code = res.data.room_code;
      setRoomCode(code);

      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/quiz/${code}/?host=true`);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "player_count") setPlayers(data.count);

        if (data.type === "question_update") {
          setCurrentQuestion(data.data);
          setPlayerAnswers({});
          setQuestionResults(null);
          startTimer(data.data.time_limit || 10);
        }

        if (data.type === "answer_selected") {
          setPlayerAnswers(prev => ({ ...prev, [data.player]: data.is_correct, points: data.points }));
          console.log("Answer selected:", data);
        }


        if (data.type === "question_end") {
          setQuestionResults(data.results);
          console.log(data);

          clearInterval(timerRef.current);
          setTimeLeft(0);
        }
      };

    };

    createRoom();

    return () => {
      clearInterval(timerRef.current);
      socketRef.current?.close();
    };
  }, [quiz]);

  const startTimer = (duration = 10) => {
    setTimeLeft(duration);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const startQuiz = () => {
    if (!socketRef.current || !quiz.questions?.length) return;

    const question = quiz.questions[0];
    const payload = {
      question: question?.question || "No question defined",
      answers: question.answers.map((a, idx) => ({
        id: a.id,
        answer: a.answer,
        colorClass: colors[idx % colors.length],
        is_correct: a.is_correct,
      })),
      time_limit: 10,
    };
    socketRef.current.send(JSON.stringify({ action: "start_quiz", question_data: payload }));
    setCurrentQuestion(payload);
    setStarted(true);
    setRoomCode("");
    startTimer(10);
  };

  const handleNextQuestion = () => {
    if (!socketRef.current) return;

    // Find the next question based on currentQuestion index
    const currentIndex = quiz.questions.findIndex(q => q.question === currentQuestion.question);

    const question = quiz.questions[currentIndex + 1];
    const payload = {
      question: question?.question || "No question defined",
      answers: question.answers.map((a, idx) => ({
        id: a.id,
        answer: a.answer,
        colorClass: colors[idx % colors.length],
        is_correct: a.is_correct,
      })),
      time_limit: 10,
    };
    socketRef.current.send(JSON.stringify({ action: "start_quiz", question_data: payload }));
    setCurrentQuestion(payload);
    setStarted(true);
    setRoomCode("");
    startTimer(10);
  };


  return (
    <div className="flex flex-col justify-between min-h-screen bg-gradient-to-r from-gray-700 to-gray-900 text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
        <p className="text-4xl font-bold">{quiz.name}</p>

        {!started && roomCode && (
          <p className="text-2xl">
            Room Code: <span className="font-mono">{roomCode}</span>
          </p>
        )}

        <p className="text-xl text-gray-300">Players Joined: {players}</p>

        {!started && (
          <button
            onClick={startQuiz}
            className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 hover:pointer disabled:bg-gray-600 hover:cursor-pointer"
            disabled={players === 0} // disable if no players
          >
            Start Quiz
          </button>
        )}


        {started && currentQuestion && (
          <div className="mt-4 w-96">
            <p className="text-xl font-bold mb-2">{currentQuestion.question}</p>
            <p className="text-yellow-400 mb-2">Time Left: {timeLeft}s</p>

            {/* Host cannot click answers */}
            <div className="grid grid-cols-2 gap-2">
              {currentQuestion.answers.map((a, idx) => (
                <div
                  key={`${a.id}-${idx}`}
                  className={`p-4 text-white font-bold rounded ${a.colorClass || colors[idx % colors.length]}`}
                >
                  {a.answer}
                </div>
              ))}
            </div>

            {Object.keys(playerAnswers).length > 0 && !questionResults && (
              <p className="mt-2 text-sm text-gray-300">
                Player answers received: {Object.keys(playerAnswers).length} / {players}
              </p>
            )}

            {questionResults && (
              <div className="mt-4 p-4 border border-gray-500 rounded bg-gray-800">
                <p className="font-bold text-lg mb-2">Results:</p>
                {Object.entries(questionResults).map(([player, result], idx) => (
                  <p key={idx} className={result.correct ? "text-green-400" : "text-red-400"}>
                    {player}: {result.points} pts
                  </p>
                ))}
                <p className="mt-2 font-bold">
                  Correct Answers: {Object.values(questionResults).filter(v => v).length} / {players}
                </p>

                {/* Next Question Button */}
                <button
                  onClick={() => handleNextQuestion()}
                  className="mt-4 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                >
                  Next Question
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Quiz;
