import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export type Subject = {
  id: string;
  name: string;
};

interface SubjectsState {
  [schoolId: string]: Subject[];
}

const initialState: SubjectsState = {};

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    addSubject: (
      state,
      action: PayloadAction<{ schoolId: string; subjectName: string }>,
    ) => {
      const { schoolId, subjectName } = action.payload;
      if (!state[schoolId]) {
        state[schoolId] = [];
      }
      if (!state[schoolId].some((s) => s.name === subjectName)) {
        state[schoolId].push({
          id: uuidv4(),
          name: subjectName,
        });
      }
    },
    removeSubject: (
      state,
      action: PayloadAction<{ schoolId: string; subjectId: string }>,
    ) => {
      const { schoolId, subjectId } = action.payload;
      state[schoolId] =
        state[schoolId]?.filter((s) => s.id !== subjectId) || [];
    },
  },
});

export const { addSubject, removeSubject } = subjectsSlice.actions;
export default subjectsSlice.reducer;
