import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";

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
    <div>
      {quizzes.map((quiz) => {
        return (
          <div key={quiz.id}>
            <h1 className="text-red-500 font-extrabold text-3xl">
              {quiz.name}
            </h1>
            <ol>
              {quiz.questions.map((question) => {
                return (
                  <div key={question.id}>
                    <li>{question.question}</li>
                    <ul>
                      {question.answers.map((answser) => {
                        return <li key={answser.id}>{answser.answer}</li>;
                      })}
                    </ul>
                  </div>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
};

export default QuizzesList;
