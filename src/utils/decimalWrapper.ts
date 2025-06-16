import Decimal from 'decimal.js';

/**
 * A wrapper class for decimal.js to handle grade calculations with proper precision
 */
export class DecimalWrapper {
  private value: Decimal;

  constructor(value: number | string | Decimal) {
    this.value = new Decimal(value);
  }

  /**
   * Creates a new DecimalWrapper instance
   */
  static from(value: number | string | Decimal): DecimalWrapper {
    return new DecimalWrapper(value);
  }

  /**
   * Adds another value to this decimal
   */
  plus(value: number | string | Decimal | DecimalWrapper): DecimalWrapper {
    const other = value instanceof DecimalWrapper ? value.value : value;
    return new DecimalWrapper(this.value.plus(other));
  }

  /**
   * Multiplies this decimal by another value
   */
  times(value: number | string | Decimal | DecimalWrapper): DecimalWrapper {
    const other = value instanceof DecimalWrapper ? value.value : value;
    return new DecimalWrapper(this.value.times(other));
  }

  /**
   * Divides this decimal by another value
   */
  dividedBy(value: number | string | Decimal | DecimalWrapper): DecimalWrapper {
    const other = value instanceof DecimalWrapper ? value.value : value;
    return new DecimalWrapper(this.value.dividedBy(other));
  }

  /**
   * Checks if this decimal is greater than or equal to another value
   */
  greaterThanOrEqualTo(value: number | string | Decimal | DecimalWrapper): boolean {
    const other = value instanceof DecimalWrapper ? value.value : value;
    return this.value.greaterThanOrEqualTo(other);
  }

  /**
   * Checks if this decimal is less than or equal to another value
   */
  lessThanOrEqualTo(value: number | string | Decimal | DecimalWrapper): boolean {
    const other = value instanceof DecimalWrapper ? value.value : value;
    return this.value.lessThanOrEqualTo(other);
  }

  /**
   * Gets the number of decimal places
   */
  decimalPlaces(): number {
    return this.value.decimalPlaces();
  }

  /**
   * Formats the decimal to a specific number of decimal places without rounding
   */
  toDecimalPlaces(places: number): DecimalWrapper {
    return new DecimalWrapper(this.value.toFixed(places, Decimal.ROUND_DOWN));
  }

  /**
   * Converts the decimal to a number
   */
  toNumber(): number {
    return this.value.toNumber();
  }

  /**
   * Checks if the decimal is zero
   */
  isZero(): boolean {
    return this.value.isZero();
  }
} 