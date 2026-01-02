import React, {ContextType, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {SWRConfig, useSWRConfig} from "swr";
import {Params, useNavigate, useParams} from "react-router-dom";
import {useLocation} from "react-router";
import {Modal, Spinner} from "reactstrap";
import {ErrorBoundary} from "react-error-boundary";
import {Selection} from "../components/FileBrowser";
import {LeftMenu} from "../components/LeftMenu";
import {AppContext, browserHistory} from "../App";
import {defaultGithubContext, fetcher} from "../services/github";
import {SemanticEditor} from "../components/SemanticEditor";
import {Content} from "../isaac-data-types";
import {Action, doDispatch} from "../services/commands";
import {useFixedRef} from "../utils/hooks";
import {TextEditor} from "../components/TextEditor";
import {ImageViewer} from "../components/ImageViewer";
import {SVGViewer} from "../components/SVGViewer";
import {PDFViewer} from "../components/PDFViewer";
import {Preview, PreviewMode} from "../components/Preview";
import {MenuModal, MenuModalRef} from "./MenuModal";
import {buildPageError} from "../components/PageError";
import Split from "react-split";
import {CDNUploadModal} from "../components/CDNUploadModal";
import hash from "object-hash";
import {isDefined} from "../utils/types";
import {compare, Operation, applyReducer} from "fast-json-patch";
import {invertJSONPatch} from "../utils/inversePatch";

import styles from "../styles/editor.module.css";

const FILE_COMPONENTS = {
    "json": SemanticEditor,
    "jpg|jpeg|gif|png": ImageViewer,
    "svg": SVGViewer,
    "pdf": PDFViewer,
};

function useParamsToSelection(params: Readonly<Params>): Selection {
    return useMemo<Selection>(() => {
        let path = params["*"];
        if (!path) {
            return null;
        }
        const isDir = path.charAt(path.length - 1) === "/";
        if (isDir) {
            path = path.substring(0, path.length - 1);
        }
        return {
            isDir,
            path,
        };
    }, [params]);
}

interface CollapsableArg {preview: {open: boolean, toggle: () => void}}
function useCollapsableDragElement(appContext: CollapsableArg): [(col: number) => HTMLElement, number | undefined] {
    const [collapsed, setCollapsed] = useState<undefined | number>();
    const dragElement = useCallback(function(columnIndex: number) {
        const gutterDiv = document.createElement('div');
        gutterDiv.innerHTML = columnIndex === 1 ? "Files" : "Quick Preview";
        gutterDiv.className = styles.gutter;

        // Collapse on double click
        gutterDiv.addEventListener("dblclick", function() {
            setCollapsed(columnIndex === 1 ? 0 : 2);
        });

        // Clear collapsed on drag interaction so that we can collapse another column in the future
        gutterDiv.addEventListener("dragend", function() {setCollapsed(undefined);});

        // Lazy start preview panel
        if (columnIndex === 2) {
            gutterDiv.addEventListener("click", function lazyStartPreviewPanel() {
                if (!appContext.preview.open) {appContext.preview.toggle();}
            });
        }

        return gutterDiv;
    }, []);

    // Stop preview panel if it is collapsed
    useEffect(function closePreviewIfPanelCollapsed() {
        if (collapsed === 2 && appContext.preview.open) {appContext.preview.toggle();}
    }, [collapsed]);

    return [dragElement, collapsed];
}

export function EditorScreen() {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<MenuModalRef>(null);

    const swrConfig = useSWRConfig();

    const [previewMode, setPreviewMode] = useState<PreviewMode>(window.innerWidth > 1400 ? "panel" : "modal");
    const [previewOpen, setPreviewOpen] = useState(false);

    const [cdnOpen, setCdnOpen] = useState(false);

    const selection = useParamsToSelection(params);
    const setSelection = useCallback((selection: Selection) => {
        let url = `/edit/${params.branch}`;
        if (selection) {
            url += `/${selection.path}`;
            if (selection.isDir) {
                url += "/";
            }
        }
        if (url !== location.pathname) {
            if (selection?.forceRefresh) {
                window.location.href = url;
            } else {
                navigate(url);
            }
        }
    }, [params.branch, navigate, location.pathname]);

    const [user, setUser] = useState(defaultGithubContext.user);
    useEffect(() => {
        fetcher("user").then(setUser);
    }, []);

    const [dirty, setDirty] = useState(false);
    const [fileHash, setFileHash] = useState<string>("");
    const [currentContent, setCurrentContent] = useState<Content | string>({});
    const [lastChange, setLastChange] = useState<Operation[]>();
    const [currentContentPath, setCurrentContentPath] = useState<string | undefined>();
    const [isAlreadyPublished, setIsAlreadyPublished] = useState<boolean>(false);

    const [actionRunning, setActionRunning] = useState(false);

    const setCurrentDoc = useCallback((content: Content | string, invertible = false) => {
        if (invertible) {
            const currentLastChanges = compare(currentContent, content, true);
            setLastChange(prevLastChanges => currentLastChanges.length > 0 ? currentLastChanges : prevLastChanges);
        }
        setCurrentContent(content);
        setDirty(hash(content) !== fileHash);
    }, [fileHash, currentContent]);
    const loadNewDoc = useCallback((content: Content | string) => {
        setDirty(false);
        setFileHash(hash(content));
        setLastChange(undefined);
        setIsAlreadyPublished(typeof content === "string" ? false : !!content.published);
        setCurrentContent(content);
        setCurrentContentPath(selection?.path);
    }, [selection]);

    const appContext = useMemo<ContextType<typeof AppContext>>(() => {
        async function dispatch(action: Action) {
            try {
                setActionRunning(true);
                await doDispatch(appContext, action);
            } finally {
                setActionRunning(false);
            }
        }

        return ({
            selection: {
                getSelection: () => selection,
                setSelection,
            },
            editor: {
                getDirty: () => dirty,
                canUndo: () => isDefined(lastChange) && lastChange.length > 0,
                undo: () => {
                    if (lastChange) {
                        try {
                            const contentAfterUndo = invertJSONPatch(lastChange).reduce(applyReducer, currentContent);
                            setCurrentDoc(contentAfterUndo);
                        } catch (e) {
                            console.error("Could not undo: ", e);
                        }
                        setLastChange(undefined);
                    }
                },
                getCurrentDoc: () => {
                    if (typeof currentContent === "string") {
                        throw new Error("Current doc is a string");
                    } else {
                        return currentContent;
                    }
                },
                getCurrentDocExt: () => {
                    return currentContentPath?.split(".").pop()?.toLowerCase() || "";
                },
                getCurrentDocAsString: () => {
                    if (typeof currentContent === "string") {
                        return currentContent;
                    } else {
                        return JSON.stringify(currentContent, null, 2);
                    }
                },
                getCurrentDocPath: () => currentContentPath,
                setDirty: setDirty,
                setCurrentDoc: setCurrentDoc,
                loadNewDoc: loadNewDoc,
                isAlreadyPublished: () => isAlreadyPublished,
            },
            github: {
                branch: params.branch || defaultGithubContext.branch,
                user,
                cache: swrConfig.cache,
            },
            dispatch,
            navigate,
            menuModal: menuRef,
            preview: {
                open: previewOpen,
                toggle: () => {
                    setPreviewOpen(!previewOpen);
                },
                mode: previewMode,
                toggleMode: () => {
                    setPreviewMode(previewMode === "modal" ? "panel" : "modal");
                },
            },
            cdn: {
                open: cdnOpen,
                toggle: () => {
                    setCdnOpen(!cdnOpen);
                },
            }
        });
    }, [setCurrentDoc, setDirty, loadNewDoc, params.branch, user, swrConfig.cache, navigate, previewOpen, previewMode, cdnOpen, selection, dirty, setSelection, currentContent, isAlreadyPublished, setLastChange, lastChange]);
    const contextRef = useFixedRef(appContext);

    const unblockRef = useRef<() => void>(null);
    useEffect(() => {
        if (dirty) {
            const unblock = browserHistory.block((transition) => {
                menuRef.current?.open({
                    title: "Changes not saved",
                    body: `Do you really want to close ${selection?.path ?? "this file"}?`,
                    options: [
                        {caption: "Discard changes and leave", value: "discard"},
                        {caption: "Save changes and leave", value: "save"},
                    ],
                    callback: async (option) => {
                        if (option === null) {
                            console.error("File creation cancelled.");
                        } else {
                            switch (option.value) {
                                case "save":
                                    await contextRef.current.dispatch({type: "save"});
                                    // eslint-ignore-nextline no-fallthrough
                                case "discard":
                                    setDirty(false);
                                    unblock();
                                    transition.retry();
                            }
                        }
                    }
                });
            });
            unblockRef.current = unblock;
            return unblock;
        }
    }, [dirty]);

    const keydown = useCallback((event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "s") {
            event.preventDefault();
            event.stopPropagation();
            if (contextRef.current.editor.getDirty()) {
                contextRef.current.dispatch({type: "save"});
            }
        }
    }, [contextRef]);

    useEffect(() => {
        document.body.addEventListener("keydown", keydown);
        return () => document.body.removeEventListener("keydown", keydown);
    }, [keydown]);

    // Once a preview is opened, keep it around so we don't have to slowly reload the IFRAME.
    const previewEverOpen = useRef(false);
    previewEverOpen.current = previewEverOpen.current || previewOpen;
    const previewComponent = previewEverOpen.current ? <Preview /> : null;

    const hasFileOpen = selection && !selection.isDir;
    const showPreview = !!hasFileOpen && previewOpen;

    const [dragElement, collapsed] = useCollapsableDragElement(appContext);
    useEffect(function updateTitleWithId() {
        if (hasFileOpen && selection.path.endsWith(".json") && typeof currentContent !== "string") {
            window.document.title = currentContent.id + " - Isaac Content Editor";
        } else {
            window.document.title = "Isaac Content Editor";
        }
    }, [currentContent, hasFileOpen, selection?.path]);

    // Finds the correct editor/viewer component given the current file type
    const FileEditor = useMemo(() => {
        return (selection?.path && Object.entries(FILE_COMPONENTS).find(([pattern]) => {
            const regex = new RegExp(`^.*\\.(${pattern})$`, "i");
            if (regex.test(selection.path ?? "")) {
                return true;
            }
        })?.[1]) || TextEditor;
    }, [selection?.path]);

    return <SWRConfig value={{fetcher, revalidateOnFocus: false, revalidateOnReconnect: false}}>
        <AppContext.Provider value={appContext}>
            <CDNUploadModal/>
            <Split
                className={styles.editorScreen} sizes={[25, 75, 0]} minSize={[0, 200, 0]}
                gutter={dragElement} gutterSize={20} collapsed={collapsed}
            >
                <LeftMenu />
                <ErrorBoundary FallbackComponent={buildPageError(selection?.path)} onResetKeysChange={() => setCurrentContent({})} onReset={() => setCurrentContent({})} resetKeys={[selection]}>
                    <div>
                        {hasFileOpen
                            ? <FileEditor/>
                            : <div className={`${styles.centered} mt-5`}>
                                Choose a file on the left to edit
                            </div>
                        }
                    </div>
                </ErrorBoundary>
                <div className={`${styles.flexFill} h-100`}>
                    {showPreview && previewComponent}
                </div>
            </Split>

            <Modal isOpen={actionRunning} contentClassName={styles.actionsModalContent}>
                <div className={styles.centered}>
                    <Spinner size="lg" />
                    <h2>Processing...</h2>
                </div>
            </Modal>
            <MenuModal menuRef={menuRef} />
        </AppContext.Provider>
    </SWRConfig>;
}
