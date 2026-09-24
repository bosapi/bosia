import { error } from "bosia";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ url, parent }) => {
	const parentData = await parent();
	if (url.searchParams.get("fail") === "1") {
		error(500, "blog layout boom");
	}
	return {
		section: "blog",
		appName: parentData.appName as string,
	};
}) satisfies LayoutServerLoad;
