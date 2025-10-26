import { useState, useRef, useEffect } from "react";

export default function JoinRoom() {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [players, setPlayers] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [joined, setJoined] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const wsRef = useRef(null);
  const timerRef = useRef(null);

  const joinRoom = () => {
    if (!username) return alert("Enter username first!");
    if (wsRef.current || !code) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/quiz/${code}/`);
    wsRef.current = ws;

    ws.onopen = () => console.log("Connected to room:", code);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "player_count") setPlayers(data.count);

      if (data.type === "question_update") {
        setCurrentQuestion(data.data);
        setQuizStarted(true);
        setHasAnswered(false);
        setWaiting(false);
        setResults([]);
        if (data.data.time_limit) startTimer(data.data.time_limit);
      }

      if (data.type === "question_end") {
        setWaiting(false);
        setResults(data.results || []);
        setHasAnswered(true);
        clearInterval(timerRef.current);
      }
    };

    ws.onclose = () => console.log("Disconnected");

    setJoined(true);
  };

  const startTimer = (duration) => {
    setTimeLeft(duration);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
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

  const selectAnswer = (answerId) => {
    if (hasAnswered) return;
    wsRef.current.send(JSON.stringify({
      action: "answer_selected",
      player: username,
      answer_id: answerId,
    }));
    setHasAnswered(true);
    setWaiting(true);
  };

  useEffect(() => () => wsRef.current?.close(), []);

  return (
    <div className="p-4 flex flex-col items-center justify-center space-y-4">
      {!joined && !quizStarted && (
        <div className="flex flex-col space-y-2 items-center">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="border px-2 py-1"
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter room code"
            className="border px-2 py-1"
          />
          <button onClick={joinRoom} className="bg-blue-600 text-white px-4 py-1 rounded">
            Join Room
          </button>
        </div>
      )}

      {quizStarted && !currentQuestion && (
        <p className="text-yellow-400 text-xl">Quiz has started! Cannot join now.</p>
      )}

      <p>Players: {players}</p>

      {currentQuestion && (
        <div className="mt-4 w-96">
          <p className="text-xl font-bold mb-2">{currentQuestion.question}</p>
          <p className="text-yellow-400 mb-2">Time Left: {timeLeft}s</p>

          {!results.length && (
            <div className="grid grid-cols-2 gap-2">
              {currentQuestion.answers.map((a, idx) => (
                <button
                  key={`${a.id}-${idx}`}
                  className={`p-4 text-white font-bold rounded ${a.colorClass || "bg-gray-500"}`}
                  onClick={() => selectAnswer(a.id)}
                  disabled={hasAnswered}
                >
                  {a.answer}
                </button>
              ))}
            </div>
          )}

          {waiting && <p className="text-yellow-300 mt-2">Waiting for other players...</p>}

          {results.length > 0 && (
            <div className="mt-4">
              <p className="font-bold mb-2">Results:</p>
              {Object.entries(results).map(([player, ans], idx) => (
                <p key={idx} className={ans.is_correct ? "text-green-400" : "text-red-400"}>
                  {player} chose: {ans.answer} {ans.is_correct ? "(Correct)" : "(Wrong)"}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
