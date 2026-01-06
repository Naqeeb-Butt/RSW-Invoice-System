# 🚀 Aasko Construction Invoice System - Deployment Guide

## 📋 Quick Deployment Options

### 🥇 **Option 1: Netlify (Recommended - Easiest)**
**Perfect for:** Quick deployment, serverless functions, free tier

### 🥈 **Option 2: Vercel + Railway**
**Perfect for:** Better performance, separate backend/frontend

---

## 🥇 **Option 1: Netlify Deployment (Easiest)**

### 📁 **Files Created for You**
- ✅ `netlify.toml` - Configuration file
- ✅ `netlify/functions/api/main.py` - Backend serverless function
- ✅ `netlify/functions/requirements.txt` - Backend dependencies
- ✅ `frontend/.env.production` - Production environment variables

### 🚀 **Step-by-Step Deployment**

#### **1. Push to GitHub**
```bash
git init
git add .
git commit -m "Ready for Netlify deployment"
git branch -M main
git remote add origin https://github.com/yourusername/aasko-invoice-system.git
git push -u origin main
```

#### **2. Deploy to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. **Build settings** (already configured):
   - **Base directory**: `frontend/`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
6. Click "Deploy site"

#### **3. Environment Variables**
In Netlify dashboard → Site settings → Environment variables:
```
NODE_VERSION=18
PYTHON_VERSION=3.9
```

### ⚙️ **How It Works**
- **Frontend**: React app builds to static files
- **Backend**: FastAPI runs as Netlify serverless functions
- **API Routes**: `/api/*` automatically redirects to serverless functions
- **Database**: SQLite file stored in serverless environment

### 🎯 **Features**
- ✅ **Free SSL certificate**
- ✅ **Custom domain support**
- ✅ **Automatic deployments**
- ✅ **Serverless functions** (100k free/month)
- ✅ **CDN distribution**

---

## 🥈 **Option 2: Vercel + Railway (More Control)**

### 🚀 **Step-by-Step Deployment**

#### **1. Deploy Frontend to Vercel**
```bash
# Create vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

#### **2. Deploy Backend to Railway**
1. Create `railway.toml`:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[[services]]
name = "api"
source = "."
```

2. Push to Railway:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### **3. Update Frontend Environment**
Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend.railway.app
```

---

## 🔧 **Environment Setup**

### **Production Environment Variables**

#### **Backend (.env.production)**
```env
DATABASE_URL=sqlite:///./invoice_system.db
SECRET_KEY=your-production-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
COMPANY_NAME=Aasko Construction
COMPANY_ADDRESS=123 Construction Ave, Building City
COMPANY_PHONE=+1-555-0123
COMPANY_EMAIL=info@aasko.com
COMPANY_WEBSITE=www.aasko.com
ADMIN_EMAIL=admin@aasko.com
ADMIN_PASSWORD=your-secure-admin-password
```

#### **Frontend (.env.production)**
```env
REACT_APP_API_URL=/.netlify/functions
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

---

## 🚀 **Quick Start (Netlify - 5 Minutes)**

### **1. Clone & Push**
```bash
git clone https://github.com/yourusername/aasko-invoice-system.git
cd aasko-invoice-system
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **2. Deploy to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub
3. Select repository
4. Deploy with default settings
5. **Done!** 🎉

### **3. Access Your App**
- **URL**: `https://your-app-name.netlify.app`
- **Login**: admin@aasko.com / admin123
- **Admin Panel**: Full functionality available

---

## 📊 **Pricing Comparison**

| Feature | Netlify (Free) | Vercel (Free) | Railway (Free) |
|---------|----------------|---------------|----------------|
| **Bandwidth** | 100GB/month | 100GB/month | 500GB/month |
| **Functions** | 100k/month | 100k/month | N/A |
| **Build Time** | 300min/month | 600min/month | N/A |
| **Custom Domain** | ✅ | ✅ | ✅ |
| **SSL** | ✅ | ✅ | ✅ |

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. Serverless Function Timeout**
```python
# In netlify/functions/api/main.py
import os
os.environ['MANGUM_CONFIG'] = '{"timeout": 30}'
```

#### **2. Database Issues**
```python
# Use persistent storage
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///tmp/invoice_system.db')
```

#### **3. CORS Issues**
```python
# In FastAPI main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Debug Mode**
```bash
# Enable debug logs
DEBUG=1 netlify dev
```

---

## 🎯 **Recommendation**

**For most users:** Use **Netlify** - it's the easiest and completely free for your invoice system.

**For advanced users:** Use **Vercel + Railway** for better performance and control.

---

## 🚀 **Next Steps**

1. **Choose your platform** (Netlify recommended)
2. **Push to GitHub**
3. **Deploy in 2 clicks**
4. **Customize your domain**
5. **Start managing invoices!** 🎉

Your Aasko Construction Invoice System will be live and accessible worldwide in minutes!
