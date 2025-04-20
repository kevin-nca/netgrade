import { ValueTransformer } from 'typeorm';

/**
 * A TypeORM ValueTransformer for handling Date properties mapped to 'date' database columns.
 *
 * This transformer converts JavaScript `Date` objects to 'YYYY-MM-DD' strings when saving to the database
 * and converts the string representation back to a `Date` object when loading from the database.
 *
 * This is necessary because in some scenarios, particularly when fetching entities
 * using the `transactionManager` (e.g., `transactionManager.findOne`), TypeORM might not
 * automatically perform the type conversion from the database string representation back
 * to a JavaScript `Date` object, potentially returning a string instead. This transformer
 * ensures the `date` property is consistently a `Date` object in the application code.
 */
export const dateTransformer: ValueTransformer = {
  to: (value: Date | null | undefined): string | null => {
    // Convert Date to a string format suitable for your DB (e.g., ISO string)
    if (value instanceof Date && !isNaN(value.getTime())) {
      // 'YYYY-MM-DD'
      return value.toISOString().split('T')[0];
    }
    return null;
  },
  from: (value: string | null | undefined): Date | null => {
    // Convert string from DB back to Date
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return null;
  },
};
