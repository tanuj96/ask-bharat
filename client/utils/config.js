export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  environment: import.meta.env.VITE_ENV,
  isProduction: import.meta.env.VITE_ENV === 'production',
  
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  googleAnalyticsId: import.meta.env.VITE_GA_ID
}