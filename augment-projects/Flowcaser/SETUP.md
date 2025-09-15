# FlowCaser Setup Guide

## 🚀 Hurtig Start

### 1. Installer Node.js
1. Gå til https://nodejs.org/en/download
2. Download "LTS" versionen for Windows
3. Kør installeren og følg instruktionerne
4. Genstart VS Code terminal efter installation

### 2. Verificer Installation
Åbn en ny terminal i VS Code og kør:
```bash
node --version
npm --version
```

### 3. Installer Dependencies
```bash
npm install
```

### 4. Opsæt Environment Variables
1. Kopier `.env.local.example` til `.env.local`
2. Udfyld Supabase credentials (se nedenfor)

### 5. Start Development Server
```bash
npm run dev
```

Åbn http://localhost:3000 i din browser

## 🗄️ Supabase Setup (Valgfrit for demo)

For fuld funktionalitet skal du oprette et Supabase projekt:

1. Gå til https://supabase.com
2. Opret gratis konto
3. Opret nyt projekt
4. Gå til SQL Editor og kør `supabase/schema.sql`
5. Gå til Storage og opret bucket "attachments"
6. Kopier Project URL og API keys til `.env.local`

## 📱 Alle Sider Du Kan Besøge

Når serveren kører kan du navigere til:

- **Dashboard**: http://localhost:3000/dashboard
- **Login**: http://localhost:3000/auth/login
- **Signup**: http://localhost:3000/auth/signup
- **Viden**: http://localhost:3000/knowledge
- **Bugs**: http://localhost:3000/bugs
- **Features**: http://localhost:3000/features
- **Tid**: http://localhost:3000/time
- **Chat**: http://localhost:3000/chat
- **Indstillinger**: http://localhost:3000/settings
- **Notifikationer**: http://localhost:3000/notifications

## 🎯 Demo Mode

Applikationen kan køre i demo mode uden Supabase:
- Alle sider vil være tilgængelige
- Data vil være mock/demo data
- Ingen database funktionalitet

## 🔧 Troubleshooting

**Node.js ikke fundet:**
- Genstart VS Code efter Node.js installation
- Tjek at Node.js er i PATH

**Port 3000 optaget:**
- Applikationen vil automatisk bruge næste ledige port
- Eller stop andre processer på port 3000

**Build fejl:**
- Slet `node_modules` og `.next` mapper
- Kør `npm install` igen
- Kør `npm run dev`

## 📞 Hjælp

Hvis du støder på problemer:
1. Tjek denne guide igen
2. Genstart VS Code terminal
3. Sørg for Node.js er korrekt installeret
