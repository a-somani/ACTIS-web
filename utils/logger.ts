type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  message: string;
  [key: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function serializeUnknown(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  try {
    return JSON.parse(JSON.stringify(value)) as unknown;
  } catch {
    return String(value);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (isRecord(error)) {
    const message = error.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    const nestedError = error.error;
    if (typeof nestedError === 'string' && nestedError.trim().length > 0) {
      return nestedError;
    }
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return 'Unknown error';
}

function getErrorDetails(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      error: error.message,
      errorName: error.name,
      stack: error.stack,
    };
  }

  if (isRecord(error)) {
    return {
      error: getErrorMessage(error),
      errorData: serializeUnknown(error),
    };
  }

  if (error !== undefined) {
    return { error: String(error) };
  }

  return {};
}

function emit(level: LogLevel, payload: LogPayload) {
  const entry = {
    level,
    ts: new Date().toISOString(),
    ...payload,
  };

  switch (level) {
    case 'error':
      console.error(JSON.stringify(entry));
      break;
    case 'warn':
      console.warn(JSON.stringify(entry));
      break;
    default:
      console.log(JSON.stringify(entry));
  }
}

export const log = {
  info(message: string, data?: Record<string, unknown>) {
    emit('info', { message, ...data });
  },

  warn(message: string, data?: Record<string, unknown>) {
    emit('warn', { message, ...data });
  },

  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    const errorDetails = getErrorDetails(error);
    emit('error', { message, ...errorDetails, ...data });
  },
};
