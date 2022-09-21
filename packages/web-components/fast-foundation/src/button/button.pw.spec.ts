import { spinalCase } from "@microsoft/fast-web-utilities";
import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { fixtureURL } from "../__test__/helpers.js";
import type { FASTButton } from "./button.js";

test.describe("Button", () => {
    let page: Page;
    let element: Locator;
    let control: Locator;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        element = page.locator("fast-button");

        control = element.locator(".control");

        await page.goto(fixtureURL("button--button"));
    });

    test.afterAll(async () => {
        await page.close();
    });

    test("should set the `disabled` attribute on the internal control", async () => {
        await page.setContent(/* html */ `
            <fast-button disabled></fast-button>
        `);

        await expect(control).toHaveBooleanAttribute("disabled");

        await element.evaluate(node => {
            node.toggleAttribute("disabled");
            return new Promise(requestAnimationFrame);
        });

        await expect(control).not.toHaveBooleanAttribute("disabled");
    });

    test("should set the `formnovalidate` attribute on the internal control", async () => {
        await page.setContent(/* html */ `
            <fast-button formnovalidate></fast-button>
        `);

        await expect(control).toHaveBooleanAttribute("formnovalidate");

        await element.evaluate(node => {
            node.toggleAttribute("formnovalidate");
            return new Promise(requestAnimationFrame);
        });

        await expect(control).not.toHaveBooleanAttribute("formnovalidate");
    });

    test.describe("should set the attribute on the internal control", () => {
        const attributes = {
            formaction: "foo",
            formenctype: "foo",
            formmethod: "post",
            formtarget: "_blank",
            form: "foo",
            name: "foo",
            type: "submit",
            value: "reset",
            ariaAtomic: "true",
            ariaBusy: "false",
            ariaControls: "testId",
            ariaCurrent: "page",
            ariaDescribedby: "testId",
            ariaDetails: "testId",
            ariaDisabled: "true",
            ariaErrormessage: "test",
            ariaExpanded: "true",
            ariaFlowto: "testId",
            ariaHaspopup: "true",
            ariaHidden: "true",
            ariaInvalid: "spelling",
            ariaKeyshortcuts: "F4",
            ariaLabel: "Foo label",
            ariaLabelledby: "testId",
            ariaLive: "polite",
            ariaOwns: "testId",
            ariaPressed: "true",
            ariaRelevant: "removals",
            ariaRoledescription: "slide",
        };

        for (const [attribute, value] of Object.entries(attributes)) {
            const attrToken = spinalCase(attribute);

            test(`should set the \`${attrToken}\` attribute to \`${value}\``, async () => {
                await page.setContent(
                    `<fast-button ${attrToken}="${value}"></fast-button>`
                );

                await expect(control).toHaveAttribute(attrToken, `${value}`);
            });
        }
    });

    test("should set the `form` attribute on the internal button when `formId` is provided", async () => {
        await page.setContent(/* html */ `
            <fast-button></fast-button>
        `);

        await element.evaluate((node: FASTButton) => {
            node.formId = "foo";
        });

        await expect(control).toHaveAttribute("form", "foo");
    });

    test("should set the `autofocus` attribute on the internal control", async () => {
        await page.setContent(/* html */ `
            <fast-button autofocus></fast-button>
        `);

        await expect(control).toHaveBooleanAttribute("autofocus");

        await element.evaluate(node => {
            node.toggleAttribute("autofocus");
            return new Promise(requestAnimationFrame);
        });

        await expect(control).not.toHaveBooleanAttribute("autofocus");
    });

    test("of type `submit` should submit the parent form when clicked", async () => {
        await page.setContent(/* html */ `
            <form>
                <fast-button type="submit">Submit Button</fast-button>
            </form>
        `);

        const form = page.locator("form");

        const [wasSubmitted] = await Promise.all([
            form.evaluate(node => {
                return new Promise(resolve => {
                    node.addEventListener("submit", e => {
                        e.preventDefault();
                        resolve(true);
                        return false;
                    });
                });
            }),

            element.click(),
        ]);

        expect(wasSubmitted).toBeTruthy();
    });

    test("of type `reset` should reset the parent form when clicked", async () => {
        await page.setContent(/* html */ `
            <form>
                <input type="text" value="foo" />
                <fast-button type="reset">Reset Button</fast-button>
            </form>
        `);

        const form = page.locator("form");

        const [wasReset] = await Promise.all([
            form.evaluate(node => {
                return new Promise(resolve => {
                    node.addEventListener("reset", () => resolve(true));
                });
            }),

            element.evaluate((node: FASTButton) => {
                node.click();
            }),
        ]);

        expect(wasReset).toBeTruthy();
    });

    test("should not propagate when clicked and `disabled` is true", async () => {
        await page.setContent(/* html */ `
            <fast-button disabled>Disabled Button</fast-button>
        `);

        const content = element.locator(".content");

        const [wasClicked] = await Promise.all([
            element.evaluate(node =>
                Promise.race([
                    new Promise(resolve => {
                        node.addEventListener("click", () => resolve(false));
                    }),
                    new Promise(requestAnimationFrame).then(() => Promise.resolve(true)),
                ])
            ),

            content.evaluate(node =>
                Promise.race([
                    new Promise(resolve => {
                        node.addEventListener("click", () => resolve(false));
                    }),
                    new Promise(requestAnimationFrame).then(() => Promise.resolve(true)),
                ])
            ),

            element.click(),
        ]);

        expect(wasClicked).not.toBeFalsy();
    });
});