import React, {useEffect} from "react";
import {Navigate, Route} from "react-router-dom";
import {createBrowserRouter, createRoutesFromElements, RouterProvider, useLocation, useParams} from "react-router";

import {Closer, isLoggedIn, LoadingScreen, LoginPrompt, Logout} from "./services/auth";
import {defaultGithubContext, githubComparisonPath, processCode} from "./services/github";
import {EditorScreen} from "./screens/EditorScreen";


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
            <Route path="/edit/:branch/*" element={<EditorScreen />} />
            <Route path="/edit/:branch" element={<EditorScreen />} />
            <Route path="/compare/:old/:new" element={<GitHubComparisonRedirect />} />
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
