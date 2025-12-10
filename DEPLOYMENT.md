# Deployment Guide

## Backend Deployment on Render

### Prerequisites
- GitHub repository connected to Render
- Render account

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `ManishPatidar806/Easy_visual`

3. **Configure Service**
   - **Name**: `ml-pipeline-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `Backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**
   Add these in Render dashboard:
   - `API_V1_PREFIX` = `/api`
   - `DEBUG` = `False`
   - `CORS_ORIGINS` = `https://your-frontend-domain.vercel.app`
   - `MAX_UPLOAD_SIZE` = `52428800`
   - `RANDOM_STATE` = `42`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the backend URL (e.g., `https://ml-pipeline-backend.onrender.com`)

---

## Frontend Deployment on Vercel

### Prerequisites
- GitHub repository connected to Vercel
- Vercel account

### Steps

1. **Update Environment Variable**
   - Create `.env.production` in Frontend directory:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

2. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository: `ManishPatidar806/Easy_visual`

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variable**
   Add in Vercel dashboard:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the frontend URL

---

## Update CORS Origins

After both deployments:

1. Go back to Render dashboard
2. Update `CORS_ORIGINS` environment variable:
   ```
   https://your-frontend-domain.vercel.app
   ```
3. Save and redeploy

---

## Verify Deployment

1. Open your Vercel frontend URL
2. Test the ML pipeline:
   - Upload a dataset
   - Configure preprocessing
   - Split data
   - Train a model
   - View results

---

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify all environment variables are set
- Ensure Python version is 3.12+

### Frontend Issues
- Check browser console for errors
- Verify `VITE_API_URL` points to correct backend
- Clear browser cache

### CORS Errors
- Update `CORS_ORIGINS` in Render to include your Vercel domain
- Redeploy backend after changing CORS settings

---

## Cost

- **Render Free Tier**: Backend sleeps after 15 minutes of inactivity
- **Vercel Free Tier**: Unlimited deployments for personal projects

For production use, consider upgrading to paid plans for better performance and reliability.
