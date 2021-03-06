// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore typescript doesn't seem to think utils is in the place it is
import {Remarkable, utils} from "remarkable";
import {linkify} from "remarkable/linkify";
import {SITE} from "../../services/site";
import styles from "../styles/markup.module.css";

const MARKDOWN_RENDERER = new Remarkable({
    html: true
}).use(linkify);

MARKDOWN_RENDERER.renderer.rules.link_open = function(tokens: Remarkable.LinkOpenToken[], idx: number/* options, env */) {
    const href = utils.escapeHtml(tokens[idx].href || "");
    const localLink = href.startsWith(window.location.origin) || href.startsWith("/") || href.startsWith("mailto:");
    const title = tokens[idx].title ? (' title="' + utils.escapeHtml(utils.replaceEntities(tokens[idx].title || "")) + '"') : '';
    if (localLink) {
        return `<a href="${href}" ${title}>`;
    } else {
        return `<a href="${href}" ${title} target="_blank" rel="noopener nofollow">`;
    }
};
export const renderRemarkableMarkdown = (markdown: string) => MARKDOWN_RENDERER.render(markdown);

// Renders placeholder cloze question drop zones
export const renderClozeDropZones = (markdown: string) => {
    // Matches: [drop-zone], [drop-zone|w-50], [drop-zone|h-50] or [drop-zone|w-50h-200]
    const dropZoneRegex = /\[drop-zone(?<params>\|(?<width>w-\d+?)?(?<height>h-\d+?)?)?]/g;
    return markdown.replace(dropZoneRegex, (_match, params, widthMatch, heightMatch) => {
        const minWidth = widthMatch ? widthMatch.slice("w-".length) + "px" : "100px";
        const minHeight = heightMatch ? heightMatch.slice("h-".length) + "px" : "auto";
        return `<span class="d-inline-block ${styles.clozeDropZonePlaceholder}" style="min-width: ${minWidth}; min-height: ${minHeight}">&nbsp;</span>`;
    });
}

// Renders a placeholder for block glossary terms
export const renderGlossaryBlocks = (markdown: string) => {
    // Matches strings such as [glossary:glossary-demo|boolean-algebra] which MUST be at the beginning of the line.
    const glossaryBlockRegexp = /^\[glossary:(?<id>[a-z-|]+?)\]/gm;
    return markdown.replace(glossaryBlockRegexp, (_match, id) => {
        return `<bclass="text-muted">[block glossary term: ${id}]</b>`;
    });
}

// Renders a placeholder for inline glossary terms
export const renderInlineGlossaryTerms = (markdown: string) => {
    // Matches strings such as [glossary-inline:glossary-demo|boolean-algebra] and
    // [glossary-inline:glossary-demo|boolean-algebra "boolean algebra"] which CAN be inlined.
    const glossaryInlineRegexp = /\[glossary-inline:(?<id>[a-z-|]+?)\s*(?:"(?<text>[A-Za-z0-9 ]+)")?\]/g;
    return markdown.replace(glossaryInlineRegexp, (_match, id, text, offset) => {
        return `<code class="text-muted">[inline glossary term: ${text ?? id}]</code>`;
    });
}

// RegEx replacements to match Latex inspired Isaac Physics functionality
export const regexProcessMarkdown = (markdown: string) => {
    const regexRules = {
        "[$1]($2)": /\\link{([^}]*)}{([^}]*)}/g,
    };
    if (SITE === "PHY") {
        Object.assign(regexRules, {
            "[**Glossary**](/glossary)": /\*\*Glossary\*\*/g,
            "[**Concepts**](/concepts)": /\*\*Concepts\*\*/g,
        });
    }
    Object.entries(regexRules).forEach(([replacement, rule]) =>
        markdown = markdown.replace(rule, replacement)
    );
    return markdown;
}