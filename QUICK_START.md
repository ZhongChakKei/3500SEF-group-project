# 🚀 Quick Deployment Guide

## TL;DR - Deploy in 10 Minutes

```powershell
# Push your code
git add .
git commit -m "Deploy to AWS Amplify"
git push origin main
```

Then:
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect GitHub → Select repo → Deploy
4. Done! 🎉

---

## What Gets Deployed

✅ **Frontend**: React app (static site)  
❌ **Backend**: Not deployed (runs locally or separately)

---

## Do I Need Backend for Serverless?

**Short Answer: NO!**

AWS Amplify + Cognito = Serverless authentication (no backend code needed)

**But for now:** Keep your Express backend for local development.

---

## Two Deployment Approaches

### Option 1: Frontend Only (NOW) ⚡

**What:** Deploy React frontend to AWS Amplify  
**Backend:** Keep local or deploy separately  
**Time:** 10 minutes  
**Cost:** $0  
**Good for:** Learning, demos, development

```powershell
git push origin main
# Configure in AWS Amplify Console
# Set: VITE_API_BASE=http://localhost:3001/api
```

### Option 2: Full Serverless (LATER) 🌟

**What:** Use AWS Amplify + Cognito  
**Backend:** No server! AWS Cognito handles auth  
**Time:** 1-2 hours to migrate  
**Cost:** $0-5/month  
**Good for:** Production, scalability

```powershell
amplify add auth
amplify push
# Migrate JWT code to Cognito
```

---

## Quick Comparison

|  | Option 1 | Option 2 |
|---|---|---|
| **Deploy Time** | 10 min | 1-2 hrs |
| **Backend** | Express (local) | AWS Cognito |
| **Code Changes** | None | Replace JWT with Cognito |
| **Cost** | $0 | $0-5/mo |
| **Best For** | Demo/Learning | Production |

---

## Environment Variables

### For AWS Amplify Console

**Frontend Only Deployment:**
```
VITE_API_BASE = http://localhost:3001/api
```

**After Backend Deployed Separately:**
```
VITE_API_BASE = https://your-backend-url/api
```

**Full Serverless (Cognito):**
```
(No variables needed - auto-configured by Amplify CLI)
```

---

## Files to Read

1. **START HERE**: [SERVERLESS_EXPLAINED.md](./SERVERLESS_EXPLAINED.md)
   - Explains everything clearly
   - Answers common questions

2. **DEPLOYMENT**: [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Step-by-step instructions
   - Both deployment options

3. **SERVERLESS**: [SERVERLESS.md](./SERVERLESS.md)
   - Full Cognito migration guide
   - Code examples

---

## Recommended Path

### Week 1: Quick Deploy ✅
```
1. Deploy frontend to Amplify (10 min)
2. Keep backend local
3. Demo your project
4. Get grade/feedback
```

### Later: Upgrade to Serverless 🚀
```
1. Learn AWS Amplify CLI
2. Add Cognito authentication
3. Replace JWT with Cognito
4. Deploy full serverless
```

---

## Common Questions

**Q: Will my JWT code work?**  
A: Yes! For frontend-only deployment. Keep backend local.

**Q: Do I have to migrate to Cognito?**  
A: No, it's optional. But Cognito is better for production.

**Q: Can I deploy backend to Amplify?**  
A: Not directly. Deploy frontend now, backend separately later.

**Q: What's the difference between serverless and my backend?**  
A: Your backend = always-on server. Serverless = runs only when needed.

**Q: Which option should I choose?**  
A: **Option 1 now** (quick demo). **Option 2 later** (production).

---

## Demo Accounts

Test your deployed app with:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |
| user@example.com | user123 | User |

---

## Need Help?

1. Check [SERVERLESS_EXPLAINED.md](./SERVERLESS_EXPLAINED.md)
2. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Ask in GitHub Issues

---

**Ready to deploy?** Just push to GitHub and connect to AWS Amplify! 🚀