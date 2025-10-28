import { useState, useRef, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

export default function JoinRoom() {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [joined, setJoined] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [points, setPoints] = useState(0); // player -> points
  const wsRef = useRef(null);
  const timerRef = useRef(null);
  const questionStartTimeRef = useRef(null);


  const joinRoom = () => {
    if (!username) return alert("Enter username first!");
    if (wsRef.current || !code) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/quiz/${code}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "join_room", player: username }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "error") {
        alert(data.message || "Room does not exist");
        ws.close();
        wsRef.current = null;
        return;
      }

      if (data.type === "question_update") {
        setCurrentQuestion(data.data);
        setQuizStarted(true);
        setHasAnswered(false);
        setWaiting(false);
        setResults([]);
        questionStartTimeRef.current = Date.now();
        if (data.data.time_limit) startTimer(data.data.time_limit);
      }

      if (data.type === "question_end") {
        setWaiting(false);
        setResults(data.results || []);
        setHasAnswered(true);
        clearInterval(timerRef.current);

      }

    };

    ws.onclose = () => { };

    setJoined(true);
  };

  const startTimer = (duration) => {
    setTimeLeft(duration);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setHasAnswered(true);
          setWaiting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const selectAnswer = (isCorrect) => {
    if (hasAnswered) return;

    let earnedPoints = 0;

    if (currentQuestion.time_limit && isCorrect) {
      const elapsedMs = Date.now() - questionStartTimeRef.current;
      const remainingTimeMs = currentQuestion.time_limit * 1000 - elapsedMs;
      earnedPoints = Math.max(Math.floor(remainingTimeMs), 0) * 0.1;
    }

    const totalPoints = points + Math.floor(earnedPoints);

    // send the correct total
    wsRef.current.send(JSON.stringify({
      action: "answer_selected",
      player: username,
      answer_id: isCorrect,
      points: totalPoints
    }));

    // now update local state
    setPoints(totalPoints);


    setHasAnswered(true);
    setWaiting(true);
  };

  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  return (
    <div className="flex flex-col justify-between min-h-screen bg-linear-to-r from-gray-700 to-gray-900 text-white">
      <Navbar />
      <div className="p-4 flex flex-col items-center justify-center space-y-4">

        {!joined && !quizStarted && (
          <div className="flex flex-col space-y-5 items-center">
            <p className="text-4xl font-bold">Join Quiz!</p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="border px-5 py-3 rounded-2xl bg-gray-950"
            />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter room code"
              className="border px-5 py-3 rounded-2xl bg-gray-950"
            />
            <button
              onClick={joinRoom}
              className="text-white px-6 py-2 bg-green-600 hover:bg-green-700 rounded hover:cursor-pointer"
            >
              Join Room
            </button>
          </div>
        )}

        {!quizStarted && joined && (
          <p className="text-yellow-400 text-xl">Waiting for the start...</p>
        )}

        {quizStarted && !currentQuestion && (
          <p className="text-yellow-400 text-xl">Quiz has started! Cannot join now.</p>
        )}

        {currentQuestion && (
          <div className="mt-4 w-96">
            <p className="text-green-400 font-bold text-2xl">
              Your Points: {points}
            </p>
            <p className="text-yellow-400 mb-2 text-xl">Time Left: {timeLeft}s</p>

            {!results.length && (
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.answers.map((a, idx) => (
                  <button
                    key={`${a.id}-${idx}`}
                    className={`p-4 text-white font-bold rounded py-6 hover:cursor-pointer ${a.colorClass || "bg-gray-500"}`}
                    onClick={() => selectAnswer(a.is_correct)}
                    disabled={hasAnswered}
                  >
                    {a.answer}
                  </button>
                ))}
              </div>
            )}

            {waiting && <p className="text-yellow-300 mt-2">Waiting for other players...</p>}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
