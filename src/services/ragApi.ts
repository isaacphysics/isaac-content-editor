/**
 * RAG Pipeline Service for Isaac Content Editor
 * 
 * Provides:
 * - Document upload and indexing for RAG
 * - Semantic Scholar API integration
 * - Vector store query operations via the Isaac API
 * - Citation and reference management
 */

import { localFetcher } from "./isaacApi";
import { siteSpecific } from "./site";

const StagingServer = siteSpecific(
    "https://staging.isaacscience.org",
    "https://staging.adacomputerscience.org"
);
const LiveServer = siteSpecific(
    "https://isaacscience.org",
    "https://adacomputerscience.org"
);

function makeRagFetcher(server: string) {
    return async function ragFetcher(path: string, options?: RequestInit) {
        const fullPath = server.includes("localhost") 
            ? `${server}/isaac-api/api/${path}`
            : `${server}/api/any/api/${path}`;
        
        const result = await fetch(fullPath, {
            ...options,
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        });
        
        if (!result.ok) {
            const errorBody = await result.text();
            throw new Error(`RAG API error ${result.status}: ${errorBody}`);
        }
        return result.json();
    };
}

export const stagingRagFetcher = makeRagFetcher(StagingServer);
export const liveRagFetcher = makeRagFetcher(LiveServer);

// Determine which fetcher to use based on environment
function getRagFetcher(): (path: string, options?: RequestInit) => Promise<any> {
    const host = window.location.hostname;
    if (host.includes("staging")) return stagingRagFetcher;
    if (host.includes("localhost")) return localFetcher as any;
    return liveRagFetcher;
}

// ============================================================
// Types
// ============================================================

export interface RAGDocument {
    id: string;
    name: string;
    type: "pdf" | "doc" | "txt" | "url" | "academic_paper";
    source?: string; // URL or file path
    uploadedAt: string;
    status: "indexing" | "ready" | "error";
    chunkCount?: number;
    metadata?: Record<string, string>;
}

export interface SemanticScholarPaper {
    paperId: string;
    title: string;
    abstract?: string;
    authors: Array<{ authorId: string; name: string }>;
    year?: number;
    venue?: string;
    citationCount?: number;
    openAccessPdf?: {
        url: string;
        status: string;
    };
    externalIds?: {
        DOI?: string;
        ArXiv?: string;
        PubMed?: string;
    };
}

export interface SemanticScholarSearchResult {
    papers: SemanticScholarPaper[];
    total: number;
    offset: number;
    next?: string;
}

export interface RAGChunk {
    chunkId: string;
    documentId: string;
    content: string;
    metadata: {
        pageNumber?: number;
        sourceFile?: string;
        startChar?: number;
        endChar?: number;
    };
    embedding?: number[];
}

export interface RAGQueryResult {
    answer: string;
    sourceChunks: Array<{
        chunk: RAGChunk;
        score: number;
        document: RAGDocument;
    }>;
    citations: Array<{
        documentId: string;
        documentName: string;
        chunkContent: string;
        citationText: string;
    }>;
    totalChunks?: number;
}

export interface RAGQueryRequest {
    query: string;
    documentIds?: string[]; // Optional: restrict to specific documents
    topK?: number;
    includeCitations?: boolean;
    searchType?: "similarity" | "mmr"; // similarity or maximal marginal relevance
}

// ============================================================
// Document Management
// ============================================================

/**
 * Upload a document for RAG indexing
 * Supports: PDF, TXT, DOC files
 */
export async function uploadRAGDocument(
    file: File,
    metadata?: Record<string, string>
): Promise<{ documentId: string; status: string }> {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata) {
        formData.append("metadata", JSON.stringify(metadata));
    }

    const fetcher = getRagFetcher();
    return fetcher("/rag/documents/upload", {
        method: "POST",
        body: formData as any,
    });
}

/**
 * Add a URL as a document source for RAG
 */
export async function addRAGUrl(
    url: string,
    name: string,
    metadata?: Record<string, string>
): Promise<{ documentId: string; status: string }> {
    const fetcher = getRagFetcher();
    return fetcher("/rag/documents/url", {
        method: "POST",
        body: JSON.stringify({ url, name, metadata }),
    });
}

/**
 * List all documents in the user's RAG corpus
 */
export async function listRAGDocuments(): Promise<RAGDocument[]> {
    const fetcher = getRagFetcher();
    return fetcher("/rag/documents");
}

/**
 * Delete a document from the RAG corpus
 */
export async function deleteRAGDocument(documentId: string): Promise<void> {
    const fetcher = getRagFetcher();
    return fetcher(`/rag/documents/${documentId}`, {
        method: "DELETE",
    });
}

/**
 * Get document status and details
 */
export async function getRAGDocument(documentId: string): Promise<RAGDocument> {
    const fetcher = getRagFetcher();
    return fetcher(`/rag/documents/${documentId}`);
}

/**
 * Re-index a document (after updates)
 */
export async function reindexRAGDocument(documentId: string): Promise<{ status: string }> {
    const fetcher = getRagFetcher();
    return fetcher(`/rag/documents/${documentId}/reindex`, {
        method: "POST",
    });
}

// ============================================================
// RAG Query
// ============================================================

/**
 * Query the RAG corpus with a question
 * Returns an AI-generated answer with citations
 */
export async function queryRAG(request: RAGQueryRequest): Promise<RAGQueryResult> {
    const fetcher = getRagFetcher();
    return fetcher("/rag/query", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

/**
 * Get suggested follow-up questions based on context
 */
export async function getRAGSuggestions(
    context: string,
    count?: number
): Promise<string[]> {
    const fetcher = getRagFetcher();
    return fetcher("/rag/suggestions", {
        method: "POST",
        body: JSON.stringify({ context, count: count ?? 3 }),
    });
}

// ============================================================
// Semantic Scholar Integration
// ============================================================

const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1";

const SS_HEADERS = {
    "Accept": "application/json",
};

/**
 * Search Semantic Scholar for academic papers
 */
export async function searchSemanticScholar(
    query: string,
    options?: {
        year?: string;       // e.g. "2024" or "2020-2024"
        venue?: string;      // e.g. "NeurIPS", "ICML"
        openAccessOnly?: boolean;
        limit?: number;
        offset?: number;
    }
): Promise<SemanticScholarSearchResult> {
    const params = new URLSearchParams({
        query,
        fields: "paperId,title,abstract,authors,year,venue,citationCount,openAccessPdf,externalIds",
        ...(options?.limit ? { limit: String(options.limit) } : {}),
        ...(options?.offset ? { offset: String(options.offset) } : {}),
    });

    const response = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/search?${params}`,
        { headers: SS_HEADERS }
    );

    if (!response.ok) {
        throw new Error(`Semantic Scholar API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for open access if requested
    let papers: SemanticScholarPaper[] = data.papers || [];
    if (options?.openAccessOnly) {
        papers = papers.filter(
            (p: SemanticScholarPaper) => p.openAccessPdf?.url
        );
    }

    return {
        papers,
        total: data.total || papers.length,
        offset: options?.offset || 0,
        next: data.next ? String(data.offset + data.limit) : undefined,
    };
}

/**
 * Get paper details from Semantic Scholar
 */
export async function getSemanticScholarPaper(
    paperId: string
): Promise<SemanticScholarPaper> {
    const fields = "paperId,title,abstract,authors,year,venue,citationCount,openAccessPdf,externalIds,influentialCitationCount,referenceCount";
    
    const response = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/${paperId}?fields=${fields}`,
        { headers: SS_HEADERS }
    );

    if (!response.ok) {
        throw new Error(`Semantic Scholar API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Get references (cited papers) for a Semantic Scholar paper
 */
export async function getSemanticScholarReferences(
    paperId: string,
    limit?: number
): Promise<SemanticScholarPaper[]> {
    const fields = "paperId,title,year,authors,venue,citationCount";
    const params = new URLSearchParams({ fields, limit: String(limit || 20) });

    const response = await fetch(
        `${SEMANTIC_SCHOLAR_API}/paper/${paperId}/references?${params}`,
        { headers: SS_HEADERS }
    );

    if (!response.ok) {
        throw new Error(`Semantic Scholar API error: ${response.status}`);
    }

    const data = await response.json();
    return (data.data || []).map((ref: any) => ref.paper).filter(Boolean);
}

/**
 * Add a Semantic Scholar paper to the RAG corpus
 * Fetches the PDF or abstract and indexes it
 */
export async function addSemanticScholarPaperToRAG(
    paperId: string
): Promise<{ documentId: string; status: string }> {
    const paper = await getSemanticScholarPaper(paperId);
    
    // Prefer open access PDF, fall back to adding abstract
    if (paper.openAccessPdf?.url) {
        return addRAGUrl(
            paper.openAccessPdf.url,
            paper.title,
            {
                type: "academic_paper",
                semanticScholarId: paperId,
                doi: paper.externalIds?.DOI || "",
                authors: paper.authors.map(a => a.name).join(", "),
                year: String(paper.year || ""),
                venue: paper.venue || "",
            }
        );
    } else {
        // Add abstract as a text document
        return addRAGUrl(
            `https://www.semanticscholar.org/paper/${paperId}`,
            paper.title,
            {
                type: "academic_paper",
                semanticScholarId: paperId,
                abstract: paper.abstract || "",
                doi: paper.externalIds?.DOI || "",
                authors: paper.authors.map(a => a.name).join(", "),
                year: String(paper.year || ""),
                venue: paper.venue || "",
            }
        );
    }
}

// ============================================================
// Citation Formatting
// ============================================================

/**
 * Format a citation in various styles
 */
export function formatCitation(
    paper: SemanticScholarPaper,
    style: "apa" | "mla" | "bibtex" = "apa"
): string {
    const authors = paper.authors.slice(0, 3);
    const authorStr = authors.map(a => a.name).join(", ");
    const etAl = paper.authors.length > 3 ? " et al." : "";
    const year = paper.year ? ` (${paper.year})` : "";
    const title = paper.title;
    const venue = paper.venue ? ` *${paper.venue}*` : "";

    switch (style) {
        case "apa":
            return `${authorStr}${etAl}${year}. ${title}.${venue}.`;
        case "bibtex": {
            const key = paper.authors[0]?.name.split(" ").pop()?.toLowerCase() || "unknown";
            return `@article{${key}${paper.year || ""},
  title={${title}},
  author={${paper.authors.map(a => a.name).join(" and ")}},
  year={${paper.year || ""}},
  journal={${paper.venue || "arxiv"}}
}`;
        }
        default:
            return `${authorStr}${etAl}, "${title}",${venue}${year}.`;
    }
}

/**
 * Generate inline citation marker [1], [2], etc.
 */
export function inlineCitation(index: number): string {
    return `[${index}]`;
}
