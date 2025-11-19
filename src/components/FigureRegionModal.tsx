import React, { useCallback, useContext, useRef, useState } from "react";
import styles from "./semantic/styles/figure.module.css";
import markupStyles from "../isaac/styles/markup.module.css";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { DropZoneQuestionContext } from "./semantic/presenters/ItemQuestionPresenter";
import throttle from "lodash/throttle";
import { InlineQuestionContext } from "./semantic/presenters/questionPresenters";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const toFixedDP = (value: number, dp: number) => {
    const factor = Math.pow(10, dp);
    return Math.round(value * factor) / factor;
}

export interface PositionableDropZoneProps {
    id: string;
    minWidth: string;
    minHeight: string;
    left: number;
    top: number;
}

interface DraggableDropZoneProps {
    scaleFactor: {x: number, y: number};
    setPercentageLeft: (l: number) => void;
    setPercentageTop: (t: number) => void;
    setDropZone: (dz: PositionableDropZoneProps) => void;
}

const PositionableDropZone = (props: PositionableDropZoneProps & DraggableDropZoneProps) => {
    const {id, minWidth, minHeight, left, top, scaleFactor} = props;
    const imgPos = useRef({left: 0, right: 0, top: 0, bottom: 0});

    const handleDrag = useCallback(throttle((e: React.DragEvent<HTMLDivElement>) => {
        if (e.pageX === 0 && e.pageY === 0) return; // on drag end, the event fires with this; ignore it
        const newX = toFixedDP(clamp(((e.pageX - imgPos.current.left) / (imgPos.current.right - imgPos.current.left)) * 100, 0, 100), 1);
        const newY = toFixedDP(clamp(((e.pageY - imgPos.current.top) / (imgPos.current.bottom - imgPos.current.top)) * 100, 0, 100), 1);
        props.setPercentageLeft(newX);
        props.setPercentageTop(newY);
        props.setDropZone({id, minWidth, minHeight, left: newX, top: newY});
    }, 40), []);

    const dragImage = new Image();
    // 1x1 transparent pixel
    dragImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    return <div 
        className="position-absolute" 
        draggable={true}
        role="tooltip"
        style={{
            left: `calc(${left}% - (${minWidth !== 'auto' ? minWidth : "100px"} * ${scaleFactor.x} * ${left/100}))`, 
            top: `calc(${top}% - (${minHeight !== 'auto' ? minHeight : "24px"} * ${scaleFactor.y} * ${top/100}))`
        }}
        onDragStart={(e) => {
            const imgRect = document.getElementById("figure-image")?.getBoundingClientRect();
            if (!imgRect) return;
            imgPos.current = {left: imgRect.left, right: imgRect.right, top: imgRect.top, bottom: imgRect.bottom};
            e.dataTransfer.setDragImage(dragImage, 0, 0);
        }}
        onDrag={(e) => {
            if (!imgPos.current.left || !imgPos.current.right || !imgPos.current.top || !imgPos.current.bottom) return;
            e.persist(); 
            handleDrag(e);
        }}
    >
        <span className={`d-inline-block text-right ${markupStyles.clozeDropZonePlaceholder}`} style={{
            minWidth: `calc(${minWidth} * ${scaleFactor.x})`, 
            minHeight: `calc(${minHeight} * ${scaleFactor.y})`
        }}>
            {id}&nbsp;&nbsp;
        </span>
    </div>
}

interface FigureDropZoneModalProps {
    open: boolean;
    toggle: () => void;
    imgSrc: string;
    initialRegionIndex: number;
    regions: PositionableDropZoneProps[];
    setRegions: React.Dispatch<React.SetStateAction<PositionableDropZoneProps[]>>;
    figureNum?: number;
}

// TODO: 
// - migrate min width / height to px only or auto (this is all that's allowed anyway!)

export const FigureRegionModal = (props: FigureDropZoneModalProps) => {
    const {open, toggle, imgSrc, initialRegionIndex, regions, setRegions, figureNum} = props;
    const dropZoneQuestionContext = useContext(DropZoneQuestionContext);
    const inlineQuestionContext = useContext(InlineQuestionContext);
    const imageRef = useRef<HTMLImageElement>(null);

    const [percentageLeft, setPercentageLeft] = useState<(number | "")[]>(regions.map(dz => dz.left));
    const [percentageTop, setPercentageTop] = useState<(number | "")[]>(regions.map(dz => dz.top));

    const [imageScaleFactor, setImageScaleFactor] = useState({x: 1, y: 1});

    if (!dropZoneQuestionContext.isDndQuestion && !inlineQuestionContext.isInlineQuestion) {
        window.alert("No DND / inline question context found. Cancelling...");
        return null;
    }
    
    const recalculateImageScaleFactor = () => {
        const newScaleFactor = imageRef.current ? {x: imageRef.current.width / imageRef.current.naturalWidth, y: imageRef.current.height / imageRef.current.naturalHeight} : {x: 1, y: 1};
        setImageScaleFactor(newScaleFactor);
    };

    return <Modal isOpen={open} toggle={toggle} size="xl">
        <ModalHeader toggle={toggle}>Add figure regions</ModalHeader>
        <ModalBody className={styles.figureRegionModalBody}>
            <div className="d-flex justify-content-center">
                <div className="position-relative">
                    <img id="figure-image" src={imgSrc} alt="" ref={imageRef} onLoad={recalculateImageScaleFactor}/>
                    {regions.map((regionProps, i) => <PositionableDropZone 
                        key={i} {...regionProps} 
                        id={regionProps.id ?? `F${figureNum ?? ""}-${initialRegionIndex + i}`}
                        scaleFactor={imageScaleFactor} 
                        setPercentageLeft={l => setPercentageLeft(p => p.map((v, j) => j === i ? l : v))}
                        setPercentageTop={t => setPercentageTop(p => p.map((v, j) => j === i ? t : v))}
                        setDropZone={dz => setRegions(p => p.map((v, j) => j === i ? dz : v))}
                    />)}
                </div>
            </div>

            <table className={styles.figureRegionModalInputs}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Min width</th>
                        <th>Min height</th>
                        <th>X (%)</th>
                        <th>Y (%)</th>
                        <th/>{/* remove button */}
                    </tr>
                </thead>
                <tbody>
                    {regions.map((regionProps, i) => {
                        const {id, minWidth, minHeight, left, top} = regionProps;

                        return <tr key={i}> 
                            <td>
                                <input type={"text"} value={id} onChange={event => {
                                    const newRegionStates = [...regions];
                                    newRegionStates[i].id = event.target.value;
                                    setRegions(newRegionStates);
                                }}/>
                            </td>
                            <td>
                                <input type={"text"} value={minWidth} onChange={event => {
                                    const newRegionStates = [...regions];
                                    newRegionStates[i].minWidth = event.target.value;
                                    setRegions(newRegionStates);
                                }}/>
                            </td>
                            <td>
                                <input type={"text"} value={minHeight} onChange={event => {
                                    const newRegionStates = [...regions];
                                    newRegionStates[i].minHeight = event.target.value;
                                    setRegions(newRegionStates);
                                }}/>
                            </td>
                            <td>
                                <input type={"number"} step={0.1} value={percentageLeft[i]} onChange={event => {
                                    const newValue = clamp(parseFloat(event.target.value), 0, 100);
                                    const newRegionStates = [...regions];
                                    const newPercentageLeft = [...percentageLeft];
                                    newPercentageLeft[i] = event.target.value !== "" ? newValue : ""
                                    newRegionStates[i].left = event.target.value !== "" ? newValue : 0;
                                    setRegions(newRegionStates);
                                    setPercentageLeft(newPercentageLeft);
                                }} onBlur={() => {
                                    if (percentageLeft[i] === "") {
                                        setPercentageLeft(p => p.map((v, j) => j === i ? 0 : v));
                                    }
                                }}/>
                            </td>
                            <td>
                                <input type={"number"} step={0.1} value={percentageTop[i]} onChange={event => {
                                    const newValue = clamp(parseFloat(event.target.value), 0, 100);
                                    const newRegionStates = [...regions];
                                    const newPercentageTop = [...percentageTop];
                                    newRegionStates[i].top = event.target.value !== "" ? newValue : 0;
                                    newPercentageTop[i] = event.target.value !== "" ? newValue : "";
                                    setPercentageTop(newPercentageTop);
                                    setRegions(newRegionStates);
                                }} onBlur={() => {
                                    if (percentageTop[i] === "") {
                                        setPercentageTop(p => p.map((v, j) => j === i ? 0 : v));
                                    }
                                }}/>
                            </td>
                            <td>
                                <button onClick={() => {
                                    setRegions(regions.filter((_, j) => j !== i));
                                    setPercentageLeft(percentageLeft.filter((_, j) => j !== i));
                                    setPercentageTop(percentageTop.filter((_, j) => j !== i));
                                }}>
                                    ❌
                                </button>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>

            <span><small><i>Note: any exact pixel values here may not be accurate to your screen. They are being scaled relative to the natural resolution of the image; if the image is shrunk, any units will follow. What you see here will instead be more accurate to how it will appear on the site.</i></small></span>
    
            <div className="d-flex justify-content-between mt-3">
                <button onClick={() => {
                    setRegions([...regions, {id: `F${figureNum ?? ""}-${regions.length}`, minWidth: "100px", minHeight: "auto", left: 50, top: 50}])
                    setPercentageLeft([...percentageLeft, 50]);
                    setPercentageTop([...percentageTop, 50]);
                    if (dropZoneQuestionContext.isDndQuestion) {
                        dropZoneQuestionContext.dropZoneCount = dropZoneQuestionContext.dropZoneCount ? dropZoneQuestionContext.dropZoneCount + 1 : 1;
                    }
                }}>
                    Add region
                </button>
                <button onClick={toggle}>
                    Done
                </button>
            </div>

        </ModalBody>
    </Modal>;
};
