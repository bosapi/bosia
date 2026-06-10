declare namespace App {
	interface Locals {
		user?: import("./features/auth").SessionUser | null;
		can: (resource: string, action: string, scope?: string) => Promise<boolean>;
	}
}
