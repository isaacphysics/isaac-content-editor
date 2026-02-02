import {Content} from "../../../isaac-data-types";
import {KeysWithValsOfType} from "../../../utils/types";
import {PresenterProps} from "../registry";
import React, {useEffect, useState} from "react";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";

export interface DropdownOptionsProps {
    disabled?: boolean;
}

// FIXME the types aren't *quite* right...
export const EnumPropFor = <
    D extends Content,
    K extends KeysWithValsOfType<D, string | undefined> = KeysWithValsOfType<D, string | undefined>,
>(prop: K, options: {[key in string]: string | undefined}) => {
    return function EnumProp({doc, update, dropdownOptions}: PresenterProps<D> & {dropdownOptions?: DropdownOptionsProps}) {
        const [isOpen, setOpen] = useState(false);
        const current = options[doc[prop] as unknown as keyof typeof options];
        const disabled = !!(dropdownOptions?.disabled as boolean | undefined);

        useEffect(() => {
            update(doc);
        }, []);

        return <Dropdown toggle={() => setOpen(toggle => !toggle)} isOpen={isOpen} disabled={disabled}>
            <DropdownToggle caret>
                {current ?? "-"}
            </DropdownToggle>
            <DropdownMenu>
                {Object.entries(options).map(([key, option]) => {
                    return <DropdownItem key={key} active={current === option} onClick={() => {
                        if (current !== option) {
                            update({
                                ...doc,
                                [prop]: key,
                            });
                        }
                    }}>
                        {option}
                    </DropdownItem>;
                })}
            </DropdownMenu>
        </Dropdown>;
    };
};
