import "./main.css";
import { BrowserRouter, Routes, Route } from "react-router";
import LandingPage from "./Pages/LandingPage";
import QuizzesList from "./Pages/QuizzesList";
import Quiz from "./Pages/Quizz";
import JoinRoom from "./Pages/JoinQuiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<QuizzesList />} path="/quizzes" />
        <Route element={<Quiz />} path="/quiz/:id" />
        <Route element={<JoinRoom />} path="/joinQuiz" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
