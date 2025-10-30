import React, {
    ContextType,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import {Button, Row, Modal, ModalBody, ModalFooter, Col, Alert} from "reactstrap";
import {AppContext} from "../App";
import {
    githubCreate,
    githubDelete,
    githubRename,
} from "../services/github";
import {FileUploader} from "react-drag-drop-files";
import {PopupMenuRef, MenuItem, buildPopupMenu, PopupEntry} from "./popups/PopupMenu";
import styles from "../styles/editor.module.css";
import {Files, FilesContext, Selection} from "./FileBrowser";
import {dirname, ext} from "../utils/strings";
import {GitHubDirInput} from "./GitHubDirInput";
import {isDefined} from "../utils/types";

export const defaultCdn = {
    open: false,
    toggle: (() => {
        throw new Error("cdn.toggle called outside AppContext");
    }) as () => void,
};

const renameCDNFile = async (context: ContextType<typeof AppContext>, item: PopupEntry, setSelection?: (selection: Selection) => void) => {
    let newName = window.prompt("Please type a new name for the file. If no extension is provided, \".json\" will be assumed", item.name);
    if (newName) {
        // Don't both renaming a file to it's previous name
        if (item.path.replace(dirname(item.path) + "/", "") === newName) {
            return;
        }
        // Ensure the file type (extension) stays the same
        if (ext(newName) !== ext(item.name)) {
            alert("Please don't modify the file extension! Cancelling rename operation...");
        }
        const basePath = dirname(item.path);
        try {
            await githubRename(context, item.path, newName, "cdn");
            window.alert("File successfully renamed!");
            setSelection?.({path: `${basePath}/${newName}`, isDir: false});
            item.refresh?.(); // TODO remove once rename mutation works
        } catch (e) {
            window.alert(`Could not rename file. Perhaps one with that name already exists?\n\nError details: ${e}`);
        }
    }
};

const deleteCDNFile = async (context: ContextType<typeof AppContext>, item: PopupEntry, selectionPath?: string, setSelection?: (selection: Selection) => void) => {
    if (window.confirm("Do you really want to delete " + item.name + "?")) {
        try {
            const newDir = await githubDelete(context, item.path, item.name, item.sha, "cdn");
            if (selectionPath === item.path) {
                setSelection?.({path: newDir, isDir: true});
            }
            window.alert("File successfully deleted!");
        } catch (e) {
            window.alert(`Could not delete file.\n\nError details: ${e}`);
        }
    }
};

const CDNPopupMenuInner = ({item}: {item: PopupEntry}) => {
    const appContext = useContext(AppContext);
    const {selectionPath, setSelection} = useContext(FilesContext);
    return <>
        {item?.type === "file" && <MenuItem onClick={() => renameCDNFile(appContext, item, setSelection)} text="Rename..."/>}
        {item?.type === "file" && <MenuItem onClick={() => deleteCDNFile(appContext, item, selectionPath, setSelection)} text="Delete"/>}
        {item?.type === "dir" && !item.refresh && <MenuItem onClick={() => void 0} text="No context actions"/>}
        {item.refresh && <MenuItem onClick={() => item.refresh?.()} text="Refresh"/>}
    </>;
};

const CDNPopupMenu = buildPopupMenu(CDNPopupMenuInner, "CDNPopupMenu");

type FileValidation = {isValid: true, error?: undefined} | {isValid?: undefined, error: string};
const validateFile: (file: File | undefined) => FileValidation = (file: File | undefined) => {
    if (!file) return {error: "File doesn't exist"};
    if (file.size >= 100_000_000) return {error: "File is too big: it must be smaller than 100Mb"};
    if (file?.name.split(".").length !== 2) return {error: "File path must consist of a name, followed by an extension, and cannot have multiple extensions"};
    const fileName = file?.name.split(".")[0];
    if (fileName.match(/^[a-zA-Z0-9_-]+$/) === null) return {error: "File name is invalid: it can only contain alphanumeric characters, dashes and underscores"};
    return {isValid: true};
};
const validateDir: (dir: string | undefined) => FileValidation = (dir: string | undefined) => {
    if (!isDefined(dir)) return {error: "Please specify a directory"};
    if (dir === "") return {error: "Please do not upload files to the top level directory"};
    if (dir.match(/^[a-zA-Z0-9_\-/]+$/) === null) return {error: "Directory is invalid: directory names can only contain alphanumeric characters, dashes and underscores"};
    return {isValid: true};
};
const FILE_TYPE_WHITELIST = ["JPG", "PNG", "GIF", "PDF", "CSV", "ODS", "XLSX", "SQLITE"];

export const CDNUploadModal = () => {
    const appContext = useContext(AppContext);
    const {cdn: {open, toggle}} = appContext;

    const [files, setFiles] = useState<({file: File} & FileValidation)[] | null>(null);
    const [dir, setDir] = useState<{ path: string | undefined, isValid: boolean, error?: string }>();
    const [successfulUploads, setSuccessfulUploads] = useState<string[] | undefined>();

    const menuRef = useRef<PopupMenuRef>(null);
    const [selection, setSelection] = useState<Selection>();

    const setSelectionAndUpdateDir = (selection?: Selection) => {
        setSelection(selection);
        setDir(selection
            ? {path: selection.isDir ? selection.path : dirname(selection.path), isValid: true}
            : undefined);
    };
    const setDirAndUpdateSelection = (dir: string | undefined) => {
        const validation = validateDir(dir);
        setDir({path: dir, isValid: "isValid" in validation, error: validation.error});
        if (dir) {
            setSelection({isDir: true, path: dir});
        }
    };

    // By default select the `isaac` subdirectory
    useEffect(() => {
        setDirAndUpdateSelection("isaac");
    }, []);

    const allFilesAreValid = files?.every(f => f.isValid);
    const paths = dir?.path && dir.isValid && files ? [...files].map((f) => dir?.path?.replace(/\/$/, "") + "/" + f.file.name) : [];

    useEffect(() => {
        if (files && files.length === 0) setSuccessfulUploads(undefined);
    }, [paths, files, dir]);

    const readFile = (f: {file: File} & FileValidation): Promise<string> => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string)
        reader.readAsBinaryString(f.file);
    });

    const uploadToCDN = async () => {
        const path = dir?.path;
        if (!files || files.length === 0 || !path) return;

        if (path.search(/^isaac\//) === -1) {
            alert(`Couldn't upload file(s) to CDN. Directory path is malformed.`);
            console.error(`Couldn't upload file(s) to CDN. Directory path is malformed.`);
            return;
        }
        // path should always start with "isaac/" after the previous check
        const dirPath = path.split("/").slice(1).join("/");

        const filesToUpload = [...files];
        setFiles(null);
        for (const f of filesToUpload) {
            try {
                const contents = await readFile(f);
                await githubCreate(appContext, "isaac", `${dirPath}/${f.file.name}`, contents, "cdn");
                setSuccessfulUploads(su => [...(su ?? []), path?.replace(/\/$/, "") + "/" + f.file.name]);
            } catch (e) {
                alert(`Couldn't upload file "${f.file.name}" to CDN. Perhaps it already exists.\n\nError details: ${e}`);
            }
        }
    };

    const [showAccessibilityNotice, setShowAccessibilityNotice] = useState<boolean>(true);
    useEffect(() => {
        if (open) setShowAccessibilityNotice(true);
    }, [open]);

    return <Modal isOpen={open} toggle={toggle} size={"xl"} keyboard={false} backdrop={"static"}>
        <div className={"modal-header w-100 d-block"}>
            <Row className={"justify-content-end"}>
                <Col xs={9} className={"pt-2 pl-4"}>
                    <h5 className={"modal-title"}>Upload to CDN</h5>
                </Col>
                <Col xs={3} className={"pr-4"}>
                    <Button color={"secondary"} className={"w-100"} onClick={toggle}>
                        Close
                    </Button>
                </Col>
            </Row>
        </div>
        <ModalBody>
            {showAccessibilityNotice && <Alert color={"warning"}>
                <div className={"w-100"}>Accessibility notice<Button color={"none"} className={"float-right mt-n2"} onClick={() => setShowAccessibilityNotice(false)}>✗</Button></div>
                <hr/>
                <small>
                    We are legally required to make all documents on the site accessible, and PDFs especially are unlikely to meet our obligations.
                    Consider whether the document could just be a page on the site, or that an accessible alternative exists.
                </small>
            </Alert>}
            <Row>
                <Col xs={6} className={"border-right"}>
                    <p>Type the directory name...</p>
                    <GitHubDirInput className={"mb-2"} repo={"cdn"} dir={dir?.path} setDir={setDirAndUpdateSelection}
                                    invalid={!dir?.isValid && isDefined(dir)}/>
                    {dir?.error && <small className={"text-danger"}>{dir.error}</small>}
                    <hr/>
                    <p>Or choose it from the file browser:</p>
                    <div className={styles.fileBrowser}>
                        <FilesContext.Provider value={{selectionPath: selection?.path, setSelection: setSelectionAndUpdateDir, repo: "cdn"}}>
                            <Files menuRef={menuRef} />
                            <CDNPopupMenu menuRef={menuRef} />
                        </FilesContext.Provider>
                    </div>
                </Col>
                <Col xs={6}>
                    <p>Upload one or more file(s) to add to the chosen directory:</p>
                    <FileUploader
                        types={FILE_TYPE_WHITELIST}
                        maxSize={100}
                        fileOrFiles={files}
                        multiple
                        handleChange={(files: FileList) => {
                            setFiles(fs => (fs ?? []).concat([...files].map(f => ({file: f, ...validateFile(f)}))));
                        }}
                        classes={"mb-2"}
                    />
                    {files && files.length > 0
                        ? <>
                            <ul>
                                {files.map((f, i) => (
                                    <li key={f.file.name} className={f.isValid ? "text-success" : "text-danger"}>
                                        <span style={{fontFamily: "monospace"}}>{f.file.name}</span> {f.isValid ? "✓" : "✗"} {f.error}
                                        <Button color={"link"} className={"p-0 d-inline"} onClick={() => setFiles(files?.length === 1 ? null : files.filter((_, _i) => i !== _i))}>
                                            Remove
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                            {allFilesAreValid
                                ? <>
                                    {paths && paths.length > 0 && <div>
                                        <span>File(s) to be created:</span>
                                        <ul>
                                            {paths.map(path => <li key={path}><code>{path}</code></li>)}
                                        </ul>
                                    </div>}
                                </>
                                : <small className={"text-danger"}>Please remove invalid files before continuing</small>}
                        </>
                        : <small>Please choose at least one file</small>
                    }
                   
                    {paths && paths.length > 0 && allFilesAreValid && selection?.isDir &&
                        <Button color={"success"} className={"w-100"} onClick={uploadToCDN}>
                            Upload file(s) to CDN
                        </Button>}
                    {successfulUploads && <Alert className={"mt-2"} color={"success"}>
                        Successfully uploaded files:
                        <ul>
                            {successfulUploads.map((s, i) => <li key={i}><code>{s}</code></li>)}
                        </ul>
                        The CDN is refreshed every 10 minutes; please check the <code>#compsci</code> Slack channel for
                        confirmation that these files have been added.
                    </Alert>}
                </Col>
            </Row>
        </ModalBody>
        <ModalFooter>
            <Row className={"w-100 justify-content-end"}>
                <Col xs={3}>
                    <Button color={"secondary"} className={"w-100"} onClick={toggle}>
                        Close
                    </Button>
                </Col>
            </Row>
        </ModalFooter>
    </Modal>;
};
