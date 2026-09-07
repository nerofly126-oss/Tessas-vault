# Tessa's Vault

A personal photo and video memory vault with a Next.js frontend and Express/MongoDB API.

## Setup

1. Copy `.env.example` to `server/.env` and fill in MongoDB and Cloudinary credentials. Generate the admin password hash with `npx bcrypt-cli <password> 12` or a small bcrypt script.
2. In `client/.env.local`, add `NEXT_PUBLIC_API_URL=http://localhost:4000/api` (it is also shown in `.env.example`).
3. Install dependencies: `npm install`
4. Start both applications: `npm run dev`
5. Open `http://localhost:3000` and sign in with `ADMIN_EMAIL` and its matching password.

The web app runs on port 3000 and the API on port 4000. Cloudinary holds original media; MongoDB holds only metadata.
