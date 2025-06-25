/* tslint:disable */
// Generated using typescript-generator version 2.12.476 on 2022-03-25 13:08:59.

export interface AssignmentDO {
    id?: number;
    gameboardId?: string;
    groupId?: number;
    ownerUserId?: number;
    notes?: string;
    creationDate?: Date;
    dueDate?: Date;
}

export interface GameboardContentDescriptor {
    id?: string;
    contentType?: string;
    context?: AudienceContext;
}

export interface GameboardDO {
    title?: string;
    contents?: GameboardContentDescriptor[];
    wildCard?: IsaacWildcard;
    wildCardPosition?: number;
    creationDate?: Date;
    gameFilter?: GameFilter;
    ownerUserId?: number;
    creationMethod?: GameboardCreationMethod;
    tags?: string[];
    _id?: string;
}

export interface IsaacAnvilQuestion extends IsaacQuestionBase {
    anvilApp?: AnvilApp;
}

export interface IsaacCard extends Content {
    image?: Image;
    clickUrl?: string;
    disabled?: boolean;
    verticalContent?: boolean;
    buttonText?: string;
}

export interface IsaacCardDeck extends Content {
    cards?: IsaacCard[];
}

export interface IsaacClozeQuestion extends IsaacItemQuestion {
    withReplacement?: boolean;
    detailedItemFeedback?: boolean;
}

export interface IsaacCoordinateQuestion extends IsaacQuestionBase {
    significantFiguresMin?: number;
    significantFiguresMax?: number;
    ordered?: boolean;
    numberOfCoordinates?: number;
    numberOfDimensions?: number;
    placeholderValues?: string[];
}

export interface IsaacConceptPage extends SeguePage {
}

export interface IsaacEventPage extends Content {
    date?: number;
    bookingDeadline?: number;
    prepWorkDeadline?: number;
    location?: Location;
    preResources?: ExternalReference[];
    postResources?: ExternalReference[];
    eventThumbnail?: Image;
    numberOfPlaces?: number;
    groupReservationLimit?: number;
    allowGroupReservations?: boolean;
    preResourceContent?: Content[];
    emailEventDetails?: string;
    emailConfirmedBookingText?: string;
    emailWaitingListBookingText?: string;
    postResourceContent?: Content[];
    eventStatus?: EventStatus;
    isaacGroupToken?: string;
    address?: Address;
    endDate?: number;
}

export interface IsaacFastTrackQuestionPage extends IsaacQuestionPage {
}

export interface IsaacFeaturedProfile extends Content {
    emailAddress?: string;
    image?: Image;
    homepage?: string;
}

export interface IsaacFreeTextQuestion extends Question {
}

export interface LLMFreeTextMarkSchemeEntry {
    jsonField?: string;
    shortDescription?: string;
    marks?: number;
}

export interface LLMFormulaNode {
    type: "LLMMarkingFunction" | "LLMMarkingVariable" | "LLMMarkingConstant";
}

export interface LLMFunctionNode extends LLMFormulaNode{
    arguments: LLMFormulaNode[] | LLMFormulaNode;
    name: string;
    type: "LLMMarkingFunction";
}

export interface LLMVariableNode extends LLMFormulaNode {
    name: string;
    type: "LLMMarkingVariable";
}

export interface LLMConstantNode extends LLMFormulaNode {
    value: number;
    type: "LLMMarkingConstant";
}

export interface LLMFreeTextMarkedExample {
    answer?: string;
    marks?: Record<string, number>;
    marksAwarded?: number;
}

export interface IsaacLLMFreeTextQuestion extends IsaacQuestionBase {
    markScheme?: LLMFreeTextMarkSchemeEntry[];
    maxMarks?: number;
    additionalMarkingInstructions?: string;
    markingFormula?: LLMFormulaNode;
    markingFormulaString?: string;
    markedExamples?: LLMFreeTextMarkedExample[];
}

export interface IsaacGraphSketcherQuestion extends IsaacQuestionBase {
    maxNumCurves?: number;
    axisLabelX?: string;
    axisLabelY?: string;
}

export interface IsaacItemQuestion extends IsaacQuestionBase {
    items?: Item[];
    randomiseItems?: boolean;
}

export interface IsaacMultiChoiceQuestion extends IsaacQuestionBase {
}

export interface IsaacNumericQuestion extends IsaacQuestionBase {
    requireUnits?: boolean;
    disregardSignificantFigures?: boolean;
    significantFiguresMin?: number;
    significantFiguresMax?: number;
    availableUnits?: string[];
    displayUnit?: string;
}

export interface IsaacPageFragment extends Content {
    summary?: string;
}

export interface IsaacParsonsQuestion extends IsaacItemQuestion {
    disableIndentation?: boolean;
}

export interface IsaacReorderQuestion extends IsaacItemQuestion { }

export interface IsaacPod extends Content {
    image?: Image;
    url?: string;
}

export interface IsaacQuestionBase extends ChoiceQuestion {
}

export interface IsaacQuestionPage extends SeguePage {
    difficulty?: number;
    passMark?: number;
    supersededBy?: string;
}

export interface IsaacQuickQuestion extends IsaacQuestionBase {
    showConfidence?: boolean;
}

export interface IsaacQuiz extends SeguePage {
    hiddenFromRoles?: string[];
    rubric?: Content;
}

export interface SidebarEntry extends Content {
    label?: string;
    pageId?: string;
    pageType?: SidebarEntryType;
}

export interface SidebarGroup extends SidebarEntry {
    sidebarEntries?: SidebarEntry[];
}

export interface Sidebar extends Content {
    sidebarEntries?: SidebarEntry[];
}

export interface IsaacBookIndexPage extends SeguePage {
    sidebar?: string; // the ID of the sidebar
    coverImage?: Image;
}

export interface IsaacBookDetailPage extends SeguePage {
    gameboards?: string[];
    extensionGameboards?: string[];
}

export interface IsaacQuizSection extends Content {
}

export interface IsaacRegexMatchQuestion extends IsaacQuestionBase {
    multiLineEntry?: boolean;
}

export interface IsaacStringMatchQuestion extends IsaacQuestionBase {
    multiLineEntry?: boolean;
    preserveLeadingWhitespace?: boolean;
    preserveTrailingWhitespace?: boolean;
}

export interface IsaacInlineQuestion extends IsaacQuestionBase {
    inlineQuestions?: IsaacStringMatchQuestion[];
}

export interface IsaacInlinePart extends IsaacQuestionBase {
}

export interface IsaacSymbolicChemistryQuestion extends IsaacSymbolicQuestion {
    isNuclear?: boolean;
    allowPermutations?: boolean;
    allowScalingCoefficients?: boolean;
}

export interface IsaacSymbolicLogicQuestion extends IsaacSymbolicQuestion {
}

export interface IsaacSymbolicQuestion extends IsaacQuestionBase {
    formulaSeed?: string;
    availableSymbols?: string[];
}

export interface IsaacTopicSummaryPage extends SeguePage {
    linkedGameboards?: string[];
}

export interface IsaacWildcard extends Content {
    description?: string;
    url?: string;
}

export interface QuizAssignmentDO {
    id?: number;
    quizId?: string;
    groupId?: number;
    ownerUserId?: number;
    creationDate?: Date;
    dueDate?: Date;
    quizFeedbackMode?: QuizFeedbackMode;
}

export interface QuizAttemptDO {
    id?: number;
    userId?: number;
    quizId?: string;
    quizAssignmentId?: number;
    startDate?: Date;
    completedDate?: Date;
}

export interface TestCase extends QuestionValidationResponse {
    expected?: boolean;
}

export interface TestQuestion {
    userDefinedChoices?: Choice[];
    testCases?: TestCase[];
}

export interface EventBooking {
    id?: number;
    creationDate?: Date;
    userId?: number;
    eventId?: string;
    additionalInformation?: { [index: string]: string };
    reservedById?: number;
    bookingStatus?: BookingStatus;
    updateDate?: Date;
}

export interface EventBookings {
}

export interface PgEventBooking extends EventBooking {
}

export interface PgEventBookings extends EventBookings {
}

export interface AnvilApp extends Content {
    appId?: string;
    appAccessKey?: string;
}

export interface ChemicalFormula extends Choice {
    mhchemExpression?: string;
}

export interface Choice extends Content {
    correct?: boolean;
    explanation?: ContentBase;
}

export interface ChoiceQuestion extends Question {
    choices?: Choice[];
    randomiseChoices?: boolean;
}

export interface CodeSnippet extends Content {
    language?: string;
    code?: string;
    disableHighlighting?: boolean;
    url?: string;
}

export interface InteractiveCodeSnippet extends CodeSnippet {
    setupCode?: string;
    testCode?: string;
    expectedResult?: string;
    wrapCodeInMain?: boolean;
    dataUrl?: string;
}

export interface IsaacTabs extends Content {
    expandable?: boolean;
    hideTitles?: boolean;
}

export interface CodeTabs extends IsaacTabs {
}

export interface Content extends ContentBase {
    title?: string;
    subtitle?: string;
    author?: string;
    encoding?: string;
    layout?: string;
    children?: ContentBase[];
    value?: string;
    attribution?: string;
    relatedContent?: string[];
    published?: boolean;
    deprecated?: boolean;
    level?: number;
    searchableContent?: string;
}

export interface ContentBase {
    id?: string;
    type?: string;
    tags?: string[];
    canonicalSourceFile?: string;
    version?: string;
    audience?: AudienceContext[];
    display?: { [index: string]: string[] };
}

export interface EmailTemplate extends Content {
    subject?: string;
    plainTextContent?: string;
    htmlContent?: string;
    overrideFromAddress?: string;
    overrideFromName?: string;
    overrideEnvelopeFrom?: string;
    replyToEmailAddress?: string;
    replyToName?: string;
}

export interface ExternalReference {
    title?: string;
    url?: string;
}

export interface Figure extends Image {
}

export interface Formula extends Choice {
    pythonExpression?: string;
    requiresExactMatch?: boolean;
}

export interface FreeTextRule extends Choice {
    caseInsensitive?: boolean;
    allowsAnyOrder?: boolean;
    allowsExtraWords?: boolean;
    allowsMisspelling?: boolean;
    wordProximity?: number;
}

export interface GlossaryTerm extends Content {
    explanation?: Content;
    examBoard?: string;
    stages?: string[];
}

export interface GraphChoice extends Choice {
    graphSpec?: string;
}

export interface Image extends Media {
    clickUrl?: string;
    clickTarget?: string;
}

export interface Item extends Content {
    altText?: string;
}

export interface ItemChoice extends Choice {
    allowSubsetMatch?: boolean;
    items?: Item[];
}

export interface LogicFormula extends Choice {
    pythonExpression?: string;
    requiresExactMatch?: boolean;
}

export interface Media extends Content {
    src?: string;
    altText?: string;
}

export interface Notification extends Content {
    externalReference?: ExternalReference;
    expiry?: Date;
}

export interface ParsonsChoice extends ItemChoice {
}

export interface CoordinateChoice extends ItemChoice {
}

export interface ParsonsItem extends Item {
    indentation?: number;
}

export interface CoordinateItem extends Item {
    coordinates?: string[];
}

export interface Quantity extends Choice {
    units?: string;
}

export interface Question extends Content {
    answer?: ContentBase;
    hints?: ContentBase[];
    defaultFeedback?: Content;
}

export interface RegexPattern extends Choice {
    caseInsensitive?: boolean;
    multiLineRegex?: boolean;
    matchWholeString?: boolean;
}

export interface SeguePage extends Content {
    summary?: string;
    permissions?: string;
    notes?: string;
}

export interface StringChoice extends Choice {
    caseInsensitive?: boolean;
}

export interface Video extends Media {
}

export interface AudienceContext {
    stage?: Stage[];
    examBoard?: ExamBoard[];
    difficulty?: Difficulty[];
    role?: RoleRequirement[];
}

export interface GameFilter {
    subjects?: string[];
    fields?: string[];
    topics?: string[];
    levels?: number[];
    stages?: string[];
    difficulties?: string[];
    examBoards?: string[];
    concepts?: string[];
    questionCategories?: string[];
}

export interface Location {
    address?: Address;
    latitude?: number;
    longitude?: number;
}

export interface Address {
    addressLine1?: string;
    addressLine2?: string;
    town?: string;
    county?: string;
    postalCode?: string;
    country?: string;
}

export interface QuestionValidationResponse extends LightweightQuestionValidationResponse {
    answer?: Choice;
    explanation?: Content;
}

export interface LightweightQuestionValidationResponse {
    questionId?: string;
    correct?: boolean;
    dateAttempted?: Date;
}

export type EventStatus = "OPEN" | "FULLY_BOOKED" | "CANCELLED" | "CLOSED" | "WAITING_LIST_ONLY";

export type GameboardCreationMethod = "FILTER" | "BUILDER";

export type QuizFeedbackMode = "NONE" | "OVERALL_MARK" | "SECTION_MARKS" | "DETAILED_FEEDBACK";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "WAITING_LIST" | "ATTENDED" | "ABSENT" | "RESERVED";

export type Stage = "year_7_and_8" | "year_9" | "gcse" | "a_level" | "further_a" | "university" | "scotland_national_5" | "scotland_higher" | "scotland_advanced_higher" | "core" | "advanced" | "all";

export type ExamBoard = "aqa" | "ocr" | "cie" | "edexcel" | "eduqas" | "wjec" | "sqa" | "ada" | "all";

export type Difficulty = "practice_1" | "practice_2" | "practice_3" | "challenge_1" | "challenge_2" | "challenge_3";

export type RoleRequirement = "logged_in" | "teacher";
