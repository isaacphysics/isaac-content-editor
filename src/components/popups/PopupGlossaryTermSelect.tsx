import React, { RefObject, useCallback, useMemo, useRef, useState } from "react";
import { Popup, PopupCloseContext, PopupRef } from "./Popup";
import { Alert, Button, Container, Input, InputGroup, Label } from "reactstrap";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import styles from "../../styles/editor.module.css";
import useSWR from "swr";
import { GlossaryTerm } from "../../isaac-data-types";
import { stagingFetcher } from "../../services/isaacApi";
import Select from "react-select";
import { Item } from "../../utils/select";
import { isDefined } from "../../utils/types";

export const PopupGlossaryTermSelect = ({
  wide,
  codemirror,
}: {
  wide?: boolean;
  codemirror: RefObject<ReactCodeMirrorRef>;
}) => {
  const popupRef = useRef<PopupRef>(null);

  const { data: glossaryTerms } = useSWR<{ results: GlossaryTerm[] }>("glossary/terms?limit=10000", stagingFetcher);

  const glossaryTermOptions: Item<string>[] = useMemo(
    () =>
      glossaryTerms?.results
        .filter((gt) => isDefined(gt.id))
        .map((gt) => ({ value: gt.id as string, label: gt.value ?? (gt.id as string) })) ?? [],
    [glossaryTerms],
  );

  const [glossaryTermText, setGlossaryTermText] = useState<string>();
  const [glossaryTerm, setGlossaryTerm] = useState<Item<string> | undefined>();
  const [isInlineTerm, setIsInlineTerm] = useState<boolean>(true);

  const generateAndInsertGlossaryTerm = useCallback(() => {
    if (glossaryTerm) {
      const trimmedGlossaryTermText = glossaryTermText?.trim();
      codemirror.current?.view?.dispatch(
        codemirror.current?.view?.state.replaceSelection(
          `[glossary${isInlineTerm ? "-inline" : ""}:${glossaryTerm.value}${isInlineTerm && trimmedGlossaryTermText ? ` "${trimmedGlossaryTermText}"` : ""}]`,
        ),
      );
    }
  }, [glossaryTermText, glossaryTerm, isInlineTerm, codemirror]);

  return (
    <>
      <button
        className={styles.cmPanelButton}
        title={"Insert glossary term"}
        onClick={(event) => {
          popupRef.current?.open(event);
        }}
      >
        {wide ? "Add glossary term" : "➕ glossary"}
      </button>
      <Popup popUpRef={popupRef}>
        <Container className={styles.cmPanelPopup}>
          <Label for={"glossary-term-id-select"}>Select glossary term:</Label>
          <Select
            inputId="glossary-term-id-select"
            onChange={(e) => setGlossaryTerm(e ? { value: e.value, label: e.label } : undefined)}
            options={glossaryTermOptions}
            placeholder={"Type to search terms"}
          />
          <hr />
          <InputGroup className={"pl-4"}>
            <Label for={"glossary-term-full-or-inline"}>Inline glossary term?</Label>
            <Input
              type={"checkbox"}
              id="glossary-term-full-or-inline"
              onChange={(e) => setIsInlineTerm(e.target.checked)}
              checked={isInlineTerm}
            />
          </InputGroup>
          {isInlineTerm ? (
            <>
              <Label for={"term-text-input"}>Text to display:</Label>
              <Input
                id={"term-text-input"}
                placeholder={glossaryTerm?.label ?? "None"}
                value={glossaryTermText}
                onChange={(e) => setGlossaryTermText(e.target.value)}
              />
            </>
          ) : (
            <Alert color={"warning"}>
              Please note: non-inline glossary terms can <b>only</b> be placed at the beginning of a line.
            </Alert>
          )}
          <hr />
          <PopupCloseContext.Consumer>
            {(close) => (
              <Button
                disabled={!glossaryTerm}
                onClick={() => {
                  generateAndInsertGlossaryTerm();
                  setGlossaryTerm(undefined);
                  setGlossaryTermText(undefined);
                  setIsInlineTerm(true);
                  close?.();
                }}
              >
                Generate markup
              </Button>
            )}
          </PopupCloseContext.Consumer>
        </Container>
      </Popup>
    </>
  );
};
