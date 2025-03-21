import { Storage } from '@ionic/storage';

const db = new Storage();

const initDB = async () => {
  console.log('Initializing DB...');
  await db.create();
};

initDB().then(() => {
  console.log('Done.');
});

export default db;
