import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types";
import { generateProblem } from "@/lib/mathProblems";
import { Problem, User } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ExtendedUser extends User {
  currentQuestion: number;
}

const users: ExtendedUser[] = [];
let currentProblem: Problem | null = null;
let globalQuestionNumber = 0;
const TOTAL_QUESTIONS = 10;

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    const httpServer = res.socket.server as unknown as NetServer;
    const io = new ServerIO(httpServer, { path: "/api/socket" });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("New client connected");
      let userUsername = "";

      socket.on("setUsername", (username: string) => {
        console.log(`Username set: ${username}`); // Debug log
        userUsername = username;
        const existingUser = users.find((u) => u.username === username);
        if (!existingUser) {
          users.push({ username, score: 0, currentQuestion: 0 });
        }

        // Generate the first problem if it doesn't exist
        if (!currentProblem) {
          currentProblem = generateProblem(globalQuestionNumber);
          console.log("Generated problem:", currentProblem); // Debug log
        }

        const user = users.find((u) => u.username === username);
        socket.emit("newProblem", {
          problem: currentProblem,
          questionNumber: user ? user.currentQuestion : 0,
        });
        io.emit("updateUsers", users);
      });

      socket.on("submitAnswer", ({ username, answer }) => {
        if (!username || username !== userUsername) {
          socket.emit("errorMessage", "Invalid username");
          return;
        }

        const userIndex = users.findIndex((u) => u.username === username);
        if (userIndex === -1) return;

        if (answer === currentProblem?.answer) {
          users[userIndex].score++;
          globalQuestionNumber++;

          if (globalQuestionNumber >= TOTAL_QUESTIONS) {
            io.emit("quizEnded");
            return;
          }

          // Generate the next problem
          currentProblem = generateProblem(globalQuestionNumber);
          console.log("New problem generated:", currentProblem); // Debug log

          users.forEach((u) => {
            u.currentQuestion = globalQuestionNumber; // Update current question for all users
          });

          // Emit the new problem to all users
          io.emit("newProblem", {
            problem: currentProblem,
            questionNumber: globalQuestionNumber,
          });
        } else {
          socket.emit("errorMessage", "Incorrect answer. Try again!");
          socket.emit("newProblem", {
            problem: currentProblem,
            questionNumber: globalQuestionNumber,
          });
        }

        users.sort((a, b) => b.score - a.score);
        io.emit("updateUsers", users);
      });

      socket.on("startNewQuiz", () => {
        users.forEach((user) => {
          user.score = 0;
          user.currentQuestion = 0;
        });
        globalQuestionNumber = 0;

        currentProblem = generateProblem(globalQuestionNumber);
        console.log("Starting new quiz with problem:", currentProblem); // Debug log

        io.emit("newProblem", {
          problem: currentProblem,
          questionNumber: globalQuestionNumber,
        });
        io.emit("updateUsers", users);
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${userUsername}`);
        const index = users.findIndex((u) => u.username === userUsername);
        if (index !== -1) {
          users.splice(index, 1);
        }
        io.emit("updateUsers", users);
      });
    });
  }
  res.end();
};

export default SocketHandler;
