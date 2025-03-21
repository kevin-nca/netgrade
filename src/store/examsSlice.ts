import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface Exam {
  id: string;
  title: string;
  date: string;
  subject: string;
  description: string;
}

interface ExamsState {
  exams: Exam[];
}

const loadExamsFromLocalStorage = (): ExamsState => {
  const exams = localStorage.getItem('exams');
  return {
    exams: exams ? JSON.parse(exams) : [],
  };
};

const initialState: ExamsState = loadExamsFromLocalStorage();

const examsSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {
    addExam: (state, action: PayloadAction<Omit<Exam, 'id'>>) => {
      const newExam = { ...action.payload, id: uuidv4() };
      state.exams.push(newExam);
      localStorage.setItem('exams', JSON.stringify(state.exams));
    },
    updateExam: (state, action: PayloadAction<Exam>) => {
      const index = state.exams.findIndex(
        (exam) => exam.id === action.payload.id,
      );
      if (index !== -1) {
        state.exams[index] = action.payload;
        localStorage.setItem('exams', JSON.stringify(state.exams));
      }
    },
    deleteExam: (state, action: PayloadAction<string>) => {
      state.exams = state.exams.filter((exam) => exam.id !== action.payload);
      localStorage.setItem('exams', JSON.stringify(state.exams));
    },
  },
});

export const { addExam, updateExam, deleteExam } = examsSlice.actions;
export default examsSlice.reducer;
