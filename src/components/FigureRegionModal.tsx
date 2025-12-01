import React, { useCallback, useContext, useMemo, useRef, useState } from "react";
import styles from "./semantic/styles/figure.module.css";
import markupStyles from "../isaac/styles/markup.module.css";
import { Input, Modal, ModalBody, ModalHeader } from "reactstrap";
import { DropZoneQuestionContext } from "./semantic/presenters/ItemQuestionPresenter";
import throttle from "lodash/throttle";
import { InlineQuestionContext } from "./semantic/presenters/questionPresenters";
import { Figure, PositionableFigureRegionProps } from "../isaac-data-types";
import classNames from "classnames";
import { PresenterProps } from "./semantic/registry";
import { alphabetIndex } from "../utils/strings";
import { isDefined } from "../utils/types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const toFixedDP = (value: number, dp: number) => {
    const factor = Math.pow(10, dp);
    return Math.round(value * factor) / factor;
}

interface DraggableDropZoneProps {
    setPercentageLeft: (l: number) => void;
    setPercentageTop: (t: number) => void;
    setDropZone: (dz: PositionableFigureRegionProps) => void;
    isCondensed?: boolean;
    index?: number;
}

const PositionableDropZone = (props: PositionableFigureRegionProps & DraggableDropZoneProps) => {
    const {id, minWidth, width, left, top, isCondensed, index} = props;
    const imgPos = useRef({left: 0, right: 0, top: 0, bottom: 0});

    const dropZoneQuestionContext = useContext(DropZoneQuestionContext);
    const minHeight = dropZoneQuestionContext.isClozeQuestion ? "24px" : "34px";
    const condensedSize = "36px";

    const handleDrag = useMemo(() => {
        return throttle((e: React.DragEvent<HTMLDivElement>) => {
            if (e.pageX === 0 && e.pageY === 0) return; // on drag end, the event fires with this; ignore it
            const newX = toFixedDP(clamp(((e.pageX - imgPos.current.left) / (imgPos.current.right - imgPos.current.left)) * 100, 0, 100), 1);
            const newY = toFixedDP(clamp(((e.pageY - imgPos.current.top) / (imgPos.current.bottom - imgPos.current.top)) * 100, 0, 100), 1);
            props.setPercentageLeft(newX);
            props.setPercentageTop(newY);
            props.setDropZone({id, minWidth, width, left: newX, top: newY});
        }, 40); 
    }, [id, minWidth, width]);

    const dragImage = new Image();
    // 1x1 transparent pixel
    dragImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    return <div 
        className="position-absolute" 
        draggable={true}
        role="tooltip"
        style={isCondensed 
            ? {
                left: `calc(${left}% - (${width}% * ${left/100}) + ((${width}% - ${condensedSize}) / 2))`, 
                top: `calc(${top}% - (${minHeight} * ${top/100}) + ((${minHeight} - ${condensedSize}) / 2))`,
                width: condensedSize,
                minWidth: condensedSize,
                height: condensedSize,
                minHeight: condensedSize,
            }
            : {
                left: `calc(${left}% - (max(${minWidth}, ${width}%) * ${left/100}))`, 
                top: `calc(${top}% - (${minHeight} * ${top/100}))`,
                width: `${width}%`,
                minWidth,
                height: minHeight, // set a height so that h-100 on children works as expected
                minHeight,
            }
        }
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
        <span className={`d-inline-block text-right w-100 h-100 ${markupStyles.clozeDropZonePlaceholder}`}>
            {!isCondensed ? id : (isDefined(index) ? alphabetIndex(index) : "?")}&nbsp;&nbsp;
        </span>
    </div>
}

interface FigureDropZoneModalProps extends PresenterProps<Figure> {
    open: boolean;
    toggle: () => void;
    imgSrc: string;
    initialRegionIndex: number;
    regions: PositionableFigureRegionProps[];
    setRegions: React.Dispatch<React.SetStateAction<PositionableFigureRegionProps[]>>;
    figureNum?: number;
}

export const FigureRegionModal = (props: FigureDropZoneModalProps) => {
    const {doc, update, open, toggle, imgSrc, initialRegionIndex, regions, setRegions, figureNum} = props;
    const dropZoneQuestionContext = useContext(DropZoneQuestionContext);
    const inlineQuestionContext = useContext(InlineQuestionContext);
    const imageRef = useRef<HTMLImageElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const [percentageLeft, setPercentageLeft] = useState<(number | "")[]>(regions.map(dz => dz.left));
    const [percentageTop, setPercentageTop] = useState<(number | "")[]>(regions.map(dz => dz.top));
    const [containerWidth, setContainerWidth] = useState<number | null>(null);
    const [condensedModeMaxWidth, setCondensedModeMaxWidth] = useState<number | undefined>(
        doc.condensedMaxWidth?.endsWith("px") ? parseInt(doc.condensedMaxWidth.substring(0, doc.condensedMaxWidth.length - 2)) : undefined
    );

    const setupResizeObserver = useCallback(() => {
        if (!imageContainerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const element = entries[0].target;
            setContainerWidth(element.clientWidth);
        });
        observer.observe(imageContainerRef.current);
        return () => observer.disconnect();
    }, []);

    const isCondensed = containerWidth !== null && condensedModeMaxWidth !== undefined && containerWidth <= condensedModeMaxWidth;

    if (!dropZoneQuestionContext.isDndQuestion && !inlineQuestionContext.isInlineQuestion) {
        window.alert("No DND / inline question context found. Cancelling...");
        return null;
    }

    return <Modal isOpen={open} toggle={toggle} size="xl">
        <ModalHeader toggle={toggle}>Add figure regions</ModalHeader>
        <ModalBody className={styles.figureRegionModalBody}>
            <div className="d-flex flex-column justify-content-center">
                <div id="figure-image-container" className={classNames(styles.figureRegionImageContainer, "align-self-center")} ref={imageContainerRef}>
                    <img id="figure-image" src={imgSrc} alt="" ref={imageRef} onLoad={setupResizeObserver} />
                    {regions.map((regionProps, i) => <PositionableDropZone 
                        key={i} {...regionProps} 
                        id={regionProps.id ?? `F${figureNum ?? ""}-${initialRegionIndex + i}`}
                        setPercentageLeft={l => setPercentageLeft(p => p.map((v, j) => j === i ? l : v))}
                        setPercentageTop={t => setPercentageTop(p => p.map((v, j) => j === i ? t : v))}
                        setDropZone={dz => setRegions(p => p.map((v, j) => j === i ? dz : v))}
                        isCondensed={isCondensed} index={i}
                    />)}
                </div>
                <div>
                    <div>Displaying at width: <b>{containerWidth}px</b></div>
                    <div className="d-flex align-items-center">
                        Condensed mode max width:
                        <Input
                            type="number"
                            style={{width: "80px"}}
                            value={condensedModeMaxWidth !== undefined ? condensedModeMaxWidth : ""}
                            placeholder="unset"
                            className="mx-1"
                            onChange={e => {
                                const value = e.target.value;
                                setCondensedModeMaxWidth(value !== "" ? Number(value) : undefined);
                            }}
                        />
                        px
                    </div>
                </div>
            </div>

            <table className={styles.figureRegionModalInputs}>
                <thead>
                    <tr>
                        <th className="text-muted" style={{width: "60px"}}>#</th>
                        <th>ID</th>
                        <th>Min width (px)</th>
                        <th>Width (%)</th>
                        <th>X (%)</th>
                        <th>Y (%)</th>
                        <th/>{/* remove button */}
                    </tr>
                </thead>
                <tbody>
                    {regions.map((regionProps, i) => {
                        const {id, minWidth, width} = regionProps;

                        return <tr key={i}>
                            <td className="text-muted">{alphabetIndex(i)}</td>
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
                                <input type={"number"} step={0.1} value={width} onChange={event => {
                                    const newValue = clamp(parseFloat(event.target.value), 0, 100);
                                    const newRegionStates = [...regions];
                                    newRegionStates[i].width = event.target.value !== "" ? newValue : 0;
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
    
            <div className="d-flex justify-content-between mt-3">
                <button onClick={() => {
                    setRegions([...regions, {
                        id: `F${figureNum ?? ""}-${regions.length}`, 
                        minWidth: "100px", 
                        width: 15, 
                        left: 50, 
                        top: 50
                    }]);
                    setPercentageLeft([...percentageLeft, 50]);
                    setPercentageTop([...percentageTop, 50]);
                    if (dropZoneQuestionContext.isDndQuestion) {
                        dropZoneQuestionContext.dropZoneCount = dropZoneQuestionContext.dropZoneCount ? dropZoneQuestionContext.dropZoneCount + 1 : 1;
                    }
                }}>
                    Add region
                </button>
                <button onClick={() => {
                    update({...doc, condensedMaxWidth: `${condensedModeMaxWidth}px`});
                    toggle();
                }}>
                    Done
                </button>
            </div>

        </ModalBody>
    </Modal>;
};
