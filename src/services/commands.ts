import { ContextType } from "react";

import { AppContext } from "../App";
import { dirname, generateGuid } from "../utils/strings";
import { ContentType } from "../components/semantic/registry";
import { Content } from "../isaac-data-types";

import { githubSave, githubCreate, githubDelete, githubRename } from "./github";
import { EMPTY_DOCUMENTS } from "./emptyDocuments";

export const defaultDispatch: (action: Action) => void = () => {
    throw new Error("dispatch called from outside AppContext");
};

export type Action =
    | {type: "openInNewTab"; path: string}
    | {type: "new"; path: string}
    | {type: "delete"; path: string; name: string; sha: string}
    | {type: "rename"; path: string; name: string}
    | {type: "saveAs"; path: string; name: string}
    | {type: "save"}
;

type ActionFor<K> = Action & {type: K};

async function doNew(context: ContextType<typeof AppContext>, action: ActionFor<"new">) {
    let newName = window.prompt("Please type a name for the new file. If no extension is provided, '.json' will be assumed", "untitled");

    if (newName) {
        if (newName.indexOf(".") === -1) {
            newName += ".json";
        }
        const name = newName as string;
        const path = action.path;

        const doCreate = async (initialContent: string) => {
            try {
                const [_, shouldRefresh] = await githubCreate(context, action.path, name, initialContent);
                context.selection.setSelection({path: `${path}/${name}`, isDir: false, forceRefresh: shouldRefresh});
            } catch (e) {
                alert("Couldn't create file. Perhaps it already exists.");
                console.error("Couldn't create file. Perhaps it already exists.", e);
            }
        };

        if (name.endsWith(".json")) {
            await new Promise<void>((resolve) => {
                context.menuModal.current?.open({
                    title: "Choose Page Type",
                    body: "What type of page would you like to create?",
                    options: [
                        {
                            caption: "General",
                            value: "page"
                        },
                        {
                            caption: "Question",
                            value: "isaacQuestionPage"
                        },
                        {
                            caption: "FastTrack Question",
                            value: "isaacFastTrackQuestionPage"
                        },
                        {
                            caption: "Concept",
                            value: "isaacConceptPage"
                        },
                        {
                            caption: "Test",
                            value: "isaacQuiz"
                        },
                        {
                            caption: "Book Index",
                            value: "isaacBookIndexPage"
                        },
                        {
                            caption: "Book Detail",
                            value: "isaacBookDetailPage"
                        },
                        {
                            caption: "Revision",
                            value: "isaacRevisionDetailPage"
                        },
                        {
                            caption: "Topic Summary",
                            value: "isaacTopicSummaryPage"
                        },
                        {
                            caption: "Event",
                            value: "isaacEventPage"
                        },
                        {
                            caption: "Sidebar",
                            value: "sidebar"
                        },
                        {
                            caption: "News Pod",
                            value: "isaacPod"
                        },
                        {
                            caption: "Email",
                            value: "emailTemplate"
                        },
                        {
                            caption: "Wildcard",
                            value: "isaacWildcard"
                        },
                    ],
                    callback: async (option) => {
                        if (option === null) {
                            console.log("File creation cancelled.");
                        } else {
                            const doc = {
                                ...EMPTY_DOCUMENTS[option.value as ContentType],
                                author: context.github.user.login,
                                id: generateGuid(),
                            };
                            await doCreate(JSON.stringify(doc, null, 2));
                        }
                        resolve();
                    },
                });
            });
        } else {
            await doCreate("");
        }
    }
}

async function doDelete(context: ContextType<typeof AppContext>, action: ActionFor<"delete">) {
    const previouslyDirty = context.editor.getDirty();
    context.editor.setDirty(false);
    if (window.confirm("Do you really want to delete " + action.name + "?")) {
        const newDir = await githubDelete(context, action.path, action.name, action.sha);
        if (context.selection.getSelection()?.path === action.path) {
            context.selection.setSelection({path: newDir, isDir: true});
        }
    } else {
        context.editor.setDirty(previouslyDirty);
    }
}

async function doRename(context: ContextType<typeof AppContext>, action: ActionFor<"rename">) {
    if (context.editor.getDirty()) {
        if (!window.confirm("This will save the current contents of this file. Are you sure you want to continue?")) {
            return;
        }
        await githubSave(context);
    }

    let newName = window.prompt("Please type a new name for the file. If no extension is provided, \".json\" will be assumed", action.name);

    if (newName) {
        const oldPath = action.path;

        if (oldPath.replace(dirname(oldPath) + "/", "") === newName) {
            return;
        }

        if (newName.indexOf(".") === -1 && oldPath.toLowerCase().endsWith(".json")) {
            newName += ".json";
        }

        const basePath = dirname(oldPath);
        try {
            const shouldRefresh = await githubRename(context, oldPath, newName);
            context.selection.setSelection({path: `${basePath}/${newName}`, isDir: false, forceRefresh: shouldRefresh});
        } catch (e) {
            window.alert("Could not rename file. Perhaps one with that name already exists.");
            console.error(e);
        }
    }
}

async function doSaveAs(context: ContextType<typeof AppContext>, action: ActionFor<"saveAs">) {
    let newName = window.prompt("Please type a new name for the file. If no extension is provided, \".json\" will be assumed", action.name);
    if (newName && newName !== action.name) {
        const oldPath = action.path;
        if (newName.indexOf(".") === -1 && oldPath.toLowerCase().endsWith(".json"))
            newName += ".json";
        const basePath = dirname(oldPath);
        const newPath = basePath + "/" + newName;

        let alteredContent: Content | string;
        try {
            alteredContent = {
                ...context.editor.getCurrentDoc(),
                author: context.github.user.login,
                id: generateGuid(),
                published: false,
            };
        } catch {
            alteredContent = context.editor.getCurrentDocAsString();
        }
        context.editor.loadNewDoc(alteredContent);

        const contentToSave = typeof alteredContent === "string" ? alteredContent : JSON.stringify(alteredContent, null, 2);

        githubCreate(context, basePath, newName, contentToSave).then(function([_, shouldRefresh]) {
            context.selection.setSelection({path: newPath, isDir: false, forceRefresh: shouldRefresh});
        }).catch(function(e) {
            window.alert("Could not create file. Perhaps it already exists.");
            console.error(e);
        });
    }

}

async function doSave(context:  ContextType<typeof AppContext>) {
    const selection = context.selection.getSelection();
    if (selection) {
        githubSave(context).catch(function(e) {
            window.alert("Could not save file. Check the browser's console for more information.");
            console.error(e);
        });
    }
}

export async function doDispatch(context: ContextType<typeof AppContext>, action: Action) {
    switch (action.type) {
        case "openInNewTab":
            window.open(`/edit/${context.github.branch}/${action.path}`, "_blank");
            return;
        case "new":
            await doNew(context, action);
            return;
        case "delete":
            await doDelete(context, action);
            return;
        case "rename":
            await doRename(context, action);
            return;
        case "saveAs":
            await doSaveAs(context, action);
            return;
        case "save":
            await doSave(context);
            return;
    }
}
