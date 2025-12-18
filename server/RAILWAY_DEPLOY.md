# Railway Deploy Instructions

## Quick Deploy (5 minutes)

### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Prepare chatbot server for Railway"
git push
```

### 2️⃣ Deploy to Railway
1. Go to: https://railway.app/
2. Click "Start a New Project"
3. Click "Deploy from GitHub repo"
4. Select your repository: `web`
5. Click "Add variables" and add:
   - `GEMINI_API_KEY` = `AIzaSyDKJUp3xAU8kDTxU9dNlfkWg9NS7eMm8M4`
   - `PORT` = `3000`
6. Click "Deploy"

### 3️⃣ Get Your URL
- Railway will give you a URL like: `https://your-app.railway.app`
- Copy this URL

### 4️⃣ Update Vercel Environment Variables
Go to Vercel dashboard → Settings → Environment Variables and add:
```
PUBLIC_CHATBOT_API_URL = https://your-app.railway.app/api/chat
PUBLIC_CHATBOT_CONVERSATIONS_URL = https://your-app.railway.app/api/conversations
```

### 5️⃣ Redeploy Vercel
- Vercel will automatically redeploy
- Wait ~2 minutes

## ✅ Done! 
Your chatbot now works on production with live chat logs.

## Troubleshooting
- If Railway doesn't detect Node.js, set "Root Directory" to `/server`
- Check Railway logs if server crashes
- Make sure GEMINI_API_KEY is set correctly
