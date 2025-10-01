const ENV_REPO = (import.meta as any).env?.VITE_GITHUB_REPO as string | undefined;
const ENV_BRANCH = (import.meta as any).env?.VITE_GITHUB_BRANCH as string | undefined;
const ENV_TOKEN = (import.meta as any).env?.VITE_GITHUB_TOKEN as string | undefined;

const GITHUB_REPO = ENV_REPO || "QMWebDesigns/High-School-Student-App-2";
const GITHUB_BRANCH = ENV_BRANCH || "main";
const GITHUB_TOKEN = ENV_TOKEN || "";

// Note: For production, you should:
// 1. Create a GitHub Personal Access Token with repo permissions
// 2. Store it securely (environment variables, not in code)
// 3. Replace "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN" with your actual token

export interface PaperMetadata {
  title: string;
  grade: string;
  subject: string;
  province: string;
  examType: string;
  year: string;
  description: string;
  publisher: string;
  format: string;
  identifier: string;
  downloadUrl?: string;
}

export const uploadPDFToGitHub = async (file: File, metadata: PaperMetadata): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
  try {
    // Check if GitHub token is configured
    if (!GITHUB_TOKEN) {
      return {
        success: false,
        error: "GitHub token not configured. Set VITE_GITHUB_TOKEN in your environment."
      };
    }

    // Validate file size (max 25MB for GitHub)
    if (file.size > 25 * 1024 * 1024) {
      return { 
        success: false, 
        error: "File size too large. Maximum size is 25MB." 
      };
    }

    // Create organized folder structure
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `papers/grade-${metadata.grade}/${metadata.subject}/${metadata.year}/${metadata.examType}/${sanitizedFileName}`;
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    
    const base64Content = await fileToBase64(file);
    const body = {
      message: `Add ${metadata.title} - ${metadata.examType} (${metadata.grade})`,
      content: base64Content,
      branch: GITHUB_BRANCH
    };

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "Digital-Library-App"
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const downloadUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
      return { success: true, downloadUrl };
    } else {
      const errorData = await response.json();
      let errorMessage = errorData.message || 'Upload failed';
      
      // Provide more specific error messages
      if (response.status === 401) {
        errorMessage = "GitHub authentication failed. Please check your token.";
      } else if (response.status === 403) {
        errorMessage = "GitHub access denied. Please check repository permissions.";
      } else if (response.status === 422) {
        errorMessage = "File already exists or invalid data provided.";
      }
      
      return { success: false, error: errorMessage };
    }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};