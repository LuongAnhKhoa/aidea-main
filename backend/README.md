# Aldea backend

Express API foundation for the React frontend. Supabase Auth owns passwords and sessions; protected API requests use the user's Supabase access token and the publishable key, so database row-level security remains in effect.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
3. In the Supabase SQL Editor, run `supabase/migrations/001_profiles.sql`, `supabase/migrations/002_project_drafts.sql`, `supabase/migrations/003_project_draft_product_info.sql`, and `supabase/migrations/004_project_analyses.sql`.
4. In `frontend/`, copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Configure the Supabase Auth site URL and redirect URLs for `http://localhost:5173` (and the production site when deployed).
6. If using Google or Facebook sign-in, enable that provider and configure its provider credentials and callback URL in Supabase.
7. Run `npm install`, then `npm run dev` in this directory. Run the frontend separately with `npm run dev` from `frontend/`.

The frontend uses the publishable key only. Do not put a Supabase secret/service-role key or an AI provider key in frontend environment variables.

## Audio transcription

Audio uploads are sent by the backend to OpenAI's audio transcription API. Set `OPENAI_API_KEY` in `backend/.env`; the default model is `gpt-4o-mini-transcribe` and can be overridden with `OPENAI_TRANSCRIPTION_MODEL`. Uploads are limited to 25 MB and Vietnamese is selected as the transcription language. The provider may charge for usage.

For local testing without Supabase, set `TRANSCRIPTION_ALLOW_LOCAL_DEV=true` in `backend/.env`, restart the backend, and open `http://localhost:5173/ai-tools?localTest=1`. This bypass applies only to that local development origin, the local-test request header, and non-production backend mode. Do not enable it in production.

Direct microphone recognition uses the browser's Web Speech API and Vietnamese (`vi-VN`); it requires a supported browser (for example, current Chrome or Edge), microphone permission, and may rely on the browser vendor's online speech service. Recognized text is editable and is not automatically saved to the project draft.

## API

- `GET /api/v1/drafts/current` returns the authenticated user's project draft.
- `PUT /api/v1/drafts/current` creates or updates the authenticated user's draft.

- `GET /api/v1/health` reports whether required Supabase environment variables exist.
- `GET /api/v1/me` requires `Authorization: Bearer <Supabase access token>` and returns the authenticated user and their profile.

Run `npm test` for API foundation checks. The health endpoint works before Supabase is configured; authenticated endpoints require a configured project.
