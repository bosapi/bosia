import { defineConfig } from "bosia";
import { serverTiming } from "bosia/plugins/server-timing";
import { inspector } from "bosia/plugins/inspector";

export default defineConfig({
	plugins: [
		serverTiming(),
		inspector({
			editor: "zed",
			aiEndpoint: "http://localhost:9000/api/inspector-ai",
		}),
	],
});
