// Sample content for Grades 10–12 to ensure the library never feels empty
// Papers closely mirror the shape used by StudentDashboard and supabaseService mapping

export interface SamplePaper {
	id: string;
	title: string;
	grade: string;
	subject: string;
	province: string;
	examType: string;
	year: string;
	description: string;
	publisher?: string;
	download_url?: string;
}

export const SAMPLE_PAPERS: SamplePaper[] = [
	{
		id: 'sp-10-maths-2024-final-kzn',
		title: 'Mathematics Paper 1 (Final Exam)',
		grade: '10',
		subject: 'Mathematics',
		province: 'KZN',
		examType: 'Final',
		year: '2024',
		description: 'Algebra, functions, and number patterns focus.',
		publisher: 'Department of Education',
		download_url: 'https://example.com/sample-maths-g10-2024-final.pdf'
	},
	{
		id: 'sp-11-physci-2023-mid-gp',
		title: 'Physical Sciences Paper (Mid-Year)',
		grade: '11',
		subject: 'Physical Sciences',
		province: 'Gauteng',
		examType: 'Mid-Year',
		year: '2023',
		description: 'Chemistry: stoichiometry and gases; Physics: mechanics.',
		publisher: 'Department of Education',
		download_url: 'https://example.com/sample-physci-g11-2023-mid.pdf'
	},
	{
		id: 'sp-12-life-2024-final-kzn',
		title: 'Life Sciences Paper (Final Exam)',
		grade: '12',
		subject: 'Life Sciences',
		province: 'KZN',
		examType: 'Final',
		year: '2024',
		description: 'Genetics, evolution, and human reproduction.',
		publisher: 'Department of Education',
		download_url: 'https://example.com/sample-lifesciences-g12-2024-final.pdf'
	},
	{
		id: 'sp-12-geo-2023-trial-gp',
		title: 'Geography Paper (Trial Exam)',
		grade: '12',
		subject: 'Geography',
		province: 'Gauteng',
		examType: 'Trial',
		year: '2023',
		description: 'Geomorphology, mapwork, and climate.',
		publisher: 'Department of Education',
		download_url: 'https://example.com/sample-geography-g12-2023-trial.pdf'
	},
	{
		id: 'sp-11-acc-2024-final-kzn',
		title: 'Accounting Paper (Final Exam)',
		grade: '11',
		subject: 'Accounting',
		province: 'KZN',
		examType: 'Final',
		year: '2024',
		description: 'Financial statements and reconciliations.',
		publisher: 'Department of Education',
		download_url: 'https://example.com/sample-accounting-g11-2024-final.pdf'
	},
	{
		id: 'sp-10-bst-2023-mid-gp',
		title: 'Business Studies (Mid-Year)',
		grade: '10',
		subject: 'Business Studies',
		province: 'Gauteng',
		examType: 'Mid-Year',
		year: '2023',
		description: 'Entrepreneurship, business environments.',
		publisher: 'Department of Education',
		download_url: 'https://example.com/sample-business-g10-2023-mid.pdf'
	}
];

export interface LibraryResource {
	id: string;
	title: string;
	grade: string;
	subject: string;
	description: string;
	url: string;
}

export const SAMPLE_STUDY_GUIDES: LibraryResource[] = [
	{
		id: 'sg-maths-10-functions',
		title: 'Mathematics: Functions (Grade 10)',
		grade: '10',
		subject: 'Mathematics',
		description: 'Graphing, transformations, and inverse functions.',
		url: 'https://example.com/guides/maths-functions-g10.pdf'
	},
	{
		id: 'sg-physci-11-mechanics',
		title: 'Physical Sciences: Mechanics (Grade 11)',
		grade: '11',
		subject: 'Physical Sciences',
		description: 'Kinematics, dynamics, and energy.',
		url: 'https://example.com/guides/physci-mechanics-g11.pdf'
	},
	{
		id: 'sg-life-12-genetics',
		title: 'Life Sciences: Genetics (Grade 12)',
		grade: '12',
		subject: 'Life Sciences',
		description: 'DNA, inheritance, and genetic disorders.',
		url: 'https://example.com/guides/life-genetics-g12.pdf'
	}
];

export const SAMPLE_BOOKS: LibraryResource[] = [
	{
		id: 'bk-maths-10-study-companion',
		title: 'Maths Study Companion (Grade 10)',
		grade: '10',
		subject: 'Mathematics',
		description: 'Comprehensive notes with worked examples.',
		url: 'https://example.com/books/maths-companion-g10.pdf'
	},
	{
		id: 'bk-geo-12-atlas',
		title: 'Senior Atlas (Grade 12)',
		grade: '12',
		subject: 'Geography',
		description: 'Maps and data skills for exam success.',
		url: 'https://example.com/books/atlas-g12.pdf'
	},
	{
		id: 'bk-acc-11-ledger',
		title: 'Accounting Ledgers Workbook (Grade 11)',
		grade: '11',
		subject: 'Accounting',
		description: 'Practice ledgers with solutions.',
		url: 'https://example.com/books/accounting-ledgers-g11.pdf'
	}
];

