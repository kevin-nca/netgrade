import db from './db';

const ReduxPersistDb = {
  getItem: (key: string): Promise<string | null> => {
    return db.get(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    return db.set(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    return db.remove(key);
  },
};

export default ReduxPersistDb;
