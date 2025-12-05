import React, {useContext, useEffect, useRef, useState} from "react";

import { Figure, PositionableFigureRegionProps } from "../../../isaac-data-types";
import { FigureNumberingContext } from "../../../isaac/IsaacTypes";
import { ContentValueOrChildrenPresenter } from "./ContentValueOrChildrenPresenter";
import { PresenterProps } from "../registry";
import { BaseValuePresenter } from "./BaseValuePresenter";
import {githubUpload, updateGitHubCacheKey, useGithubContents} from "../../../services/github";
import { AppContext } from "../../../App";
import { dirname } from "../../../utils/strings";
import { useFixedRef } from "../../../utils/hooks";

import styles from "../styles/figure.module.css";
import {NON_STATIC_FIGURE_FLAG} from "../../../isaac/IsaacTypes";
import {Alert} from "reactstrap";
import { DropZoneQuestionContext } from "./ItemQuestionPresenter";
import { FigureRegionModal } from "../../FigureRegionModal";
import { InlineQuestionContext } from "./questionPresenters";

export function FigurePresenter(props: PresenterProps<Figure>) {
    const {doc, update} = props;
    const docRef = useFixedRef(doc);

    const figureNumbering = useContext(FigureNumberingContext);
    const figureNumber = figureNumbering[doc.id as string];

    const appContext = useContext(AppContext);
    const basePath = dirname(appContext.selection.getSelection()?.path) as string;
    const [replacedFile, setReplacedFile] = useState(false);
    const {data} = useGithubContents(appContext, getContentPathFromSrc(doc.src), isAppAsset(doc.src) ? "app" : undefined);

    const itemQuestionContext = useContext(DropZoneQuestionContext);
    const inlineQuestionContext = useContext(InlineQuestionContext);
    const [dndDropZoneModalOpen, setDndModalDropZoneOpen] = useState(false);
    const toggleDndDropZoneModal = () => setDndModalDropZoneOpen(o => !o);
    const [figureRegions, setFigureRegions] = useState<PositionableFigureRegionProps[]>(doc.figureRegions ?? []);

    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        function inlineBase64URLFromGithubData(data: { content: string; }) {
            let type = "image";
            switch (getImageFileType(doc.src)) {
                case "png": type = "image/png"; break;
                case "gif": type = "image/gif"; break;
                case "svg": type = "image/svg+xml"; break;
                case "jpg": type = "image/jpeg"; break;
                case "jpeg": type = "image/jpeg"; break;
            }

            const b64 = data.content;
            return "data:" + type + ";base64," +  b64;
        }

        if (data && data.content) {
            let dataUrl;
            if (getImageFileType(doc.src) === "svg" && getSVGView(doc.src)) {
                // SVG images may have "views", which can't be included in inline base 64 data, so we will use the
                // GitHub URL as the source instead
                dataUrl = githubURLFromGithubData(data, getSVGView(doc.src))
            }
            else {
                dataUrl = inlineBase64URLFromGithubData(data);
            }
            if (imageRef.current) {
                imageRef.current.src = dataUrl;
            }
        }
    }, [data, doc.src]);

    useEffect(() => {
        update({...doc, figureRegions: figureRegions?.length === 0 ? undefined : figureRegions});
        if (itemQuestionContext.isDndQuestion) {
            itemQuestionContext.figureMap[doc.id as string] = [figureRegions, setFigureRegions];
        } else if (inlineQuestionContext.isInlineQuestion) {
            inlineQuestionContext.setFigureMap?.(prev => ({
                ...prev,
                [doc.id as string]: figureRegions
            }) );
        }
    }, [itemQuestionContext.isDndQuestion, figureRegions, setFigureRegions]);

    const fileRef = useRef<HTMLInputElement>(null);

    function getContentPathFromSrc(src?: string) {
        if (doc.src !== undefined && doc.src !== "") {
            return isAppAsset(src) ? doc.src : `${basePath}/${doc.src}`
        }
        return false
    }

    function isAppAsset(path?: string) {
        return path && path.startsWith('/assets')
    }

    function githubURLFromGithubData(data: {download_url: string}, svgView?: string | null) {
        // If there is an SVG view, include at the end of the URL
        return svgView ? `${data.download_url}#${svgView}` : data.download_url;
    }

    function getImageFileType(src?: string) {
        src = src?.toLowerCase() ?? "";

        // remove SVG view, if present
        if(src.includes('#')) {
            src = src.substring(0, src.lastIndexOf('#'))
        }

        return src.substring(src.lastIndexOf(".") + 1)
    }

    function getSVGView(src?: string) {
        if (src && src.includes('#')) {
            src = src.toLowerCase()
            return src.substring(src.lastIndexOf("#") + 1)
        }
        return null
    }

    function selectFile(file: File) {
        const reader = new FileReader();
        reader.onload = async function() {
            const src = await githubUpload(appContext, basePath, file.name, reader.result as string);
            if (src) {
                if (src === docRef.current.src) {
                    setReplacedFile(true);
                    updateGitHubCacheKey(); // So that we load the image afresh even if it is in the browser cache.
                }
                update({ ...docRef.current, src });
            }
        };
        reader.readAsBinaryString(file);
    }

    function imageClick() {
        fileRef.current?.click();
    }

    function imageDragOver(event: React.DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        if (event.nativeEvent.dataTransfer) {
            event.nativeEvent.dataTransfer.dropEffect = "copy";
        }
    }

    function imageDrop(event: React.DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        if (event.nativeEvent.dataTransfer) {
            if (event.nativeEvent.dataTransfer.files.length !== 1)
                return;

            selectFile(event.nativeEvent.dataTransfer.files[0]);
        }
    }

    function fileChange() {
        if (fileRef.current?.files?.length !== 1)
            return;

        selectFile(fileRef.current?.files[0]);
    }

    const figureNumberText = figureNumber === NON_STATIC_FIGURE_FLAG
        ? <Alert color={"danger"}><small>Figure is in a non-static context, so cannot be given a number</small></Alert>
        : <h6>{figureNumber ? `Figure ${figureNumber}` : "Set ID to get a figure number"}</h6>;

    return <>
        <div className={styles.figureWrapper}>
            <div className={styles.figureImage}>
                <button onClick={imageClick} onDragOver={imageDragOver} onDrop={imageDrop}>
                    <img ref={imageRef} alt={doc.altText} width="250px" height="250px" src="/not-found.png"/>
                </button>
                <input type="file" ref={fileRef} className={styles.fileInput} onChange={fileChange} />
                {replacedFile && <div className="alert alert-warning text-center rounded-0 py-0" style={{width: 262}}>
                    Image Replaced
                </div>}
            </div>
            <div className={styles.figureCaption}>
                {doc.type === "figure" && <>
                    {figureNumberText}
                    <ContentValueOrChildrenPresenter {...props} topLevel />
                </>}
                {doc.attribution && <>
                    <BaseValuePresenter doc={{value: doc.attribution, encoding: "markdown"}} update={(newContent) => {
                        update({...doc, attribution: newContent.value});
                    }}/>
                </>}
            </div>
        </div>
        {itemQuestionContext.isDndQuestion && <div className={styles.clozeFigureFooter}>
            <button onClick={toggleDndDropZoneModal} disabled={!imageRef.current?.src}>Add drop-zones to figure</button>
            {!!figureRegions.length && <span style={{color: "grey"}}> ({figureRegions.length} managed zone{figureRegions.length !== 1 ? "s" : ""})</span>}
            {imageRef.current?.src && <FigureRegionModal 
                doc={doc} update={update}
                open={dndDropZoneModalOpen} toggle={toggleDndDropZoneModal} imgSrc={imageRef.current.src} 
                initialRegionIndex={itemQuestionContext.calculateDZIndexFromFigureId(doc.id as string)}
                regions={figureRegions} setRegions={setFigureRegions} figureNum={typeof figureNumber === "number" ? figureNumber : undefined}
            />}
        </div>}
        {inlineQuestionContext.isInlineQuestion && <div className={styles.clozeFigureFooter}>
            <button onClick={toggleDndDropZoneModal} disabled={!imageRef.current?.src}>Add inline entry to figure</button>
            {!!figureRegions.length && <span style={{color: "grey"}}> ({figureRegions.length} managed zone{figureRegions.length !== 1 ? "s" : ""})</span>}
            {imageRef.current?.src && <FigureRegionModal 
                doc={doc} update={update}
                open={dndDropZoneModalOpen} toggle={toggleDndDropZoneModal} imgSrc={imageRef.current.src} 
                initialRegionIndex={0}
                regions={figureRegions} setRegions={setFigureRegions} figureNum={typeof figureNumber === "number" ? figureNumber : undefined}
            />}
        </div>}
    </>;
}
