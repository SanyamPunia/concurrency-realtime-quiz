import { Problem } from "../types";

export const generateProblem = (questionNumber: number): Problem => {
  const operators = ["+", "-", "*"] as const;

  const operator = operators[questionNumber % operators.length];
  const num1 = ((questionNumber * 3) % 20) + 1;
  const num2 = ((questionNumber * 7) % 20) + 1;

  let answer: number;
  let question: string;

  switch (operator) {
    case "+":
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
    case "-":
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
      break;
    case "*":
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
      break;
    default:
      throw new Error("Invalid operator");
  }

  return { question, answer };
};
