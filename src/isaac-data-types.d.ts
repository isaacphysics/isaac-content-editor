/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2024-03-28 09:08:00.

export interface AbstractUserPreferenceManager {
}

export interface AssignmentDO {
  id?: number;
  gameboardId?: string;
  groupId?: number;
  ownerUserId?: number;
  notes?: string;
  creationDate?: EpochTimeStamp;
  dueDate?: EpochTimeStamp;
  scheduledStartDate?: EpochTimeStamp;
}

export interface AssociationToken {
  token?: string;
  ownerUserId?: number;
  groupId?: number;
}

export interface AudienceContext {
  stage?: Stage[];
  examBoard?: ExamBoard[];
  difficulty?: Difficulty[];
  role?: RoleRequirement[];
}

export interface FormulaValidationResponse extends QuestionValidationResponse {
  matchType?: string;
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
  creationDate?: EpochTimeStamp;
  gameFilter?: GameFilter;
  ownerUserId?: number;
  creationMethod?: GameboardCreationMethod;
  tags?: string[];
  _id?: string;
}

export interface GroupMembership {
  groupId?: number;
  userId?: number;
  status?: GroupMembershipStatus;
  updated?: EpochTimeStamp;
  created?: EpochTimeStamp;
}

export interface ITransaction extends AutoCloseable {
  connection?: any;
}

export interface IUserAlert {
  message?: string;
  id?: number;
  userId?: number;
  created?: EpochTimeStamp;
  link?: string;
  seen?: EpochTimeStamp;
  clicked?: EpochTimeStamp;
  dismissed?: EpochTimeStamp;
}

export interface IUserAlerts {
}

export interface IUserNotification {
  contentNotificationId?: string;
  status?: NotificationStatus;
  userId?: number;
  created?: EpochTimeStamp;
}

export interface IUserNotifications {
}

export interface IUserStreaksManager {
}

export interface IsaacAnvilQuestion extends IsaacQuestionBase {
  anvilApp?: AnvilApp;
}

export interface IsaacCard extends Content {
  image?: Image;
  clickUrl?: string;
  buttonText?: string;
  disabled?: boolean;
  verticalContent?: boolean;
}

export interface IsaacCardDeck extends Content {
  cards?: IsaacCard[];
}

export interface IsaacClozeQuestion extends IsaacItemQuestion {
  withReplacement?: boolean;
  detailedItemFeedback?: boolean;
}

export interface IsaacConceptPage extends SeguePage {
}

export interface IsaacEventPage extends Content {
  date?: EpochTimeStamp;
  bookingDeadline?: EpochTimeStamp;
  prepWorkDeadline?: EpochTimeStamp;
  location?: Location;
  preResources?: ExternalReference[];
  postResources?: ExternalReference[];
  eventThumbnail?: Image;
  numberOfPlaces?: number;
  groupReservationLimit?: number;
  allowGroupReservations?: boolean;
  privateEvent?: boolean;
  hub?: Hub;
  endDate?: EpochTimeStamp;
  preResourceContent?: Content[];
  emailEventDetails?: string;
  emailConfirmedBookingText?: string;
  emailWaitingListBookingText?: string;
  postResourceContent?: Content[];
  eventStatus?: EventStatus;
  isaacGroupToken?: string;
  address?: Address;
  end_date?: EpochTimeStamp;
  EventStatus?: EventStatus;
}

export interface IsaacFeaturedProfile extends Content {
  emailAddress?: string;
  image?: Image;
  homepage?: string;
}

export interface IsaacFreeTextQuestion extends IsaacQuestionBase {
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

export interface IsaacPod extends Content {
  image?: Image;
  url?: string;
  emailAddress?: string;
}

export interface IsaacQuestionBase extends ChoiceQuestion {
}

export interface IsaacQuestionPage extends SeguePage {
  difficulty?: Difficulty;
  passMark?: number;
  supersededBy?: string;
}

export interface IsaacQuickQuestion extends IsaacQuestionBase {
  showConfidence?: boolean;
}

export interface IsaacQuiz extends SeguePage {
  /**
   * @deprecated
   */
  visibleToStudents?: boolean;
  hiddenFromRoles?: string[];
  rubric?: Content;
}

export interface IsaacQuizSection extends Content {
}

export interface IsaacRegexMatchQuestion extends IsaacQuestionBase {
  multiLineEntry?: boolean;
}

export interface IsaacReorderQuestion extends IsaacItemQuestion {
}

export interface IsaacStringMatchQuestion extends IsaacQuestionBase {
  multiLineEntry?: boolean;
  preserveLeadingWhitespace?: boolean;
  preserveTrailingWhitespace?: boolean;
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

export interface ItemValidationResponse extends QuestionValidationResponse {
  itemsCorrect?: boolean[];
}

export interface LightweightQuestionValidationResponse {
  questionId?: string;
  correct?: boolean;
  dateAttempted?: EpochTimeStamp;
}

export interface LogEvent {
  id?: string;
  eventType?: string;
  eventDetailsType?: string;
  eventDetails?: any;
  userId?: string;
  anonymousUser?: boolean;
  ipAddress?: string;
  timestamp?: EpochTimeStamp;
}

export interface PgTransaction extends ITransaction {
  connection?: Connection;
}

export interface PgUserAlert extends IUserAlert {
}

export interface PgUserAlerts extends IUserAlerts {
}

export interface PgUserNotification extends IUserNotification {
  contentNotificationid?: string;
}

export interface PgUserNotifications extends IUserNotifications {
}

export interface PgUserPreferenceManager extends AbstractUserPreferenceManager {
}

export interface PgUserStreakManager extends IUserStreaksManager {
}

export interface QuantityValidationResponse extends QuestionValidationResponse {
  correctValue?: boolean;
  correctUnits?: boolean;
}

export interface QuestionValidationResponse extends LightweightQuestionValidationResponse {
  answer?: Choice;
  explanation?: Content;
}

export interface QuizAssignmentDO {
  id?: number;
  quizId?: string;
  groupId?: number;
  ownerUserId?: number;
  creationDate?: EpochTimeStamp;
  dueDate?: EpochTimeStamp;
  quizFeedbackMode?: QuizFeedbackMode;
}

export interface QuizAttemptDO {
  id?: number;
  userId?: number;
  quizId?: string;
  quizAssignmentId?: number;
  startDate?: EpochTimeStamp;
  completedDate?: EpochTimeStamp;
}

export interface TestCase extends QuestionValidationResponse {
  expected?: boolean;
}

export interface TestQuestion {
  userDefinedChoices?: Choice[];
  testCases?: TestCase[];
}

export interface UserAssociation {
  userIdGrantingPermission?: number;
  userIdReceivingPermission?: number;
  created?: EpochTimeStamp;
}

export interface UserBadge {
  userId?: number;
  badgeName?: Badge;
  state?: any;
}

export interface UserGroup {
  id?: number;
  groupName?: string;
  ownerId?: number;
  status?: GroupStatus;
  created?: EpochTimeStamp;
  archived?: boolean;
  additionalManagerPrivileges?: boolean;
  lastUpdated?: EpochTimeStamp;
}

export interface UserPreference {
  userId?: number;
  preferenceType?: string;
  preferenceName?: string;
  preferenceValue?: boolean;
}

export interface AnvilApp extends Content {
  appId?: string;
  appAccessKey?: string;
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

export interface CodeTabs extends Content {
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
  expandable?: boolean;
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
}

export interface Image extends Media {
  clickUrl?: string;
  clickTarget?: string;
}

export interface InteractiveCodeSnippet extends CodeSnippet {
  setupCode?: string;
  testCode?: string;
  expectedResult?: string;
  wrapCodeInMain?: boolean;
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
  expiry?: EpochTimeStamp;
}

export interface ParsonsChoice extends ItemChoice {
}

export interface ParsonsItem extends Item {
  indentation?: number;
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
}

export interface StringChoice extends Choice {
  caseInsensitive?: boolean;
}

export interface Video extends Media {
}

export interface EventBooking {
  id?: number;
  additionalInformation?: { [index: string]: string };
  eventId?: string;
  updateDate?: EpochTimeStamp;
  userId?: number;
  reservedById?: number;
  bookingStatus?: BookingStatus;
  creationDate?: EpochTimeStamp;
}

export interface EventBookings {
}

export interface PgEventBooking extends EventBooking {
}

export interface PgEventBookings extends EventBookings {
}

export interface AbstractSegueUser {
}

export interface AnonymousUser extends AbstractSegueUser {
  sessionId?: string;
  dateCreated?: EpochTimeStamp;
  lastUpdated?: EpochTimeStamp;
  _id?: string;
}

export interface FacebookTokenData {
  appId?: string;
  valid?: boolean;
  app_id?: string;
  is_valid?: boolean;
}

export interface FacebookTokenInfo {
  data?: FacebookTokenData;
}

export interface FacebookUser {
  id?: string;
  email?: string;
  gender?: string;
  link?: string;
  locale?: string;
  name?: string;
  timezone?: number;
  verified?: boolean;
  firstName?: string;
  lastName?: string;
  updatedTime?: string;
  first_name?: string;
  last_name?: string;
  updated_time?: string;
}

export interface LinkedAccount {
  id?: string;
  localUserId?: string;
  provider?: AuthenticationProvider;
  providerUserId?: string;
  providerId?: string;
}

export interface LocalUserCredential {
  userId?: number;
  password?: string;
  secureSalt?: string;
  securityScheme?: string;
  resetToken?: string;
  resetExpiry?: EpochTimeStamp;
  created?: EpochTimeStamp;
  lastUpdated?: EpochTimeStamp;
}

export interface RegisteredUser extends AbstractSegueUser {
  /**
   * @deprecated
   */
  _id?: number;
  givenName?: string;
  familyName?: string;
  email?: string;
  role?: Role;
  dateOfBirth?: EpochTimeStamp;
  gender?: Gender;
  registrationDate?: EpochTimeStamp;
  lastUpdated?: EpochTimeStamp;
  emailToVerify?: string;
  emailVerificationToken?: string;
  emailVerificationStatus?: EmailVerificationStatus;
  teacherPending?: boolean;
  schoolId?: string;
  schoolOther?: string;
  registeredContexts?: UserContext[];
  registeredContextsLastConfirmed?: EpochTimeStamp;
  lastSeen?: EpochTimeStamp;
  id?: number;
}

export interface School {
  urn?: string;
  name?: string;
  postcode?: string;
  closed?: boolean;
  dataSource?: SchoolDataSource;
}

export interface TOTPSharedSecret {
  userId?: number;
  sharedSecret?: string;
  created?: EpochTimeStamp;
  lastUpdated?: EpochTimeStamp;
}

export interface UserAuthenticationSettings extends AbstractSegueUser {
  linkedAccounts?: AuthenticationProvider[];
  hasSegueAccount?: boolean;
  mfaStatus?: boolean;
  id?: number;
}

export interface UserContext {
  stage?: Stage;
  examBoard?: ExamBoard;
}

export interface UserExternalAccountChanges {
  userId?: number;
  providerUserId?: string;
  accountEmail?: string;
  role?: Role;
  givenName?: string;
  deleted?: boolean;
  emailVerificationStatus?: EmailVerificationStatus;
  allowsNewsEmails?: boolean;
  allowsEventsEmails?: boolean;
}

export interface UserFromAuthProvider {
  providerUserId?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  dateOfBirth?: EpochTimeStamp;
  gender?: Gender;
  emailVerificationStatus?: EmailVerificationStatus;
}

export interface UserSettings {
  registeredUser?: RegisteredUser;
  userPreferences?: { [index: string]: { [index: string]: boolean } };
  registeredUserContexts?: UserContext[];
  passwordCurrent?: string;
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

export interface AutoCloseable {
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

export interface Connection extends Wrapper, AutoCloseable {
  readOnly?: boolean;
  transactionIsolation?: number;
  autoCommit?: boolean;
  schema?: string;
  metaData?: DatabaseMetaData;
  catalog?: string;
  warnings?: SQLWarning;
  typeMap?: { [index: string]: Class<any> };
  holdability?: number;
  clientInfo?: { [index: string]: any };
  closed?: boolean;
  networkTimeout?: number;
}

export interface DatabaseMetaData extends Wrapper {
  connection?: Connection;
  readOnly?: boolean;
  url?: string;
  resultSetHoldability?: number;
  databaseProductVersion?: string;
  identifierQuoteString?: string;
  maxBinaryLiteralLength?: number;
  maxCharLiteralLength?: number;
  maxProcedureNameLength?: number;
  maxCatalogNameLength?: number;
  defaultTransactionIsolation?: number;
  databaseMajorVersion?: number;
  databaseMinorVersion?: number;
  clientInfoProperties?: ResultSet;
  driverName?: string;
  sqlkeywords?: string;
  schemaTerm?: string;
  catalogTerm?: string;
  maxRowSize?: number;
  schemas?: ResultSet;
  catalogs?: ResultSet;
  tableTypes?: ResultSet;
  typeInfo?: ResultSet;
  userName?: string;
  databaseProductName?: string;
  driverVersion?: string;
  driverMajorVersion?: number;
  driverMinorVersion?: number;
  numericFunctions?: string;
  stringFunctions?: string;
  systemFunctions?: string;
  timeDateFunctions?: string;
  searchStringEscape?: string;
  extraNameCharacters?: string;
  procedureTerm?: string;
  catalogAtStart?: boolean;
  catalogSeparator?: string;
  maxColumnNameLength?: number;
  maxColumnsInGroupBy?: number;
  maxColumnsInIndex?: number;
  maxColumnsInOrderBy?: number;
  maxColumnsInSelect?: number;
  maxColumnsInTable?: number;
  maxConnections?: number;
  maxCursorNameLength?: number;
  maxIndexLength?: number;
  maxSchemaNameLength?: number;
  maxStatementLength?: number;
  maxStatements?: number;
  maxTableNameLength?: number;
  maxTablesInSelect?: number;
  maxUserNameLength?: number;
  jdbcmajorVersion?: number;
  jdbcminorVersion?: number;
  sqlstateType?: number;
  rowIdLifetime?: RowIdLifetime;
  maxLogicalLobSize?: number;
}

export interface SQLWarning extends SQLException {
  nextWarning?: SQLWarning;
}

export interface Class<T> extends Serializable, GenericDeclaration, Type, AnnotatedElement, OfField<Class<any>>, Constable {
}

export interface Wrapper {
}

export interface ResultSet extends Wrapper, AutoCloseable {
  type?: number;
  metaData?: ResultSetMetaData;
  warnings?: SQLWarning;
  holdability?: number;
  cursorName?: string;
  beforeFirst?: boolean;
  afterLast?: boolean;
  first?: boolean;
  fetchSize?: number;
  concurrency?: number;
  statement?: Statement;
  closed?: boolean;
  last?: boolean;
  row?: number;
  fetchDirection?: number;
}

export interface Throwable extends Serializable {
  cause?: Throwable;
  stackTrace?: StackTraceElement[];
  message?: string;
  suppressed?: Throwable[];
  localizedMessage?: string;
}

export interface StackTraceElement extends Serializable {
  classLoaderName?: string;
  moduleName?: string;
  moduleVersion?: string;
  methodName?: string;
  fileName?: string;
  lineNumber?: number;
  className?: string;
  nativeMethod?: boolean;
}

export interface SQLException extends Exception, Iterable<Throwable> {
  sqlstate?: string;
  errorCode?: number;
  nextException?: SQLException;
}

export interface Serializable {
}

export interface GenericDeclaration extends AnnotatedElement {
  typeParameters?: TypeVariable<any>[];
}

export interface Type {
  typeName?: string;
}

export interface AnnotatedElement {
  annotations?: Annotation[];
  declaredAnnotations?: Annotation[];
}

export interface Constable {
}

export interface ResultSetMetaData extends Wrapper {
  columnCount?: number;
}

export interface Statement extends Wrapper, AutoCloseable {
  connection?: Connection;
  resultSetConcurrency?: number;
  resultSetHoldability?: number;
  warnings?: SQLWarning;
  maxRows?: number;
  resultSet?: ResultSet;
  updateCount?: number;
  moreResults?: boolean;
  poolable?: boolean;
  fetchSize?: number;
  closed?: boolean;
  maxFieldSize?: number;
  queryTimeout?: number;
  resultSetType?: number;
  closeOnCompletion?: boolean;
  largeUpdateCount?: number;
  largeMaxRows?: number;
  fetchDirection?: number;
  generatedKeys?: ResultSet;
}

export interface Exception extends Throwable {
}

export interface TypeVariable<D> extends Type, AnnotatedElement {
  genericDeclaration?: D;
  annotatedBounds?: AnnotatedType[];
  name?: string;
  bounds?: Type[];
}

export interface Annotation {
}

export interface OfField<F> extends TypeDescriptor {
  array?: boolean;
  primitive?: boolean;
}

export interface Iterable<T> {
}

export interface AnnotatedType extends AnnotatedElement {
  annotatedOwnerType?: AnnotatedType;
  type?: Type;
}

export interface TypeDescriptor {
}

export type Difficulty = "practice_1" | "practice_2" | "practice_3" | "challenge_1" | "challenge_2" | "challenge_3";

export type EventStatus = "OPEN" | "FULLY_BOOKED" | "CANCELLED" | "CLOSED" | "WAITING_LIST_ONLY";

export type ExamBoard = "aqa" | "ocr" | "cie" | "edexcel" | "eduqas" | "wjec" | "all";

export type GameboardCreationMethod = "FILTER" | "BUILDER";

export type GroupMembershipStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type GroupStatus = "ACTIVE" | "DELETED";

export type Hub = "BIRMINGHAM_AND_CENTRAL_MIDLANDS" | "CAMBRIDGE_AND_NORTHAMPTONSHIRE" | "CHESHIRE" | "CORNWALL" | "CUMBRIA_SATELLITE" | "DARTFORD_AND_EAST_SUSSEX" | "DEVON" | "GLOUCESTERSHIRE_WILTSHIRE_AND_NORTH_SOMERSET" | "GREATER_MANCHESTER" | "LANCASHIRE_SATELLITE" | "LEICESTER_NOTTINGHAMSHIRE_AND_RUTLAND" | "LINCOLNSHIRE" | "LONDON_HERTFORDSHIRE_AND_ESSEX" | "LONDON_HERTFORDSHIRE_AND_HAMPSHIRE" | "LONDON_SURREY_AND_WEST_SUSSEX" | "MAIDSTONE_AND_KENT" | "MILTON_KEYNES_AND_NORTHAMPTONSHIRE" | "NEWCASTLE_DURHAM_AND_EAST_CUMBRIA" | "NORFOLK" | "NORTH_EAST_AND_NORTHUMBERLAND" | "NORTH_YORKSHIRE_LEEDS_AND_WAKEFIELD";

export type AlertEvents = "SEEN" | "CLICKED" | "DISMISSED";

export type NotificationStatus = "ACKNOWLEDGED" | "POSTPONED" | "DISABLED" | "DISMISSED";

export type QuizFeedbackMode = "NONE" | "OVERALL_MARK" | "SECTION_MARKS" | "DETAILED_FEEDBACK";

export type RoleRequirement = "logged_in" | "teacher";

export type Stage = "gcse" | "a_level" | "all";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "WAITING_LIST" | "ATTENDED" | "ABSENT" | "RESERVED";

export type EmailVerificationStatus = "VERIFIED" | "NOT_VERIFIED" | "DELIVERY_FAILED";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | "UNKNOWN";

export type Role = "STUDENT" | "TUTOR" | "TEACHER" | "EVENT_LEADER" | "CONTENT_EDITOR" | "EVENT_MANAGER" | "ADMIN";

export type SchoolDataSource = "GOVERNMENT_UK" | "GOVERNMENT_IE" | "GOVERNMENT_SCO" | "GOVERNMENT_WAL" | "GOVERNMENT_NI" | "USER_ENTERED";

export type Badge = "TEACHER_GROUPS_CREATED" | "TEACHER_ASSIGNMENTS_SET" | "TEACHER_GAMEBOARDS_CREATED" | "TEACHER_CPD_EVENTS_ATTENDED";

export type AuthenticationProvider = "GOOGLE" | "FACEBOOK" | "TWITTER" | "RAVEN" | "TEST" | "SEGUE" | "RASPBERRYPI";

export type RowIdLifetime = "ROWID_UNSUPPORTED" | "ROWID_VALID_OTHER" | "ROWID_VALID_SESSION" | "ROWID_VALID_TRANSACTION" | "ROWID_VALID_FOREVER";
