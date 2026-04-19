const isProduction = process.env.NODE_ENV === 'production';
const debugEnabled = process.env.REACT_APP_DEBUG === 'true';

const shouldLog = !isProduction || debugEnabled;

export const logger = {
  log: (...args) => {
    if (shouldLog) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  info: (...args) => {
    if (shouldLog) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },
  debug: (...args) => {
    if (shouldLog) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  },
  warn: (...args) => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  error: (...args) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
};

export default logger;
