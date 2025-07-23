# Deployment Guide

This project uses Vercel for hosting with GitHub Actions for continuous deployment.

## Setup Instructions

### 1. Vercel Setup

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Connect GitHub**: Link your GitHub account to Vercel
3. **Import Project**: Import this repository from your GitHub account
4. **Get Project Details**: 
   - Go to Project Settings > General
   - Copy your `Project ID` and `Team ID` (Org ID)

### 2. GitHub Secrets Configuration

Add the following secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here  
VERCEL_PROJECT_ID=your_vercel_project_id_here
```

#### Getting Vercel Token:
1. Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
2. Create a new token with appropriate scope
3. Copy the token value

#### Getting Org ID and Project ID:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel link` in your project directory
3. The IDs will be saved in `.vercel/project.json`

### 3. Deployment Workflow

The deployment pipeline includes:

#### For Pull Requests:
- ✅ Code quality checks (lint, type-check, build)
- 🚀 Deploy preview environment
- 💬 Comment with preview URL

#### For Main Branch:
- ✅ Code quality checks (lint, type-check, build)  
- 🚀 Deploy to production
- 📊 Security audit

## Files Created

- `vercel.json` - Vercel configuration
- `.github/workflows/deploy.yml` - Main deployment workflow
- `.github/workflows/quality-checks.yml` - Code quality checks
- `.env.example` - Environment variables template

## Manual Deployment

You can also deploy manually using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Environment Variables

The application currently doesn't require runtime environment variables, but you can add them in:

1. **Vercel Dashboard**: Project Settings > Environment Variables
2. **GitHub Secrets**: For build-time variables used in workflows

## Monitoring

- **Vercel Dashboard**: Monitor deployments, analytics, and performance
- **GitHub Actions**: View build logs and deployment status
- **Vercel Analytics**: Enable in project settings for detailed metrics

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check GitHub Actions logs for specific errors
2. **Missing Secrets**: Verify all required secrets are set in GitHub
3. **Vercel CLI Issues**: Ensure you're logged in with `vercel whoami`
4. **Permission Errors**: Check Vercel token has correct permissions

### Debug Commands:

```bash
# Check build locally
npm run build

# Test with Vercel CLI
vercel dev

# Check deployment status
vercel ls
```