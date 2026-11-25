import React, { useEffect } from "react";
import { Spinner } from "react-bootstrap";
import Cookies from "js-cookie";

import { GITHUB_TOKEN_COOKIE } from "./github";

import styles from "../styles/editor.module.css";
import { getConfig } from "./config";

export function authorizationURL(target: string) {
    const config = getConfig();

    return `https://gitHub.com/login/oauth/authorize?scope=repo&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(target)}`;
}

export async function doAuth(github_code: string) {
    const config = getConfig();

    const url = `https://editor-auth.isaacphysics.org/_/api/authenticate?auth_code=${
        // The OAuth proxy expects this format; it doesn't work with the format URLSearchParams produces
        encodeURIComponent(config.authCode)
    }&${
        new URLSearchParams({
            client_id: config.clientId,
            github_code
        })
    }`;
    const result = await fetch(url);

    return result.json();
}

export function LoginPrompt() {
    return <div className={`m-5 {styles.centered} {styles.flexFill}`}>
        <h2 className={styles.centered}>Isaac Editor</h2>
        <div className="text-center">
            <a className="btn btn-primary w-25" href={authorizationURL(document.location.href)}>
                Log in
            </a>
        </div>
    </div>;
}

export function LoadingScreen({message = "Logging in..."}: { message?: string }) {
    // FIXME should these be ${styles.centered} ${styles.flexFill}?
    return <div className={`m-5 text-center {styles.centered} {styles.flexFill}`}>
        <Spinner />
        <br />
        <h4>{message}</h4>
    </div>;
}

export function Logout() {
    useEffect(() => {
        Cookies.remove(GITHUB_TOKEN_COOKIE);
        window.location.replace("/");
    });
    return <LoadingScreen message="Logging out..."/>;
}

export function Closer() {
    useEffect(() => {
        window.close();
    });
    return <LoadingScreen message="You can now close this window" />;
}

export function isLoggedIn() {
    return Cookies.get(GITHUB_TOKEN_COOKIE) !== undefined;
}
