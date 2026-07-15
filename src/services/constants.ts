import { Difficulty, ExamBoard, Stage } from "../isaac-data-types";
import { siteSpecific } from "./site";

// STAGES
export enum STAGE {
    YEAR_7_AND_8 = "year_7_and_8",
    YEAR_9 = "year_9",
    GCSE = "gcse",
    A_LEVEL = "a_level",
    FURTHER_A = "further_a",
    UNIVERSITY = "university",
    SCOTLAND_NATIONAL_5 = "scotland_national_5",
    SCOTLAND_HIGHER = "scotland_higher",
    SCOTLAND_ADVANCED_HIGHER = "scotland_advanced_higher",
    CORE = "core",
    ADVANCED = "advanced",
    POST_18 = "post_18",
    ALL = "all",
}
export const STAGE_NULL_OPTIONS = [STAGE.ALL];
export const STAGES_PHY = [STAGE.YEAR_7_AND_8, STAGE.YEAR_9, STAGE.GCSE, STAGE.A_LEVEL, STAGE.FURTHER_A, STAGE.UNIVERSITY];
export const STAGES_CS = [STAGE.GCSE, STAGE.A_LEVEL, STAGE.SCOTLAND_NATIONAL_5, STAGE.SCOTLAND_HIGHER, STAGE.SCOTLAND_ADVANCED_HIGHER, STAGE.CORE, STAGE.ADVANCED, STAGE.POST_18];
export const stagesOrdered: Stage[] = [...siteSpecific(STAGES_PHY, STAGES_CS), STAGE.ALL];
export const stageLabelMap: {[stage in Stage]: string} = {
    year_7_and_8: "Year\u00A07&8",
    year_9: "Year\u00A09",
    gcse: "GCSE",
    a_level: "A\u00A0Level",
    further_a: "Further\u00A0A",
    university: "University",
    scotland_national_5: "N5",
    scotland_higher: "Higher",
    scotland_advanced_higher: "Adv Higher",
    core: "Core",
    advanced: "Advanced",
    post_18: "Post-18",
    all: "All stages",
};

// EXAM BOARDS
export enum EXAM_BOARD {
    AQA = "aqa",
    CIE = "cie",
    EDEXCEL = "edexcel",
    EDUQAS = "eduqas",
    OCR = "ocr",
    WJEC = "wjec",
    SQA = "sqa",
    ADA = "ada",
    ALL = "all",
}
export const EXAM_BOARDS_CS = [EXAM_BOARD.AQA, EXAM_BOARD.CIE, EXAM_BOARD.EDEXCEL, EXAM_BOARD.EDUQAS, EXAM_BOARD.OCR, EXAM_BOARD.WJEC, EXAM_BOARD.SQA, EXAM_BOARD.ADA, EXAM_BOARD.ALL];
export const CS_EXAM_BOARDS_BY_STAGE: Partial<Record<Stage, ExamBoard[]>> = {
    gcse: [EXAM_BOARD.AQA, EXAM_BOARD.EDEXCEL, EXAM_BOARD.EDUQAS, EXAM_BOARD.OCR, EXAM_BOARD.WJEC],
    a_level: [EXAM_BOARD.AQA, EXAM_BOARD.CIE, EXAM_BOARD.OCR, EXAM_BOARD.EDUQAS, EXAM_BOARD.WJEC],
    scotland_national_5: [EXAM_BOARD.SQA],
    scotland_higher: [EXAM_BOARD.SQA],
    scotland_advanced_higher: [EXAM_BOARD.SQA],
    core: [EXAM_BOARD.ADA],
    advanced: [EXAM_BOARD.ADA],
    post_18: [EXAM_BOARD.ADA],
};

// DIFFICULTIES
export enum DIFFICULTIES {
    PRACTICE_1 = "practice_1",
    PRACTICE_2 = "practice_2",
    PRACTICE_3 = "practice_3",
    CHALLENGE_1 = "challenge_1",
    CHALLENGE_2 = "challenge_2",
    CHALLENGE_3 = "challenge_3"
}
export const difficultiesOrdered: Difficulty[] = siteSpecific(
    ["practice_1", "practice_2", "practice_3", "challenge_1", "challenge_2", "challenge_3"],
    ["practice_1", "practice_2", "challenge_1", "challenge_2"]
);

// SUBJECTS
export enum SUBJECTS {
    PHYSICS = 'physics',
    MATHS = 'maths',
    CHEMISTRY = 'chemistry',
    BIOLOGY = 'biology',
    CS = 'computer_science'
}
export const SUBJECTS_PHY = [SUBJECTS.PHYSICS, SUBJECTS.MATHS, SUBJECTS.CHEMISTRY, SUBJECTS.BIOLOGY];

export const BOOK_DETAIL_ID_SEPARATOR = "__";
