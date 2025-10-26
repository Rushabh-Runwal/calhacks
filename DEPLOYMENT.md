# Deployment Guide

This guide covers deploying the Multiplayer AI Chat application to various platforms.

## Table of Contents

- [Frontend Deployment](#frontend-deployment)
  - [Vercel](#vercel-recommended)
  - [Netlify](#netlify)
  - [Railway](#railway)
- [Backend Deployment](#backend-deployment)
  - [Railway](#railway-1)
  - [Render](#render)
  - [Fly.io](#flyio)
  - [Heroku](#heroku)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)

## Frontend Deployment

### Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

1. **Push your code to GitHub**

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Set **Root Directory** to `frontend`

3. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

5. **Domain**
   - Vercel provides a `.vercel.app` domain
   - You can add a custom domain in settings

### Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site"
   - Select your repository

2. **Build Settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

4. **Deploy**

### Railway

1. **Create New Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure Service**
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Start command: `npm start`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

4. **Deploy**

## Backend Deployment

### Railway

1. **Create New Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure Service**
   - Root directory: `backend`
   - Start command: `python start_server.py`

3. **Environment Variables**
   ```
   HOST=0.0.0.0
   PORT=8000
   FISH_API_KEY=your_fish_audio_api_key
   JANITOR_API_KEY=your_janitor_ai_api_key
   ```

4. **Install FFmpeg**
   - Add to `nixpacks.toml` in backend directory:
   ```toml
   [phases.setup]
   aptPkgs = ["ffmpeg"]
   ```

5. **Deploy**
   - Railway will provide a public URL
   - Use this URL in your frontend's `NEXT_PUBLIC_API_URL`

### Render

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your repository

2. **Configure**
   - Name: `chat-backend`
   - Root directory: `backend`
   - Runtime: `Python 3`
   - Build command: `pip install -r requirements.txt`
   - Start command: `python start_server.py`

3. **Environment Variables**
   ```
   HOST=0.0.0.0
   PORT=8000
   FISH_API_KEY=your_fish_audio_api_key
   JANITOR_API_KEY=your_janitor_ai_api_key
   ```

4. **Install System Dependencies**
   - Add `render.yaml` to backend:
   ```yaml
   services:
     - type: web
       name: chat-backend
       runtime: python
       buildCommand: apt-get update && apt-get install -y ffmpeg && pip install -r requirements.txt
       startCommand: python start_server.py
   ```

### Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and Initialize**
   ```bash
   cd backend
   fly auth login
   fly launch
   ```

3. **Configure**
   - Edit `fly.toml`:
   ```toml
   [env]
     PORT = "8000"
   
   [[services]]
     internal_port = 8000
     protocol = "tcp"
   ```

4. **Set Secrets**
   ```bash
   fly secrets set FISH_API_KEY=your_key
   fly secrets set JANITOR_API_KEY=your_key
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

### Heroku

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   ```

2. **Login and Create App**
   ```bash
   cd backend
   heroku login
   heroku create your-app-name
   ```

3. **Add Buildpacks**
   ```bash
   heroku buildpacks:add heroku/python
   heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set FISH_API_KEY=your_key
   heroku config:set JANITOR_API_KEY=your_key
   ```

5. **Create Procfile** in backend directory:
   ```
   web: python start_server.py
   ```

6. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

## Docker Deployment

### Using Docker Compose (Local or VPS)

1. **Setup Environment**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   
   # Edit .env files with your API keys
   ```

2. **Build and Run**
   ```bash
   docker-compose up --build -d
   ```

3. **View Logs**
   ```bash
   docker-compose logs -f
   ```

4. **Stop**
   ```bash
   docker-compose down
   ```

### Individual Docker Containers

**Backend:**
```bash
cd backend
docker build -t chat-backend .
docker run -p 8000:8000 \
  -e FISH_API_KEY=your_key \
  -e JANITOR_API_KEY=your_key \
  chat-backend
```

**Frontend:**
```bash
cd frontend
docker build -t chat-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://your-backend-url.com .
docker run -p 3000:3000 chat-frontend
```

## Environment Variables

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `FISH_API_KEY` | Fish Audio API key | `abc123...` |
| `JANITOR_API_KEY` | Janitor AI API key | `xyz789...` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` |

## Post-Deployment Checklist

- [ ] Backend is accessible and returns health check
- [ ] Frontend can connect to backend
- [ ] Socket.IO connection works
- [ ] API keys are set correctly
- [ ] CORS is configured properly
- [ ] Audio files are being generated
- [ ] Voice recording works (requires HTTPS)
- [ ] Error logging is configured
- [ ] Rate limiting is set up (if needed)
- [ ] Monitoring is enabled

## Troubleshooting

### CORS Issues

Add your frontend URL to backend CORS settings in `main.py`:

```python
sio = socketio.AsyncServer(
    async_mode="asgi", 
    cors_allowed_origins=["https://your-frontend-url.com", "*"]
)
```

### WebSocket Connection Failed

1. Ensure backend is publicly accessible
2. Check if your hosting platform supports WebSocket
3. Verify `NEXT_PUBLIC_API_URL` is correct

### Audio Not Working

1. Ensure FFmpeg is installed on backend server
2. Check Fish Audio API key is valid
3. Verify audio_cache directory is writable

### High Memory Usage

- Implement audio file cleanup
- Add Redis for Socket.IO scaling
- Use CDN for static assets

## Scaling

For production with high traffic:

1. **Use Redis for Socket.IO**
   - Enables multiple backend instances
   - Maintains real-time state across servers

2. **Add CDN**
   - CloudFlare for frontend
   - S3/CloudFront for audio files

3. **Database**
   - Add PostgreSQL/MongoDB for persistence
   - Store messages and user data

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Add performance monitoring
   - Configure logging (LogDNA, DataDog)

## Support

For deployment issues, please open an issue on GitHub.
