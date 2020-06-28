import { FASTDesignSystemProvider } from "../design-system-provider";
import TooltipTemplate from "./fixtures/base.html";
import { FASTTooltip } from "./";

// Prevent tree-shaking
FASTTooltip;
FASTDesignSystemProvider;

export default {
    title: "Tooltip",
};

export const base = () => TooltipTemplate;