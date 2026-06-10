/**
 * Resource/action registry — mostly documentation for permission grants.
 * Format: `resource.action`. Features append their own keys via append-block.
 */
export const RESOURCES: string[] = ["users.read", "users.update"];

export type ResourceAction = string;
