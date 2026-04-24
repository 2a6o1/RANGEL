import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const credentials = {
  type: "service_account",
  project_id: "gallery-8333e",
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)}`
};

fs.writeFileSync('./credentials.json', JSON.stringify(credentials, null, 2));
console.log("✅ credentials.json generado.");
