import { create } from 'zustand';

interface Quiz {
  id: string;
  title: string;
  questions: number;
  completed: boolean;
}

interface QuizState {
  quizzes: Quiz[];
  addQuiz: (quiz: Quiz) => void;
  removeQuiz: (quizId: string) => void;
  toggleQuizCompletion: (quizId: string) => void;
}

const useQuizStore = create<QuizState>((set: (fn: (state: QuizState) => QuizState) => void) => ({
  quizzes: [],
  addQuiz: (quiz: Quiz) =>
    set((state: QuizState) => ({
      ...state,
      quizzes: [...state.quizzes, quiz],
    })),
  removeQuiz: (quizId: string) =>
    set((state: QuizState) => ({
      ...state,
      quizzes: state.quizzes.filter(quiz => quiz.id !== quizId),
    })),
  toggleQuizCompletion: (quizId: string) =>
    set((state: QuizState) => ({
      ...state,
      quizzes: state.quizzes.map(quiz =>
        quiz.id === quizId ? { ...quiz, completed: !quiz.completed } : quiz
      ),
    })),
}));

export default useQuizStore;
