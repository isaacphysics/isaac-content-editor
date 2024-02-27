/* eslint-disable react/prop-types */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Button, FormFeedback, Input, InputProps } from "reactstrap";

import { safeLowercase } from "../../../utils/strings";

import styles from "../styles/editable.module.css";
import classNames from "classnames";
import { Markup } from "../../../isaac/markup";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { MarkupToolbar } from "../../MarkupToolbar";
import { keyBindings } from "../../../utils/codeMirrorExtensions";

export interface SaveOptions {
  movement?: number;
  fromBlur?: boolean;
}

export type EditableTextFormat = "latex" | "code" | "plain";

export const escapedNewLineToLineBreakTag = (string: string) =>
  string.split("\n").map((item: string, index: number) => (index === 0 ? item : [<br key={index} />, item]));

const textFormatMap: { [K in EditableTextFormat]: (text: string, multiline?: boolean) => React.ReactNode } = {
  latex: (text) => <Markup encoding="latex">{text}</Markup>,
  code: (text, ml) => <pre>{ml ? escapedNewLineToLineBreakTag(text) : text}</pre>,
  plain: (text, ml) => (ml ? escapedNewLineToLineBreakTag(text) : text),
};

export type EditableTextProps = {
  text?: string;
  onSave: (newText: string | undefined, options?: SaveOptions) => void;
  multiLine?: boolean;
  placeHolder?: string;
  onDelete?: (options?: SaveOptions) => void;
  autoFocus?: boolean;
  hasError?: (newText: string | undefined) => string | undefined;
  label?: string;
  noSupressSaves?: boolean;
  hideWhenEmpty?: boolean;
  block?: boolean;
  format?: EditableTextFormat;
  previewWrapperChar?: "$" | "";
  inputProps?: Omit<InputProps, "type" | "placeHolder" | "invalid" | "autoFocus" | "value">;
};

interface EditableTextState {
  isEditing: boolean;
  value?: string;
  errorShown: boolean;
}

type EditableTextAction =
  | { type: "startEdit" }
  | { type: "save"; options?: SaveOptions }
  | { type: "cancel" }
  | { type: "update"; value: string };

function useWrappedRef<T>(t: T) {
  const ref = useRef<T>(t);
  useEffect(() => {
    ref.current = t;
  }, [t]);
  return ref;
}

export interface EditableTextRef {
  startEdit: () => void;
}

function showErrorIfNotShown(current: EditableTextState) {
  if (!current.errorShown) {
    alert("Not a valid value");
  }
  return {
    ...current,
    errorShown: true,
  };
}

export const EditableText = forwardRef<EditableTextRef, EditableTextProps>(
  (
    {
      text,
      onSave: onSaveUnsafe,
      placeHolder,
      onDelete: onDeleteUnsafe,
      autoFocus,
      hasError: hasErrorUnsafe,
      label,
      noSupressSaves,
      hideWhenEmpty,
      block,
      format = "plain",
      multiLine = format === "code",
      previewWrapperChar = "",
      inputProps,
    },
    ref,
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [errorMessage, setErrorMessage] = useState<string>();

    const onSave = useWrappedRef(onSaveUnsafe);
    const onDelete = useWrappedRef(onDeleteUnsafe);
    const hasError = useWrappedRef(hasErrorUnsafe);

    const reducer = useMemo(() => {
      return (current: EditableTextState, action: EditableTextAction) => {
        switch (action.type) {
          case "startEdit":
            if (current.isEditing) {
              return current;
            }
            return {
              isEditing: true,
              value: text,
              errorShown: false,
            };
          case "save":
            if (current.isEditing) {
              if (current.value === undefined || current.value === "") {
                if (onDelete.current) {
                  onDelete.current(action.options);
                } else {
                  if (hasError.current && !!hasError.current(current.value)) {
                    return showErrorIfNotShown(current);
                  } else {
                    onSave.current(undefined, action.options);
                  }
                }
              } else {
                if (hasError.current && !!hasError.current(current.value)) {
                  return showErrorIfNotShown(current);
                }
                if (noSupressSaves || current.value !== text) {
                  // No changes, no save
                  onSave.current(current.value, action.options);
                }
              }
            }
            return { isEditing: false, errorShown: false };
          case "cancel":
            return { isEditing: false, errorShown: false };
          case "update":
            return { ...current, value: action.value, errorShown: false };
        }
      };
    }, [text, onDelete, hasError, onSave, noSupressSaves]);
    const [state, dispatch] = useReducer(reducer, { isEditing: false, errorShown: false });

    useEffect(() => {
      if (autoFocus === true) {
        dispatch({ type: "startEdit" });
      }
    }, [autoFocus]);

    const startEdit = useCallback(() => dispatch({ type: "startEdit" }), []);
    const save = useCallback((options?: SaveOptions) => dispatch({ type: "save", options }), []);
    const cancel = useCallback(() => dispatch({ type: "cancel" }), []);
    const setCurrent = useCallback(
      (value: string) => {
        dispatch({ type: "update", value });
        if (hasError.current) {
          setErrorMessage(hasError.current(value));
        }
      },
      [hasError],
    );

    const handleKey = (e: React.KeyboardEvent) => {
      if ((!multiLine || e.ctrlKey || e.metaKey) && e.key === "Enter") {
        save({ movement: 1 });
      } else if (e.key === "Escape") {
        cancel();
      } else if (!multiLine && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        save({ movement: e.key === "ArrowUp" ? -1 : 1 });
      }
    };

    const onBlur = (e: React.FocusEvent) => {
      if (wrapperRef.current && wrapperRef.current.contains(e.relatedTarget as Element)) {
        // Inside, so ignore
      } else {
        save({ fromBlur: true });
      }
    };

    useImperativeHandle(ref, () => ({
      startEdit: () => {
        dispatch({ type: "startEdit" });
      },
    }));

    const nonEmpty = text !== undefined && text !== "";
    const selected = state.isEditing || nonEmpty;

    const hidden = hideWhenEmpty && !selected;
    if (hidden) {
      return null;
    }

    const labelElement = label && (
      <>
        <em>{label}:</em>{" "}
      </>
    );
    const labelLC = safeLowercase(label);
    const placeHolderLC = safeLowercase(placeHolder);

    const Wrap = block ? "div" : "span";
    if (state.isEditing) {
      return (
        <Wrap ref={wrapperRef} className={`${styles.isEditingWrapper} ${multiLine ? styles.multiLine : ""}`}>
          <span className={classNames(styles.controlWrapper, format === "code" ? "w-100" : "")}>
            <span className={styles.labelledInput}>
              <>
                {multiLine ? labelElement : <div>{labelElement}</div>}
                {format === "code" ? (
                  <CodeMirror
                    className={"w-100"}
                    value={state.value ?? ""}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    extensions={[
                      EditorView.lineWrapping,
                      keyBindings(
                        () => {
                          save();
                          return true;
                        },
                        () => {
                          cancel();
                          return true;
                        },
                        "plaintext",
                      ),
                    ]}
                    onChange={(newValue) => setCurrent(newValue)}
                  >
                    <MarkupToolbar set={save} cancel={cancel} encoding={"plaintext"} />
                  </CodeMirror>
                ) : (
                  <Input
                    type={multiLine ? "textarea" : "text"}
                    /* eslint-disable-next-line jsx-a11y/no-autofocus */
                    autoFocus
                    value={state.value ?? ""}
                    onChange={(e) => setCurrent(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={placeHolder}
                    onBlur={onBlur}
                    invalid={!!errorMessage}
                    {...inputProps}
                  />
                )}
              </>
            </span>
            {errorMessage && <FormFeedback className={styles.feedback}>{errorMessage}</FormFeedback>}
          </span>
          <Button onClick={cancel}>Cancel</Button>
          <Button color="primary" onClick={() => save()}>
            Set
          </Button>
        </Wrap>
      );
    }
    if (nonEmpty) {
      return (
        <Wrap className={classNames(styles.notEditingWrapper, { [styles.multiLine]: multiLine })}>
          <button className={styles.startEdit} onClick={startEdit}>
            {labelElement}
            {text === undefined ? (
              <i>{placeHolder}</i>
            ) : (
              textFormatMap[format](previewWrapperChar + text + previewWrapperChar, multiLine)
            )}
            {onDelete.current && <Button onClick={() => onDelete.current && onDelete.current()}>Delete</Button>}
          </button>
        </Wrap>
      );
    }
    return (
      <Wrap className={styles.notEditingWrapper}>
        <Button onClick={startEdit}>Set {labelLC || placeHolderLC}</Button>
      </Wrap>
    );
  },
);

EditableText.displayName = "EditableText";
