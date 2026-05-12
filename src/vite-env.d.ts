/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  readonly VITE_GOOGLE_PRIVATE_KEY: string;
  readonly VITE_SPREADSHEET_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
