# flowcaser-augment
# FlowCaser - Dansk SaaS Platform

FlowCaser er en komplet SaaS platform til projektledelse, bug tracking, vidensdeling og team samarbejde på dansk.

## 🚀 Funktioner

### ✅ Implementerede Funktioner

- **🔐 Autentificering**: Komplet login/signup system med Supabase Auth
- **📊 Dashboard**: Oversigt over team aktivitet og statistikker
- **📚 Videns Base**: CRUD for videns cases med søgning og kategorisering
- **🐛 Bug Tracking**: Opret, vis, opdater og slet bugs med status tracking
- **💡 Feature Requests**: Fuld CRUD for feature anmodninger med stemme system
- **⏰ Tidsregistrering**: Log og spor tid på projekter og opgaver
- **💬 AI Chat Assistant**: Intelligent chat der kan svare på spørgsmål om hele systemet
- **⚙️ Indstillinger**: Funktionelle bruger- og team indstillinger
- **🔔 Notifikationer**: Realtime notifikationer via Supabase channels
- **🔍 Global Søgning**: Øjeblikkelig søgning på tværs af alle moduler med ⌘K shortcut
- **🎨 Design System**: Professionelle UI komponenter med konsistent design
- **📊 Advanced Tables**: Sortérbare tabeller med filtrering og pagination
- **⚡ Loading States**: Skeleton loaders og smooth transitions
- **🚨 Error Handling**: Brugervenlige fejlmeddelelser og alerts

### 🏗️ Teknisk Stack

- **Frontend**: React + Vite for hurtig udvikling
- **Styling**: Tailwind CSS med professionelt design system
- **UI Components**: Headless UI for accessibility
- **Database**: Supabase PostgreSQL med Row Level Security
- **Autentificering**: Supabase Auth med team management
- **Realtime**: Supabase Realtime channels
- **AI Service**: Intelligent assistant med kontekstuel søgning
- **State Management**: Zustand for effektiv state management
- **Routing**: React Router for client-side navigation
- **TypeScript**: Type-sikker udvikling
- **TypeScript**: Fuldt typesikret med interfaces
- **Icons**: Heroicons + custom ikoner
- **Notifikationer**: React Hot Toast + custom alerts

## 🛠️ Installation

### Forudsætninger

- Node.js 18+ 
- Supabase projekt

### 1. Klon Repository

```bash
git clone <repository-url>
cd flowcaser
```

### 2. Installer Dependencies

```bash
npm install
```

### 3. Opsæt Environment Variables

Kopier `.env.local.example` til `.env.local` og udfyld:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Opsæt Supabase Database

Kør SQL scriptet i `supabase/schema.sql` i din Supabase SQL editor:

```sql
-- Kør indholdet af supabase/schema.sql
```

### 5. Start Development Server

```bash
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000) i din browser.

## 📁 Projekt Struktur

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Autentificering sider
│   ├── dashboard/         # Dashboard
│   ├── knowledge/         # Videns base
│   ├── bugs/              # Bug tracking
│   ├── features/          # Feature requests
│   ├── time/              # Tidsregistrering
│   ├── chat/              # Chat system
│   └── settings/          # Indstillinger
├── components/            # React komponenter
│   ├── layout/           # Layout komponenter
│   └── providers/        # Context providers
├── lib/                  # Utility funktioner
│   ├── supabase.ts       # Supabase konfiguration
│   └── auth.ts           # Auth hjælpefunktioner
└── middleware.ts         # Next.js middleware
```

## 🗄️ Database Schema

Databasen består af følgende hovedtabeller:

- `users` - Bruger profiler
- `teams` - Team information
- `knowledge_cases` - Videns cases
- `bugs` - Bug rapporter
- `feature_requests` - Feature anmodninger
- `time_logs` - Tidsregistreringer
- `chat_messages` - Chat beskeder
- `comments` - Kommentarer
- `notifications` - Notifikationer
- `file_attachments` - Fil vedhæftninger

Alle tabeller har Row Level Security (RLS) aktiveret for team-baseret adgangskontrol.

## 🔒 Sikkerhed

- **Row Level Security**: Alle data er isoleret per team
- **Autentificering**: Supabase Auth med JWT tokens
- **Middleware**: Beskytter ruter og redirecter
- **Type Safety**: TypeScript for compile-time sikkerhed

## 🚀 Deployment

### Vercel (Anbefalet)

1. Push koden til GitHub
2. Forbind repository til Vercel
3. Tilføj environment variables
4. Deploy automatisk

### Andre Platforme

Platformen kan deployes på enhver Node.js hosting service der understøtter Next.js.

## 📝 Brug

### Første Gang Setup

1. Opret en konto på `/auth/signup`
2. Log ind på `/auth/login`
3. Opret et team i indstillinger
4. Inviter team medlemmer
5. Start med at oprette videns cases, bugs eller features

### Daglig Brug

- **Dashboard**: Se oversigt over team aktivitet
- **Viden**: Opret og søg i videns cases
- **Bugs**: Rapporter og spor bugs
- **Features**: Foreslå og stem på nye funktioner
- **Tid**: Registrer arbejdstid
- **Chat**: Kommuniker med team eller AI
- **Indstillinger**: Administrer profil og team

## 🤝 Bidrag

1. Fork projektet
2. Opret en feature branch
3. Commit dine ændringer
4. Push til branchen
5. Åbn en Pull Request

## 📄 Licens

Dette projekt er licenseret under MIT License.

## 🆘 Support

For hjælp og support, opret venligst et issue i GitHub repository.

---

**FlowCaser** - Effektiv projektledelse på dansk 🇩🇰
