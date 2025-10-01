# Digital Library - High School Student App

A comprehensive digital library application for high school students to access past exam papers, with admin functionality for managing content and analytics.

## Features

### Student Features
- **Authentication**: Secure sign-up and sign-in
- **Paper Browser**: Browse and search past exam papers by grade, subject, province, and year
- **Download**: Direct download of PDF papers
- **Survey**: Student feedback collection for improving the platform

### Admin Features
- **Dashboard**: Analytics and insights on student usage
- **Paper Management**: Upload, edit, and delete exam papers
- **GitHub Integration**: Automatic PDF storage in organized GitHub repository
- **Survey Analytics**: View student feedback and preferences

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with dark mode support
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **File Storage**: GitHub API for PDF storage
- **Charts**: Recharts for analytics
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- GitHub repository (for PDF storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore
   - Copy your Firebase config to `src/config/firebase.ts`

4. **Configure GitHub (for PDF uploads)**
   - Create a GitHub Personal Access Token (classic) with `repo` scope
   - Copy `.env.example` to `.env.local` and fill:
     ```bash
     VITE_GITHUB_TOKEN=ghp_your_token_here
     VITE_GITHUB_REPO=QMWebDesigns/High-School-Student-App-2
     VITE_GITHUB_BRANCH=main
     ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Admin Access

To access admin features, sign up with one of these email addresses:
- `admin@example.com`
- `admin@school.com`

## Project Structure

```
src/
├── components/
│   ├── Admin/          # Admin dashboard components
│   ├── Auth/           # Authentication components
│   ├── Common/         # Shared components
│   ├── Layout/         # Layout components
│   ├── Student/        # Student dashboard components
│   └── Survey/         # Survey components
├── config/
│   └── firebase.ts     # Firebase configuration
├── contexts/
│   ├── AuthContext.tsx # Authentication context
│   └── ThemeContext.tsx # Theme context
├── services/
│   ├── authService.ts  # Authentication service
│   ├── firestoreService.ts # Firestore operations
│   └── githubService.ts # GitHub API integration
└── App.tsx            # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Netlify

1. **Build the project**
   ```bash
   npm run build
   ```
2. **Deploy the `dist` folder** to Netlify
3. **Set environment variables** in Netlify dashboard

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## Configuration

### Firebase Setup

1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Update `src/config/firebase.ts` with your config

### GitHub Integration

1. Create a GitHub Personal Access Token (classic) with `repo` scope
2. Set environment variables in `.env.local` as shown above
3. Restart dev server after changes

## Security Considerations

- Never commit API keys or tokens to version control
- Use environment variables for sensitive configuration
- Implement proper Firebase security rules
- Regularly rotate GitHub tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
