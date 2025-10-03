import { supabase } from '../config/supabaseClient';

export interface Book {
  id: string;
  title: string;
  author: string;
  subject: string;
  grade: string;
  description: string;
  coverImage: string;
  downloadUrl?: string;
  rating: number;
  pages: number;
  format: string;
  publisher: string;
  year: string;
  isbn?: string;
  createdAt?: string;
}

export interface StudyGuide {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  description: string;
  author: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  downloadUrl?: string;
  previewUrl?: string;
  rating: number;
  downloads: number;
  pages: number;
  format: string;
  lastUpdated: string;
  tags: string[];
  createdAt?: string;
}

// Cache for better performance
let booksCache: Book[] | null = null;
let booksCacheTimestamp: number | null = null;
let guidesCache: StudyGuide[] | null = null;
let guidesCacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getBooks = async (useCache: boolean = true) => {
  try {
    // Check cache first
    if (useCache && booksCache && booksCacheTimestamp &&
        Date.now() - booksCacheTimestamp < CACHE_DURATION) {
      return { success: true, books: booksCache, error: null };
    }

    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const books: Book[] = (data || []).map((row: any) => ({
      id: String(row.id),
      title: row.title,
      author: row.author,
      subject: row.subject,
      grade: row.grade,
      description: row.description,
      coverImage: row.cover_image || '/api/placeholder/300/400',
      downloadUrl: row.download_url,
      rating: row.rating || 0,
      pages: row.pages || 0,
      format: row.format,
      publisher: row.publisher,
      year: row.year,
      isbn: row.isbn,
      createdAt: row.created_at
    }));

    // Update cache
    booksCache = books;
    booksCacheTimestamp = Date.now();

    return { success: true, books, error: null };
  } catch (error: unknown) {
    return { success: false, books: [], error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const getStudyGuides = async (useCache: boolean = true) => {
  try {
    // Check cache first
    if (useCache && guidesCache && guidesCacheTimestamp &&
        Date.now() - guidesCacheTimestamp < CACHE_DURATION) {
      return { success: true, guides: guidesCache, error: null };
    }

    const { data, error } = await supabase
      .from('study_guides')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const guides: StudyGuide[] = (data || []).map((row: any) => ({
      id: String(row.id),
      title: row.title,
      subject: row.subject,
      grade: row.grade,
      topic: row.topic,
      description: row.description,
      author: row.author,
      difficulty: row.difficulty,
      estimatedTime: row.estimated_time,
      downloadUrl: row.download_url,
      previewUrl: row.preview_url,
      rating: row.rating || 0,
      downloads: row.downloads || 0,
      pages: row.pages || 0,
      format: row.format,
      lastUpdated: row.last_updated,
      tags: row.tags || [],
      createdAt: row.created_at
    }));

    // Update cache
    guidesCache = guides;
    guidesCacheTimestamp = Date.now();

    return { success: true, guides, error: null };
  } catch (error: unknown) {
    return { success: false, guides: [], error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const saveBook = async (book: Omit<Book, 'id' | 'createdAt'>) => {
  try {
    // Validate required fields
    if (!book.title || !book.author || !book.subject || !book.grade) {
      return { success: false, error: 'Missing required fields: title, author, subject, or grade' };
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        title: book.title,
        author: book.author,
        subject: book.subject,
        grade: book.grade,
        description: book.description,
        cover_image: book.coverImage,
        download_url: book.downloadUrl,
        rating: book.rating,
        pages: book.pages,
        format: book.format,
        publisher: book.publisher,
        year: book.year,
        isbn: book.isbn,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    // Invalidate cache
    booksCache = null;
    booksCacheTimestamp = null;

    if (error) {
      console.error('Database insert error:', error);
      return { success: false, id: undefined as unknown as string, error: error.message };
    }
    return { success: true, id: String((data as any).id), error: null };
  } catch (error: unknown) {
    console.error('Save book error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const saveStudyGuide = async (guide: Omit<StudyGuide, 'id' | 'createdAt'>) => {
  try {
    // Validate required fields
    if (!guide.title || !guide.subject || !guide.grade || !guide.author) {
      return { success: false, error: 'Missing required fields: title, subject, grade, or author' };
    }

    const { data, error } = await supabase
      .from('study_guides')
      .insert({
        title: guide.title,
        subject: guide.subject,
        grade: guide.grade,
        topic: guide.topic,
        description: guide.description,
        author: guide.author,
        difficulty: guide.difficulty,
        estimated_time: guide.estimatedTime,
        download_url: guide.downloadUrl,
        preview_url: guide.previewUrl,
        rating: guide.rating,
        downloads: guide.downloads,
        pages: guide.pages,
        format: guide.format,
        last_updated: guide.lastUpdated,
        tags: guide.tags,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    // Invalidate cache
    guidesCache = null;
    guidesCacheTimestamp = null;

    if (error) {
      console.error('Database insert error:', error);
      return { success: false, id: undefined as unknown as string, error: error.message };
    }
    return { success: true, id: String((data as any).id), error: null };
  } catch (error: unknown) {
    console.error('Save study guide error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const updateBook = async (id: string, book: Partial<Book>) => {
  try {
    const updateData: any = {};
    if (book.title) updateData.title = book.title;
    if (book.author) updateData.author = book.author;
    if (book.subject) updateData.subject = book.subject;
    if (book.grade) updateData.grade = book.grade;
    if (book.description) updateData.description = book.description;
    if (book.coverImage) updateData.cover_image = book.coverImage;
    if (book.downloadUrl) updateData.download_url = book.downloadUrl;
    if (book.rating !== undefined) updateData.rating = book.rating;
    if (book.pages !== undefined) updateData.pages = book.pages;
    if (book.format) updateData.format = book.format;
    if (book.publisher) updateData.publisher = book.publisher;
    if (book.year) updateData.year = book.year;
    if (book.isbn) updateData.isbn = book.isbn;

    const { error } = await supabase.from('books').update(updateData).eq('id', id);
    if (error) throw error;

    // Invalidate cache
    booksCache = null;
    booksCacheTimestamp = null;

    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const updateStudyGuide = async (id: string, guide: Partial<StudyGuide>) => {
  try {
    const updateData: any = {};
    if (guide.title) updateData.title = guide.title;
    if (guide.subject) updateData.subject = guide.subject;
    if (guide.grade) updateData.grade = guide.grade;
    if (guide.topic) updateData.topic = guide.topic;
    if (guide.description) updateData.description = guide.description;
    if (guide.author) updateData.author = guide.author;
    if (guide.difficulty) updateData.difficulty = guide.difficulty;
    if (guide.estimatedTime) updateData.estimated_time = guide.estimatedTime;
    if (guide.downloadUrl) updateData.download_url = guide.downloadUrl;
    if (guide.previewUrl) updateData.preview_url = guide.previewUrl;
    if (guide.rating !== undefined) updateData.rating = guide.rating;
    if (guide.downloads !== undefined) updateData.downloads = guide.downloads;
    if (guide.pages !== undefined) updateData.pages = guide.pages;
    if (guide.format) updateData.format = guide.format;
    if (guide.lastUpdated) updateData.last_updated = guide.lastUpdated;
    if (guide.tags) updateData.tags = guide.tags;

    const { error } = await supabase.from('study_guides').update(updateData).eq('id', id);
    if (error) throw error;

    // Invalidate cache
    guidesCache = null;
    guidesCacheTimestamp = null;

    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const deleteBook = async (id: string) => {
  try {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;

    // Invalidate cache
    booksCache = null;
    booksCacheTimestamp = null;

    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const deleteStudyGuide = async (id: string) => {
  try {
    const { error } = await supabase.from('study_guides').delete().eq('id', id);
    if (error) throw error;

    // Invalidate cache
    guidesCache = null;
    guidesCacheTimestamp = null;

    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

// Statistics functions
export const getLibraryStats = async () => {
  try {
    const [booksResult, guidesResult] = await Promise.all([
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('study_guides').select('id', { count: 'exact', head: true })
    ]);

    const booksCount = booksResult.count || 0;
    const guidesCount = guidesResult.count || 0;

    return {
      success: true,
      stats: {
        totalBooks: booksCount,
        totalStudyGuides: guidesCount,
        totalResources: booksCount + guidesCount
      },
      error: null
    };
  } catch (error: unknown) {
    return {
      success: false,
      stats: { totalBooks: 0, totalStudyGuides: 0, totalResources: 0 },
      error: error instanceof Error ? error.message : 'An error occurred'
    };
  }
};

// Storage helpers

const sanitizePathSegment = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop() as string : '';
};

const uploadFileToStorage = async (
  bucket: string,
  path: string,
  file: File,
  upsert: boolean = false
): Promise<{ success: boolean; publicUrl?: string; path?: string; error?: string }> => {
  try {
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 50MB limit' };
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert, contentType: file.type });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { success: true, publicUrl: data.publicUrl, path };
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
};

// Public helpers for books
export const uploadBookCover = async (file: File, title: string) => {
  const bucket = 'library'; // Ensure this bucket exists in Supabase
  const slug = sanitizePathSegment(title || 'book');
  const ext = getFileExtension(file.name) || 'jpg';
  const path = `books/covers/${slug}-${Date.now()}.${ext}`;
  return uploadFileToStorage(bucket, path, file, true);
};

export const uploadBookFile = async (file: File, title: string) => {
  const bucket = 'library'; // Ensure this bucket exists in Supabase
  const slug = sanitizePathSegment(title || 'book');
  const ext = getFileExtension(file.name) || 'pdf';
  const path = `books/files/${slug}-${Date.now()}.${ext}`;
  return uploadFileToStorage(bucket, path, file, true);
};

// Public helpers for study guides
export const uploadGuidePreview = async (file: File, title: string) => {
  const bucket = 'library';
  const slug = sanitizePathSegment(title || 'guide');
  const ext = getFileExtension(file.name) || 'jpg';
  const path = `guides/previews/${slug}-${Date.now()}.${ext}`;
  return uploadFileToStorage(bucket, path, file, true);
};

export const uploadGuideFile = async (file: File, title: string) => {
  const bucket = 'library';
  const slug = sanitizePathSegment(title || 'guide');
  const ext = getFileExtension(file.name) || 'pdf';
  const path = `guides/files/${slug}-${Date.now()}.${ext}`;
  return uploadFileToStorage(bucket, path, file, true);
};