import React, { useState } from "react";
import { EditableDocPropFor, EditableIDProp, EditableTitleProp } from "../props/EditableDocProp";
import styles from "../styles/question.module.css";
import { Alert, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import {
  Content,
  IsaacMultiChoiceQuestion,
  IsaacNumericQuestion,
  IsaacQuestionBase,
  IsaacQuickQuestion,
  IsaacStringMatchQuestion,
  IsaacSymbolicQuestion,
  Quantity,
} from "../../../isaac-data-types";
import { SemanticDocProp } from "../props/SemanticDocProp";
import { EditableText } from "../props/EditableText";
import { CheckboxDocProp } from "../props/CheckboxDocProp";
import { PresenterProps } from "../registry";
import { SemanticListProp } from "../props/listProps";
import { NumberDocPropFor } from "../props/NumberDocPropFor";
import { ChoicesPresenter } from "./ChoicesPresenter";

export const QuestionContext = React.createContext<Content | null>(null);

export type QUESTION_TYPES =
  | "isaacQuestion"
  | "isaacMultiChoiceQuestion"
  | "isaacNumericQuestion"
  | "isaacSymbolicQuestion"
  | "isaacStringMatchQuestion"
  | "isaacFreeTextQuestion"
  | "isaacSymbolicLogicQuestion"
  | "isaacRegexMatchQuestion"
  | "isaacItemQuestion"
  | "isaacReorderQuestion"
  | "isaacParsonsQuestion"
  | "isaacClozeQuestion";

const QuestionTypes: Record<QUESTION_TYPES, { name: string }> = {
  isaacQuestion: {
    name: "Quick Question",
  },
  isaacMultiChoiceQuestion: {
    name: "Multiple Choice Question",
  },
  isaacNumericQuestion: {
    name: "Numeric Question",
  },
  isaacSymbolicQuestion: {
    name: "Symbolic Question",
  },
  isaacStringMatchQuestion: {
    name: "String Match Question",
  },
  isaacRegexMatchQuestion: {
    name: "Regex Match Question",
  },
  isaacFreeTextQuestion: {
    name: "Free Text Question",
  },
  isaacSymbolicLogicQuestion: {
    name: "Logic Question",
  },
  isaacItemQuestion: {
    name: "Item Question",
  },
  isaacReorderQuestion: {
    name: "Reorder Question",
  },
  isaacParsonsQuestion: {
    name: "Parsons Question",
  },
  isaacClozeQuestion: {
    name: "Cloze (Drag and Drop) Question",
  },
};

function QuestionTypeSelector({ doc, update }: PresenterProps) {
  const [isOpen, setOpen] = useState(false);

  const questionType = QuestionTypes[doc.type as QUESTION_TYPES];

  return (
    <Dropdown toggle={() => setOpen((toggle) => !toggle)} isOpen={isOpen}>
      <DropdownToggle caret>{questionType.name}</DropdownToggle>
      <DropdownMenu>
        {Object.keys(QuestionTypes).map((key) => {
          const possibleType = QuestionTypes[key as QUESTION_TYPES];
          return (
            <DropdownItem
              key={key}
              active={questionType === possibleType}
              onClick={() => {
                if (questionType !== possibleType) {
                  const newType = key;
                  const newDoc = { ...doc, type: newType } as IsaacQuickQuestion & IsaacNumericQuestion;
                  if (newType === "isaacNumericQuestion" && !newDoc.hasOwnProperty("requireUnits")) {
                    // Add the default value if it is missing
                    newDoc.requireUnits = true;
                    delete newDoc.displayUnit;
                    newDoc.disregardSignificantFigures = false;
                    delete newDoc.showConfidence;
                    delete newDoc.randomiseChoices;
                  } else if (newType === "isaacQuestion" && !newDoc.hasOwnProperty("showConfidence")) {
                    newDoc.showConfidence = false;
                    delete newDoc.requireUnits;
                    delete newDoc.disregardSignificantFigures;
                    delete newDoc.displayUnit;
                    delete newDoc.randomiseChoices;
                  } else if (newType === "isaacMultiChoiceQuestion" && !newDoc.hasOwnProperty("randomiseChoices")) {
                    // Add the default value if it is missing
                    newDoc.randomiseChoices = true;
                    delete newDoc.requireUnits;
                    delete newDoc.disregardSignificantFigures;
                    delete newDoc.displayUnit;
                    delete newDoc.showConfidence;
                  } else {
                    // Remove the requireUnits property as it is no longer applicable to this type of question
                    delete newDoc.requireUnits;
                    // Remove the disregardSignificantFigures property as it is no longer applicable to this type of question
                    delete newDoc.disregardSignificantFigures;
                    // Remove the displayUnit property as it is no longer applicable to this type of question
                    delete newDoc.displayUnit;
                    // Remove the randomiseChoices property as it is no longer applicable to this type of question
                    delete newDoc.randomiseChoices;
                    // Remove showConfidence property as it is no longer applicable to this type of question
                    delete newDoc.showConfidence;
                  }

                  if (newType === "isaacQuestion") {
                    // Remove the defaultFeedback property as it is not applicable to quick questions
                    delete newDoc.defaultFeedback;
                  }

                  update(newDoc);
                }
              }}
            >
              {possibleType.name}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}

export function QuestionMetaPresenter(props: PresenterProps) {
  return (
    <div>
      <div className={styles.questionType}>
        <QuestionTypeSelector {...props} />
      </div>
      <h4>
        <EditableTitleProp {...props} placeHolder="Question title" />
      </h4>
      <h6>
        <EditableIDProp {...props} label="Question ID" />
      </h6>
    </div>
  );
}

export function AnswerPresenter({ doc, ...rest }: PresenterProps) {
  return <SemanticDocProp doc={doc as IsaacQuickQuestion} {...rest} prop="answer" name="Answer" />;
}

export function QuickQuestionPresenter(props: PresenterProps) {
  const question = props.doc as IsaacQuickQuestion;
  return (
    <>
      <QuestionMetaPresenter {...props} />
      <CheckboxDocProp doc={question} update={props.update} prop="showConfidence" label="Show confidence question" />
    </>
  );
}

export function QuestionFooterPresenter(props: PresenterProps<IsaacQuestionBase>) {
  return (
    <>
      <ChoicesPresenter {...props} />
      <SemanticDocProp {...props} prop="defaultFeedback" name="Default Feedback" />
      <AnswerPresenter {...props} />
      <SemanticListProp {...props} prop="hints" type="hints" />
    </>
  );
}

export function MultipleChoiceQuestionPresenter(props: PresenterProps) {
  const { doc, update } = props;
  const question = doc as IsaacMultiChoiceQuestion;
  return (
    <>
      <QuestionMetaPresenter {...props} />
      <CheckboxDocProp
        doc={question}
        update={update}
        prop="randomiseChoices"
        label="Randomise Choices"
        checkedIfUndefined={true}
      />
    </>
  );
}

const EditableSignificantFiguresMin = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMin", {
  label: "from",
  block: true,
});
const EditableSignificantFiguresMax = NumberDocPropFor<IsaacNumericQuestion>("significantFiguresMax", {
  label: "to",
  block: true,
});
const EditableAvailableUnits = ({ doc, update }: PresenterProps<IsaacNumericQuestion>) => {
  return (
    <EditableText
      onSave={(newText) => {
        update({
          ...doc,
          availableUnits: newText?.split("|").map((unit) => unit.trim()),
        });
      }}
      text={doc.availableUnits?.join(" | ")}
      placeHolder="Enter list of units here (|-separated)"
      label="Available units"
      block
    />
  );
};
const EditableDisplayUnit = EditableDocPropFor<IsaacNumericQuestion>("displayUnit", {
  label: "Display unit",
  block: true,
  format: "latex",
  previewWrapperChar: "$",
});

export function NumericQuestionPresenter(props: PresenterProps) {
  const { doc, update } = props;
  const question = doc as IsaacNumericQuestion;

  return (
    <>
      <QuestionMetaPresenter {...props} />
      <div>
        <CheckboxDocProp doc={question} update={update} prop="disregardSignificantFigures" label="Exact answers only" />
      </div>
      {!question.disregardSignificantFigures && (
        <div className={styles.questionLabel}>
          Significant figures:
          <div className="row">
            <div className="col col-lg-5">
              <EditableSignificantFiguresMin doc={question} update={update} />
            </div>
            <div className="col col-lg-5">
              <EditableSignificantFiguresMax doc={question} update={update} />
            </div>
          </div>
        </div>
      )}
      <div>
        <CheckboxDocProp
          doc={question}
          update={(newQuestion) => {
            if (newQuestion.requireUnits) {
              delete newQuestion.displayUnit;
            } else {
              delete newQuestion.availableUnits;
              newQuestion.choices?.forEach((choice) => {
                if (choice.type === "quantity") {
                  delete (choice as Quantity).units;
                }
              });
            }
            update(newQuestion);
          }}
          prop="requireUnits"
          label="Require choice of units"
        />
      </div>
      {question.requireUnits ? (
        <EditableAvailableUnits doc={question} update={update} />
      ) : (
        <EditableDisplayUnit doc={question} update={update} />
      )}
      <div className={styles.questionLabel} /> {/* For spacing */}
    </>
  );
}

const EditableAvailableSymbols = ({ doc, update }: PresenterProps<IsaacSymbolicQuestion>) => {
  return (
    <EditableText
      onSave={(newText) => {
        update({
          ...doc,
          availableSymbols: newText?.split(",").map((unit) => unit.trim()),
        });
      }}
      text={doc.availableSymbols?.map((unit) => unit.trim()).join(", ")}
      placeHolder="Enter list of symbols here (,-separated)"
      label="Available symbols"
      format={"latex"}
    />
  );
};
const EditableFormulaSeed = EditableDocPropFor<IsaacSymbolicQuestion>("formulaSeed", {
  format: "latex",
  label: "Formula seed",
  placeHolder: "Enter initial state here",
});

const availableMetaSymbols = [
  ["_trigs", "Trigs"],
  ["_1/trigs", "1/Trigs"],
  ["_inv_trigs", "Inv Trigs"],
  ["_inv_1/trigs", "Inv 1/Trigs"],
  ["_hyp_trigs", "Hyp Trigs"],
  ["_inv_hyp_trigs", "Inv Hyp Trigs"],
  ["_logs", "Logarithms"],
  ["_no_alphabet", "No Alphabet"],
];

function hasSymbol(availableSymbols: string[] | undefined, symbol: string) {
  return availableSymbols?.find((s) => s === symbol);
}

function SymbolicMetaSymbols({ doc, update }: PresenterProps<IsaacSymbolicQuestion>) {
  function toggle(symbol: string) {
    const availableSymbols = [...(doc.availableSymbols ?? [])];
    const index = availableSymbols.indexOf(symbol);
    if (index !== -1) {
      availableSymbols.splice(index, 1);
    } else {
      availableSymbols.push(symbol);
    }
    update({
      ...doc,
      availableSymbols,
    });
  }

  return (
    <div className={styles.symbolicMetaButtons}>
      {availableMetaSymbols.map(([symbol, label]) => (
        <Button
          key={symbol}
          size="sm"
          color={hasSymbol(doc.availableSymbols, symbol) ? "primary" : "secondary"}
          onClick={() => toggle(symbol)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

export function SymbolicQuestionPresenter(props: PresenterProps<IsaacSymbolicQuestion>) {
  const { doc } = props;
  return (
    <>
      <QuestionMetaPresenter {...props} />
      <div className={styles.editableFullwidth}>
        <EditableAvailableSymbols {...props} />
      </div>
      {doc.type === "isaacSymbolicQuestion" && <SymbolicMetaSymbols {...props} />}
      <div className={styles.editableFullwidth}>
        <EditableFormulaSeed {...props} />
      </div>
    </>
  );
}

export function StringMatchQuestionPresenter(props: PresenterProps<IsaacStringMatchQuestion>) {
  return (
    <>
      <QuestionMetaPresenter {...props} />
      <CheckboxDocProp {...props} prop="multiLineEntry" label="Multi-line" />
    </>
  );
}

export function FreeTextQuestionInstructions() {
  return (
    <div>
      <h5>Matching Rule Syntax</h5>
      <Alert color="info">
        A fuller set of instructions can be found{" "}
        <a href="https://github.com/isaacphysics/rutherford-content/wiki/Editor-Notes#free-text-questions" target="_">
          here
        </a>
        .
      </Alert>
      <table className={styles.striped}>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Description</th>
            <th>Rule</th>
            <th>✓️ Match</th>
            <th>✗ Failed Match</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.center}>
              <code>|</code>
            </td>
            <td>Separate an OR list of word choices</td>
            <td className={styles.nowrap}>
              <code>JavaScript|[Java&nbsp;Script]|JS</code>
            </td>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <td>"JavaScript", "Java Script", "JS"</td>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <td>"Java"</td>
          </tr>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <tr>
            <td className={styles.center}>
              <code>.</code>
            </td>
            <td>Match only one character</td>
            <td className={styles.center}>
              <code>.a.b.</code>
            </td>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <td>"XaXbX"</td>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <td>"ab", "Xab", "aXb", "abX", "XYZaXYZbXYZ", "XbXaX"</td>
          </tr>
          <tr>
            <td className={styles.center}>
              <code>*</code>
            </td>
            <td>Match zero or more characters</td>
            <td className={styles.center}>
              <code>*a*b*</code>
            </td>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <td>"ab", "Xab", "aXb", "abX", "XYZaXYZbXYZ"</td>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <td>"ba", "XbXaX"</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
