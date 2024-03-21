import {
  AnswerPresenter,
  MultipleChoiceQuestionPresenter,
  NumericQuestionPresenter,
  QUESTION_TYPES,
  QuestionContext,
  QuestionFooterPresenter,
  QuestionMetaPresenter,
  QuickQuestionPresenter,
  StringMatchQuestionPresenter,
  SymbolicQuestionPresenter,
} from "./presenters/questionPresenters";
import { CHOICE_TYPES } from "./ChoiceInserter";
import { TabsPresenter } from "./presenters/TabsPresenter";
import React, { FunctionComponent, Provider } from "react";
import { ChoicePresenter } from "./presenters/ChoicePresenter";
import { Content } from "../../isaac-data-types";
import { FigurePresenter } from "./presenters/FigurePresenter";
import { ValuePresenter } from "./presenters/BaseValuePresenter";
import { ContentValueOrChildrenPresenter } from "./presenters/ContentValueOrChildrenPresenter";
import { AccordionPresenter } from "./presenters/AccordionPresenter";
import { CodeSnippetPresenter } from "./presenters/CodeSnippetPresenter";
import { VideoPresenter } from "./presenters/VideoPresenter";
import { GlossaryTermPresenter } from "./presenters/GlossaryTermPresenter";
import { EmailTemplatePresenter } from "./presenters/EmailTemplatePresenter";
import { AnvilAppPresenter } from "./presenters/AnvilAppPresenter";
import {
  EventPagePresenter,
  PagePresenter,
  QuizPagePresenter,
  QuizSectionPresenter,
} from "./presenters/pagePresenters";
import { PodPresenter } from "./presenters/PodPresenter";
import { defaultMeta, MetaItemKey } from "./Metadata";
import { CardDeckPresenter, CardPresenter } from "./presenters/CardPresenter";
import { MetaItems } from "./metaItems";
import { ItemChoicePresenter, ItemPresenter, ItemQuestionPresenter } from "./presenters/ItemQuestionPresenter";
import styles from "./styles/semantic.module.css";
import { ListChildrenPresenter } from "./presenters/ListChildrenPresenter";

export type ContentType =
  | "content"
  | "content$accordion"
  | "content$horizontal"
  | "content$callout"
  | "content$tabs"
  | "isaacConceptPage"
  | "isaacQuestionPage"
  | "isaacEventPage"
  | "isaacTopicSummaryPage"
  | "isaacPageFragment"
  | "page"
  | "isaacQuiz"
  | "hints"
  | "figure"
  | "codeSnippet"
  | "image"
  | "video"
  | "glossaryTerm"
  | "emailTemplate"
  | "anvilApp"
  | "isaacQuizSection"
  | "isaacPod"
  | "isaacCard"
  | "isaacCardDeck"
  | "isaacWildcard"
  | "item"
  | "parsonsItem"
  | "item$choice"
  | QUESTION_TYPES
  | CHOICE_TYPES;

export interface PresenterProps<D = Content> {
  doc: D;
  update: <T extends D>(newContent: T, invertible?: boolean) => void;
}

export type Presenter<D extends Content = Content> = FunctionComponent<PresenterProps<D>>;

interface RegistryEntry {
  name?: string;
  headerPresenter?: Presenter;
  bodyPresenter?: ValuePresenter;
  footerPresenter?: Presenter;
  blankValue?: string;
  metadata?: MetaItemKey[];
  contextProviderWrapper?: Provider<Content | null>;
  className?: string;
}

const content: RegistryEntry = {
  headerPresenter: undefined,
  bodyPresenter: ContentValueOrChildrenPresenter,
  footerPresenter: undefined,
};
const callout: RegistryEntry = {
  name: "Callout",
  bodyPresenter: ContentValueOrChildrenPresenter,
};
const choice: RegistryEntry = {
  name: "Choice",
  bodyPresenter: ChoicePresenter,
};
const accordion: RegistryEntry = {
  name: "Accordion",
  bodyPresenter: AccordionPresenter,
};
const horizontal: RegistryEntry = {
  name: "Side-by-side layout",
  className: styles.horizontal,
  bodyPresenter: ListChildrenPresenter,
};
const tabs: RegistryEntry = {
  name: "Tabs",
  bodyPresenter: TabsPresenter,
};
const hints: RegistryEntry = {
  name: "Hints",
  bodyPresenter: (props) => <TabsPresenter {...props} hideTitles />,
};
const question: RegistryEntry = {
  name: "Question",
  headerPresenter: QuestionMetaPresenter,
  bodyPresenter: ContentValueOrChildrenPresenter,
  footerPresenter: QuestionFooterPresenter,
  blankValue: "Enter question body here",
  contextProviderWrapper: QuestionContext.Provider,
};
const isaacSymbolicQuestion = {
  ...question,
  headerPresenter: SymbolicQuestionPresenter,
};
const isaacStringMatchQuestion = {
  ...question,
  headerPresenter: StringMatchQuestionPresenter,
};
const isaacItemQuestion = {
  ...question,
  bodyPresenter: ItemQuestionPresenter,
  footerPresenter: undefined,
};
const item = {
  bodyPresenter: ItemPresenter,
};

const mediaMeta: MetaItemKey[] = [...defaultMeta, "altText", "attribution"];
const figure: RegistryEntry = {
  name: "Figure",
  bodyPresenter: FigurePresenter,
  blankValue: "Enter caption here",
  metadata: mediaMeta,
};
const video: RegistryEntry = {
  name: "Video",
  bodyPresenter: VideoPresenter,
  metadata: mediaMeta,
};
const codeSnippet: RegistryEntry = {
  name: "Code Snippet",
  bodyPresenter: CodeSnippetPresenter,
};
const glossaryTerm: RegistryEntry = {
  name: "Glossary term",
  bodyPresenter: GlossaryTermPresenter,
};
const anvilApp: RegistryEntry = {
  name: "Anvil app",
  bodyPresenter: AnvilAppPresenter,
  metadata: [...defaultMeta, "appId", "appAccessKey"],
};
const isaacPod: RegistryEntry = {
  name: "Pod",
  bodyPresenter: PodPresenter,
  metadata: [...defaultMeta, "published"],
};
const emailTemplate: RegistryEntry = {
  ...content,
  name: "Email template",
  bodyPresenter: EmailTemplatePresenter,
  metadata: [...defaultMeta, "published"],
};
const isaacCard: RegistryEntry = {
  name: "Card",
  bodyPresenter: CardPresenter,
};
const isaacCardDeck: RegistryEntry = {
  name: "Card Deck",
  bodyPresenter: CardDeckPresenter,
};

const pageMeta: MetaItemKey[] = ["audience", ...defaultMeta, "relatedContent"];
const pageMetaTail: MetaItemKey[] = ["published", "deprecated"];
const basePage: RegistryEntry = {
  ...content,
  name: "Page",
  headerPresenter: PagePresenter,
  metadata: pageMeta,
};
const contentPage: RegistryEntry = {
  ...basePage,
  metadata: [...pageMeta, ...pageMetaTail, "summary"],
};
const isaacTopicSummaryPage: RegistryEntry = {
  ...contentPage,
  metadata: [...(contentPage.metadata ?? []), "linkedGameboards"],
};
const isaacQuestionPage: RegistryEntry = {
  ...basePage,
  metadata: [...pageMeta, "attribution", "supersededBy", ...pageMetaTail],
};
const isaacConceptPage: RegistryEntry = {
  ...isaacQuestionPage,
  metadata: [...(isaacQuestionPage.metadata ?? []), "summary"],
};
const isaacEventPage: RegistryEntry = {
  ...basePage,
  name: "Event Page",
  headerPresenter: EventPagePresenter,
  metadata: [
    ...pageMeta,
    ...pageMetaTail,
    "privateEvent",
    "hub",
    "emailEventDetails",
    "emailConfirmedBookingText",
    "emailWaitingListBookingText",
    "date",
    "end_date",
    "bookingDeadline",
    "prepWorkDeadline",
    "numberOfPlaces",
    "eventStatus",
    "location",
    "isaacGroupToken",
    "reservations",
    "preResources",
    "postResources",
  ],
};

const isaacQuiz: RegistryEntry = {
  name: "Test",
  bodyPresenter: QuizPagePresenter,
  metadata: [...defaultMeta, "visibleToStudents", "hiddenFromTeachers", "published", "attribution"],
};
const isaacQuizSection: RegistryEntry = {
  ...content,
  headerPresenter: QuizSectionPresenter,
};

const isaacWildcard: RegistryEntry = {
  name: "Wildcard",
  headerPresenter: PagePresenter,
  metadata: [...defaultMeta, "description", "url"],
};

export const REGISTRY: Record<ContentType, RegistryEntry> = {
  content,
  page: contentPage,
  isaacTopicSummaryPage: isaacTopicSummaryPage,
  isaacPageFragment: contentPage,
  isaacConceptPage,
  isaacQuestionPage,
  isaacEventPage,
  isaacQuiz,
  isaacWildcard,
  content$accordion: accordion,
  content$horizontal: horizontal,
  content$callout: callout,
  content$tabs: tabs,
  hints,
  // Quick questions don't have choices or hints
  isaacQuestion: { ...question, headerPresenter: QuickQuestionPresenter, footerPresenter: AnswerPresenter },
  isaacMultiChoiceQuestion: { ...question, headerPresenter: MultipleChoiceQuestionPresenter },
  choice: choice,
  isaacNumericQuestion: { ...question, headerPresenter: NumericQuestionPresenter },
  quantity: choice,
  isaacSymbolicQuestion,
  formula: choice,
  isaacSymbolicLogicQuestion: isaacSymbolicQuestion,
  logicFormula: choice,
  isaacStringMatchQuestion,
  stringChoice: choice,
  isaacFreeTextQuestion: isaacStringMatchQuestion,
  freeTextRule: choice,
  isaacRegexMatchQuestion: isaacStringMatchQuestion,
  regexPattern: choice,
  isaacItemQuestion,
  isaacReorderQuestion: isaacItemQuestion,
  isaacParsonsQuestion: isaacItemQuestion,
  itemChoice: choice,
  parsonsChoice: choice,
  isaacClozeQuestion: isaacItemQuestion,
  item,
  parsonsItem: item,
  item$choice: { bodyPresenter: ItemChoicePresenter },
  figure,
  image: { ...figure, name: "Image" },
  codeSnippet,
  video,
  glossaryTerm,
  emailTemplate,
  anvilApp,
  isaacQuizSection,
  isaacPod,
  isaacCard,
  isaacCardDeck,
};

const unknown: RegistryEntry = {
  ...content,
  name: "Unknown",
  metadata: Object.keys(MetaItems) as MetaItemKey[],
};

export function getEntryType(doc: ContentType | Content) {
  if (typeof doc === "string") {
    return REGISTRY[doc];
  }
  const typeWithLayout = `${doc.type}$${doc.layout}` as ContentType;
  return REGISTRY[typeWithLayout] || REGISTRY[doc.type as ContentType] || unknown;
}
