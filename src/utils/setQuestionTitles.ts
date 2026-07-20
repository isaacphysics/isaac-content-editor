import { convertNumberToRoman } from "cr-numeral";
import { Content, IsaacInlineQuestion } from "../isaac-data-types";
import { QuestionTypes } from "../components/semantic/presenters/questionPresenters";
import { formatTabIndex } from "../components/semantic/presenters/TabsPresenter";

const formatTitle = (accordionIndex: number, questionIndex: number, onlyQuestion?: boolean) => {
    return `${formatTabIndex(accordionIndex, "alphabetical")}${onlyQuestion ? "" : `.${convertNumberToRoman(questionIndex + 1).toLowerCase()}`}`;
};

const isTitleStandardFormat = (title?: string) => {
    if (!title) return true;

    const regexFormat = new RegExp(/^[A-Z](?:\.(?=(?=[clxvi])(c{0,3}(?:xc|xl|l?x{0,3})(?:ix|iv|v?i{0,3})))\1)?$/);
    return regexFormat.test(title);
};

const doQuestionTitleLoop = (content: Content | string, writeNewTitles?: boolean, overrideOldTitles?: boolean) => {
    if (typeof content === "string") return {newContent: content, mismatchFound: false};

    const newContent = structuredClone(content);
    let noMismatch = true;
    newContent.children?.forEach((child) => {
        const contentChild = child as Content;
        if (contentChild.type === "content" && contentChild.layout === "accordion") {
            const accordion = child as Content;
            accordion.children?.forEach((accordionChild, accordionIndex) => {
                const accordionSection = accordionChild as Content;
                const questionCount = accordionSection.children?.filter(c => (c.type || "") in QuestionTypes).length ?? 0;
                const inlineQuestionCount = accordionSection.children?.reduce((acc, c) => acc + (c.type === "isaacInlineRegion" ?
                    (c as IsaacInlineQuestion).inlineQuestions?.length ?? 0 : 0), 0) ?? 0;
                const containsOneQuestion = questionCount + inlineQuestionCount === 1;

                let questionIndex = 0;
                accordionSection.children?.forEach((sectionChild) => {
                    if ((sectionChild.type || "") in QuestionTypes) {
                        const sectionQuestion = sectionChild as Content;
                        if (writeNewTitles && (overrideOldTitles || isTitleStandardFormat(sectionQuestion.title))) {
                            sectionQuestion.title = formatTitle(accordionIndex, questionIndex, containsOneQuestion);
                        }
                        noMismatch = noMismatch && sectionQuestion.title === formatTitle(accordionIndex, questionIndex, containsOneQuestion);
                        questionIndex += 1;
                    } else if (sectionChild.type === "isaacInlineRegion") {
                        const inlineRegion = sectionChild as IsaacInlineQuestion;
                        inlineRegion.inlineQuestions?.forEach((inlineQuestion) => {
                            if ((inlineQuestion.type || "") in QuestionTypes) {
                                if (writeNewTitles && (overrideOldTitles || isTitleStandardFormat(inlineQuestion.title))) {
                                    inlineQuestion.title = formatTitle(accordionIndex, questionIndex, containsOneQuestion);
                                }
                                noMismatch = noMismatch && inlineQuestion.title === formatTitle(accordionIndex, questionIndex, containsOneQuestion);
                                questionIndex += 1;
                            } 
                        });
                    }
                });
            });
        }
    });

    if (writeNewTitles) {
        return {newContent, mismatchFound: false};
    } else {
        return {newContent: content, mismatchFound: !noMismatch};
    }
};

export const makeQuestionTitlesStandard = (content: Content | string, overrideOldTitles: boolean) => {
    const {newContent} = doQuestionTitleLoop(content, true, overrideOldTitles);
    return newContent;
};

export const areQuestionTitlesMismatched = (content: Content | string) => {
    const {mismatchFound} = doQuestionTitleLoop(content);
    return mismatchFound;
};
