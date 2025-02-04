export type CurrencyCode = string;

export type APIResponse = {
  date: string;
  [key: CurrencyCode]: any; // This allows for dynamic currency keys
};