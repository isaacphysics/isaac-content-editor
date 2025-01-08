import React, { useCallback, useContext, useRef, useState } from "react";
import styles from "./semantic/styles/figure.module.css";
import markupStyles from "../isaac/styles/markup.module.css";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { ClozeQuestionContext } from "./semantic/presenters/ItemQuestionPresenter";
import throttle from "lodash/throttle";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const toFixedDP = (value: number, dp: number) => {
    const factor = Math.pow(10, dp);
    return Math.round(value * factor) / factor;
}

export interface PositionableDropZoneProps {
    index?: number;
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
    const {index, minWidth, minHeight, left, top, scaleFactor} = props;
    // const [imgPos, setImgPos] = useState({left: 0, right: 0, top: 0, bottom: 0});
    const imgPos = useRef({left: 0, right: 0, top: 0, bottom: 0});

    const handleDrag = useCallback(throttle((e: React.DragEvent<HTMLDivElement>) => {
        if (e.pageX === 0 && e.pageY === 0) return; // on drag end, the event fires with this; ignore it
        const newX = toFixedDP(clamp(((e.pageX - imgPos.current.left) / (imgPos.current.right - imgPos.current.left)) * 100, 0, 100), 1);
        const newY = toFixedDP(clamp(((e.pageY - imgPos.current.top) / (imgPos.current.bottom - imgPos.current.top)) * 100, 0, 100), 1);
        props.setPercentageLeft(newX);
        props.setPercentageTop(newY);
        props.setDropZone({index: index ?? -1, minWidth, minHeight, left: newX, top: newY});
    }, 40), []);

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
            e.dataTransfer.setDragImage(new Image(1, 1), 0, 0);
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
            {index}&nbsp;&nbsp;
        </span>
    </div>
}

interface FigureDropZoneModalProps {
    open: boolean;
    toggle: () => void;
    imgSrc: string;
    dropZones: PositionableDropZoneProps[];
    setDropZones: React.Dispatch<React.SetStateAction<PositionableDropZoneProps[]>>;
}

// TODO: 
// - drag and drop
// - remove drop zones
// - remove index from dropZones json?
// - migrate min width / height to px only or auto (this is all that's allowed anyway!)

export const FigureDropZoneModal = (props: FigureDropZoneModalProps) => {
    const {open, toggle, imgSrc, dropZones, setDropZones} = props;
    const clozeContext = useContext(ClozeQuestionContext);
    const imageRef = useRef<HTMLImageElement>(null);

    const [percentageLeft, setPercentageLeft] = useState<(number | "")[]>(dropZones.map(dz => dz.left));
    const [percentageTop, setPercentageTop] = useState<(number | "")[]>(dropZones.map(dz => dz.top));

    const [imageScaleFactor, setImageScaleFactor] = useState({x: 1, y: 1});

    if (!clozeContext.isClozeQuestion) {
        window.alert("No cloze question context found. Cancelling...");
        return null;
    }
    
    const recalculateImageScaleFactor = () => {
        const newScaleFactor = imageRef.current ? {x: imageRef.current.width / imageRef.current.naturalWidth, y: imageRef.current.height / imageRef.current.naturalHeight} : {x: 1, y: 1};
        setImageScaleFactor(newScaleFactor);
    };

    return <Modal isOpen={open} toggle={toggle}>
        <ModalHeader toggle={toggle}>Add drop zones</ModalHeader>
        <ModalBody className={styles.clozeDropZoneModalBody}>
            <div className="d-flex justify-content-center">
                <div className="position-relative">
                    <img id="figure-image" src={imgSrc} alt="" ref={imageRef} onLoad={recalculateImageScaleFactor}/>
                    {dropZones.map((dzProps, i) => <PositionableDropZone 
                        key={i} {...dzProps} scaleFactor={imageScaleFactor} 
                        setPercentageLeft={l => setPercentageLeft(p => p.map((v, j) => j === i ? l : v))}
                        setPercentageTop={t => setPercentageTop(p => p.map((v, j) => j === i ? t : v))}
                        setDropZone={dz => setDropZones(p => p.map((v, j) => j === i ? dz : v))}
                    />)}
                </div>
            </div>

            <table className={styles.dropZoneInputs}>
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Min width</th>
                        <th>Min height</th>
                        <th>X (%)</th>
                        <th>Y (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {dropZones.map((dzProps, i) => {
                        const {index, minWidth, minHeight, left, top} = dzProps;
                        return <tr key={i}> 
                            <td>{index}</td>
                            <td>
                                <input type={"text"} value={minWidth} onChange={event => {
                                    const newDropZoneStates = [...dropZones];
                                    newDropZoneStates[i].minWidth = event.target.value;
                                    setDropZones(newDropZoneStates);
                                }}/>
                            </td>
                            <td>
                                <input type={"text"} value={minHeight} onChange={event => {
                                    const newDropZoneStates = [...dropZones];
                                    newDropZoneStates[i].minHeight = event.target.value;
                                    setDropZones(newDropZoneStates);
                                }}/>
                            </td>
                            <td>
                                <input type={"number"} step={0.1} value={percentageLeft[i]} onChange={event => {
                                    const newValue = clamp(parseFloat(event.target.value), 0, 100);
                                    const newDropZoneStates = [...dropZones];
                                    const newPercentageLeft = [...percentageLeft];
                                    newPercentageLeft[i] = event.target.value !== "" ? newValue : ""
                                    newDropZoneStates[i].left = event.target.value !== "" ? newValue : 0;
                                    setDropZones(newDropZoneStates);
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
                                    const newDropZoneStates = [...dropZones];
                                    const newPercentageTop = [...percentageTop];
                                    newDropZoneStates[i].top = event.target.value !== "" ? newValue : 0;
                                    newPercentageTop[i] = event.target.value !== "" ? newValue : "";
                                    setPercentageTop(newPercentageTop);
                                    setDropZones(newDropZoneStates);
                                }} onBlur={() => {
                                    if (percentageTop[i] === "") {
                                        setPercentageTop(p => p.map((v, j) => j === i ? 0 : v));
                                    }
                                }}/>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>

            <span><small><i>Note: any exact pixel values here may not be accurate to your screen. They are being scaled relative to the natural resolution of the image; if the image is shrunk, any units will follow. What you see here will instead be more accurate to how it will appear on the site.</i></small></span>
    
            <div className="d-flex justify-content-between mt-3">
                <button onClick={() => setDropZones([...dropZones, {index: (clozeContext.dropZoneCount ?? 0), minWidth: "100px", minHeight: "auto", left: 0, top: 0}])}>
                    Add drop zone
                </button>
                <button onClick={toggle}>
                    Done
                </button>
            </div>

        </ModalBody>
    </Modal>;
};
