# Supabase Storage Troubleshooting Guide

## Common Download Issues and Solutions

### 1. **Download Buttons Not Working**

#### Problem: Buttons don't respond to clicks
**Solution:** ✅ **FIXED** - Added proper `onClick` handlers to all download buttons

#### Problem: URLs are undefined or null
**Causes:**
- Files not properly uploaded to Supabase
- Database records missing download URLs
- Storage bucket not configured correctly

**Debugging Steps:**
1. Check browser console for logged URLs
2. Verify data in Supabase dashboard
3. Check storage bucket contents

### 2. **Supabase Storage Configuration Issues**

#### Required Storage Bucket Setup:
```sql
-- Create the library bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('library', 'library', true);
```

#### Required Storage Policies:
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'library');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'library' AND 
  auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'library' AND 
  auth.role() = 'authenticated'
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'library' AND 
  auth.role() = 'authenticated'
);
```

### 3. **CORS Issues**

#### Problem: Files don't load due to CORS errors
**Solution:** Ensure Supabase storage bucket allows cross-origin requests

#### Check CORS Configuration:
1. Go to Supabase Dashboard → Storage → Settings
2. Ensure "Public bucket" is enabled
3. Check CORS settings allow your domain

### 4. **File URL Generation Issues**

#### Problem: URLs are malformed or incorrect
**Debugging Steps:**

1. **Check URL Format:**
   ```javascript
   // Correct Supabase URL format:
   // https://your-project.supabase.co/storage/v1/object/public/library/path/to/file.pdf
   ```

2. **Verify URL Generation:**
   ```javascript
   // In libraryService.ts, URLs are generated like this:
   const { data } = supabase.storage.from(bucket).getPublicUrl(path);
   return { success: true, publicUrl: data.publicUrl, path };
   ```

3. **Test URL Manually:**
   - Copy URL from console log
   - Paste in browser address bar
   - Should download or display the file

### 5. **Database Schema Issues**

#### Required Tables:
```sql
-- Books table
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  download_url TEXT,  -- This should contain the Supabase URL
  rating INTEGER DEFAULT 0,
  pages INTEGER DEFAULT 0,
  format TEXT DEFAULT 'PDF',
  publisher TEXT,
  year TEXT,
  isbn TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study guides table
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
  download_url TEXT,  -- This should contain the Supabase URL
  preview_url TEXT,   -- This should contain the Supabase URL
  rating INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  pages INTEGER DEFAULT 0,
  format TEXT DEFAULT 'PDF',
  last_updated TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. **Debugging Steps**

#### Step 1: Check Console Logs
- Open browser developer tools
- Click download buttons
- Check console for logged URLs
- Verify URLs are not null/undefined

#### Step 2: Test URLs Manually
- Copy URL from console
- Paste in new browser tab
- Should download or display file

#### Step 3: Check Supabase Dashboard
1. **Storage Tab:**
   - Verify files exist in 'library' bucket
   - Check file paths match database records

2. **Database Tab:**
   - Check books/study_guides tables
   - Verify download_url fields contain valid URLs

#### Step 4: Check Network Tab
- Open developer tools → Network tab
- Click download button
- Look for failed requests
- Check response status codes

### 7. **Common Error Messages and Solutions**

#### "Failed to load resource: the server responded with a status of 403"
**Solution:** Storage bucket not public or missing read policy

#### "Failed to load resource: the server responded with a status of 404"
**Solution:** File doesn't exist in storage bucket

#### "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution:** CORS not configured for storage bucket

#### "download_url is null"
**Solution:** File upload failed or database record incomplete

### 8. **Testing Checklist**

- [ ] Storage bucket 'library' exists and is public
- [ ] Storage policies allow public read access
- [ ] Files uploaded successfully to storage
- [ ] Database records contain valid download URLs
- [ ] URLs are properly formatted Supabase URLs
- [ ] Download buttons have onClick handlers
- [ ] Console logs show valid URLs when clicking buttons
- [ ] URLs work when pasted directly in browser

### 9. **Quick Fix Commands**

#### Reset Storage Policies:
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Recreate policies (see section 2 above)
```

#### Check Bucket Configuration:
```sql
-- Check if bucket exists and is public
SELECT * FROM storage.buckets WHERE id = 'library';
```

### 10. **Environment Variables**

Ensure your `.env.local` file contains:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** The anon key should have access to storage operations.