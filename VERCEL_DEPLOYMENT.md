# Vercel Deployment Guide

## Frontend Deployment (Vercel)

### 1. Deploy Frontend Only
- Connect your GitHub repo to Vercel
- Set **Root Directory** to `frontend`
- Set **Build Command** to `npm run build`
- Set **Output Directory** to `dist`

### 2. Environment Variables
Add these in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.herokuapp.com/api
VITE_SOCKET_URL=https://your-backend-url.herokuapp.com
```

### 3. Backend Deployment
Deploy backend separately to:
- Heroku
- Railway
- Render
- Or any Node.js hosting service

### 4. Update Environment Variables
After backend is deployed, update frontend env vars with actual backend URL.

## Quick Fix for Current Issue

1. **Redeploy with correct settings:**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Or use Vercel CLI:**
```bash
cd frontend
vercel --prod
```

## Alternative: Deploy Both Together

If you want to deploy both frontend and backend on Vercel:
1. Use Vercel's serverless functions for backend
2. Move backend code to `/api` folder
3. Update frontend to use relative API paths
