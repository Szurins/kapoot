import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import QuizzCard from "../Components/QuizzCard";

const QuizzesList = () => {
  let [quizzes, setQuizzes] = useState([]);
  useEffect(() => {
    const getQuizzesFromApi = async () => {
      const response = await axios.get("http://127.0.0.1:8000/api/quizzes/");
      setQuizzes(response.data);
    };
    getQuizzesFromApi();
  }, []);
  return (
    <div className="flex flex-col justify-between h-screen bg-linear-to-r from-gray-700 to-gray-900">
      <Navbar />
      <div className="grid grid-cols-12 h-full p-5 overflow-y-auto gap-10">
        {quizzes.map((quiz) => {
          return (
            <QuizzCard
              key={quiz.id}
              id={quiz.id}
              title={quiz.name}
              description={quiz.description}
            />
          );
        })}
      </div>
      <Footer />
    </div>
  );
};

export default QuizzesList;
