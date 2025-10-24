const QuizzCard = ({ id, title, description }) => {
  return (
    <a
      href={"quiz/" + id}
      className="text-2xl p-3 col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-3 text-center text-gray-200 border h-50 rounded-2xl bg-gray-800 border-gray-950 hover:bg-gray-900 duration-300 ease-in-out"
    >
      <div className="border-b text-4xl font-semibold pb-2">
        <p>{title}</p>
      </div>
      <p>{description}</p>
    </a>
  );
};

export default QuizzCard;
