import { supabase } from '../config/supabaseClient';
import { PaperMetadata } from './githubService';

// Cache for papers to improve performance
let papersCache: (PaperMetadata & { id: string })[] | null = null;
let papersCacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface SurveyData {
  studentEmail: string;
  subjects: string[];
  studyFrequency: string;
  preferredResources: string[];
  additionalComments: string;
  timestamp?: unknown;
}

export const submitSurvey = async (data: SurveyData) => {
  try {
    const { error } = await supabase.from('surveys').insert({
      ...data,
      timestamp: new Date().toISOString()
    });
    return { success: !error, error: error ? error.message : null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const savePaperMetadata = async (metadata: PaperMetadata) => {
  try {
    const { data, error } = await supabase
      .from('papers')
      .insert({
        ...metadata,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    // Invalidate cache when new paper is added
    papersCache = null;
    papersCacheTimestamp = null;

    if (error) return { success: false, id: undefined as unknown as string, error: error.message };
    return { success: true, id: String((data as any).id), error: null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const getPapers = async (useCache: boolean = true) => {
  try {
    // Check cache first
    if (useCache && papersCache && papersCacheTimestamp &&
        Date.now() - papersCacheTimestamp < CACHE_DURATION) {
      return { success: true, papers: papersCache, error: null };
    }

    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const papers: (PaperMetadata & { id: string })[] = (data || []).map((row: any) => ({
      id: String(row.id),
      title: row.title,
      grade: row.grade,
      subject: row.subject,
      province: row.province,
      examType: row.examType,
      year: row.year,
      description: row.description,
      publisher: row.publisher,
      format: row.format,
      identifier: row.identifier,
      downloadUrl: row.downloadUrl
    }));

    // Update cache
    papersCache = papers;
    papersCacheTimestamp = Date.now();

    return { success: true, papers, error: null };
  } catch (error: unknown) {
    return { success: false, papers: [], error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const getSurveys = async () => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    const surveys: (SurveyData & { id: string })[] = (data || []).map((row: any) => ({
      id: String(row.id),
      studentEmail: row.studentEmail,
      subjects: row.subjects,
      studyFrequency: row.studyFrequency,
      preferredResources: row.preferredResources,
      additionalComments: row.additionalComments,
      timestamp: row.timestamp
    }));
    return { success: true, surveys, error: null };
  } catch (error: unknown) {
    return { success: false, surveys: [], error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const updatePaper = async (id: string, metadata: Partial<PaperMetadata>) => {
  try {
    const { error } = await supabase.from('papers').update(metadata).eq('id', id);
    if (error) throw error;

    // Invalidate cache when paper is updated
    papersCache = null;
    papersCacheTimestamp = null;

    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const deletePaper = async (id: string) => {
  try {
    const { error } = await supabase.from('papers').delete().eq('id', id);
    if (error) throw error;

    // Invalidate cache when paper is deleted
    papersCache = null;
    papersCacheTimestamp = null;

    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

// Real-time listener for papers (temporarily disabled)
export const subscribeToPapers = () => {
  // No-op; re-enable with Supabase real-time if desired
  // eslint-disable-next-line no-console
  console.log('Real-time listener temporarily disabled');
  return () => {};
};
