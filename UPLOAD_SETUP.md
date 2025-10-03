# Upload Functionality Setup Guide

## Prerequisites

### 1. Supabase Configuration
Create a `.env.local` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Supabase Storage Buckets
Create the following storage buckets in your Supabase project:

- **`library`** - Main bucket for all library files
  - Subfolders: `books/covers/`, `books/files/`, `guides/previews/`, `guides/files/`

### 3. Database Tables
Ensure the following tables exist in your Supabase database:

#### Books Table
```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  download_url TEXT,
  rating INTEGER DEFAULT 0,
  pages INTEGER DEFAULT 0,
  format TEXT DEFAULT 'PDF',
  publisher TEXT,
  year TEXT,
  isbn TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Study Guides Table
```sql
CREATE TABLE study_guides (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  topic TEXT,
  description TEXT,
  author TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Beginner',
  estimated_time TEXT,
  download_url TEXT,
  preview_url TEXT,
  rating INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  pages INTEGER DEFAULT 0,
  format TEXT DEFAULT 'PDF',
  last_updated TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Storage Policies
Set up Row Level Security (RLS) policies for the storage buckets:

```sql
-- Allow public read access to library files
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'library');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'library' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'library' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'library' AND 
  auth.role() = 'authenticated'
);
```

## Upload Functionality

### Books Upload
- **Location**: Admin Dashboard → Books Tab
- **Features**:
  - Upload PDF files
  - Upload cover images (optional)
  - Add metadata (title, author, subject, grade, etc.)
  - Automatic file organization in storage

### Study Guides Upload
- **Location**: Admin Dashboard → Study Guides Tab
- **Features**:
  - Upload PDF files
  - Upload preview images (optional)
  - Add metadata (title, subject, grade, topic, difficulty, etc.)
  - Automatic file organization in storage

## File Organization

Files are automatically organized in the storage bucket:

```
library/
├── books/
│   ├── covers/
│   │   └── book-title-1234567890.jpg
│   └── files/
│       └── book-title-1234567890.pdf
└── guides/
    ├── previews/
    │   └── guide-title-1234567890.jpg
    └── files/
        └── guide-title-1234567890.pdf
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure `.env.local` file exists with correct credentials
   - Restart the development server after adding environment variables

2. **"Upload failed"**
   - Check if the `library` storage bucket exists
   - Verify storage policies allow uploads
   - Check file size limits (default: 50MB)

3. **"Database error"**
   - Ensure database tables exist with correct schema
   - Check RLS policies for the tables

4. **Files not showing for students**
   - Verify the `getBooks()` and `getStudyGuides()` functions are working
   - Check if files are properly saved to the database
   - Ensure public read access is enabled for storage

### Testing Upload

1. Start the development server: `npm run dev`
2. Login as admin (email: admin@example.com or admin@school.com)
3. Navigate to Admin Dashboard
4. Try uploading a book or study guide
5. Check if it appears in the student/library views

## Security Notes

- All uploads require authentication
- File types are restricted (PDF for books/guides, images for covers/previews)
- File names are sanitized to prevent security issues
- Storage policies control access to uploaded files