import { fail, redirect } from "bosbun";
import type { RequestEvent } from "bosbun";

export async function load() {
    return { greeting: "Test form actions" };
}

export const actions = {
    default: async ({ request }: RequestEvent) => {
        const data = await request.formData();
        const email = data.get("email") as string;
        const name = data.get("name") as string;

        const errors: Record<string, string> = {};
        if (!email) errors.email = "Email is required";
        if (!name) errors.name = "Name is required";

        if (Object.keys(errors).length > 0) {
            return fail(400, { email, name, errors });
        }

        return { success: true, email, name };
    },

    reset: async () => {
        return { cleared: true };
    },
};
