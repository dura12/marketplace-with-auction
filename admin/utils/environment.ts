// Simple environment detection without external dependencies
export const isServer = typeof window === "undefined"
export const isBrowser = typeof window !== "undefined"
export const isProduction = process.env.NODE_ENV === "production"
export const isDevelopment = process.env.NODE_ENV === "development"

