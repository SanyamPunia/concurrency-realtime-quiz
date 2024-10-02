import { useState } from "react";
import { Problem } from "@/types";

interface Props {
  problem: Problem;
  onSubmit: (answer: number) => void;
  currentQuestion: number;
  totalQuestions: number;
  error: string | null;
}

const QuizDisplay: React.FC<Props> = ({
  problem,
  onSubmit,
  currentQuestion,
  totalQuestions,
  error,
}) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(Number(answer));
    setAnswer("");
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Question {currentQuestion + 1} of {totalQuestions}
      </h2>
      <h3 className="text-xl mb-4 text-gray-700">{problem.question}</h3>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
          className="px-3 py-2 mb-2 text-gray-700 border rounded-lg focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          Submit
        </button>
      </form>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default QuizDisplay;
