# GitHub Storage Setup Guide

## Overview
Your digital library uses GitHub API for PDF storage instead of Firebase Storage. This is perfect for the Firebase free plan since you only use Firestore for lightweight metadata storage.

## Setup Steps

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Repository name: `high-school-papers` (or your preferred name)
3. Make it **Public** (required for direct downloads)
4. Initialize with README
5. Note your repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`

### 2. Create Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Token name: `Digital Library Upload`
4. Expiration: `No expiration` (or set a long expiration)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `public_repo` (Access public repositories)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again)

### 3. Update Configuration
Edit `src/services/githubService.ts`:

```typescript
const GITHUB_REPO = "YOUR_USERNAME/YOUR_REPO_NAME"; // Replace with your repo
const GITHUB_BRANCH = "main";
const GITHUB_TOKEN = "ghp_your_actual_token_here"; // Replace with your token
```

### 4. Test Upload
1. Start your development server: `npm run dev`
2. Sign in as admin (admin@example.com)
3. Go to Admin Dashboard → Upload Paper
4. Try uploading a small PDF file
5. Check your GitHub repository - you should see the file appear

## File Organization
PDFs are automatically organized in this structure:
```
papers/
├── grade-10/
│   ├── Mathematics/
│   │   ├── 2023/
│   │   │   ├── Final-Exam/
│   │   │   └── Midterm/
│   │   └── 2022/
│   └── Life-Sciences/
├── grade-11/
└── grade-12/
```

## Benefits of GitHub Storage
- ✅ **Free**: No storage costs
- ✅ **Reliable**: GitHub's CDN for fast downloads
- ✅ **Organized**: Automatic folder structure
- ✅ **Version Control**: Track all uploads
- ✅ **Public Access**: Students can download directly
- ✅ **No Limits**: GitHub allows large files (up to 25MB per file)

## Security Notes
- Your GitHub token should be kept secret
- For production, use environment variables
- The repository should be public for student downloads
- Consider using a dedicated GitHub account for the library

## Troubleshooting

### Upload Fails
- Check your GitHub token has correct permissions
- Verify repository name is correct
- Ensure repository is public
- Check file size (max 25MB)

### Download Issues
- Verify the repository is public
- Check the download URL is correct
- Ensure the file exists in the repository

### Token Issues
- Regenerate token if expired
- Check token permissions include `repo` and `public_repo`
- Verify token is correctly copied (no extra spaces)

## Production Deployment
For production, use environment variables:

```bash
# In your deployment platform (Vercel, Netlify, etc.)
VITE_GITHUB_TOKEN=your_actual_token_here
VITE_GITHUB_REPO=your_username/your_repo_name
```

Then update the service to use environment variables:
```typescript
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO;
```

## Success Indicators
✅ PDF uploads appear in your GitHub repository
✅ Students can download PDFs directly
✅ Files are organized in proper folder structure
✅ No Firebase Storage errors
✅ Fast download speeds for students

