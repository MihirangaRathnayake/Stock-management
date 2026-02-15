export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function requireString(value: unknown, field: string, maxLength = 120): string {
  if (typeof value !== "string") throw new ValidationError(`${field} is required`);
  const trimmed = value.trim();
  if (!trimmed) throw new ValidationError(`${field} is required`);
  if (trimmed.length > maxLength) throw new ValidationError(`${field} exceeds ${maxLength} chars`);
  return trimmed;
}

export function optionalString(value: unknown, maxLength = 250): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new ValidationError(`Text exceeds ${maxLength} chars`);
  return trimmed;
}

export function requireNumber(value: unknown, field: string, min = 0): number {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new ValidationError(`${field} must be a number`);
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) throw new ValidationError(`${field} must be a valid number`);
  if (numeric < min) throw new ValidationError(`${field} must be >= ${min}`);
  return numeric;
}

export function requireInteger(value: unknown, field: string, min = 1): number {
  const numeric = requireNumber(value, field, min);
  if (!Number.isInteger(numeric)) throw new ValidationError(`${field} must be an integer`);
  return numeric;
}

export function requireDate(value: unknown, field: string): string {
  const text = requireString(value, field, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new ValidationError(`${field} must be YYYY-MM-DD`);
  }
  const d = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${field} invalid date`);
  return text;
}

export function requireEnum<T extends string>(value: unknown, field: string, options: T[]): T {
  const text = requireString(value, field, 40) as T;
  if (!options.includes(text)) {
    throw new ValidationError(`${field} must be one of: ${options.join(", ")}`);
  }
  return text;
}

export function cleanQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

export function toIsoNow(): string {
  return new Date().toISOString();
}
