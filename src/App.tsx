import React, {createContext, MutableRefObject, useEffect} from "react";
import {Navigate, Route} from "react-router-dom";
import {createBrowserRouter, createRoutesFromElements, NavigateFunction, RouterProvider, useLocation, useParams} from "react-router";

import {defaultSelectedContext} from "./components/FileBrowser";
import {defaultEditorState} from "./components/SemanticEditor";
import {Closer, isLoggedIn, LoadingScreen, LoginPrompt, Logout} from "./services/auth";
import {defaultGithubContext, githubComparisonPath, processCode} from "./services/github";
import {EditorScreen} from "./screens/EditorScreen";
import {defaultDispatch} from "./services/commands";
import {MenuModalRef} from "./screens/MenuModal";
import {defaultPreview} from "./components/Preview";
import {defaultCdn} from "./components/CDNUploadModal";


export const AppContext = createContext({
    selection: defaultSelectedContext,
    editor: defaultEditorState,
    github: defaultGithubContext,
    dispatch: defaultDispatch,
    navigate: (() => {
        throw new Error("Can't navigate outside of AppContext");
    }) as NavigateFunction,
    menuModal: {current: null} as MutableRefObject<MenuModalRef | null>,
    preview: defaultPreview,
    cdn: defaultCdn,
});

function RedirectOldOrDefault() {
    const location = useLocation();
    const to = (location.pathname === "/") && (location.hash.slice(0, 3) === "#!/")
        ? location.hash.slice(2) // leave the slash intact
        : `/edit/${encodeURIComponent(defaultGithubContext.branch)}`;
    return <Navigate to={to} />;
}

function GitHubComparisonRedirect() {
    const params = useParams();
    useEffect(function redirectToGitHub() { window.location.href = githubComparisonPath(params.old, params.new); }, []);
    return <div className="p-2">
        <strong>Redirecting to GitHub...</strong>
    </div>;
}

const router = (loggedIn: boolean) => createBrowserRouter(createRoutesFromElements(
    <>
        <Route path="/logout" element={<Logout />} />
        <Route path="/login_finished" element={<Closer />} />
        {!loggedIn && <Route path="*" element={<LoginPrompt />} />}
        {loggedIn && <>
            <Route path="edit/:branch/*" element={<EditorScreen />} />
            <Route path="edit/:branch" element={<EditorScreen />} />
            <Route path="compare/:old/:new" element={<GitHubComparisonRedirect />} />
            <Route path="*" element={<RedirectOldOrDefault />} />
        </>}
    </>
));

function App() {
    const loggedIn = isLoggedIn();

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    useEffect(() => {
        void processCode(code);
    }, [code]);

    return code ? <LoadingScreen/> : <RouterProvider router={router(loggedIn)} />;
}

export default App;
