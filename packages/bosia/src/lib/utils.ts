import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getServerTime() {
    const now = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get timezone offset in minutes and convert to ±HH:MM format
    const offsetMinutes = -now.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const offsetStr = `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

    // Convert UTC time to local time by adding the offset
    const localTime = new Date(now.getTime() + offsetMinutes * 60 * 1000);
    const timestamp = localTime.toISOString().slice(0, -1) + offsetStr;

    return { timestamp, timezone: timeZone };
}
