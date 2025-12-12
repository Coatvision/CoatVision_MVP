# Deployment til Render - Norsk Guide

## Oversikt

Dette er deployment-konfigurasjon for CoatVision til Render. Alle nødvendige filer er nå opprettet og klare for deployment.

## Hva er inkludert?

### Nye filer opprettet:

1. **`render.yaml`** - Blueprint for automatisk deployment av alle tjenester
2. **`backend/build.sh`** - Build-script for backend
3. **`backend/Dockerfile`** - Docker-konfigurasjon (valgfri)
4. **`backend/.dockerignore`** - Filene Docker skal ignorere
5. **`frontend/package.json`** - Frontend dependencies og scripts
6. **`frontend/vite.config.js`** - Vite build-konfigurasjon
7. **`frontend/index.html`** - HTML entry point
8. **`frontend/.eslintrc.json`** - ESLint konfigurasjon
9. **`DEPLOYMENT.md`** - Komplett deployment guide (engelsk)
10. **`QUICK_DEPLOY.md`** - Rask deployment guide (engelsk)
11. **`Procfile`** - Alternativ deployment-konfigurasjon

### Oppdaterte filer:

- **`backend/requirements.txt`** - Lagt til `requests` for health checks

## Hvordan deploye til Render

### Metode 1: Blueprint (Anbefalt)

Dette er den enkleste måten - Render setter opp alt automatisk:

1. **Push koden til GitHub:**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Deploy via Render Dashboard:**
   - Gå til [Render Dashboard](https://dashboard.render.com)
   - Klikk "New +" → "Blueprint"
   - Koble til GitHub repository
   - Velg `Coatvision/CoatVision_MVP`
   - Render vil automatisk finne `render.yaml`
   - Klikk "Apply" for å deploye

3. **Tjenester som opprettes:**
   - **coatvision-backend** - FastAPI backend (Web Service)
   - **coatvision-dashboard** - React frontend (Static Site)

### Metode 2: Manuell deployment

Hvis du foretrekker å deploye tjenester individuelt, følg instruksjonene i `DEPLOYMENT.md`.

## Environment Variables

Etter deployment, legg til disse i Render Dashboard:

### For Backend:
- `SECRET_KEY` - Genereres automatisk av Render
- `OPENAI_API_KEY` - Din OpenAI API-nøkkel (valgfri)
- `DATABASE_URL` - Database URL (valgfri, bruker SQLite som standard)

### For Frontend:
- `VITE_API_URL` - Settes automatisk fra backend URL

## Verifisering

Etter deployment, sjekk:

- Backend health: `https://coatvision-backend.onrender.com/health`
- Backend API: `https://coatvision-backend.onrender.com/`
- Frontend: `https://coatvision-dashboard.onrender.com/`

## Mobil App

Mobil-appen (React Native/Expo) deployes **ikke** til Render. Den skal:
- Brukes med Expo Go for utvikling
- Bygges med EAS Build for produksjon
- Distribueres via App Store/Google Play

For å koble mobil-appen til deployed backend, oppdater:
```
EXPO_PUBLIC_API_URL=https://coatvision-backend.onrender.com
```

## VSCode-problem løst

Problemet med at VSCode henger seg opp er løst fordi:
- Deployment skjer via Render's plattform, ikke VSCode
- Du trenger bare å pushe koden til GitHub
- Render håndterer resten automatisk

## Kostnader

### Gratis tier:
- Backend: 750 timer/måned gratis
- Frontend: Ubegrenset (100 GB/måned)
- Database: Gratis i 90 dager

### Betalt:
- Fra $7/måned per tjeneste for always-on deployment

## Neste steg

1. ✅ Push alle filer til GitHub
2. ✅ Gå til Render Dashboard
3. ✅ Opprett Blueprint deployment
4. ✅ Konfigurer environment variables
5. ✅ Verifiser at alt fungerer

## Støtte

- Se `DEPLOYMENT.md` for full dokumentasjon
- Se `QUICK_DEPLOY.md` for rask guide
- Render dokumentasjon: https://render.com/docs

## Oppsummering av endringer

Denne deployment-konfigurasjonen inkluderer:

✅ **Komplett system klart for deployment**
- Backend med alle nødvendige filer
- Frontend med package.json og build-config
- Automatisk deployment via render.yaml
- Dockerfile for alternativ deployment
- Komplett dokumentasjon

✅ **Ingen manuelle steg nødvendig i VSCode**
- Alt gjøres via Render Dashboard
- Push til GitHub og deploy derfra

✅ **Production-ready konfigurasjon**
- Health checks konfigurert
- Environment variables definert
- CORS konfigurert
- SPA routing støttet

Alt er nå klart for deployment! 🚀
