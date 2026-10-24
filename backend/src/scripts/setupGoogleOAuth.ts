import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const PORT = 5005;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

function promptUser(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

function updateEnvFile(key: string, value: string) {
  const envPath = path.resolve(process.cwd(), '.env');
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}=${value}`;

  if (regex.test(content)) {
    content = content.replace(regex, newLine);
  } else {
    content = content.trimEnd() + `\n${newLine}\n`;
  }

  fs.writeFileSync(envPath, content, 'utf8');
}

async function main() {
  console.log('\n======================================================');
  console.log('🚀 GOOGLE DRIVE PERSONAL ACCOUNT (OAUTH2) SETUP');
  console.log('======================================================\n');
  console.log('This will link your personal Google Drive (15 GB storage)');
  console.log('so you can upload PDF quotes & documents without 0MB quota limits.\n');

  let clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId) {
    clientId = await promptUser('1. Enter your Google OAuth Client ID: ');
  } else {
    console.log('Found GOOGLE_CLIENT_ID in .env');
  }

  if (!clientSecret) {
    clientSecret = await promptUser('2. Enter your Google OAuth Client Secret: ');
  } else {
    console.log('Found GOOGLE_CLIENT_SECRET in .env');
  }

  if (!clientId || !clientSecret) {
    console.error('❌ Error: Both Client ID and Client Secret are required.');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive'],
  });

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url && req.url.startsWith('/oauth2callback')) {
        const queryParams = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
        const code = queryParams.get('code');

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h3>Authorization code missing. Please try again.</h3>');
          return;
        }

        const { tokens } = await oauth2Client.getToken(code);
        const refreshToken = tokens.refresh_token;

        if (!refreshToken) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(
            '<h3>⚠️ No refresh token returned.</h3><p>Make sure prompt was consent and access_type was offline. Please re-run the script.</p>'
          );
          process.exit(1);
        }

        // Save to .env
        updateEnvFile('GOOGLE_CLIENT_ID', clientId);
        updateEnvFile('GOOGLE_CLIENT_SECRET', clientSecret);
        updateEnvFile('GOOGLE_REFRESH_TOKEN', refreshToken);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <div style="font-family: system-ui, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #10b981;">✅ Authorization Successful!</h1>
            <p>Your personal Google Drive is now connected with full 15 GB upload permissions.</p>
            <p>You can close this tab and return to your terminal.</p>
          </div>
        `);

        console.log('\n======================================================');
        console.log('🎉 SUCCESS: Google Drive OAuth2 credentials saved to .env!');
        console.log('GOOGLE_CLIENT_ID saved.');
        console.log('GOOGLE_CLIENT_SECRET saved.');
        console.log('GOOGLE_REFRESH_TOKEN saved.');
        console.log('======================================================\n');
        console.log('Your website can now upload unlimited PDFs & briefs to Drive!');

        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1000);
      }
    } catch (err: any) {
      console.error('Callback error:', err.message);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h3>Error: ${err.message}</h3>`);
    }
  });

  server.listen(PORT, () => {
    console.log('\n👉 Open this link in your browser to authorize your Google Drive:');
    console.log('\n\x1b[36m' + authUrl + '\x1b[0m\n');
    console.log('Waiting for approval in browser...\n');
  });
}

main().catch(console.error);
