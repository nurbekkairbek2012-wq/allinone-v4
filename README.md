# IELTS AllInOne v0.2

Smart IELTS preparation platform — Future Code 2026.
Built by Қайырбек Нұрбек, NIS IB Astana.

## Setup

```bash
npm install
npm run dev
```

## Environment variables

Create `.env` in root:
```
VITE_GEMINI_API_KEY=your_gemini_key_here
```

## Supabase setup

1. Go to your Supabase project → SQL Editor
2. Run the full contents of `supabase_schema.sql`
3. Done — auth, profiles, scores, leaderboard all work automatically

## Adding audio

Place your MP4/MP3 in `/public/audio/listening_test_1.mp4`
Then in `src/pages/Listening.jsx` change:
```js
const AUDIO_SRC = null
// to:
const AUDIO_SRC = '/audio/listening_test_1.mp4'
```

## Deploy

```bash
npm run build
# push to GitHub → connect to vercel.com
```
