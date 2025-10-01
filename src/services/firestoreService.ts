import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../config/firebase";
import { PaperMetadata } from "./githubService";

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
    await addDoc(collection(db, "surveys"), {
      ...data,
      timestamp: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const savePaperMetadata = async (metadata: PaperMetadata) => {
  try {
    const docRef = await addDoc(collection(db, "papers"), {
      ...metadata,
      createdAt: serverTimestamp()
    });
    
    // Invalidate cache when new paper is added
    papersCache = null;
    papersCacheTimestamp = null;
    
    return { success: true, id: docRef.id, error: null };
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

    const q = query(collection(db, "papers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const papers: (PaperMetadata & { id: string })[] = [];
    querySnapshot.forEach((doc) => {
      papers.push({ id: doc.id, ...doc.data() } as PaperMetadata & { id: string });
    });
    
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
    const q = query(collection(db, "surveys"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const surveys: (SurveyData & { id: string })[] = [];
    querySnapshot.forEach((doc) => {
      surveys.push({ id: doc.id, ...doc.data() } as SurveyData & { id: string });
    });
    return { success: true, surveys, error: null };
  } catch (error: unknown) {
    return { success: false, surveys: [], error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const updatePaper = async (id: string, metadata: Partial<PaperMetadata>) => {
  try {
    await updateDoc(doc(db, "papers", id), metadata);
    
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
    await deleteDoc(doc(db, "papers", id));
    
    // Invalidate cache when paper is deleted
    papersCache = null;
    papersCacheTimestamp = null;
    
    return { success: true, error: null };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

// Real-time listener for papers (temporarily disabled due to connection issues)
export const subscribeToPapers = () => {
  // Temporarily return a no-op function to prevent connection errors
  // TODO: Re-enable when Firebase connection issues are resolved
  console.log('Real-time listener temporarily disabled');
  return () => {};
};