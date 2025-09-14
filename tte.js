// Telsoc Template Engine
// Repurposes all template tags with id's, automatically producing custom web
// components for them.
// Also handles importing templates using src attribute on a template tag.
//
// Cheatsheet:
//  Local templates
//      <template id="tag-name-with-hyphen"></template>
//  Importing file as template
//      <template id="tag-name-with-hyphen" src="path"></template>

document.addEventListener("DOMContentLoaded", () => {

    // Obtain all template tags with ids (in this program, intended tagnames)
    const templates = document.querySelectorAll("template[id]");
    

    // Iterate through them and register the custom tags
    templates.forEach(async t => {

        // If the tag contains src, fetch it - otherwise use the innerHTML
        let html;
        const src = t.getAttribute("src");

        if (src) {
            html = await fetch(src).then(res => res.text());
        } else {
            html = t.innerHTML;
        }


        // Create an (effectively) anonymous class with basic logic for elements
        class CustomElement extends HTMLElement {
            constructor() {
                super();
            }

            connectedCallback() {
                this.innerHTML = html;
            }
        }


        // Attempt to register it
        try {
            customElements.define(t.id, CustomElement);
        } catch (e) {
            console.warn(`Failed to make ${t.id} (REASON:\n${e}\n)`);
        }

    });
});
