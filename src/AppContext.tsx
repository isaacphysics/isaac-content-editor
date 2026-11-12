import {createContext, MutableRefObject} from "react";
import {NavigateFunction} from "react-router";
import {defaultGithubContext} from "./services/github";
import {defaultSelectedContext} from "./components/FileBrowser";
import {defaultEditorState} from "./components/SemanticEditor";
import {defaultDispatch} from "./services/commands";
import {MenuModalRef} from "./screens/MenuModal";
import {defaultPreview} from "./components/Preview";
import {defaultCdn} from "./components/CDNUploadModal";
import { FileNameResult } from "./screens/FileNameModal";

export const AppContext = createContext({
    selection: defaultSelectedContext,
    editor: defaultEditorState,
    github: defaultGithubContext,
    dispatch: defaultDispatch,
    navigate: (() => {
        throw new Error("Can't navigate outside of AppContext");
    }) as NavigateFunction,
    menuModal: {current: null} as MutableRefObject<MenuModalRef | null>,
    showFileNameModal: async (_: string, __: string) => null as FileNameResult | null,
    showPartTitleModal: () => {},
    setActionRunning: (_: boolean) => {},
    preview: defaultPreview,
    cdn: defaultCdn,
});
