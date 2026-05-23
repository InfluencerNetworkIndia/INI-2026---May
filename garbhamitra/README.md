# GarbhaMitra 🌸

AI-powered Indian pregnancy nutrition tracking platform. Chat to log food, get personalised targets, and receive WhatsApp reminders — all tailored to Indian food culture and maternal health.

## Tech stack

- **Framework**: Next.js 16.2 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Claude API (claude-sonnet-4-6) via Anthropic SDK
- **Cache / sessions**: Upstash Redis
- **Messaging**: Meta WhatsApp Cloud API
- **UI**: Tailwind CSS v4, Framer Motion, Recharts

---

## Environment variables

Create `garbhamitra/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# WhatsApp (Meta Cloud API)
WHATSAPP_VERIFY_TOKEN=your-random-verify-token
WHATSAPP_ACCESS_TOKEN=your-meta-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# Cron security (Vercel cron jobs)
CRON_SECRET=your-random-cron-secret
```

---

## Local setup

```bash
cd garbhamitra
npm install
```

### 1. Run Supabase migration

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

The migration file is at `supabase/migrations/001_initial_schema.sql`.

### 2. Seed the food database

```bash
npm run seed:foods
```

Seeds 75 verified Indian food items. Idempotent — safe to run multiple times.

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## User journey

1. **Sign up** — enter mobile number → receive OTP → verify
2. **Onboarding** — 10-step wizard: personal info, pregnancy week, body metrics, food preference, health conditions, allergies, routine, supplements, doctor notes
3. **Dashboard** — personalised nutrient rings, calorie bar, alerts, weekly chart; auto-refreshes every 30s
4. **Log food** — conversational AI chat: *"Had 2 rotis with palak paneer for lunch"*
5. **History** — weekly calendar with per-day summaries and meal logs; PDF export via `window.print()`
6. **Profile** — update pregnancy week, health conditions, supplements; recalculate targets; sign out

---

## WhatsApp bot setup

### 1. Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create App → Business type → Add WhatsApp product
3. Note your **Phone Number ID** and generate a **Permanent Access Token**

### 2. Configure webhook

Expose your local server:
```bash
npx ngrok http 3000
```

In Meta Developer Console:
- Webhook URL: `https://your-ngrok-url/api/whatsapp`
- Verify token: matches `WHATSAPP_VERIFY_TOKEN` in `.env.local`
- Subscribe to: `messages`

### 3. Test commands

| Message | Response |
|---------|----------|
| `"Had 2 idlis and sambar for breakfast"` | Logs food with nutrients |
| `"summary"` / `"aaj ka"` | Today's nutrition summary |
| `"targets"` | Personalised daily targets |
| `"weight 62 kg"` | Logs weight |
| `"help"` | Command list |

New users go through a 5-question WhatsApp onboarding automatically.

---

## Scheduled reminders

Vercel cron jobs (configured in `vercel.json`):

| IST time | Type | Action |
|----------|------|--------|
| 8:00 AM | `morning` | Supplement reminder + breakfast prompt |
| 3:00 PM | `hydration` | Water check (users below 50% target) |
| 9:00 PM | `evening_summary` | Full daily nutrition summary |

Trigger manually:
```bash
curl -X POST "http://localhost:3000/api/reminders?type=morning" \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Project structure

```
garbhamitra/
├── app/
│   ├── (app)/            # Authenticated pages
│   │   ├── dashboard/    # Live nutrition dashboard
│   │   ├── log/          # Conversational food logging
│   │   ├── history/      # Weekly meal history
│   │   └── profile/      # User profile & settings
│   ├── (auth)/login/     # Phone OTP login
│   └── api/
│       ├── chat/         # AI food logging
│       ├── dashboard/    # Dashboard data
│       ├── logs/         # Food log CRUD
│       ├── onboarding/   # Profile setup
│       ├── profile/      # Profile updates
│       ├── whatsapp/     # Meta webhook
│       └── reminders/    # Cron notifications
├── components/
│   ├── dashboard/        # Dashboard UI (8 components)
│   └── logging/          # Chat UI (5 components)
├── hooks/useChat.ts      # Chat state management
├── lib/
│   ├── ai/               # FoodLogger + prompts
│   ├── nutrition/        # Targets, safety, alerts, score, summary
│   ├── supabase/         # Browser + server clients
│   └── whatsapp/         # Handler, sender, formatters
├── scripts/seedFoods.ts  # Indian food database seed (75 items)
├── supabase/migrations/  # PostgreSQL schema + RLS
├── types/index.ts        # Shared TypeScript types
└── vercel.json           # Cron configuration
```

---

## Performance

- Dashboard: server-side fetch, < 2s initial load
- Food logging: Anthropic API typically < 3s
- WhatsApp response: within Meta's 15s webhook timeout
- Redis TTL: chat sessions 2h, WhatsApp sessions 24h, dedup 60s
