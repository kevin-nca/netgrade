import { DataSource, DataSourceOptions, Repository } from 'typeorm'; // Import Repository
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Exam, Grade, School, Semester, Subject } from './entities';
import localforage from 'localforage';

// @ts-expect-error SQL.js is not typed
import initSqlJs from 'sql.js';

// Migrations
import { Initdb1745319232244 } from './migrations/1745319232244-initdb';
import { DropDescriptionFromSubject1761134134122 } from './migrations/1761134134122-drop_description_from_subject';
import { AddSemester1745400000000 } from '@/db/migrations/1745400000000-add-semester';

// Reference: https://github.com/sql-js/react-sqljs-demo/blob/master/src/App.js
(window as { localforage?: typeof localforage }).localforage = localforage;
// Make SQL.js available globally for TypeORM
(window as unknown as { SQL: unknown }).SQL = null;

const DATABASE_NAME = 'netgrade-db';
const BROWSER_DB_LOCATION = 'netgrade-db-browser';

export const ENTITIES = [Exam, Grade, School, Subject, Semester];

let AppDataSource: DataSource | null = null;

interface AppRepositories {
  exam: Repository<Exam>;
  grade: Repository<Grade>;
  school: Repository<School>;
  subject: Repository<Subject>;
  semester: Repository<Semester>;
}

let repositories: AppRepositories | null = null;

const initializeNativeDb = async (): Promise<DataSourceOptions> => {
  console.log('Initializing Native SQLite DB Connection...');

  const sqliteConnection = new SQLiteConnection(CapacitorSQLite);

  await CapacitorSQLite.checkConnectionsConsistency({
    dbNames: [], // i.e. "i expect no connections to be open"
    openModes: [],
  }).catch((e) => {
    // the plugin throws an error when closing connections. we can ignore
    // that since it is expected behaviour
    console.error(e);
    return {};
  });

  // Now create a new connection as usual
  console.log('Native SQLite DB opened successfully.');

  return {
    type: 'capacitor',
    driver: sqliteConnection,
    database: DATABASE_NAME,
    entities: ENTITIES,
    synchronize: false, // DEV ONLY
    logging: ['error', 'warn', 'query'],
    migrationsRun: true,
    migrations: [
      Initdb1745319232244,
      DropDescriptionFromSubject1761134134122,
      AddSemester1745400000000,
    ],
    migrationsTableName: 'migrations',
    mode: 'no-encryption',
  };
};

const initializeWebDb = async (): Promise<DataSourceOptions> => {
  console.log('Initializing Web SQL.js DB Connection...');

  // Initialize sql.js explicitly before TypeORM tries to use it
  // Specify the location of the wasm file to ensure it's loaded correctly
  const SQL = await initSqlJs({
    locateFile: (file: string) => `./node_modules/sql.js/dist/${file}`,
  });

  // Make SQL.js available globally for TypeORM
  (window as unknown as { SQL: unknown }).SQL = SQL;

  return {
    type: 'sqljs',
    location: BROWSER_DB_LOCATION,
    entities: ENTITIES,
    synchronize: true,
    logging: ['error', 'warn', 'query'],
    autoSave: true,
    useLocalForage: true,
    driver: SQL, // Provide the SQL.js instance directly to the driver
    sqlJsConfig: {
      // Provide the initialized SQL.js instance
      SqlJsStatic: SQL,
    },
  };
};

export const initializeDatabase = async (): Promise<DataSource> => {
  if (AppDataSource?.isInitialized) {
    console.log('Database already initialized.');
    return AppDataSource;
  }
  if (AppDataSource) {
    // Handle case where DataSource exists but is not initialized (e.g., previous attempt failed)
    console.warn(
      'DataSource exists but is not initialized. Re-initializing...',
    );
  }

  try {
    const isNative = Capacitor.isNativePlatform();
    const options = isNative
      ? await initializeNativeDb()
      : await initializeWebDb();
    console.log(`Using ${isNative ? 'Native SQLite' : 'Web SQL.js'} driver.`);

    AppDataSource = new DataSource(options);
    await AppDataSource.initialize();
    console.log('Data Source has been initialized successfully.');

    repositories = {
      exam: AppDataSource.getRepository(Exam),
      grade: AppDataSource.getRepository(Grade),
      school: AppDataSource.getRepository(School),
      subject: AppDataSource.getRepository(Subject),
      semester: AppDataSource.getRepository(Semester),
    };
    console.log('Repositories initialized.');

    // Optional: Run migrations or seed data here
    // await runMigrations(AppDataSource);
    // await seedDatabase(repositories); // Pass repositories if needed

    return AppDataSource;
  } catch (err) {
    console.error('Error during Data Source initialization:', err);
    AppDataSource = null;
    repositories = null;
    throw err;
  }
};

export const getRepositories = (): AppRepositories => {
  if (!repositories) {
    throw new Error(
      'Repositories are not initialized. Call initializeDatabase first and ensure it succeeded.',
    );
  }
  return repositories;
};

/**
 * Gets the initialized DataSource instance
 * @returns DataSource - The initialized DataSource instance
 * @throws Error if DataSource is not initialized
 */
export const getDataSource = (): DataSource => {
  if (!AppDataSource || !AppDataSource.isInitialized) {
    throw new Error(
      'DataSource is not initialized. Call initializeDatabase first and ensure it succeeded.',
    );
  }
  return AppDataSource;
};
