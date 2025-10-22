import "./main.css";
import { BrowserRouter, Routes, Route } from "react-router";
import LandingPage from "./Pages/LandingPage";
import QuizzesList from "./Pages/QuizzesList";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<QuizzesList />} path="/quizzes" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
