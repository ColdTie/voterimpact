import logger from './logger';

const REQUIRED_VARS = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY',
];

const OPTIONAL_VARS = [
  'REACT_APP_API_URL',
  'REACT_APP_CONGRESS_API_KEY',
  'REACT_APP_OPENSTATES_API_KEY',
];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    const message =
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `The app will not function correctly. See .env.example for setup.`;
    logger.error(message);
    return { ok: false, missing };
  }

  const missingOptional = OPTIONAL_VARS.filter((name) => !process.env[name]);
  if (missingOptional.length > 0) {
    logger.warn(
      `Optional environment variables not set: ${missingOptional.join(', ')}. ` +
        `Some features may use fallbacks or sample data.`
    );
  }

  return { ok: true, missing: [] };
}

export default validateEnv;
