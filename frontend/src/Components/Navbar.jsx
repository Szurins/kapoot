import logo from "../Assets/logo.png";

const Navbar = () => {
  return (
    <div className="flex gap-4 p-2 flex-row border-b bg-gray-950 text-gray-100 justify-between">
      <div className="flex flex-row items-center">
        <a href="/" className="flex flex-row items-center">
          <img src={logo} alt="logo image" className="h-20" />
          <p className="text-4xl font-semibold">Kapoot</p>
        </a>
      </div>
      <div className="flex flex-row gap-20 items-center mr-10 text-2xl">
        <a href="/joinQuiz">Join quiz!</a>
        <a href="/quizzes">Quizzes</a>
        <a href="#">Log in</a>
      </div>
    </div>
  );
};

export default Navbar;
