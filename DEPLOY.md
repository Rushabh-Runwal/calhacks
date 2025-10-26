# Deployment Guide: Vercel + Render

## Overview
- **Frontend**: Deployed on Vercel (automatic deployments from GitHub)
- **Backend**: Deployed on Render (Docker-based deployment)

---

## Part 1: Deploy Backend to Render

### Step 1: Sign up for Render
1. Go to https://render.com
2. Sign up with your GitHub account

### Step 2: Create a New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Rushabh-Runwal/calhacks`
3. Configure the service:
   - **Name**: `multiplayer-ai-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Docker Command**: Leave empty (uses Dockerfile CMD)

### Step 3: Add Environment Variables
Click "Advanced" and add these environment variables:
- `HOST` = `0.0.0.0`
- `PORT` = `8000`
- `FISH_API_KEY` = `b34cff9e6fed4b8cb414b3ed4356014d`
- `JANITOR_API_KEY` = `calhacks2047`

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Once deployed, copy your backend URL (e.g., `https://multiplayer-ai-backend.onrender.com`)

**Note**: Render free tier may spin down after inactivity. First request might be slow.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Sign up for Vercel
1. Go to https://vercel.com
2. Sign up with your GitHub account

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import `Rushabh-Runwal/calhacks` repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variable
In the "Environment Variables" section:
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://your-backend-url.onrender.com` (from Step 4 above)
- **Environment**: Production, Preview, and Development

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### Step 5: Set Custom Domain (Optional)
1. Go to your project settings on Vercel
2. Click **"Domains"**
3. Add your custom domain and follow DNS instructions

---

## Part 3: Update Backend CORS

After deploying frontend, update your backend CORS settings to allow your Vercel domain.

In `backend/main.py`, update:
```python
sio = socketio.AsyncServer(
    async_mode="asgi", 
    cors_allowed_origins=[
        "https://your-project.vercel.app",
        "http://localhost:3000",
        "*"  # Remove this in production
    ]
)
```

Then commit and push to trigger a redeploy on Render.

---

## Verification

### Backend Health Check
Visit: `https://your-backend-url.onrender.com/`

You should see:
```json
{
  "message": "Talking Tom Chat API",
  "status": "running"
}
```

### Frontend
Visit: `https://your-project.vercel.app`

You should see the chat interface.

### Test Socket.IO Connection
1. Open browser console on your frontend
2. Look for: `Socket.IO connection established`
3. Try creating a room and sending a message

---

## Troubleshooting

### Backend Issues

**Build fails on Render:**
- Check that `pyproject.toml` and `uv.lock` are committed
- Verify Dockerfile syntax
- Check Render build logs

**Backend not responding:**
- Check environment variables are set correctly
- Verify the service is running in Render dashboard
- Check logs for errors

**Socket.IO connection fails:**
- Verify CORS settings in `main.py`
- Ensure WebSocket support is enabled (Render supports it by default)

### Frontend Issues

**Build fails on Vercel:**
- Check that all dependencies are in `package.json`
- Verify `NEXT_PUBLIC_API_URL` is set
- Check build logs in Vercel dashboard

**Can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` points to your Render backend
- Check browser console for CORS errors
- Ensure backend is running

**Environment variable not working:**
- Rebuild and redeploy (environment variables only apply to new builds)
- Check variable name starts with `NEXT_PUBLIC_`

---

## Updating Your Deployment

### Backend Updates
Push to `main` branch → Render auto-deploys

### Frontend Updates
Push to `main` branch → Vercel auto-deploys

### Manual Redeploy
- **Render**: Click "Manual Deploy" → "Deploy latest commit"
- **Vercel**: Click "Redeploy" in your deployment

---

## Costs

### Render
- **Free Tier**: 750 hours/month, 512MB RAM
- Services spin down after 15 minutes of inactivity
- Cold starts take 30-60 seconds

### Vercel
- **Hobby Plan**: Free
- 100GB bandwidth/month
- Unlimited deployments
- Custom domains included

---

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Socket.IO connection working
- [ ] Audio generation working
- [ ] Voice input working (requires HTTPS)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring setup (optional - Sentry)
- [ ] Analytics setup (optional - Vercel Analytics)

---

## Support

If you encounter issues:
1. Check Render and Vercel logs
2. Verify environment variables
3. Test locally with the same environment variables
4. Check browser console for errors

---

## Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/Rushabh-Runwal/calhacks
