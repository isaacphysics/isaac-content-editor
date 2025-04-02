import {
    AnswerPresenter,
    CoordinateQuestionPresenter,
    GraphSketcherQuestionPresenter,
    HintsPresenter,
    InlineQuestionPartPresenter,
    InlineRegionPresenter,
    MultipleChoiceQuestionPresenter,
    NumericQuestionPresenter,
    QUESTION_TYPES,
    QuestionContext,
    QuestionFooterPresenter,
    QuestionMetaPresenter,
    QuickQuestionPresenter,
    StringMatchQuestionPresenter,
    SymbolicQuestionPresenter,
    SymbolicChemistryQuestionPresenter
} from "./presenters/questionPresenters";
import {CHOICE_TYPES} from "./ChoiceInserter";
import {TabsPresenter} from "./presenters/TabsPresenter";
import React, {FunctionComponent, Provider} from "react";
import {ChoicePresenter, CoordinateItemPresenter} from "./presenters/ChoicePresenter";
import {Content} from "../../isaac-data-types";
import {FigurePresenter} from "./presenters/FigurePresenter";
import {ValuePresenter} from "./presenters/BaseValuePresenter";
import {ContentValueOrChildrenPresenter} from "./presenters/ContentValueOrChildrenPresenter";
import {AccordionPresenter} from "./presenters/AccordionPresenter";
import {CodeSnippetPresenter} from "./presenters/CodeSnippetPresenter";
import {VideoPresenter} from "./presenters/VideoPresenter";
import {GlossaryTermPresenter} from "./presenters/GlossaryTermPresenter";
import {EmailTemplatePresenter} from "./presenters/EmailTemplatePresenter";
import {AnvilAppPresenter} from "./presenters/AnvilAppPresenter";
import {EventPagePresenter, PagePresenter, QuizPagePresenter, QuizSectionPresenter} from "./presenters/pagePresenters";
import {PodPresenter} from "./presenters/PodPresenter";
import {defaultMeta, MetaItemKey} from "./Metadata";
import {CardDeckPresenter, CardPresenter} from "./presenters/CardPresenter";
import {MetaItems} from "./metaItems";
import {
    ItemChoicePresenter,
    ItemPresenter,
    ItemQuestionPresenter
} from "./presenters/ItemQuestionPresenter";
import styles from "./styles/semantic.module.css";
import {ListChildrenPresenter} from "./presenters/ListChildrenPresenter";
import {InteractiveCodeSnippetPresenter} from "./presenters/InteractiveCodeSnippetPresenter";
import {CalloutPresenter} from "./presenters/CalloutPresenter";
import {LLMQuestionPresenter} from "./presenters/LLMQuestionPresenter";

export type ContentType =
    | "content"
    | "content$accordion"
    | "content$horizontal"
    | "content$clearfix"
    | "content$callout"
    | "content$tabs"
    | "isaacConceptPage"
    | "isaacQuestionPage"
    | "isaacFastTrackQuestionPage"
    | "isaacEventPage"
    | "isaacTopicSummaryPage"
    | "isaacPageFragment"
    | "page"
    | "isaacQuiz"
    | "hints"
    | "figure"
    | "codeSnippet"
    | "interactiveCodeSnippet"
    | "codeTabs"
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
    | "inlineQuestionPart"
    | "isaacInlineRegion"
    | "coordinateItem$choice"
    | QUESTION_TYPES
    | CHOICE_TYPES
;

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
    bodyPresenter: CalloutPresenter,
};
const choice: RegistryEntry = {
    name: "Choice",
    bodyPresenter: ChoicePresenter,
};
const accordion: RegistryEntry = {
    name: "Accordion",
    bodyPresenter: AccordionPresenter,
}
const horizontal: RegistryEntry = {
    name: "Side-by-side layout",
    className: styles.horizontal,
    bodyPresenter: ListChildrenPresenter,
}
const clearfix: RegistryEntry = {
    name: "Clearfix",
    bodyPresenter: () => <div className={"text-center pb-3"}>
        <hr/>
        <i>This block is used to clear floating elements</i>
    </div>,
}
const tabs: RegistryEntry = {
    name: "Tabs",
    bodyPresenter: TabsPresenter,
}
const hints: RegistryEntry = {
    name: "Hints",
    bodyPresenter: (props) => <TabsPresenter {...props} />,
};
const question: RegistryEntry = {
    name: "Question",
    headerPresenter: QuestionMetaPresenter,
    bodyPresenter: ContentValueOrChildrenPresenter,
    footerPresenter: QuestionFooterPresenter,
    blankValue: "Enter question body here",
    contextProviderWrapper: QuestionContext.Provider
};
const isaacSymbolicQuestion = {
    ...question,
    headerPresenter: SymbolicQuestionPresenter,
};
const isaacSymbolicChemistryQuestion = {
    ...question,
    headerPresenter: SymbolicChemistryQuestionPresenter,
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
const isaacLLMFreeTextQuestion: RegistryEntry = {
    ...question,
    bodyPresenter: ContentValueOrChildrenPresenter,
    footerPresenter: LLMQuestionPresenter,
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
const interactiveCodeSnippet: RegistryEntry = {
    name: "Interactive Code Snippet",
    bodyPresenter: InteractiveCodeSnippetPresenter,
};
const codeTabs: RegistryEntry = {
    name: "Code Tabs",
    bodyPresenter: TabsPresenter,
}
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
    metadata: [...defaultMeta, "published"]
};
const emailTemplate: RegistryEntry = {
    ...content,
    name: "Email template",
    bodyPresenter: EmailTemplatePresenter,
    metadata: [...defaultMeta, "published"]
};
const isaacCard: RegistryEntry = {
    name: "Card",
    bodyPresenter: CardPresenter,
};
const isaacCardDeck: RegistryEntry = {
    name: "Card Deck",
    bodyPresenter: CardDeckPresenter,
};
const isaacInlineRegion: RegistryEntry = {
    name: "Inline Region",
    bodyPresenter: InlineRegionPresenter,
    footerPresenter: HintsPresenter,
};
const isaacInlineQuestionPart: RegistryEntry = {
    name: "Inline Question Part",
    bodyPresenter: InlineQuestionPartPresenter,
};

const pageMeta: MetaItemKey[] = ["audience", ...defaultMeta, "relatedContent", "permissions", "notes", "teacherNotes"];
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
    metadata: [...contentPage.metadata ?? [], "linkedGameboards"],
};
const isaacQuestionPage: RegistryEntry = {
    ...basePage,
    metadata: [...pageMeta, "attribution", "supersededBy", ...pageMetaTail],
};
const isaacFastTrackQuestionPage: RegistryEntry = {
    ...isaacQuestionPage,
    metadata: [...isaacQuestionPage.metadata ?? [], "level"]
}
const isaacConceptPage: RegistryEntry = {
    ...isaacQuestionPage,
    metadata: [...isaacQuestionPage.metadata ?? [], "summary"]
};
const isaacEventPage: RegistryEntry = {
    ...basePage,
    name: "Event Page",
    headerPresenter: EventPagePresenter,
    metadata: [...pageMeta, ...pageMetaTail, "emailEventDetails", "emailConfirmedBookingText", "emailWaitingListBookingText", "date", "end_date", "bookingDeadline", "prepWorkDeadline", "numberOfPlaces", "eventStatus", "location", "isaacGroupToken", "reservations", "preResources", "postResources"],
};

const isaacQuiz: RegistryEntry = {
    name: "Test",
    bodyPresenter: QuizPagePresenter,
    metadata: ["audience", ...defaultMeta, "hiddenFromStudentsAndTutors", "hiddenFromTeachers", "published", "deprecated", "attribution"],
};
const isaacQuizSection: RegistryEntry = {
    ...content,
    headerPresenter: QuizSectionPresenter,
};

const isaacWildcard: RegistryEntry = {
    name: "Wildcard",
    headerPresenter: PagePresenter,
    metadata: [...defaultMeta, "description", "url", "published"],
};


export const REGISTRY: Record<ContentType, RegistryEntry> = {
    content,
    page: contentPage,
    isaacTopicSummaryPage: isaacTopicSummaryPage,
    isaacPageFragment: contentPage,
    isaacConceptPage,
    isaacQuestionPage,
    isaacFastTrackQuestionPage: isaacQuestionPage,
    isaacEventPage,
    isaacQuiz,
    isaacWildcard,
    content$accordion: accordion,
    content$horizontal: horizontal,
    content$clearfix: clearfix,
    content$callout: callout,
    content$tabs: tabs,
    hints,
    // Quick questions don't have choices or hints
    isaacQuestion: {
        ...question,
        headerPresenter: QuickQuestionPresenter,
        footerPresenter: AnswerPresenter
    },
    isaacMultiChoiceQuestion: {...question, headerPresenter: MultipleChoiceQuestionPresenter},
    choice: choice,
    isaacNumericQuestion: {...question, headerPresenter: NumericQuestionPresenter},
    quantity: choice,
    isaacSymbolicQuestion,
    formula: choice,
    isaacSymbolicChemistryQuestion,
    chemicalFormula: choice,
    isaacSymbolicLogicQuestion: isaacSymbolicQuestion,
    logicFormula: choice,
    isaacStringMatchQuestion,
    stringChoice: choice,
    isaacFreeTextQuestion: isaacStringMatchQuestion,
    freeTextRule: choice,
    isaacLLMFreeTextQuestion,
    isaacRegexMatchQuestion: isaacStringMatchQuestion,
    inlineQuestionPart: isaacInlineQuestionPart,
    isaacInlineRegion: isaacInlineRegion,
    regexPattern: choice,
    isaacGraphSketcherQuestion: {...question, headerPresenter: GraphSketcherQuestionPresenter},
    graphChoice: choice,
    isaacItemQuestion,
    isaacReorderQuestion: isaacItemQuestion,
    isaacParsonsQuestion: isaacItemQuestion,
    itemChoice: choice,
    parsonsChoice: choice,
    isaacClozeQuestion: isaacItemQuestion,
    coordinateItem$choice: {bodyPresenter: CoordinateItemPresenter},
    coordinateChoice: choice,
    isaacCoordinateQuestion: {...question, headerPresenter: CoordinateQuestionPresenter, footerPresenter: undefined},
    item,
    parsonsItem: item,
    item$choice: {bodyPresenter: ItemChoicePresenter},
    figure,
    image: {...figure, name: "Image"},
    codeSnippet,
    interactiveCodeSnippet,
    codeTabs,
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
