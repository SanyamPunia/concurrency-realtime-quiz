"use client";

import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import QuizDisplay from "@/components/QuizDisplay";
import LeaderBoard from "@/components/LeaderBoard";
import { Problem, User } from "@/types";

const TOTAL_QUESTIONS = 10;

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsernameSubmitted, setIsUsernameSubmitted] = useState(false);

  useEffect(() => {
    const newSocket = io("", {
      path: "/api/socket",
    });
    setSocket(newSocket);

    newSocket.on(
      "newProblem",
      (data: { problem: Problem; questionNumber: number }) => {
        console.log("New problem received:", data);
        setProblem(data.problem);
        setCurrentQuestion(data.questionNumber);
        setError(null);
      }
    );

    newSocket.on("updateUsers", (updatedUsers: User[]) => {
      console.log("Users updated:", updatedUsers);
      setUsers(updatedUsers);
    });

    newSocket.on("quizEnded", () => {
      setQuizEnded(true);
    });

    newSocket.on("errorMessage", (message: string) => {
      setError(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSubmitUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSubmitted(true);
      if (socket) {
        socket.emit("setUsername", username);
      }
    } else {
      setError("Please enter a username");
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  const handleSubmitAnswer = (answer: number) => {
    if (socket) {
      socket.emit("submitAnswer", { username, answer });
    }
  };

  const startNewQuiz = () => {
    if (socket) {
      socket.emit("startNewQuiz");
      setQuizEnded(false);
      setCurrentQuestion(0);
      setIsUsernameSubmitted(false);
      setUsername("");
    }
  };
  return (
    <main className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
            Competitive Math Quiz
          </h1>
          {!quizEnded ? (
            <>
              {!isUsernameSubmitted ? (
                <form onSubmit={handleSubmitUsername} className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 mb-2 text-gray-700 border rounded-lg focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                  >
                    Start Quiz
                  </button>
                </form>
              ) : problem ? (
                <QuizDisplay
                  problem={problem}
                  onSubmit={handleSubmitAnswer}
                  currentQuestion={currentQuestion}
                  totalQuestions={TOTAL_QUESTIONS}
                  error={error}
                />
              ) : null}
            </>
          ) : (
            <>
              <LeaderBoard users={users} />
              <button
                onClick={startNewQuiz}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
              >
                Start New Quiz
              </button>
            </>
          )}
          {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>
      </div>
    </main>
  );
}
