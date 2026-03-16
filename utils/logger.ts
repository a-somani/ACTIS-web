type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  message: string;
  [key: string]: unknown;
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
    const errorDetails: Record<string, unknown> = {};

    if (error instanceof Error) {
      errorDetails.error = error.message;
      errorDetails.stack = error.stack;
    } else if (error !== undefined) {
      errorDetails.error = String(error);
    }

    emit('error', { message, ...errorDetails, ...data });
  },
};
