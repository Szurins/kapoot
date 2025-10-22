import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const LandingPage = () => {
  return (
    <div className="flex flex-col h-screen justify-between">
      <Navbar />
      <Footer />
    </div>
  );
};

export default LandingPage;
