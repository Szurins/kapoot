import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const LandingPage = () => {
  return (
    <div className="flex flex-col h-screen justify-between bg-linear-to-r from-gray-700 to-gray-900">
      <Navbar />
      <div className="flex items-center flex-row justify-center ">
        <div className="w-3xl text-3xl text-gray-100">
          <p>
            <span className="underline">
              Welcome to <span className="text-4xl font-semibold">Kapoot</span>
            </span>{" "}
            —<br /> the ultimate platform for creating and hosting fun,
            interactive quizzes! 🎉 Challenge your friends, classmates, or
            colleagues in real-time and see who tops the leaderboard. Whether
            you're learning, teaching, or just having fun,{" "}
            <span className="text-4xl font-semibold">Kapoot</span> makes
            engagement easy and exciting. Create your first quiz today and spark
            some friendly competition!
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <a
          href="/quizzes"
          className="border py-5 px-8 text-2xl rounded-2xl text-gray-100 border-gray-900 bg-gray-700 hover:cursor-pointer duration-300 hover:bg-gray-900 ease-in-out"
        >
          Start now!
        </a>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
