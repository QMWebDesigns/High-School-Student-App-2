import { createClient } from '@supabase/supabase-js';

// Types
export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  grade?: number;
  province?: 'KZN' | 'Gauteng';
  created_at: string;
}

export interface Paper {
  id: string;
  title: string;
  grade: number;
  subject: string;
  province: 'KZN' | 'Gauteng';
  exam_type: string;  // Note: snake_case to match database
  year: number;
  description?: string;
  publisher?: string;
  format: string;
  identifier?: string;
  file_path: string;      // Must match database
  download_url: string;   // Must match database  
  file_size?: number;
  download_count: number;
  created_at: string;
  created_by: string;
}

export interface Survey {
  id: string;
  user_id: string;
  student_email: string;
  most_needed_subjects: string[];
  study_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  preferred_resources: string[];
  additional_comments?: string;
  timestamp: string;
}

export interface ResourceUsage {
  id: string;
  user_id: string;
  paper_id: string;
  action_type: 'view' | 'download';
  timestamp: string;
}

export interface UploadMetadata {
  title: string;
  grade: number;
  subject: string;
  province: 'KZN' | 'Gauteng';
  examType: string;  // Your frontend can use camelCase
  year: number;
  description?: string;
  publisher?: string;
}

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth functions
export const auth = {
  // Sign up new user
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  },

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    const profile = await this.getUserProfile(user.id);
    return profile?.role === 'admin';
  }
};

// Paper functions
export const papers = {
  // Upload paper to Supabase Storage
  async uploadPaper(file: File, metadata: UploadMetadata): Promise<{ success: boolean; error?: string; paper?: Paper }> {
    try {
      // Check if user is admin
      const isUserAdmin = await auth.isAdmin();
      if (!isUserAdmin) {
        return { success: false, error: 'Only admins can upload papers' };
      }

      // Create file path
      const fileExtension = file.name.split('.').pop();
      const fileName = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
      const filePath = `grade-${metadata.grade}/${metadata.subject}/${metadata.year}/${metadata.examType}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('papers')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (storageError) {
        console.error('Storage upload error:', storageError);
        return { success: false, error: `Upload failed: ${storageError.message}` };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('papers')
        .getPublicUrl(filePath);

      // Get current user
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Save paper metadata to database
      const { data: paperData, error: dbError } = await supabase
        .from('papers')
        .insert({
          title: metadata.title,
          grade: metadata.grade,
          subject: metadata.subject,
          province: metadata.province,
          exam_type: metadata.examType,
          year: metadata.year,
          description: metadata.description,
          publisher: metadata.publisher,
          file_path: filePath,
          download_url: publicUrl,
          file_size: file.size,
          download_count: 0,
          created_by: user.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Clean up uploaded file if DB insert fails
        await supabase.storage.from('papers').remove([filePath]);
        return { success: false, error: `Database error: ${dbError.message}` };
      }

      return { success: true, paper: paperData };
    } catch (error: any) {
      console.error('Upload paper error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all papers with optional filters
  async getPapers(filters?: {
    grade?: number;
    subject?: string;
    province?: string;
    examType?: string;
    year?: number;
  }): Promise<{ data: Paper[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.grade) query = query.eq('grade', filters.grade);
      if (filters?.subject) query = query.eq('subject', filters.subject);
      if (filters?.province) query = query.eq('province', filters.province);
      if (filters?.examType) query = query.eq('exam_type', filters.examType);
      if (filters?.year) query = query.eq('year', filters.year);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching papers:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Get papers error:', error);
      return { data: null, error: error.message };
    }
  },

  // Download paper and track usage
  async downloadPaper(paperId: string, paper: Paper): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await auth.getCurrentUser();
      
      // Track download in analytics if user is logged in
      if (user) {
        await supabase
          .from('resource_usage')
          .insert({
            user_id: user.id,
            paper_id: paperId,
            action_type: 'download'
          });

        // Increment download count
        await supabase
          .from('papers')
          .update({ download_count: paper.download_count + 1 })
          .eq('id', paperId);
      }

      // Open download URL
      window.open(paper.download_url, '_blank');
      
      return { success: true };
    } catch (error: any) {
      console.error('Download paper error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete paper (admin only)
  async deletePaper(paperId: string, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isUserAdmin = await auth.isAdmin();
      if (!isUserAdmin) {
        return { success: false, error: 'Only admins can delete papers' };
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('papers')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        return { success: false, error: `Storage error: ${storageError.message}` };
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('papers')
        .delete()
        .eq('id', paperId);

      if (dbError) {
        console.error('Database delete error:', dbError);
        return { success: false, error: `Database error: ${dbError.message}` };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Delete paper error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Survey functions
export const surveys = {
  // Submit survey
  async submitSurvey(surveyData: {
    student_email: string;
    most_needed_subjects: string[];
    study_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
    preferred_resources: string[];
    additional_comments?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User must be logged in to submit survey' };
      }

      const { error } = await supabase
        .from('surveys')
        .insert({
          user_id: user.id,
          ...surveyData
        });

      if (error) {
        console.error('Survey submission error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Submit survey error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get surveys (admin only)
  async getSurveys(): Promise<{ data: Survey[] | null; error: string | null }> {
    try {
      const isUserAdmin = await auth.isAdmin();
      if (!isUserAdmin) {
        return { data: null, error: 'Only admins can view surveys' };
      }

      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching surveys:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Get surveys error:', error);
      return { data: null, error: error.message };
    }
  }
};

// Analytics functions
export const analytics = {
  // Get admin stats
  async getAdminStats(): Promise<{ data: any | null; error: string | null }> {
    try {
      const isUserAdmin = await auth.isAdmin();
      if (!isUserAdmin) {
        return { data: null, error: 'Only admins can view analytics' };
      }

      const { data, error } = await supabase.rpc('get_admin_stats');

      if (error) {
        console.error('Error fetching admin stats:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Get admin stats error:', error);
      return { data: null, error: error.message };
    }
  },

  // Track resource view
  async trackView(paperId: string): Promise<void> {
    try {
      const user = await auth.getCurrentUser();
      if (user) {
        await supabase
          .from('resource_usage')
          .insert({
            user_id: user.id,
            paper_id: paperId,
            action_type: 'view'
          });
      }
    } catch (error) {
      console.error('Track view error:', error);
    }
  }
};

// Utility functions
export const utils = {
  // Get available filter options
  async getFilterOptions() {
    const { data } = await supabase
      .from('papers')
      .select('grade, subject, province, exam_type, year');

    if (!data) return {};

    return {
      grades: [...new Set(data.map((p: any) => p.grade))].sort(),
      subjects: [...new Set(data.map((p: any) => p.subject))].sort(),
      provinces: [...new Set(data.map((p: any) => p.province))],
      examTypes: [...new Set(data.map((p: any) => p.exam_type))].sort(),
      years: [...new Set(data.map((p: any) => p.year))].sort((a: number, b: number) => b - a)
    };
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default supabase;

// Storage and content helpers for Books and Study Guides
export const storage = {
  async uploadBook(file: File, metadata: {
    title: string;
    grade: number;
    subject: string;
    author: string;
    publisher?: string;
    year?: number;
  }): Promise<{ success: boolean; error?: string; publicUrl?: string }> {
    try {
      const fileExtension = file.name.split('.').pop();
      const safeTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeTitle}.${fileExtension}`;
      const filePath = `grade-${metadata.grade}/${metadata.subject}/${fileName}`;

      const { error } = await supabase.storage
        .from('books')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('books')
        .getPublicUrl(filePath);

      return { success: true, publicUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async uploadStudyGuide(file: File, metadata: {
    title: string;
    grade: number;
    subject: string;
    topic?: string;
    author: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime?: string;
  }): Promise<{ success: boolean; error?: string; publicUrl?: string }> {
    try {
      const fileExtension = file.name.split('.').pop();
      const safeTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeTitle}.${fileExtension}`;
      const filePath = `grade-${metadata.grade}/${metadata.subject}/${fileName}`;

      const { error } = await supabase.storage
        .from('study-guides')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('study-guides')
        .getPublicUrl(filePath);

      return { success: true, publicUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

export const books = {
  async addBook(bookData: {
    title: string;
    author: string;
    subject: string;
    grade: number;
    description?: string;
    download_url: string;
    publisher?: string;
    year?: number;
    pages?: number;
    isbn?: string;
  }): Promise<{ success: boolean; error?: string; book?: any }> {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert({
          ...bookData,
          grade: bookData.grade.toString(),
          year: bookData.year?.toString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, book: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getBooks(filters?: { grade?: string; subject?: string }): Promise<{ data: any[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.grade) query = query.eq('grade', filters.grade);
      if (filters?.subject) query = query.eq('subject', filters.subject);

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
};

export const studyGuides = {
  async addStudyGuide(guideData: {
    title: string;
    subject: string;
    grade: number;
    topic?: string;
    description?: string;
    author: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    estimated_time?: string;
    download_url: string;
    pages?: number;
    tags?: string[];
  }): Promise<{ success: boolean; error?: string; guide?: any }> {
    try {
      const { data, error } = await supabase
        .from('study_guides')
        .insert({
          ...guideData,
          grade: guideData.grade.toString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, guide: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getStudyGuides(filters?: { grade?: string; subject?: string; difficulty?: string }): Promise<{ data: any[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('study_guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.grade) query = query.eq('grade', filters.grade);
      if (filters?.subject) query = query.eq('subject', filters.subject);
      if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
};