import React, {useCallback, useContext, useEffect, useState} from "react";
import {Button, Col, FormText, Input, Label, Row} from "reactstrap";

import {Content, ExternalReference, IsaacEventPage, IsaacQuiz, Location,} from "../../isaac-data-types";
import {useFixedRef} from "../../utils/hooks";
import {useKeyedList} from "../../utils/keyedListHook";

import {AudiencePresenter} from "./presenters/AudiencePresenter";
import {TagsPresenter} from "./presenters/TagsPresenter";
import {RelatedContentPresenter} from "./presenters/RelatedContentPresenter";
import {LinkedGameboardsPresenter} from "./presenters/LinkedGameboardsPresenter";
import {asMetaItems, checkWarning, MetaItemPresenter, MetaItemPresenterProps} from "./Metadata";

import styles from "./styles/metadata.module.css";
import {isDefined} from "../../utils/types";
import {AppContext} from "../../App";

const TITLE_MAX_LENGTH = 32;

export const MetaItems = asMetaItems({
    tags: ["Tags", {presenter: TagsPresenter}],
    id: ["ID", {
        hasWarning: (newValue, context) => {
            const id = newValue as string;
            if (!id.match(/^[a-z0-9_-]+$/)) {
                return "Please alter this ID, as it does not match our required style (ids can only contain alphanumerics, dashes and underscores)";
            }
            if (id && context.editor.isAlreadyPublished()) {
                return "Please make sure not to alter the id of content once it has been published";
            }
            if (!id.match(/^[a-z0-9]+([-_][a-z0-9]+)*$/)) {
                return "This ID doesn't seem to match our usual style.";
            }
        }
    }],
    title: ["Title", {
        hasWarning: (value) => {
            const title = value as string;
            if (title.length > TITLE_MAX_LENGTH) {
                return "This title is a little long, consider rephrasing 🙂";
            }
        }
    }],
    subtitle: ["Subtitle", {deleteIfEmpty: true}],
    author: "Author",
    appId: "App ID",
    appAccessKey: "Access Key",
    attribution: ["Attribution", {deleteIfEmpty: true}],
    permissions: ["Permissions", {deleteIfEmpty: true}],
    notes: ["Notes", {deleteIfEmpty: true}],
    supersededBy: ["Superseded By", {deleteIfEmpty: true}],
    level: ["Level", {type: "number", hasWarning: (value) => {
        const level = value as number; // Already parsed by virtue of type: "number"
        if (isNaN(level) || level < 1 || level > 6) {
            return "Level must be a number between 1 and 6."
        }
    }}],
    summary: "Summary",
    published: ["Published", {
        type: "checkbox",
        hasWarning: (value) => {
            const published = value as boolean;
            if (!published) {
                return "Please do not un-publish content once it has been published";
            }
        }
    }],
    altText: ["Alt text", {type: "textarea"}],
    audience: ["Audience", {presenter: AudiencePresenter}],
    deprecated: ["Deprecated", {presenter: Deprecated}],
    description: "Description",
    url: "URL",
    relatedContent: ["Related content", {presenter: RelatedContentPresenter}],
    hiddenFromStudentsAndTutors: ["Hidden from students/tutors", {presenter: HiddenFromStudentsAndTutors}],
    hiddenFromTeachers: ["Hidden from teachers", {presenter: HiddenFromTeachers}],
    linkedGameboards: ["Linked gameboards", {presenter: LinkedGameboardsPresenter}],

    // Events stuff
    emailEventDetails: ["Email Event Details", {type: "textarea"}],
    emailConfirmedBookingText: ["Email Confirmed Booking Text", {type: "textarea"}],
    emailWaitingListBookingText: ["Email Waiting List Booking Text", {type: "textarea"}],
    date: ["Start Date", {
        presenter: DateTimeInput,
        hasWarning: (value) => {
            if (!value) {
                return "Start Date must be populated";
            }
        },
        deleteIfEmpty: true,
    }],
    end_date: ["End Date", {
        presenter: DateTimeInput,
        hasWarning: (value) => {
            if (!value) {
                return "End Date must be populated";
            }
        },
        deleteIfEmpty: true,
    }],
    bookingDeadline: ["Booking Deadline", {presenter: DateTimeInput}],
    prepWorkDeadline: ["Prep-work Deadline", {presenter: DateTimeInput}],
    numberOfPlaces: ["Number of places", {type: "number"}],
    eventStatus: ["Status", {type: "select", options: {
        OPEN: "Open",
        CANCELLED: "Cancelled",
        CLOSED: "Closed",
        WAITING_LIST_ONLY: "Waiting List Only",
    }}],
    location: ["Location", {presenter: LocationMetaPresenter}],
    isaacGroupToken: "Isaac Group Token",
    reservations: ["Reservations", {presenter: ReservationsMetaPresenter}],
    preResources: ["Pre-Resources", {presenter: ResourcesMetaPresenter}],
    postResources: ["Post-Resources", {presenter: ResourcesMetaPresenter}],
});


function ReservationsMetaPresenter(props: MetaItemPresenterProps<IsaacEventPage>) {
    const limitId = `${props.id}-limit`
    return <Row className={styles.row}>
        <Col xs={1}>
            <Label for={props.id}>Enabled</Label>
        </Col>
        <Col xs={1}>
            <MetaItemPresenter {...props} prop="allowGroupReservations" name="Reservations Enabled" options={{type: "checkbox"}} />
        </Col>
        {props.doc.allowGroupReservations && <>
            <Col xs={3} className={styles.label}>
                <Label for={`${limitId}`}>Per-teacher Limit</Label>
            </Col>
            <Col xs={5} className={styles.groupReservationLimit}>
                <MetaItemPresenter {...props} id={limitId} prop="groupReservationLimit" name="Per-teacher Limit" options={{type: "number", defaultValue: 10}} />
            </Col>
        </>}
    </Row>;
}

const deprecatedTag = "nofilter";
function Deprecated({doc, update, ...rest}: MetaItemPresenterProps<Content>) {
    const onChange = (deprecated: boolean) => {
        const oldTags = doc.tags ?? [];
        let newTags = undefined;

        if (deprecated && !oldTags.includes(deprecatedTag)) {
            newTags = [...oldTags, deprecatedTag];
        } else if (!deprecated && oldTags.includes(deprecatedTag)) {
            newTags = oldTags.filter(tag => tag !== deprecatedTag);
        }

        update({
            ...doc,
            deprecated,
            tags: newTags ?? doc.tags,
        });
    };

    return <Input type="checkbox" {...rest} checked={!!doc.deprecated} onChange={(e) => onChange(e.target.checked)} />;
}


function HiddenFromStudentsAndTutors({doc, update, ...rest}: MetaItemPresenterProps<IsaacQuiz>) {
    const onChange = (hiddenFromStudentsAndTutors: boolean) => {
        let hiddenFromRoles = doc.hiddenFromRoles;
        if (!hiddenFromStudentsAndTutors) {
            hiddenFromRoles = []; // If they can see it, everyone can!
        } else {
            // Duplicate not visible into the hidden from roles
            hiddenFromRoles = [...new Set([...hiddenFromRoles ?? [], "STUDENT", "TUTOR"]).keys()];
        }
        update({
            ...doc,
            hiddenFromRoles,
        });
    };

    const currentlyHidden = doc.hiddenFromRoles?.includes("STUDENT") && doc.hiddenFromRoles?.includes("TUTOR");
    return <Input type="checkbox" {...rest} checked={currentlyHidden} onChange={(e) => onChange(e.target.checked)} />;
}

function DateTimeInput({doc, update, prop, options, ...rest}: MetaItemPresenterProps<IsaacEventPage>) {
    const dateProp = prop as keyof IsaacEventPage;
    const [warning, setWarning] = useState<string>();

    const context = useContext(AppContext);

    function padDigits(num: number) {
        return num.toString().padStart(2, '0');
    }

    function dateFilter(date: Date) {
        return (
            [date.getFullYear(), padDigits(date.getMonth() + 1), padDigits(date.getDate())].join('-') + ' ' +
            [padDigits(date.getHours()), padDigits(date.getMinutes())].join(':')
        );
    }

    const initialValue = doc[dateProp] ? dateFilter(new Date(doc[dateProp] as number)) : "";
    const [dateInput, setDateInput] = useState(initialValue);
    const [dateOutput, setDateOutput] = useState(initialValue);

    useEffect(() => {
        checkWarning(options, initialValue, setWarning, context);
    }, [options, initialValue]);

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        setDateInput(e.target.value);
        try {
            const d = Date.parse(e.target.value.replace(/-/g, "/"));
            checkWarning(options, d, setWarning, context);
            if (d) {
                setDateOutput(dateFilter(new Date(d)));
                update({...doc, [dateProp]: d});
            }
        } catch (err) {
            // We can ignore a failed parsing - probably intermediate state
        }
        if (options?.deleteIfEmpty && (!e.target.value || e.target.value.length === 0)) {
            setDateOutput("");
            update({...doc, [dateProp]: undefined});
        }
    }

    return <>
        <Row>
            <Col><Input type="text" invalid={isDefined(warning)} {...rest} onChange={onChange} value={dateInput} placeholder="YYYY-MM-DD HH:mm" /></Col>
            <Col>{dateOutput}</Col>
        </Row>
        {warning && <FormText className={"mb-1 mt-0"} color={"danger"}>{warning}</FormText>}
    </>;
}

function HiddenFromTeachers({doc, update, ...rest}: MetaItemPresenterProps<IsaacQuiz>) {
    const onChange = (hiddenFromTeachers: boolean) => {
        let hiddenFromRoles = doc.hiddenFromRoles;
        if (hiddenFromTeachers) {
            hiddenFromRoles = [...new Set([...hiddenFromRoles ?? [], "TEACHER", "TUTOR", "STUDENT"]).keys()];
        } else {
            hiddenFromRoles = hiddenFromRoles?.filter((role) => role !== "TEACHER");
        }
        update({
            ...doc,
            hiddenFromRoles,
        });
    };

    return <Input {...rest} type="checkbox" checked={!!doc.hiddenFromRoles?.includes("TEACHER")} onChange={(e) => onChange(e.target.checked)} />;
}

function LocationMetaPresenter({doc, update, prop, id}: MetaItemPresenterProps) {
    const docRef = useFixedRef(doc);
    const location = doc[prop as keyof Content] as Location ?? {};

    const locationUpdate = useCallback((location: Content) => {
        update({
            ...docRef.current,
            [prop]: location,
        })
    }, [docRef, prop, update]);
    const locationProps = {doc: location as Content, update: locationUpdate};

    const address = location.address ?? {};
    const addressUpdate = useCallback((address: Content) => {
        update({
            ...docRef.current,
            [prop]: {
                ...docRef.current[prop as keyof Content] as Location,
                address,
            },
        })
    }, [docRef, prop, update]);
    const addressProps = {doc: address as Content, update: addressUpdate};

    return <>
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
    </>;
}

function ResourcesMetaPresenter({doc, update, prop, name}: MetaItemPresenterProps) {
    const docRef = useFixedRef(doc);

    const deriveNewList: () => [Content, ExternalReference[]] = useCallback(() => {
        const newList = [...(docRef.current[prop as keyof Content] as ExternalReference[] ?? [])];
        const newDoc = {
            ...docRef.current,
            [prop]: newList,
        };
        return [newDoc, newList];
    }, [docRef, prop]);
    const {insert, keyList, updateChild, shiftBy, remove} = useKeyedList(doc[prop as keyof Content] as ExternalReference[], deriveNewList, update);

    const resources = doc[prop as keyof Content] as ExternalReference[] | undefined;

    return <>
        <Row>
            <Col xs={5}>
                Title
            </Col>
            <Col xs={5}>
                URL
            </Col>
        </Row>
        {resources?.map((resource, index) => {
            const updateResource = (newContent: ExternalReference) => updateChild(index, newContent);
            return <Row key={keyList[index]}>
                <Col xs={5}>
                    <MetaItemPresenter doc={resource}
                                       update={updateResource}
                                       prop="title" name="Title"/>
                </Col>
                <Col xs={5}>
                    <MetaItemPresenter doc={resource}
                                       update={updateResource}
                                       prop="url" name="URL"/>
                </Col>
                <Col xs={2}>
                    <Button color="link" size="sm" onClick={() => shiftBy(index, -1)} disabled={index <= 0}>▲</Button>
                    <Button color="link" size="sm" onClick={() => shiftBy(index, 1)} disabled={index >= resources.length - 1}>▼</Button>
                    <Button color="link" size="sm" onClick={() => remove(index)}>❌</Button>
                </Col>
            </Row>;
        })}
        <Button onClick={() => insert(resources?.length ?? 0, {title:"Event brochure", url:"somewhere/interesting.pdf"})}>
            Add {name.substring(0, name.length - 1)}
        </Button>
    </>;
}
