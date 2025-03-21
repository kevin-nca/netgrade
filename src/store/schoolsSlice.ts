//schoolSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

type School = {
  id: string;
  name: string;
};

//todo interface type

type SchoolState = {
  schools: School[];
};

const initialState: SchoolState = {
  schools: [],
};

const schoolsSlice = createSlice({
  name: 'schools',
  initialState,
  reducers: {
    addSchool: (state, action: PayloadAction<string>) => {
      state.schools.push({ id: uuidv4(), name: action.payload });
    },
    removeSchool: (state, action: PayloadAction<string>) => {
      state.schools = state.schools.filter(
        (school) => school.id !== action.payload,
      );
    },
  },
});

export const { addSchool, removeSchool } = schoolsSlice.actions;
export default schoolsSlice.reducer;
