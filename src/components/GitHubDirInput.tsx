import React, {useContext, useMemo, useState} from "react";
import {contentsPath, GitHubRepository} from "../services/github";
import {components, GroupBase, InputActionMeta, SingleValue} from "react-select";
import {AppContext} from "../App";
import useSWR from "swr";
import CreatableSelect from "react-select/creatable";

interface GitHubOption {
    type: "dir" | "file",
    label: string;
    value: string;
}
const AlwaysVisibleInput = (props: any) => <components.Input {...props} isHidden={false} />;

interface GitHubDirInputProps {
    repo: GitHubRepository;
    className: string;
    dir: string | undefined;
    setDir: (newDir: string | undefined) => void;
    invalid?: boolean;
}
export const GitHubDirInput = ({repo, className, dir, setDir, invalid}: GitHubDirInputProps) => {

    // Hacking react-select to do sensible things reading list:
    //  - https://github.com/JedWatson/react-select/issues/1558#issuecomment-738880505
    //  - https://github.com/JedWatson/react-select/discussions/4302
    //  - https://stackoverflow.com/questions/51951379/how-do-i-implement-field-validation-for-react-select

    const appContext = useContext(AppContext);
    const [pathOption, setPathOption] = useState<GitHubOption | null>();
    const searchablePathPart = dir ? dir.split("/").length === 0 ? dir : dir.split("/").slice(0, -1).join("/") : "";

    const {data, isValidating, isLoading, error} = useSWR(contentsPath(searchablePathPart ?? "", appContext.github.branch, repo));

    const pathOptions: GroupBase<GitHubOption>[] = useMemo(() => {
        return (error || !data) ? [] : [{
            options: data?.type === "file" ? {value: data.path, label: data.path, isDisabled: true} : data?.map((d: any) => ({value: d.path, label: d.path, isDisabled: d.type === "file"})) ?? [],
            label: "Existing directories"
        }];
    }, [error, data]);

    const formatCreateLabel = (path: string) => `Create directory "${path.replace(/\/$/, "")}"`;

    const onInputChange = (inputValue: string, { action }: InputActionMeta) => {
        // onBlur => setInputValue to last selected value
        if (action === "input-blur") {
            setDir(pathOption ? pathOption.value : "");
        }
        // onInputChange => update inputValue
        else if (action === "input-change") {
            setDir(inputValue);
        }
    };

    const onChange = (option: SingleValue<GitHubOption>) => {
        setPathOption(option);
        setDir(option ? option.value.replace(/\/$/, "") : "");
    };

    const getBasePath = (path: string) => {
        return path.replace(/\/[^/]*$/, "");
    };

    return <CreatableSelect
        className={className}
        isLoading={isLoading || isValidating}
        value={pathOption}
        tabSelectsValue
        onChange={onChange}
        inputValue={dir}
        isClearable
        onInputChange={onInputChange}
        controlShouldRenderValue={false}
        components={{
            Input: AlwaysVisibleInput
        }}
        isValidNewOption={(path, value, options ) => {
            if (path === "") return false;
            if (path.match(/^[a-zA-Z0-9_\-/]+$/) === null) return false;
            const pathToSearch = path.replace(/\/$/, "");
            return !options.find(o => "value" in o ? [o.value, getBasePath(o.value)].includes(pathToSearch) : o.options.find(_o => [_o.value, getBasePath(_o.value)].includes(pathToSearch)));
        }}
        styles={{
            control: (base) => ({
                ...base,
                // state.isFocused can display different borderColor if you need it
                borderColor: !invalid ? '#ddd' : 'red',
                // overwrittes hover style
                '&:hover': {
                    borderColor: !invalid ? '#ddd' : 'red'
                }
            })
        }}
        options={pathOptions}
        placeholder={"Choose a directory..."}
        createOptionPosition={"first"}
        formatCreateLabel={formatCreateLabel}
    />;
};
