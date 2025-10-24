import { useParams } from "react-router";
import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

function Quiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchQuiz = async () => {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/quizzes/${id}`
      );
      setQuiz(response.data);
    };

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    console.log("Quiz state updated:", quiz.name);
  });
  return (
    <div className="flex flex-col justify-between min-h-screen bg-linear-to-r from-gray-700 to-gray-900 text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center text-3xl font-bold">
        <p>{quiz.name}</p>
      </main>

      <Footer />
    </div>
  );
}

export default Quiz;
