-- Digital High School Library - Complete Supabase Schema
-- This schema supports the enhanced digital library with books, study guides, and papers

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create tables for the digital library

-- 1. Papers table (existing - enhanced)
CREATE TABLE IF NOT EXISTS public.papers (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    grade TEXT NOT NULL CHECK (grade IN ('10', '11', '12')),
    subject TEXT NOT NULL,
    province TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    year TEXT NOT NULL,
    description TEXT,
    publisher TEXT,
    format TEXT DEFAULT 'PDF',
    identifier TEXT,
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Books table (new)
CREATE TABLE IF NOT EXISTS public.books (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL CHECK (grade IN ('10', '11', '12')),
    description TEXT,
    cover_image TEXT DEFAULT '/api/placeholder/300/400',
    download_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    pages INTEGER DEFAULT 0,
    format TEXT DEFAULT 'PDF' CHECK (format IN ('PDF', 'EPUB', 'Interactive')),
    publisher TEXT,
    year TEXT,
    isbn TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Study Guides table (new)
CREATE TABLE IF NOT EXISTS public.study_guides (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL CHECK (grade IN ('10', '11', '12')),
    topic TEXT,
    description TEXT,
    author TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    estimated_time TEXT,
    download_url TEXT,
    preview_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    downloads INTEGER DEFAULT 0,
    pages INTEGER DEFAULT 0,
    format TEXT DEFAULT 'PDF' CHECK (format IN ('PDF', 'EPUB', 'Interactive')),
    last_updated DATE DEFAULT CURRENT_DATE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Surveys table (existing - enhanced)
CREATE TABLE IF NOT EXISTS public.surveys (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_email TEXT NOT NULL,
    most_needed_subjects TEXT[] NOT NULL,
    study_frequency TEXT NOT NULL CHECK (study_frequency IN ('daily', 'weekly', 'monthly', 'rarely')),
    preferred_resources TEXT[] NOT NULL,
    additional_comments TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Downloads table (new - for tracking)
CREATE TABLE IF NOT EXISTS public.user_downloads (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('paper', 'book', 'study_guide')),
    resource_id BIGINT NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Favorites table (new - for bookmarking)
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('paper', 'book', 'study_guide')),
    resource_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_type, resource_id)
);

-- 7. User Progress table (new - for tracking study progress)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('paper', 'book', 'study_guide')),
    resource_id BIGINT NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, resource_type, resource_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_papers_grade ON public.papers(grade);
CREATE INDEX IF NOT EXISTS idx_papers_subject ON public.papers(subject);
CREATE INDEX IF NOT EXISTS idx_papers_year ON public.papers(year);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON public.papers(created_at);

CREATE INDEX IF NOT EXISTS idx_books_grade ON public.books(grade);
CREATE INDEX IF NOT EXISTS idx_books_subject ON public.books(subject);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books(author);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at);

CREATE INDEX IF NOT EXISTS idx_study_guides_grade ON public.study_guides(grade);
CREATE INDEX IF NOT EXISTS idx_study_guides_subject ON public.study_guides(subject);
CREATE INDEX IF NOT EXISTS idx_study_guides_difficulty ON public.study_guides(difficulty);
CREATE INDEX IF NOT EXISTS idx_study_guides_tags ON public.study_guides USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_study_guides_created_at ON public.study_guides(created_at);

CREATE INDEX IF NOT EXISTS idx_user_downloads_user_id ON public.user_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_downloads_resource ON public.user_downloads(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_papers_updated_at
    BEFORE UPDATE ON public.papers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_study_guides_updated_at
    BEFORE UPDATE ON public.study_guides
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Papers policies
CREATE POLICY "Papers are viewable by authenticated users" ON public.papers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Papers are manageable by admins" ON public.papers
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@library.edu',
            'administrator@school.edu'
        )
    );

-- Books policies
CREATE POLICY "Books are viewable by authenticated users" ON public.books
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Books are manageable by admins" ON public.books
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@library.edu',
            'administrator@school.edu'
        )
    );

-- Study guides policies
CREATE POLICY "Study guides are viewable by authenticated users" ON public.study_guides
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Study guides are manageable by admins" ON public.study_guides
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@library.edu',
            'administrator@school.edu'
        )
    );

-- Surveys policies
CREATE POLICY "Users can insert their own surveys" ON public.surveys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all surveys" ON public.surveys
    FOR SELECT USING (
        auth.jwt() ->> 'email' IN (
            'admin@library.edu',
            'administrator@school.edu'
        )
    );

-- User downloads policies
CREATE POLICY "Users can manage their own downloads" ON public.user_downloads
    FOR ALL USING (auth.uid() = user_id);

-- User favorites policies
CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can manage their own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- Sample data for testing (optional)
-- Uncomment the sections below to insert sample data

/*
-- Sample Papers
INSERT INTO public.papers (title, grade, subject, province, exam_type, year, description, publisher, download_url) VALUES
('Mathematics Grade 12 Final Exam', '12', 'Mathematics', 'Gauteng', 'Final Exam', '2023', 'Comprehensive mathematics final exam covering all grade 12 topics', 'Department of Education', 'https://example.com/math-12-final.pdf'),
('Life Sciences Grade 11 Test', '11', 'Life Sciences', 'KZN', 'Test', '2023', 'Life sciences test focusing on human biology and ecology', 'Provincial Education', 'https://example.com/life-sciences-11.pdf'),
('Physical Sciences Grade 10 Practical', '10', 'Physical Sciences', 'Gauteng', 'Practical', '2023', 'Practical examination for physical sciences grade 10', 'Science Department', 'https://example.com/physics-10-practical.pdf');

-- Sample Books
INSERT INTO public.books (title, author, subject, grade, description, publisher, year, rating, pages, isbn) VALUES
('Mathematics Grade 12 Textbook', 'Dr. Sarah Johnson', 'Mathematics', '12', 'Comprehensive mathematics textbook covering all Grade 12 curriculum requirements including calculus, algebra, and geometry.', 'Educational Publishers', '2024', 4.8, 456, '978-0-123456-78-9'),
('Life Sciences: Living Systems', 'Prof. Michael Chen', 'Life Sciences', '11', 'Explore the complexity of living systems with detailed illustrations and practical examples.', 'Science Education Press', '2024', 4.6, 389, '978-0-123456-79-0'),
('Physical Sciences Fundamentals', 'Dr. Emily Rodriguez', 'Physical Sciences', '10', 'Introduction to physics and chemistry concepts with hands-on experiments and real-world applications.', 'Science Works', '2023', 4.7, 425, '978-0-123456-80-6'),
('Geography: Our Changing World', 'Dr. James Wilson', 'Geography', '12', 'Comprehensive study of physical and human geography with contemporary global case studies.', 'World Studies Press', '2024', 4.5, 378, '978-0-123456-81-3'),
('Business Studies: Entrepreneurship', 'Prof. Lisa Anderson', 'Business Studies', '11', 'Learn about business principles, entrepreneurship, and economic systems.', 'Business Education Hub', '2024', 4.4, 342, '978-0-123456-82-0'),
('History: The Modern World', 'Dr. Robert Taylor', 'History', '10', 'Explore major historical events and their impact on the modern world.', 'Historical Perspectives', '2023', 4.6, 412, '978-0-123456-83-7');

-- Sample Study Guides
INSERT INTO public.study_guides (title, subject, grade, topic, description, author, difficulty, estimated_time, rating, downloads, pages, tags) VALUES
('Calculus Quick Reference Guide', 'Mathematics', '12', 'Calculus', 'Essential calculus formulas, derivatives, and integrals with step-by-step examples.', 'Dr. Sarah Johnson', 'Advanced', '2 hours', 4.8, 1250, 24, ARRAY['derivatives', 'integrals', 'limits', 'formulas']),
('Photosynthesis Study Guide', 'Life Sciences', '11', 'Plant Biology', 'Comprehensive guide to photosynthesis process, light and dark reactions, and factors affecting photosynthesis.', 'Prof. Michael Chen', 'Intermediate', '1.5 hours', 4.6, 980, 18, ARRAY['photosynthesis', 'chloroplast', 'light reactions', 'Calvin cycle']),
('Chemical Bonding Essentials', 'Physical Sciences', '10', 'Chemistry', 'Master ionic, covalent, and metallic bonding with clear diagrams and practice problems.', 'Dr. Emily Rodriguez', 'Beginner', '1 hour', 4.7, 1430, 16, ARRAY['ionic bonding', 'covalent bonding', 'metallic bonding', 'lewis structures']),
('World War II Timeline', 'History', '11', 'Modern History', 'Detailed timeline of WWII events with key dates, battles, and turning points.', 'Dr. Robert Taylor', 'Intermediate', '45 minutes', 4.5, 756, 12, ARRAY['WWII', 'timeline', 'battles', 'axis powers', 'allied forces']),
('Climate and Weather Patterns', 'Geography', '12', 'Physical Geography', 'Understanding global climate systems, weather patterns, and climate change impacts.', 'Dr. James Wilson', 'Advanced', '2.5 hours', 4.9, 892, 32, ARRAY['climate', 'weather', 'global warming', 'precipitation', 'temperature']),
('Financial Statements Analysis', 'Business Studies', '12', 'Accounting', 'Learn to analyze financial statements, ratios, and make informed business decisions.', 'Prof. Lisa Anderson', 'Advanced', '3 hours', 4.4, 634, 28, ARRAY['financial statements', 'ratios', 'analysis', 'accounting', 'business']),
('Algebra Fundamentals', 'Mathematical Literacy', '10', 'Basic Algebra', 'Essential algebra concepts including equations, inequalities, and graphing.', 'Ms. Jennifer Smith', 'Beginner', '1.5 hours', 4.6, 1125, 20, ARRAY['algebra', 'equations', 'inequalities', 'graphing', 'variables']),
('Human Anatomy Quick Reference', 'Life Sciences', '12', 'Human Biology', 'Complete reference for human body systems with labeled diagrams and functions.', 'Dr. Patricia Adams', 'Intermediate', '2 hours', 4.8, 1067, 36, ARRAY['anatomy', 'human body', 'systems', 'organs', 'physiology']);
*/

-- Views for analytics and reporting

-- Library statistics view
CREATE OR REPLACE VIEW public.library_stats AS
SELECT 
    'papers' as resource_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN grade = '10' THEN 1 END) as grade_10_count,
    COUNT(CASE WHEN grade = '11' THEN 1 END) as grade_11_count,
    COUNT(CASE WHEN grade = '12' THEN 1 END) as grade_12_count
FROM public.papers
UNION ALL
SELECT 
    'books' as resource_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN grade = '10' THEN 1 END) as grade_10_count,
    COUNT(CASE WHEN grade = '11' THEN 1 END) as grade_11_count,
    COUNT(CASE WHEN grade = '12' THEN 1 END) as grade_12_count
FROM public.books
UNION ALL
SELECT 
    'study_guides' as resource_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN grade = '10' THEN 1 END) as grade_10_count,
    COUNT(CASE WHEN grade = '11' THEN 1 END) as grade_11_count,
    COUNT(CASE WHEN grade = '12' THEN 1 END) as grade_12_count
FROM public.study_guides;

-- Popular resources view
CREATE OR REPLACE VIEW public.popular_resources AS
SELECT 
    'study_guide' as resource_type,
    id,
    title,
    downloads as popularity_score,
    'downloads' as metric_type
FROM public.study_guides
WHERE downloads > 0
ORDER BY downloads DESC
LIMIT 10;

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_downloads TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_favorites TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT INSERT ON public.surveys TO authenticated;

-- Grant permissions for admin users (you'll need to adjust the admin check logic based on your setup)
-- This is a simplified version - in production, you might want to use a separate admin role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;