import { defineConfig } from "bosia";
import { inspector } from "bosia/plugins/inspector";

export default defineConfig({
	plugins: [
		// Dev-only: Alt+click any element on the page to open its source in your editor.
		// Change `editor` to "cursor" or "zed" if you don't use VS Code.
		inspector({ editor: "code" }),
	],
});
