import { combineReducers } from '@reduxjs/toolkit';
import gradesReducer from './gradesSlice';
import subjectsReducer from './subjectsSlice';
import examsReducer from './examsSlice';
import schoolsReducer from './schoolsSlice';

const rootReducer = combineReducers({
  grades: gradesReducer,
  subjects: subjectsReducer,
  exams: examsReducer,
  schools: schoolsReducer,
});

export default rootReducer;
