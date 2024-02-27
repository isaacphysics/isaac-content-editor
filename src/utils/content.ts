import { Content } from "../isaac-data-types";

export const extractValueOrChildrenText = (doc: Content): string => {
  return (doc.value || doc.children?.map(extractValueOrChildrenText).join("\n")) ?? "";
};
