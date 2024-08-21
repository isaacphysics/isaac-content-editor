import { Content } from "../isaac-data-types";
import { ContentType } from "../components/semantic/registry";

type Document = Content & { type: ContentType };
const emptyDocuments: Document[] = [
  {
    type: "isaacWildcard",
    title: "_Enter title here_",
    url: "_Enter url here_",
    description: "_Enter description here_",
  } as Document,
  {
    type: "isaacQuestionPage",
    encoding: "markdown",
    title: "New Question Page",
    level: 0,
    children: [
      {
        type: "content",
        encoding: "markdown",
        value: "Add page content here",
      },
    ],
  } as Document,
  {
    type: "isaacConceptPage",
    encoding: "markdown",
    title: "New Page",
    children: [
      {
        type: "content",
        encoding: "markdown",
        value: "Add page content here",
      },
    ],
  } as Document,
  {
    type: "isaacTopicSummaryPage",
    encoding: "markdown",
    title: "New Topic Summary",
    relatedContent: ["__\uD83D\uDE42_DELETE_ME_AND_REPLACE_WITH_IDS_\uD83D\uDE42__"],
    linkedGameboards: [],
    children: [
      {
        type: "content",
        encoding: "markdown",
        value: "This is a summary of a topic. You should write something sensible here!",
      },
    ],
  } as Document,
  {
    type: "isaacQuiz",
    encoding: "markdown",
    title: "New Test",
    visibleToStudents: false,
    published: false,
    rubric: {
      type: "content",
      encoding: "markdown",
      children: [
        {
          type: "content",
          value: "_Enter rubric here or remove this section if not wanted_",
          encoding: "markdown",
        },
      ],
    },
    children: [],
  } as Document,
  {
    type: "page",
    encoding: "markdown",
    title: "New General Page",
    children: [
      {
        type: "content",
        encoding: "markdown",
        value: "Add page content here",
      },
    ],
  } as Document,
  {
    layout: "1-col",
    title: "Event Title Here",
    subtitle: "Some subtitle",
    tags: ["student"],
    author: "",
    eventThumbnail: {
      src: "../../images/student.jpg",
      type: "image",
      altText: "",
      id: "eventThumbnail",
    },
    date: 1722470400000,
    numberOfPlaces: 20,
    eventStatus: "CLOSED",
    preResources: [],
    postResources: [],
    emailEventDetails: "Check the online events page for additional details.",
    emailConfirmedBookingText: "",
    emailWaitingListBookingText: "",
    encoding: "markdown",
    type: "isaacEventPage",
    children: [
      {
        type: "content",
        value: "Some details about the event here . . .",
        encoding: "markdown",
      },
    ],
    location: {
      address: {
        addressLine1: "",
        addressLine2: "",
        town: "",
        county: "",
        postalCode: "",
      },
    },
    published: false,
    privateEvent: false,
  } as Document,
  {
    type: "emailTemplate",
    encoding: "markdown",
    title: "",
    subject: "",
    plainTextContent: "Your plain text template here.",
    htmlContent: "Your HTML template here.",
  } as Document,
  {
    type: "isaacPod",
    tags: [],
    encoding: "markdown",
    title: "",
    value: "",
    url: "",
    image: {
      src: "",
      type: "image",
      altText: "",
    },
  } as Document,
  {
    type: "isaacCard",
    tags: [],
    encoding: "markdown",
    title: "",
    subtitle: "",
    image: {
      src: "",
      type: "image",
      altText: "",
    },
    clickUrl: "",
    verticalContent: false,
    disabled: false,
  } as Document,
  {
    type: "isaacCardDeck",
    tags: [],
    encoding: "markdown",
    title: "",
    subtitle: "",
    cards: [],
  } as Document,
];

export const EMPTY_DOCUMENTS: Partial<Record<ContentType, Content>> = Object.fromEntries(
  emptyDocuments.map((document) => {
    return [document.type as ContentType, document];
  }),
);
