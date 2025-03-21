import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export interface Grade {
  id: string;
  examName: string;
  date: string;
  weight: number;
  score: number;
  counts: boolean;
  comment: string;
  subject: string;
}

interface GradesState {
  [schoolId: string]: Grade[];
}

const initialState: GradesState = {};

const gradesSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    addGrade: (
      state,
      action: PayloadAction<{ schoolId: string; grade: Omit<Grade, 'id'> }>,
    ) => {
      const { schoolId, grade } = action.payload;
      if (!state[schoolId]) {
        state[schoolId] = [];
      }

      state[schoolId].push({ ...grade, id: uuidv4() });
    },
    deleteGrade: (
      state,
      action: PayloadAction<{ schoolId: string; gradeId: string }>,
    ) => {
      const { schoolId, gradeId } = action.payload;
      if (state[schoolId]) {
        state[schoolId] = state[schoolId].filter(
          (grade) => grade.id !== gradeId,
        );
      }
    },
    updateGrade: (
      state,
      action: PayloadAction<{
        schoolId: string;
        gradeId: string;
        updatedGrade: Grade;
      }>,
    ) => {
      const { schoolId, gradeId, updatedGrade } = action.payload;
      if (state[schoolId]) {
        const index = state[schoolId].findIndex(
          (grade) => grade.id === gradeId,
        );
        if (index !== -1) {
          state[schoolId][index] = updatedGrade;
        }
      }
    },
  },
});

export const { addGrade, deleteGrade, updateGrade } = gradesSlice.actions;
export default gradesSlice.reducer;
