import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button, Row, Modal, ModalBody, ModalFooter, ModalHeader, Col, Alert } from "reactstrap";
import { AppContext } from "../App";
import { contentsPath, githubCreate, GitHubRepository } from "../services/github";
import { components, GroupBase, InputActionMeta, SingleValue } from "react-select";
import useSWR from "swr";
import CreatableSelect from "react-select/creatable";
import { isDefined } from "../utils/types";
import { FileUploader } from "react-drag-drop-files";

export const defaultCdn = {
  open: false,
  toggle: (() => {
    throw new Error("cdn.toggle called outside AppContext");
  }) as () => void,
};

interface GitHubOption {
  type: "dir" | "file";
  label: string;
  value: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AlwaysVisibleInput = (props: any) => <components.Input {...props} isHidden={false} />;

interface GitHubDirInputProps {
  repo: GitHubRepository;
  className: string;
  dir: string | undefined;
  setDir: (newDir: string | undefined) => void;
  invalid?: boolean;
}
const GitHubDirInput = ({ repo, className, dir, setDir, invalid }: GitHubDirInputProps) => {
  // Hacking react-select to do sensible things reading list:
  //  - https://github.com/JedWatson/react-select/issues/1558#issuecomment-738880505
  //  - https://github.com/JedWatson/react-select/discussions/4302
  //  - https://stackoverflow.com/questions/51951379/how-do-i-implement-field-validation-for-react-select

  const appContext = useContext(AppContext);
  const [pathOption, setPathOption] = useState<GitHubOption | null>();
  const searchablePathPart = dir ? (dir.split("/").length === 0 ? dir : dir.split("/").slice(0, -1).join("/")) : "";

  const { data, isValidating, error } = useSWR(contentsPath(searchablePathPart ?? "", appContext.github.branch, repo));

  const pathOptions: GroupBase<GitHubOption>[] = useMemo(() => {
    return error || !data
      ? []
      : [
          {
            options:
              data?.type === "file"
                ? { value: data.path, label: data.path, isDisabled: true }
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data?.map((d: any) => ({ value: d.path, label: d.path, isDisabled: d.type === "file" })) ?? [],
            label: "Existing directories",
          },
        ];
  }, [error, data]);

  const formatCreateLabel = (path: string) => `Create directory "${path.replace(/\/$/, "")}"`;

  const onInputChange = (inputValue: string, { action }: InputActionMeta) => {
    // onBlur => setInputValue to last selected value
    if (action === "input-blur") {
      setDir(pathOption ? pathOption.value : "");
    }
    // onInputChange => update inputValue
    else if (action === "input-change") {
      setDir(inputValue);
    }
  };

  const onChange = (option: SingleValue<GitHubOption>) => {
    setPathOption(option);
    setDir(option ? option.value : "");
  };

  const getBasePath = (path: string) => {
    return path.replace(/\/[^/]*$/, "");
  };

  return (
    <CreatableSelect
      className={className}
      isLoading={isValidating}
      value={pathOption}
      tabSelectsValue
      onChange={onChange}
      inputValue={dir}
      isClearable
      onInputChange={onInputChange}
      controlShouldRenderValue={false}
      components={{
        Input: AlwaysVisibleInput,
      }}
      isValidNewOption={(path, value, options) => {
        if (path === "") return false;
        if (path.match(/^[a-zA-Z0-9_\-/]+$/) === null) return false;
        const pathToSearch = path.replace(/\/$/, "");
        return !options.find((o) =>
          "value" in o
            ? [o.value, getBasePath(o.value)].includes(pathToSearch)
            : o.options.find((_o) => [_o.value, getBasePath(_o.value)].includes(pathToSearch)),
        );
      }}
      styles={{
        control: (base, _) => ({
          ...base,
          // state.isFocused can display different borderColor if you need it
          borderColor: !invalid ? "#ddd" : "red",
          // overwrittes hover style
          "&:hover": {
            borderColor: !invalid ? "#ddd" : "red",
          },
        }),
      }}
      options={pathOptions}
      placeholder={"Choose a directory..."}
      createOptionPosition={"first"}
      formatCreateLabel={formatCreateLabel}
    />
  );
};
type FileValidation = { isValid: true; error?: undefined } | { isValid?: undefined; error: string };
const validateFile: (file: File | undefined) => FileValidation = (file: File | undefined) => {
  if (!file) return { error: "File doesn't exist" };
  if (file.size >= 100_000_000) return { error: "File is too big: it must be smaller than 100Mb" };
  if (file?.name.split(".").length !== 2)
    return { error: "File path must consist of a name, followed by an extension, and cannot have multiple extensions" };
  const fileName = file?.name.split(".")[0];
  if (fileName.match(/^[a-zA-Z0-9_-]+$/) === null)
    return { error: "File name is invalid: it can only contain alphanumeric characters, dashes and underscores" };
  return { isValid: true };
};

const validateDir: (dir: string | undefined) => FileValidation = (dir: string | undefined) => {
  if (!isDefined(dir)) return { error: "Please specify a directory" };
  if (dir === "") return { error: "Please do not upload files to the top level directory" };
  if (dir.match(/^[a-zA-Z0-9_\-/]+$/) === null)
    return {
      error: "Directory is invalid: directory names can only contain alphanumeric characters, dashes and underscores",
    };
  return { isValid: true };
};

const FILE_TYPE_WHITELIST = ["JPG", "PNG", "GIF", "PDF", "CSV", "ODS", "XLSX"];

export const CDNUploadModal = () => {
  const appContext = useContext(AppContext);
  const {
    cdn: { open, toggle },
  } = appContext;

  const [files, setFiles] = useState<({ file: File } & FileValidation)[] | null>(null);
  const [dir, setDir] = useState<string>();
  const [successfulUploads, setSuccessfulUploads] = useState<string[] | undefined>();

  const dirIsValid = validateDir(dir);
  const allFilesAreValid = files?.every((f) => f.isValid);
  const paths = useMemo(() => {
    return dir && dirIsValid.isValid && files ? [...files].map((f) => dir.replace(/\/$/, "") + "/" + f.file.name) : [];
  }, [dir, dirIsValid.isValid, files]);

  useEffect(() => {
    if (files && files.length === 0) setSuccessfulUploads(undefined);
  }, [paths, files, dir]);

  const uploadToCDN = async () => {
    if (!files || files.length === 0 || !dir) return;
    const filesToUpload = [...files];
    setFiles(null);
    for (const f of filesToUpload) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await githubCreate(appContext, dir, f.file.name, reader.result as string, "cdn");
          setSuccessfulUploads((su) => [...(su ?? []), dir.replace(/\/$/, "") + "/" + f.file.name]);
        } catch (e) {
          alert(`Couldn't upload file "${f.file.name}" to CDN. Perhaps it already exists.`);
          console.error(`Couldn't upload file "${f.file.name}" to CDN. Perhaps it already exists.`, e);
        }
      };
      reader.readAsBinaryString(f.file);
    }
  };

  const [showAccessibilityNotice, setShowAccessibilityNotice] = useState<boolean>(true);
  useEffect(() => {
    if (open) setShowAccessibilityNotice(true);
  }, [open]);

  return (
    <Modal isOpen={open} toggle={toggle}>
      <ModalHeader>Upload to CDN</ModalHeader>
      <ModalBody>
        {showAccessibilityNotice && (
          <Alert color={"warning"}>
            <div className={"w-100"}>
              Accessibility notice
              <Button color={"none"} className={"float-right mt-n2"} onClick={() => setShowAccessibilityNotice(false)}>
                ✗
              </Button>
            </div>
            <hr />
            <small>
              We are legally required to make all documents on the site accessible, and PDFs especially are unlikely to
              meet our obligations. Consider whether the document could just be a page on the site, or that an
              accessible alternative exists.
            </small>
          </Alert>
        )}
        <FileUploader
          types={FILE_TYPE_WHITELIST}
          maxSize={100}
          fileOrFiles={files}
          multiple
          handleChange={(files: FileList) => {
            setFiles((fs) => (fs ?? []).concat([...files].map((f) => ({ file: f, ...validateFile(f) }))));
          }}
          classes={"mb-2"}
        />
        {files && files.length > 0 ? (
          <>
            <ul>
              {files.map((f, i) => (
                <li key={f.file.name} className={f.isValid ? "text-success" : "text-danger"}>
                  <span style={{ fontFamily: "monospace" }}>{f.file.name}</span> {f.isValid ? "✓" : "✗"} {f.error}
                  <Button
                    color={"link"}
                    className={"p-0 d-inline"}
                    onClick={() => setFiles(files?.length === 1 ? null : files.filter((_, _i) => i !== _i))}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            {allFilesAreValid ? (
              <>
                <GitHubDirInput
                  className={"mb-2"}
                  repo={"cdn"}
                  dir={dir}
                  setDir={setDir}
                  invalid={!dirIsValid.isValid && isDefined(dir)}
                />
                {paths && paths.length > 0 && (
                  <div>
                    <span>File(s) to be created:</span>
                    <ul>
                      {paths.map((path) => (
                        <li key={path}>
                          <code>{path}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!dirIsValid.isValid && (
                  <small className={isDefined(dir) ? "text-danger" : ""}>{dirIsValid.error}</small>
                )}
              </>
            ) : (
              <small className={"text-danger"}>Please remove invalid files before continuing</small>
            )}
          </>
        ) : (
          <small>Please choose at least one file</small>
        )}
        {successfulUploads && (
          <Alert className={"mt-2"} color={"success"}>
            Successfully uploaded files:
            <ul>
              {successfulUploads.map((s, i) => (
                <li key={i}>
                  <code>{s}</code>
                </li>
              ))}
            </ul>
            The CDN is refreshed every 10 minutes; please check the <code>#compsci</code> Slack channel for confirmation
            that these files have been added.
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Row className={"w-100 justify-content-end"}>
          {paths && paths.length > 0 && allFilesAreValid && dirIsValid.isValid && (
            <Col xs={8}>
              <Button color={"success"} className={"w-100"} onClick={uploadToCDN}>
                Upload
              </Button>
            </Col>
          )}
          <Col xs={4}>
            <Button color={"secondary"} className={"w-100"} onClick={toggle}>
              Close
            </Button>
          </Col>
        </Row>
      </ModalFooter>
    </Modal>
  );
};
