import { defineConfig } from "bosia";
import { serverTiming } from "bosia/plugins/server-timing";
import { accessLog } from "bosia/plugins/access-log";
import { inspector } from "bosia/plugins/inspector";

export default defineConfig({
	plugins: [
		serverTiming(),
		accessLog(),
		inspector({
			editor: "zed",
			aiEndpoint: "http://localhost:9900/api/inspector-ai",
		}),
	],
});
