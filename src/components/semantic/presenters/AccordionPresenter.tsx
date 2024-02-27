import React, { useEffect, useState } from "react";
import { Button, Input } from "reactstrap";

import { EditableTitleProp } from "../props/EditableDocProp";
import { TabsHeader, TabsMain, useTabs } from "./TabsPresenter";
import { PresenterProps } from "../registry";
import { AudiencePresenter } from "./AudiencePresenter";

import styles from "../styles/accordion.module.css";

type Display = { audience: string[]; nonAudience: string[] } | undefined;

interface AudienceDisplayControlProps {
  set: (newDisplay: Display | undefined) => void;
  display: Display;
  title: string;
}

const audienceOptions = ["open", "closed"];
const nonAudienceOptions = ["closed", "de-emphasised", "hidden"];

function updateSelection(set: (modifier: (current: string[]) => string[]) => void, old: string) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    set((existing) => {
      const result = [...existing];
      result.splice(existing.indexOf(old), 1, newValue);
      return result;
    });
  };
}

function addSelection(set: (modifier: (current: string[]) => string[]) => void, newValue: string) {
  return () => {
    set((existing) => {
      return [...existing, newValue];
    });
  };
}

function deleteSelection(set: (modifier: (current: string[]) => string[]) => void, old: string) {
  return () => {
    set((existing) => {
      return existing.filter((entry) => entry !== old);
    });
  };
}

function getRemainingValues(audienceOptions: string[], audience: string[]) {
  return audienceOptions.filter((option) => !audience.includes(option));
}

interface DisplayListEditorProps {
  displayList: string[];
  setDisplayList: (modifier: (current: string[]) => string[]) => void;
  name: string;
  displayOptions: string[];
}

function DisplayListEditor({ displayList, setDisplayList, name, displayOptions }: DisplayListEditorProps) {
  const remainingAudienceValues = getRemainingValues(displayOptions, displayList);
  return (
    <>
      {name}:&nbsp;[
      {displayList.length === 0 && "(default) "}
      {displayList.map((selection, i, selections) => (
        <span key={selection}>
          <Input type="select" bsSize="sm" value={selection} onChange={updateSelection(setDisplayList, selection)}>
            <option value={selection}>{selection}</option>
            {remainingAudienceValues.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Input>
          <Button size="sm" outline onClick={deleteSelection(setDisplayList, selection)}>
            ➖
          </Button>
          {i < selections.length - 1 && ", "}
        </span>
      ))}
      {remainingAudienceValues.length > 0 && (
        <Button size="sm" outline onClick={addSelection(setDisplayList, remainingAudienceValues[0])}>
          ➕
        </Button>
      )}
      {"] "}
    </>
  );
}

function AudienceDisplayControl({ display, set, title }: AudienceDisplayControlProps) {
  const [editing, setEditing] = useState(false);
  const [audience, setAudience] = useState(display?.audience ?? []);
  const [nonAudience, setNonAudience] = useState(display?.nonAudience ?? []);

  useEffect(() => {
    if (editing) {
      setAudience(display?.audience ?? []);
      setNonAudience(display?.nonAudience ?? []);
    }
    // Only need to update each time we start editing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);
  const titleText = (
    <small>
      {title}
      {": "}
    </small>
  );
  if (!editing) {
    return (
      <div className={styles.audienceDisplayControls}>
        {titleText}
        {display && (display.audience.length !== 0 || display.nonAudience.length !== 0) ? (
          <span>
            <span>Audience:&nbsp;{display.audience.length ? "[" + display.audience.join(", ") + "]" : "default"}</span>
            &nbsp;&nbsp;
            <span>
              Non-audience:&nbsp;{display.nonAudience.length ? "[" + display.nonAudience.join(", ") + "]" : "default"}
            </span>
          </span>
        ) : (
          "default"
        )}
        &nbsp;&nbsp;
        <Button size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.audienceDisplayControls}>
      {titleText}
      <DisplayListEditor
        displayList={audience}
        setDisplayList={setAudience}
        name="Audience"
        displayOptions={audienceOptions}
      />
      <DisplayListEditor
        displayList={nonAudience}
        setDisplayList={setNonAudience}
        name="Non-Audience"
        displayOptions={nonAudienceOptions}
      />
      <div className={styles.displayButtons}>
        <Button
          size="sm"
          color="primary"
          onClick={() => {
            setEditing(false);
            set({ audience, nonAudience });
          }}
        >
          Set
        </Button>{" "}
        &nbsp;
        <Button
          size="sm"
          color="secondary"
          onClick={() => {
            setEditing(false);
          }}
        >
          Cancel
        </Button>{" "}
        &nbsp;
        <Button
          size="sm"
          color="danger"
          onClick={() => {
            setEditing(false);
            set(undefined);
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

export function AccordionPresenter(props: PresenterProps) {
  const { doc, update } = props;
  const { editTitleRef, currentChild, allProps, currentChildProps } = useTabs(props, {
    emptyDescription: "This accordion is empty.",
    elementName: "Section",
    styles,
    showTitles: false,
  });

  const { keyList, index, updateCurrentChild } = allProps;

  const currentChildDisplay = currentChild?.display as Display;
  const setCurrentChildDisplay = (display: Display | undefined) =>
    updateCurrentChild({
      ...currentChild,
      display,
    });

  return (
    <>
      <div className={styles.headerDisplayControls}>
        <AudienceDisplayControl
          display={doc.display as Display}
          set={(display) => {
            update({
              ...doc,
              display,
            });
          }}
          title="Accordion Display"
        />
      </div>
      <div className={styles.wrapper}>
        <TabsHeader {...allProps} />
        <TabsMain
          {...allProps}
          back="▲"
          forward="▼"
          contentHeader={
            currentChild ? (
              <>
                <div className={styles.meta}>
                  <h3>
                    <EditableTitleProp
                      ref={editTitleRef}
                      {...currentChildProps}
                      placeHolder="Section title"
                      hideWhenEmpty
                    />
                  </h3>
                  <div className={styles.allAudienceControls}>
                    <div className={styles.audienceControls}>
                      <small className={styles.audienceControlsLabel}>Audience:</small>
                      <AudiencePresenter {...currentChildProps} type="accordion" />
                      {currentChildDisplay === undefined && (
                        <Button
                          size="sm"
                          className={styles.audienceDisplayEdit}
                          onClick={() => {
                            setCurrentChildDisplay({
                              audience: [],
                              nonAudience: [],
                            });
                          }}
                        >
                          Override Display
                        </Button>
                      )}
                    </div>
                    {currentChildDisplay !== undefined && (
                      <AudienceDisplayControl
                        key={keyList[index]}
                        display={currentChildDisplay}
                        set={setCurrentChildDisplay}
                        title="Display Override"
                      />
                    )}
                  </div>
                </div>
              </>
            ) : undefined
          }
          extraButtons={
            currentChild ? (
              <>
                {!currentChild.title && (
                  <Button onClick={() => editTitleRef.current?.startEdit()}>Set section title</Button>
                )}
              </>
            ) : undefined
          }
        />
      </div>
    </>
  );
}
