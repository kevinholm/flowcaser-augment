# FlowCaser Deployment Guide

Denne guide hjælper dig med at deploye FlowCaser til produktion.

## 🚀 Hurtig Deployment med Vercel (Anbefalet)

### 1. Forbered Supabase Projekt

1. Gå til [supabase.com](https://supabase.com) og opret et nyt projekt
2. Vent på at projektet er klar (ca. 2 minutter)
3. Gå til SQL Editor og kør indholdet af `supabase/schema.sql`
4. Gå til Storage og opret en bucket kaldet `attachments` med public access
5. Noter din Project URL og anon key fra Settings > API

### 2. Deploy til Vercel

1. Push din kode til GitHub
2. Gå til [vercel.com](https://vercel.com) og log ind
3. Klik "New Project" og vælg dit GitHub repository
4. Tilføj følgende environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key (valgfrit)
```

5. Klik "Deploy"
6. Vent på deployment (ca. 2-3 minutter)

### 3. Konfigurer Supabase Auth

1. Gå til Authentication > URL Configuration i Supabase
2. Tilføj din Vercel URL til "Site URL" og "Redirect URLs"
3. Eksempel: `https://your-app.vercel.app`

### 4. Test Deployment

1. Besøg din Vercel URL
2. Opret en test bruger
3. Opret et team
4. Test alle funktioner

## 🔧 Manuel Deployment

### Forudsætninger

- Node.js 18+
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL certifikat

### 1. Server Setup

```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2
npm install -g pm2

# Installer Nginx
sudo apt update
sudo apt install nginx
```

### 2. Applikation Setup

```bash
# Klon repository
git clone <your-repo-url>
cd flowcaser

# Installer dependencies
npm install

# Byg applikation
npm run build

# Start med PM2
pm2 start npm --name "flowcaser" -- start
pm2 save
pm2 startup
```

### 3. Nginx Konfiguration

Opret `/etc/nginx/sites-available/flowcaser`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktiver site
sudo ln -s /etc/nginx/sites-available/flowcaser /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL med Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Få SSL certifikat
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Tilføj: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔒 Sikkerhed

### Environment Variables

Sørg for at alle følsomme data er i environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (valgfrit)

### Supabase Sikkerhed

1. **Row Level Security**: Allerede aktiveret i schema
2. **API Keys**: Brug kun anon key i frontend
3. **CORS**: Konfigurer allowed origins i Supabase
4. **Rate Limiting**: Aktiveret automatisk i Supabase

### Nginx Sikkerhed

```nginx
# Tilføj til nginx config
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📊 Monitoring

### Vercel Analytics

Tilføj til `next.config.js`:

```javascript
const nextConfig = {
  // ... existing config
  experimental: {
    instrumentationHook: true,
  },
}
```

### Error Tracking

Overvej at tilføje Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

### Performance Monitoring

- Brug Vercel Analytics
- Monitor Supabase dashboard
- Opsæt uptime monitoring

## 🔄 CI/CD

### GitHub Actions

Opret `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Almindelige Problemer

1. **Build Fejl**: Tjek TypeScript errors
2. **Database Forbindelse**: Verificer Supabase credentials
3. **Auth Problemer**: Tjek redirect URLs
4. **Storage Fejl**: Verificer bucket permissions

### Logs

```bash
# Vercel logs
vercel logs

# PM2 logs
pm2 logs flowcaser

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Performance

- Aktiver Next.js Image Optimization
- Brug Vercel Edge Functions for API routes
- Implementer caching strategier
- Optimer database queries

## 📞 Support

For hjælp med deployment:

1. Tjek GitHub Issues
2. Læs Vercel dokumentation
3. Konsulter Supabase docs
4. Kontakt support team

---

**FlowCaser** - Klar til produktion! 🚀
