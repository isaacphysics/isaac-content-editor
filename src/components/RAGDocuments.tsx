import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Input,
    FormGroup,
    Label,
    ListGroup,
    ListGroupItem,
    Spinner,
    Alert,
    Badge,
    Nav,
    NavItem,
    NavLink,
    Row,
    Col,
    Card,
    CardBody,
} from "reactstrap";
import { FileUploader } from "react-drag-drop-files";
import {
    RAGDocument,
    SemanticScholarPaper,
    RAGQueryResult,
    inlineCitation,
    searchSemanticScholar,
    listRAGDocuments,
    uploadRAGDocument,
    deleteRAGDocument,
    addSemanticScholarPaperToRAG,
    queryRAG,
    addRAGUrl,
} from "../services/ragApi";
import styles from "../styles/rag.module.css";

interface RAGDocumentsModalProps {
    isOpen: boolean;
    toggle: () => void;
}

type TabId = "documents" | "semantic-scholar" | "query";

export const RAGDocumentsModal: FunctionComponent<RAGDocumentsModalProps> = ({
    isOpen,
    toggle,
}) => {
    const [activeTab, setActiveTab] = useState<TabId>("documents");

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            size={"xl"}
            backdrop={"static"}
            scrollable
        >
            <ModalHeader toggle={toggle} className={styles.modalHeader}>
                <span className={styles.modalTitle}>📚 Research Documents & RAG</span>
            </ModalHeader>

            <Nav tabs className={`px-3 pt-2 mb-0`}>
                <NavItem>
                    <NavLink
                        className={activeTab === "documents" ? styles.activeTab : ""}
                        onClick={() => setActiveTab("documents")}
                        style={{ cursor: "pointer" }}
                    >
                        📁 My Documents
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === "semantic-scholar" ? styles.activeTab : ""}
                        onClick={() => setActiveTab("semantic-scholar")}
                        style={{ cursor: "pointer" }}
                    >
                        🔬 Semantic Scholar
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === "query" ? styles.activeTab : ""}
                        onClick={() => setActiveTab("query")}
                        style={{ cursor: "pointer" }}
                    >
                        🤖 Ask Research
                    </NavLink>
                </NavItem>
            </Nav>

            <ModalBody className={styles.modalBody}>
                {activeTab === "documents" && (
                    <DocumentsTab />
                )}
                {activeTab === "semantic-scholar" && (
                    <SemanticScholarTab />
                )}
                {activeTab === "query" && (
                    <QueryTab />
                )}
            </ModalBody>

            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

// ============================================================
// Documents Tab
// ============================================================

const DocumentsTab: FunctionComponent = () => {
    const [documents, setDocuments] = useState<RAGDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [urlName, setUrlName] = useState("");
    const [addingUrl, setAddingUrl] = useState(false);

    const loadDocuments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const docs = await listRAGDocuments();
            setDocuments(docs);
        } catch (e: unknown) {
            setError(`Failed to load documents: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDocuments();
    }, [loadDocuments]);

    const handleFileUpload = async (files: File | File[]) => {
        setUploading(true);
        setUploadError(null);
        try {
            for (const file of Array.isArray(files) ? files : [files]) {
                await uploadRAGDocument(file, {
                    originalName: file.name,
                    uploadedBy: "content-editor",
                });
            }
            await loadDocuments();
        } catch (e: unknown) {
            setUploadError(`Upload failed: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setUploading(false);
        }
    };

    const handleAddUrl = async () => {
        if (!urlInput || !urlName) return;
        setAddingUrl(true);
        setUploadError(null);
        try {
            await addRAGUrl(urlInput, urlName);
            setUrlInput("");
            setUrlName("");
            await loadDocuments();
        } catch (e: unknown) {
            setUploadError(`Failed to add URL: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setAddingUrl(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!window.confirm("Delete this document from your RAG corpus?")) return;
        try {
            await deleteRAGDocument(docId);
            setDocuments(docs => docs.filter(d => d.id !== docId));
        } catch (e: unknown) {
            alert(`Failed to delete: ${e instanceof Error ? e.message : String(e)}`);
        }
    };

    const getStatusBadge = (doc: RAGDocument) => {
        switch (doc.status) {
            case "ready":
                return <Badge color="success">Ready</Badge>;
            case "indexing":
                return <Badge color="warning">Indexing...</Badge>;
            case "error":
                return <Badge color="danger">Error</Badge>;
            default:
                return null;
        }
    };

    return (
        <div>
            <Row className="mb-3">
                <Col md={6}>
                    <h5>Upload Documents</h5>
                    <FileUploader
                        types={["PDF", "TXT", "DOC", "DOCX"]}
                        multiple
                        fileOrFiles={undefined}
                        handleChange={handleFileUpload}
                        classes={styles.fileUploader}
                    />
                    {uploading && (
                        <div className="mt-2">
                            <Spinner size="sm" /> Uploading...
                        </div>
                    )}
                    {uploadError && (
                        <Alert color="danger" className="mt-2" fade={false}>
                            {uploadError}
                        </Alert>
                    )}
                </Col>
                <Col md={6}>
                    <h5>Add URL</h5>
                    <FormGroup>
                        <Input
                            placeholder="Document name"
                            value={urlName}
                            onChange={e => setUrlName(e.target.value)}
                            className="mb-2"
                        />
                        <Input
                            placeholder="https://..."
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            className="mb-2"
                        />
                        <Button
                            color="primary"
                            size="sm"
                            onClick={handleAddUrl}
                            disabled={addingUrl || !urlInput || !urlName}
                        >
                            {addingUrl ? <Spinner size="sm" /> : "Add URL"}
                        </Button>
                    </FormGroup>
                </Col>
            </Row>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>My Documents ({documents.length})</h5>
                <Button size="sm" onClick={loadDocuments} disabled={loading}>
                    🔄 Refresh
                </Button>
            </div>

            {loading && <Spinner size="sm" />}

            {error && (
                <Alert color="danger" fade={false}>
                    {error}
                    <Button size="sm" onClick={loadDocuments} className="ms-2">
                        Retry
                    </Button>
                </Alert>
            )}

            {!loading && documents.length === 0 && (
                <Alert color="info" fade={false}>
                    No documents yet. Upload a file or add a URL above to get started.
                </Alert>
            )}

            <ListGroup>
                {documents.map(doc => (
                    <ListGroupItem key={doc.id} className={styles.docItem}>
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-fill">
                                <div className={styles.docName}>{doc.name}</div>
                                <div className={styles.docMeta}>
                                    <Badge
                                        color={
                                            doc.type === "academic_paper"
                                                ? "info"
                                                : "secondary"
                                        }
                                        className="me-2"
                                    >
                                        {doc.type}
                                    </Badge>
                                    {getStatusBadge(doc)}
                                    {doc.chunkCount != null && (
                                        <span className="ms-2 text-muted">
                                            {doc.chunkCount} chunks
                                        </span>
                                    )}
                                    {doc.uploadedAt && (
                                        <span className="ms-2 text-muted">
                                            {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                {doc.source && (
                                    <div className={styles.docSource}>
                                        <a
                                            href={doc.source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {doc.source.length > 60
                                                ? doc.source.slice(0, 60) + "..."
                                                : doc.source}
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="ms-2">
                                <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => handleDelete(doc.id)}
                                >
                                    🗑️
                                </Button>
                            </div>
                        </div>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </div>
    );
};

// ============================================================
// Semantic Scholar Tab
// ============================================================

const SemanticScholarTab: FunctionComponent = () => {
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<SemanticScholarPaper[]>([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [addingPaper, setAddingPaper] = useState<string | null>(null);
    const [addedPapers, setAddedPapers] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState({
        yearFrom: "",
        yearTo: "",
        openAccessOnly: false,
    });

    const handleSearch = async (offset = 0) => {
        if (!query.trim()) return;
        setSearching(true);
        setError(null);
        try {
            let yearFilter: string | undefined;
            if (filters.yearFrom || filters.yearTo) {
                yearFilter = [filters.yearFrom, filters.yearTo]
                    .filter(Boolean)
                    .join("-");
            }

            const result = await searchSemanticScholar(query, {
                year: yearFilter,
                openAccessOnly: filters.openAccessOnly,
                limit: 20,
                offset,
            });
            setResults(result.papers);
            setTotal(result.total);
        } catch (e: unknown) {
            setError(`Search failed: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setSearching(false);
        }
    };

    const handleAddPaper = async (paper: SemanticScholarPaper) => {
        setAddingPaper(paper.paperId);
        try {
            await addSemanticScholarPaperToRAG(paper.paperId);
            setAddedPapers(prev => new Set([...prev, paper.paperId]));
        } catch (e: unknown) {
            alert(`Failed to add paper: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setAddingPaper(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            void handleSearch();
        }
    };

    return (
        <div>
            <h5>Search Academic Papers</h5>
            <p className="text-muted small">
                Search Semantic Scholar for research papers and add them to your
                RAG corpus for AI-powered querying with citations.
            </p>

            <Row className="mb-3">
                <Col md={8}>
                    <Input
                        placeholder="Search papers (e.g., 'transformer language models attention')..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="mb-2"
                    />
                </Col>
                <Col md={4}>
                    <Button
                        color="primary"
                        onClick={() => void handleSearch()}
                        disabled={searching || !query.trim()}
                        className="me-2"
                    >
                        {searching ? <Spinner size="sm" /> : "🔍 Search"}
                    </Button>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={3}>
                    <FormGroup>
                        <Label className="small">Year from</Label>
                        <Input
                            type="number"
                            placeholder="2000"
                            value={filters.yearFrom}
                            onChange={e =>
                                setFilters(f => ({
                                    ...f,
                                    yearFrom: e.target.value,
                                }))
                            }
                            min="1900"
                            max="2030"
                        />
                    </FormGroup>
                </Col>
                <Col md={3}>
                    <FormGroup>
                        <Label className="small">Year to</Label>
                        <Input
                            type="number"
                            placeholder="2026"
                            value={filters.yearTo}
                            onChange={e =>
                                setFilters(f => ({
                                    ...f,
                                    yearTo: e.target.value,
                                }))
                            }
                            min="1900"
                            max="2030"
                        />
                    </FormGroup>
                </Col>
                <Col md={3}>
                    <FormGroup check className="mt-4">
                        <Input
                            type="checkbox"
                            checked={filters.openAccessOnly}
                            onChange={e =>
                                setFilters(f => ({
                                    ...f,
                                    openAccessOnly: e.target.checked,
                                }))
                            }
                        />
                        <Label check>Open Access only</Label>
                    </FormGroup>
                </Col>
            </Row>

            {error && (
                <Alert color="danger" fade={false}>
                    {error}
                </Alert>
            )}

            {total > 0 && (
                <p className="text-muted">
                    Found {total.toLocaleString()} papers
                </p>
            )}

            {results.map(paper => (
                <Card key={paper.paperId} className="mb-2">
                    <CardBody className="py-2 px-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-fill">
                                <div className={styles.paperTitle}>
                                    <a
                                        href={`https://www.semanticscholar.org/paper/${paper.paperId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {paper.title}
                                    </a>
                                </div>
                                <div className={styles.paperMeta}>
                                    {paper.authors
                                        .slice(0, 5)
                                        .map(a => a.name)
                                        .join(", ")}
                                    {paper.authors.length > 5 && " et al."}
                                    {paper.year && ` • ${paper.year}`}
                                    {paper.venue && ` • ${paper.venue}`}
                                    {paper.citationCount != null && (
                                        <span className="ms-2">
                                            📖 {paper.citationCount} citations
                                        </span>
                                    )}
                                    {paper.openAccessPdf && (
                                        <Badge
                                            color="success"
                                            className="ms-2"
                                        >
                                            🔓 Open Access
                                        </Badge>
                                    )}
                                </div>
                                {paper.abstract && (
                                    <div className={styles.paperAbstract}>
                                        {paper.abstract.slice(0, 200)}
                                        {paper.abstract.length > 200 && "..."}
                                    </div>
                                )}
                            </div>
                            <div className="ms-2">
                                {addedPapers.has(paper.paperId) ? (
                                    <Badge color="success">✓ Added</Badge>
                                ) : (
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={() =>
                                            void handleAddPaper(paper)
                                        }
                                        disabled={
                                            addingPaper === paper.paperId
                                        }
                                    >
                                        {addingPaper === paper.paperId ? (
                                            <Spinner size="sm" />
                                        ) : (
                                            "➕ Add to RAG"
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}

            {searching && results.length === 0 && <Spinner />}

            {!searching && results.length === 0 && query && (
                <Alert color="info" fade={false}>
                    No papers found. Try different search terms.
                </Alert>
            )}
        </div>
    );
};

// ============================================================
// Query Tab
// ============================================================

const QueryTab: FunctionComponent = () => {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState<RAGQueryResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [documents, setDocuments] = useState<RAGDocument[]>([]);
    const [showCitations] = useState(true);

    useEffect(() => {
        // Load documents list for filtering
        listRAGDocuments()
            .then(setDocuments)
            .catch(() => setDocuments([]));
    }, []);

    const handleQuery = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setAnswer(null);
        try {
            const result = await queryRAG({
                query,
                documentIds:
                    selectedDocs.length > 0 ? selectedDocs : undefined,
                topK: 10,
                includeCitations: true,
            });
            setAnswer(result);
        } catch (e: unknown) {
            setError(`Query failed: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInsertCitation = (citation: RAGQueryResult["citations"][0], index: number) => {
        const citationText = `${inlineCitation(index)} ${citation.citationText}`;
        navigator.clipboard.writeText(citationText).then(() => {
            alert(`Citation copied to clipboard:\n\n${citationText}\n\nPaste it into your content.`);
        }).catch(() => {
            alert(`Citation:\n\n${citationText}\n\nPaste it into your content.`);
        });
    };

    const toggleDoc = (docId: string) => {
        setSelectedDocs(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    return (
        <div>
            <h5>Ask Your Research</h5>
            <p className="text-muted small">
                Query your uploaded documents and academic papers. The AI will
                generate an answer with inline citations.
            </p>

            {documents.length > 0 && (
                <div className="mb-3">
                    <Label className="small fw-bold">Filter by document (optional):</Label>
                    <div className={styles.docFilterList}>
                        {documents
                            .filter(d => d.status === "ready")
                            .map(doc => (
                                <FormGroup check key={doc.id} className="me-3">
                                    <Input
                                        type="checkbox"
                                        checked={selectedDocs.includes(doc.id)}
                                        onChange={() => toggleDoc(doc.id)}
                                    />
                                    <Label check className="small">
                                        {doc.name}
                                    </Label>
                                </FormGroup>
                            ))}
                    </div>
                </div>
            )}

            <FormGroup>
                <Input
                    type="textarea"
                    placeholder="Ask a question about your research documents (e.g., 'What methodology is used in the papers about transformers?')"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    rows={3}
                    className="mb-2"
                />
            </FormGroup>

            <Button
                color="primary"
                onClick={() => void handleQuery()}
                disabled={loading || !query.trim()}
                className="mb-3"
            >
                {loading ? <Spinner size="sm" /> : "🤖 Ask AI"}
            </Button>

            {error && (
                <Alert color="danger" fade={false} className="mb-3">
                    {error}
                    {error.includes("connect") && (
                        <div className="mt-1 small">
                            Make sure the Isaac API server is running with RAG
                            support enabled.
                        </div>
                    )}
                </Alert>
            )}

            {answer && (
                <div className={styles.answerContainer}>
                    <h6>Answer:</h6>
                    <div className={styles.answerText}>{answer.answer}</div>

                    {showCitations && answer.citations.length > 0 && (
                        <>
                            <hr />
                            <h6>
                                📚 References (
                                {answer.citations.length})
                            </h6>
                            <ol className={styles.citationsList}>
                                {answer.citations.map((cit, i) => (
                                    <li key={i} className={styles.citationItem}>
                                        <div className={styles.citationText}>
                                            {cit.citationText}
                                        </div>
                                        <Button
                                            size="sm"
                                            color="link"
                                            onClick={() =>
                                                handleInsertCitation(cit, i + 1)
                                            }
                                        >
                                            📋 Copy citation
                                        </Button>
                                    </li>
                                ))}
                            </ol>
                        </>
                    )}

                    {answer.sourceChunks.length > 0 && (
                        <>
                            <hr />
                            <h6>📄 Source Passages</h6>
                            {answer.sourceChunks.map((src, i) => (
                                <Alert
                                    key={i}
                                    color="light"
                                    fade={false}
                                    className={styles.sourceChunk}
                                >
                                    <div className="small text-muted mb-1">
                                        From:{" "}
                                        <strong>{src.document.name}</strong>
                                        {src.score != null && (
                                            <span className="ms-2">
                                                Relevance:{" "}
                                                {(src.score * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                    <div>{src.chunk.content}</div>
                                </Alert>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
