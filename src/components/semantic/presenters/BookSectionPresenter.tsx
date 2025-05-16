import React, { useState } from "react";
import { BookSection, Content } from "../../../isaac-data-types";
import { EditableDocPropFor, EditableTitleProp } from "../props/EditableDocProp";
import { PresenterProps } from "../registry";
import Select, { components } from "react-select";
import useSWR from "swr";
import styles from "../styles/editable.module.css";
import { stagingFetcher } from "../../../services/isaacApi";
import classNames from "classnames";

const EditableLabelProp = EditableDocPropFor<BookSection>("label", {block: true, placeHolder: "Section label"});

export const BookSectionPresenter = (props: PresenterProps<BookSection>) => {
    const {doc, update} = props;

    const [searchString, setSearchString] = useState<string>("");

    const {data: bookDetailPages} = useSWR<{results: Content[]}>(
        searchString !== "" ? "search?query=" + encodeURIComponent(searchString) + "&types=isaacBookDetailPage" : null,
        stagingFetcher,
    );

    const bookDetailPageOptions = bookDetailPages?.results.map(
        page => {
            return {
                value: page.id,
                title: page.title,
                id: page.id,
                label: `${page.title} ${page.id}`, // this is used for searching; the display is overridden in the Option component
            };
        }
    ) ?? [];

    return <>
        <div className="d-flex">
            <EditableLabelProp {...props} />
            : &nbsp;
            <EditableTitleProp {...props} placeHolder="Section title" />
        </div>
        <details className="mb-2">
            <summary className="mb-2">
                Book page ID:
                <span className={classNames(styles.startEdit, "ml-2")}>{doc.bookPageId}</span>
            </summary>
            <Select
                onChange={e => {
                    const selectedValue = e ? e.value : undefined;
                    update({
                        ...doc,
                        bookPageId: selectedValue,
                    });
                }}
                onInputChange={e => {
                    setSearchString(e);
                }}
                options={bookDetailPageOptions}
                placeholder={"Search for a book section..."}
                menuPortalTarget={document.body}
                styles={{menuPortal: (base) => ({...base, zIndex: 10})}}
                isClearable
                components={{
                    SingleValue: (props: any) => {
                        return <components.SingleValue {...props}>
                            <div>
                                {props.data.title}
                            </div>
                        </components.SingleValue>
                    },
                    Option: (props: any) => {
                        const title = props?.data?.title;
                        const id = props?.data?.id;
                        return <components.Option {...props}>
                            <div>
                                {id ? (<> 
                                    {title}
                                    <span className="ml-2" style={{fontSize: "0.8em", color: "#888"}}>
                                        ({id})
                                    </span>
                                </>) : title
                                }
                            </div>
                        </components.Option>
                    }
                }}
            />
        </details>
    </>;
}
