import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button, Col, FormText, Input, Label, Row } from "reactstrap";

import { Content, ExternalReference, Hub, IsaacEventPage, IsaacQuiz, Location } from "../../isaac-data-types";
import { useFixedRef } from "../../utils/hooks";
import { useKeyedList } from "../../utils/keyedListHook";

import { AudiencePresenter } from "./presenters/AudiencePresenter";
import { TagsPresenter } from "./presenters/TagsPresenter";
import { RelatedContentPresenter } from "./presenters/RelatedContentPresenter";
import { LinkedGameboardsPresenter } from "./presenters/LinkedGameboardsPresenter";
import { asMetaItems, checkWarning, MetaItemPresenter, MetaItemPresenterProps } from "./Metadata";

import styles from "./styles/metadata.module.css";
import { isDefined } from "../../utils/types";
import { AppContext } from "../../App";

const TITLE_MAX_LENGTH = 32;

const hubOptions: { [key in Hub]: string } = {
  BIRMINGHAM_AND_CENTRAL_MIDLANDS: "Birmingham and Central Midlands",
  CAMBRIDGE_AND_NORTHAMPTONSHIRE: "Cambridge and Northamptonshire",
  CHESHIRE: "Cheshire",
  CORNWALL: "Cornwall",
  CUMBRIA_SATELLITE: "Cumbria Satellite",
  DARTFORD_AND_EAST_SUSSEX: "Dartford and East Sussex",
  DEVON: "Devon",
  GLOUCESTERSHIRE_WILTSHIRE_AND_NORTH_SOMERSET: "Gloucestershire, Wiltshire, and North Somerset",
  GREATER_MANCHESTER: "Greater Manchester",
  LANCASHIRE_SATELLITE: "Lancashire Satellite",
  LEICESTER_NOTTINGHAMSHIRE_AND_RUTLAND: "Leicester, Nottinghamshire, and Rutland",
  LINCOLNSHIRE: "Lincolnshire",
  LONDON_HERTFORDSHIRE_AND_ESSEX: "London, Hertfordshire, and Essex",
  LONDON_HERTFORDSHIRE_AND_HAMPSHIRE: "London, Hertfordshire, and Hampshire",
  LONDON_SURREY_AND_WEST_SUSSEX: "London, Surrey, and West Sussex",
  MAIDSTONE_AND_KENT: "Maidstone and Kent",
  MILTON_KEYNES_AND_NORTHAMPTONSHIRE: "Milton Keynes and Northamptonshire",
  NEWCASTLE_DURHAM_AND_EAST_CUMBRIA: "Newcastle, Durham, and East Cumbria",
  NORFOLK: "Norfolk",
  NORTH_EAST_AND_NORTHUMBERLAND: "North East and Northumberland",
  NORTH_YORKSHIRE_LEEDS_AND_WAKEFIELD: "North Yorkshire, Leeds, and Wakefield",
  OXFORDSHIRE_BUCKINGHAMSHIRE_AND_WEST_BERKSHIRE: "Oxfordshire, Buckinghamshire, and West Berkshire",
  SOMERSET: "Somerset",
  STOKE_ON_TRENT_STAFFORDSHIRE_AND_DERBYSHIRE: "Stoke-on-Trent, Staffordshire, and Derbyshire",
  SUFFOLK: "Suffolk",
  TEES_VALLEY_AND_RICHMONDSHIRE: "Tees Valley and Richmondshire",
  WARRINGTON_AND_MERSEYSIDE: "Warrington and Merseyside",
  WEST_MIDLANDS_SATELLITE: "West Midlands Satellite",
  WEST_SUSSEX_AND_HAMPSHIRE: "West Sussex and Hampshire",
  WEST_YORKSHIRE: "West Yorkshire",
  YORK_EAST_AND_SOUTH_YORKSHIRE: "York, East, and South Yorkshire",
};

export const MetaItems = asMetaItems({
  tags: ["Tags", { presenter: TagsPresenter }],
  id: [
    "ID",
    {
      hasWarning: (newValue, context) => {
        const id = newValue as string;
        if (!id.match(/^[a-z0-9_-]+$/)) {
          return "Please alter this ID, as it does not match our required style (ids can only contain alphanumerics, dashes and underscores)";
        }
        if (id && context.editor.isAlreadyPublished()) {
          return "Please make sure not to alter the id of content once it has been published";
        }
      },
    },
  ],
  title: [
    "Title",
    {
      hasWarning: (value) => {
        const title = value as string;
        if (title.length > TITLE_MAX_LENGTH) {
          return "This title is a little long, consider rephrasing 🙂";
        }
      },
    },
  ],
  subtitle: ["Subtitle", { deleteIfEmpty: true }],
  author: "Author",
  appId: "App ID",
  appAccessKey: "Access Key",
  attribution: ["Attribution", { deleteIfEmpty: true }],
  supersededBy: ["Superseded By", { deleteIfEmpty: true }],
  level: [
    "Level",
    {
      type: "number",
      hasWarning: (value) => {
        const level = value as number; // Already parsed by virtue of type: "number"
        if (isNaN(level) || level < 1 || level > 6) {
          return "Level must be a number between 1 and 6.";
        }
      },
    },
  ],
  summary: "Summary",
  publicationDate: ["Publication Date", { presenter: DateTimeInput }],
  published: [
    "Published",
    {
      type: "checkbox",
      hasWarning: (value) => {
        const published = value as boolean;
        if (!published) {
          return "Please do not un-publish content once it has been published";
        }
      },
    },
  ],
  altText: ["Alt text", { type: "textarea" }],
  audience: ["Audience", { presenter: AudiencePresenter }],
  deprecated: ["Deprecated", { presenter: Deprecated }],
  description: "Description",
  url: "URL",
  relatedContent: ["Related content", { presenter: RelatedContentPresenter }],
  visibleToStudents: ["Visible to students", { presenter: VisibleToStudents }],
  hiddenFromTeachers: ["Hidden from teachers", { presenter: HiddenFromTeachers }],
  linkedGameboards: ["Linked gameboards", { presenter: LinkedGameboardsPresenter }],

  // Events stuff
  privateEvent: ["Private Event", { type: "checkbox" }],
  competitionEvent: ["Competition Event", { type: "checkbox" }],
  hub: [
    "Hub",
    {
      type: "select",
      options: { "": "N/A", ...hubOptions },
      deleteIfEmpty: true,
    },
  ],
  meetingUrl: "Meeting URL",
  emailEventDetails: ["Email Event Details", { type: "textarea" }],
  emailConfirmedBookingText: ["Email Confirmed Booking Text", { type: "textarea" }],
  emailWaitingListBookingText: ["Email Waiting List Booking Text", { type: "textarea" }],
  date: [
    "Start Date",
    {
      presenter: DateTimeInput,
      hasWarning: (value) => {
        if (!value) {
          return "Start Date must be populated";
        }
      },
      deleteIfEmpty: true,
    },
  ],
  end_date: [
    "End Date",
    {
      presenter: DateTimeInput,
      hasWarning: (value) => {
        if (!value) {
          return "End Date must be populated";
        }
      },
      deleteIfEmpty: true,
    },
  ],
  bookingDeadline: ["Booking Deadline", { presenter: DateTimeInput }],
  prepWorkDeadline: ["Prep-work Deadline", { presenter: DateTimeInput }],
  numberOfPlaces: ["Number of places", { type: "number" }],
  eventStatus: [
    "Status",
    {
      type: "select",
      options: {
        OPEN: "Open",
        CANCELLED: "Cancelled",
        CLOSED: "Closed",
        WAITING_LIST_ONLY: "Waiting List Only",
      },
    },
  ],
  location: ["Location", { presenter: LocationMetaPresenter }],
  isaacGroupToken: "Isaac Group Token",
  reservations: ["Reservations", { presenter: ReservationsMetaPresenter }],
  preResources: ["Pre-Resources", { presenter: ResourcesMetaPresenter }],
  postResources: ["Post-Resources", { presenter: ResourcesMetaPresenter }],
  eventSurvey: "Event Survey URL",
});

function ReservationsMetaPresenter(props: MetaItemPresenterProps<IsaacEventPage>) {
  const limitId = `${props.id}-limit`;
  return (
    <Row className={styles.row}>
      <Col xs={1}>
        <Label for={props.id}>Enabled</Label>
      </Col>
      <Col xs={1}>
        <MetaItemPresenter
          {...props}
          prop="allowGroupReservations"
          name="Reservations Enabled"
          options={{ type: "checkbox" }}
        />
      </Col>
      {props.doc.allowGroupReservations && (
        <>
          <Col xs={3} className={styles.label}>
            <Label for={`${limitId}`}>Per-teacher Limit</Label>
          </Col>
          <Col xs={5} className={styles.groupReservationLimit}>
            <MetaItemPresenter
              {...props}
              id={limitId}
              prop="groupReservationLimit"
              name="Per-teacher Limit"
              options={{ type: "number", defaultValue: 10 }}
            />
          </Col>
        </>
      )}
    </Row>
  );
}

const deprecatedTag = "nofilter";
function Deprecated({ doc, update, ...rest }: MetaItemPresenterProps<Content>) {
  const onChange = (deprecated: boolean) => {
    const oldTags = doc.tags ?? [];
    let newTags = undefined;

    if (deprecated && !oldTags.includes(deprecatedTag)) {
      newTags = [...oldTags, deprecatedTag];
    } else if (!deprecated && oldTags.includes(deprecatedTag)) {
      newTags = oldTags.filter((tag) => tag !== deprecatedTag);
    }

    update({
      ...doc,
      deprecated,
      tags: newTags ?? doc.tags,
    });
  };

  return <Input type="checkbox" {...rest} checked={!!doc.deprecated} onChange={(e) => onChange(e.target.checked)} />;
}

function VisibleToStudents({ doc, update, ...rest }: MetaItemPresenterProps<IsaacQuiz>) {
  const onChange = (visibleToStudents: boolean) => {
    let hiddenFromRoles = doc.hiddenFromRoles;
    if (visibleToStudents) {
      hiddenFromRoles = []; // If students can see it, everyone can see it
    } else {
      // Duplicate not visible into the hidden from roles
      hiddenFromRoles = [...new Set([...(hiddenFromRoles ?? []), "STUDENT"]).keys()];
    }
    update({
      ...doc,
      visibleToStudents,
      hiddenFromRoles,
    });
  };

  return (
    <Input type="checkbox" {...rest} checked={!!doc.visibleToStudents} onChange={(e) => onChange(e.target.checked)} />
  );
}

function DateTimeInput({ doc, update, prop, options, ...rest }: MetaItemPresenterProps<IsaacEventPage>) {
  const dateProp = prop as keyof IsaacEventPage;
  const [warning, setWarning] = useState<string>();

  const context = useContext(AppContext);

  function padDigits(num: number) {
    return num.toString().padStart(2, "0");
  }

  function dateFilter(date: Date) {
    return (
      [date.getFullYear(), padDigits(date.getMonth() + 1), padDigits(date.getDate())].join("-") +
      " " +
      [padDigits(date.getHours()), padDigits(date.getMinutes())].join(":")
    );
  }

  const initialValue = doc[dateProp] ? dateFilter(new Date(doc[dateProp] as number)) : "";
  const [dateInput, setDateInput] = useState(initialValue);
  const [dateOutput, setDateOutput] = useState(initialValue);

  useEffect(() => {
    checkWarning(options, initialValue, setWarning, context);
  }, [options, initialValue, context]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDateInput(e.target.value);
    try {
      const d = Date.parse(e.target.value.replace(/-/g, "/"));
      checkWarning(options, d, setWarning, context);
      if (d) {
        setDateOutput(dateFilter(new Date(d)));
        update({ ...doc, [dateProp]: d });
      }
    } catch (err) {
      // We can ignore a failed parsing - probably intermediate state
    }
    if (options?.deleteIfEmpty && (!e.target.value || e.target.value.length === 0)) {
      setDateOutput("");
      update({ ...doc, [dateProp]: undefined });
    }
  }

  return (
    <>
      <Row>
        <Col>
          <Input
            type="text"
            invalid={isDefined(warning)}
            {...rest}
            onChange={onChange}
            value={dateInput}
            placeholder="YYYY-MM-DD HH:mm"
          />
        </Col>
        <Col>{dateOutput}</Col>
      </Row>
      {warning && (
        <FormText className={"mb-1 mt-0"} color={"danger"}>
          {warning}
        </FormText>
      )}
    </>
  );
}

function HiddenFromTeachers({ doc, update, ...rest }: MetaItemPresenterProps<IsaacQuiz>) {
  const onChange = (hiddenFromTeachers: boolean) => {
    let visibleToStudents = doc.visibleToStudents;
    let hiddenFromRoles = doc.hiddenFromRoles;
    if (hiddenFromTeachers) {
      hiddenFromRoles = [...new Set([...(hiddenFromRoles ?? []), "TEACHER", "STUDENT"]).keys()];
      visibleToStudents = false; // If teachers can't see it, neither can students
    } else {
      hiddenFromRoles = hiddenFromRoles?.filter((role) => role !== "TEACHER");
    }
    update({
      ...doc,
      visibleToStudents,
      hiddenFromRoles,
    });
  };

  return (
    <Input
      {...rest}
      type="checkbox"
      checked={!!doc.hiddenFromRoles?.includes("TEACHER")}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

function LocationMetaPresenter({ doc, update, prop, id }: MetaItemPresenterProps) {
  const docRef = useFixedRef(doc);
  const location = (doc[prop as keyof Content] as Location) ?? {};

  const locationUpdate = useCallback(
    (location: Content) => {
      update({
        ...docRef.current,
        [prop]: location,
      });
    },
    [docRef, prop, update],
  );
  const locationProps = { doc: location as Content, update: locationUpdate };

  const address = location.address ?? {};
  const addressUpdate = useCallback(
    (address: Content) => {
      update({
        ...docRef.current,
        [prop]: {
          ...(docRef.current[prop as keyof Content] as Location),
          address,
        },
      });
    },
    [docRef, prop, update],
  );
  const addressProps = { doc: address as Content, update: addressUpdate };

  return (
    <>
      <MetaItemPresenter {...addressProps} id={id} prop="addressLine1" name="Address Line 1" />
      <MetaItemPresenter {...addressProps} prop="addressLine2" name="Address Line 2" />
      <MetaItemPresenter {...addressProps} prop="town" name="Town" />
      <MetaItemPresenter {...addressProps} prop="county" name="County" />
      <MetaItemPresenter {...addressProps} prop="postalCode" name="Postal Code" />
      <MetaItemPresenter {...addressProps} prop="country" name="Country" />
      <Row>
        <Col xs={5}>
          <Label>
            Longitude
            <MetaItemPresenter {...locationProps} prop="longitude" name="Longitude" />
          </Label>
        </Col>
        <Col xs={5}>
          <Label>
            Latitude
            <MetaItemPresenter {...locationProps} prop="latitude" name="Latitude" />
          </Label>
        </Col>
      </Row>
    </>
  );
}

function ResourcesMetaPresenter({ doc, update, prop, name }: MetaItemPresenterProps) {
  const docRef = useFixedRef(doc);

  const deriveNewList: () => [Content, ExternalReference[]] = useCallback(() => {
    const newList = [...((docRef.current[prop as keyof Content] as ExternalReference[]) ?? [])];
    const newDoc = {
      ...docRef.current,
      [prop]: newList,
    };
    return [newDoc, newList];
  }, [docRef, prop]);
  const { insert, keyList, updateChild, shiftBy, remove } = useKeyedList(
    doc[prop as keyof Content] as ExternalReference[],
    deriveNewList,
    update,
  );

  const resources = doc[prop as keyof Content] as ExternalReference[] | undefined;

  return (
    <>
      <Row>
        <Col xs={5}>Title</Col>
        <Col xs={5}>URL</Col>
      </Row>
      {resources?.map((resource, index) => {
        const updateResource = (newContent: ExternalReference) => updateChild(index, newContent);
        return (
          <Row key={keyList[index]}>
            <Col xs={5}>
              <MetaItemPresenter doc={resource} update={updateResource} prop="title" name="Title" />
            </Col>
            <Col xs={5}>
              <MetaItemPresenter doc={resource} update={updateResource} prop="url" name="URL" />
            </Col>
            <Col xs={2}>
              <Button color="link" size="sm" onClick={() => shiftBy(index, -1)} disabled={index <= 0}>
                ▲
              </Button>
              <Button color="link" size="sm" onClick={() => shiftBy(index, 1)} disabled={index >= resources.length - 1}>
                ▼
              </Button>
              <Button color="link" size="sm" onClick={() => remove(index)}>
                ❌
              </Button>
            </Col>
          </Row>
        );
      })}
      <Button
        onClick={() => insert(resources?.length ?? 0, { title: "Event brochure", url: "somewhere/interesting.pdf" })}
      >
        Add {name.substring(0, name.length)}
      </Button>
    </>
  );
}
