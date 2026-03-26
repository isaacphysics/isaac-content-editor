/**
 * CitationPicker - Inline citation/reference picker for the SemanticEditor
 * 
 * Allows content editors to:
 * - Search their RAG corpus
 * - Insert formatted citations into content
 * - Manage bibliography entries
 */

import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    Button,
    Input,
    InputGroup,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalHeader,
    Spinner,
    Alert,
    Badge,
} from "reactstrap";
import {
    listRAGDocuments,
    queryRAG,
    RAGQueryResult,
    inlineCitation,
} from "../services/ragApi";

interface CitationPickerProps {
    isOpen: boolean;
    toggle: () => void;
    onInsertCitation: (citation: string, bibliographyEntry: string) => void;
}

interface BibliographyEntry {
    id: string;
    citation: string;
    documentId: string;
    documentName: string;
}

export const CitationPicker: FunctionComponent<CitationPickerProps> = ({
    isOpen,
    toggle,
    onInsertCitation,
}) => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<RAGQueryResult | null>(null);
    const [bibliography] = useState<BibliographyEntry[]>([]);
    const [selectedPassages, setSelectedPassages] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (isOpen) {
            listRAGDocuments().catch(() => {
                // Silently fail - documents list is optional for citation picker
            });
        }
    }, [isOpen]);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setResults(null);
        setSelectedPassages(new Set());
        try {
            const result = await queryRAG({
                query,
                topK: 5,
                includeCitations: true,
            });
            setResults(result);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown error";
            setError(`Search failed: ${message}`);
        } finally {
            setLoading(false);
        }
    }, [query]);

    const togglePassage = useCallback((index: number) => {
        setSelectedPassages(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const handleInsert = useCallback(() => {
        if (!results || selectedPassages.size === 0) return;

        const selectedChunks = Array.from(selectedPassages).map(i => ({
            chunk: results.sourceChunks[i].chunk,
            citation: results.citations[i],
        }));

        // Build inline citation markers
        const citationMarkers = selectedChunks
            .map((_sc, displayIndex) => inlineCitation(displayIndex + 1))
            .join(", ");

        // Build bibliography entries
        const bibliographyEntries = selectedChunks.map((sc, displayIndex) => {
            const entry = bibliography.find(
                b => b.documentId === sc.chunk.documentId
            );
            return entry
                ? `[${displayIndex + 1}] ${entry.citation}`
                : `${inlineCitation(displayIndex + 1)} ${sc.citation.citationText}`;
        });

        onInsertCitation(
            citationMarkers,
            bibliographyEntries.join("\n")
        );
        toggle();
    }, [results, selectedPassages, bibliography, onInsertCitation, toggle]);

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            size={"lg"}
            scrollable
        >
            <ModalHeader toggle={toggle}>
                📖 Insert Citation from Research
            </ModalHeader>
            <ModalBody>
                <div className="mb-3">
                    <InputGroup>
                        <Input
                            placeholder="Search your documents for a passage to cite..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") void handleSearch();
                            }}
                        />
                        <Button
                            color="primary"
                            onClick={() => void handleSearch()}
                            disabled={loading || !query.trim()}
                        >
                            {loading ? <Spinner size="sm" /> : "🔍 Search"}
                        </Button>
                    </InputGroup>
                </div>

                {error && (
                    <Alert color="danger" fade={false}>
                        {error}
                    </Alert>
                )}

                {results && (
                    <div>
                        <div className="mb-2 small text-muted">
                            {results.sourceChunks.length} passages found.
                            Select passages to cite:
                        </div>

                        {results.sourceChunks.map((src, i) => (
                            <ListGroupItem
                                key={i}
                                active={selectedPassages.has(i)}
                                onClick={() => togglePassage(i)}
                                className="mb-1"
                                style={{ cursor: "pointer" }}
                            >
                                <div className="d-flex justify-content-between">
                                    <div className="flex-fill">
                                        <Badge
                                            color="secondary"
                                            className="me-2 mb-1"
                                        >
                                            {src.document.name}
                                        </Badge>
                                        <span className="small">
                                            {src.chunk.content.slice(0, 200)}
                                            {src.chunk.content.length > 200 && "..."}
                                        </span>
                                    </div>
                                    <div className="ms-2">
                                        {selectedPassages.has(i) ? (
                                            <Badge color="primary">
                                                ✓ Selected
                                            </Badge>
                                        ) : (
                                            <Badge color="light">+ Select</Badge>
                                        )}
                                    </div>
                                </div>
                            </ListGroupItem>
                        ))}

                        {selectedPassages.size > 0 && (
                            <Button
                                color="success"
                                className="mt-3 w-100"
                                onClick={handleInsert}
                            >
                                📋 Insert {selectedPassages.size} Citation
                                {selectedPassages.size > 1 ? "s" : ""}
                            </Button>
                        )}
                    </div>
                )}

                {!results && !loading && (
                    <div className="text-center text-muted py-4">
                        <div className="mb-2">🔍</div>
                        Search your research documents to find passages
                        <br />
                        to cite in your content.
                    </div>
                )}

                {loading && (
                    <div className="text-center py-4">
                        <Spinner />
                        <div className="mt-2 small text-muted">
                            Searching RAG corpus...
                        </div>
                    </div>
                )}

                <hr className="my-3" />

                <div>
                    <h6 className="mb-2">
                        📚 Bibliography (
                        {bibliography.length} entries)
                    </h6>
                    {bibliography.length === 0 ? (
                        <div className="small text-muted">
                            Citations you select will appear here as a
                            bibliography you can insert.
                        </div>
                    ) : (
                        <ListGroup>
                            {bibliography.map((entry, i) => (
                                <ListGroupItem
                                    key={entry.id}
                                    className="small"
                                >
                                    <span className="me-2 fw-bold">
                                        [{i + 1}]
                                    </span>
                                    {entry.citation}
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
};
