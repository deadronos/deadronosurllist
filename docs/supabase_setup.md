Supabase Setup for LinkList (T3 Stack)

Overview
- Use Supabase as the managed PostgreSQL database for Prisma.
- Keep NextAuth.js for auth with Discord + Google providers.
- Configure environment variables through `src/env.js` and a local `.env` file.

Prerequisites
- Node.js 18+ and npm
- Supabase account: https://supabase.com/
- Discord Developer account and Google Cloud project for OAuth

1) Create a Supabase Project
- Go to the Supabase dashboard → New Project
- Choose an organization and project name
- Set a strong Database Password (save it)
- Choose a region, then create the project

2) Get the Database Connection String
- In your project, open Database → Connection string → URI
- Copy the Postgres URI (it looks like `postgresql://postgres:<password>@db.<id>.supabase.co:5432/postgres`)
- Set it as `DATABASE_URL` in your local `.env` file

3) Configure Environment Variables
Create a `.env` file in the repository root with the following keys:

AUTH_SECRET="your_long_random_string"
AUTH_DISCORD_ID="your_discord_client_id"
AUTH_DISCORD_SECRET="your_discord_client_secret"
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"
DATABASE_URL="postgresql://postgres:<password>@db.<id>.supabase.co:5432/postgres"

Notes
- `AUTH_SECRET` can be generated via `openssl rand -base64 32` or any random generator.
- All variables are validated in `src/env.js`.

4) Configure Discord OAuth
- Go to https://discord.com/developers/applications → New Application
- Add OAuth2 → Configure a “Web” application
- Authorized redirect URI (local): `http://localhost:3000/api/auth/callback/discord`
- After creating the Client, copy the Client ID and Client Secret into `.env` as `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET`
- For production, add `https://<your-domain>/api/auth/callback/discord` as another redirect URI

5) Configure Google OAuth
- Go to https://console.cloud.google.com/
- Create a project (or select an existing one)
- APIs & Services → Credentials → Create Credentials → OAuth client ID
- Application type: Web application
- Authorized redirect URI (local): `http://localhost:3000/api/auth/callback/google`
- Create and copy the Client ID and Client Secret into `.env` as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
- For production, add `https://<your-domain>/api/auth/callback/google` as another redirect URI

6) Push the Prisma Schema to Supabase
- Ensure `.env` is set
- Install dependencies: `npm install`
- Generate Prisma client and apply schema:

npm run db:generate
npm run db:push

- Optional: open Prisma Studio to inspect data:

npm run db:studio

7) Run the App Locally
- Start dev server:

npm run dev

- Visit `http://localhost:3000`, sign in, then go to `/dashboard`

What This Sets Up
- Database models: `Collection` and `Link` (plus NextAuth models) in Supabase Postgres
- tRPC routers for collections and links with ownership checks
- NextAuth configured with Discord + Google providers

Production (Vercel) Notes
- Set the same env vars in your Vercel project settings
- Use the same `DATABASE_URL` (Supabase project) in Vercel
- Add production OAuth redirect URIs for Discord and Google

Troubleshooting
- Env validation errors during build: re-check `.env` values and names
- Prisma errors: ensure the `DATABASE_URL` is reachable and correct
- OAuth errors: verify redirect URIs exactly match what providers expect

