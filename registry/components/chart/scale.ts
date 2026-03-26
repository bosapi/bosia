/** Maps a value from [domainMin, domainMax] to [rangeMin, rangeMax]. */
export function linearScale(
    domainMin: number,
    domainMax: number,
    rangeMin: number,
    rangeMax: number,
): (value: number) => number {
    const domainSpan = domainMax - domainMin || 1;
    const rangeSpan = rangeMax - rangeMin;
    return (value: number) => rangeMin + ((value - domainMin) / domainSpan) * rangeSpan;
}

/** Maps a Date to [rangeMin, rangeMax] based on the full date domain. */
export function timeScale(
    dateMin: Date,
    dateMax: Date,
    rangeMin: number,
    rangeMax: number,
): (date: Date) => number {
    const scale = linearScale(dateMin.getTime(), dateMax.getTime(), rangeMin, rangeMax);
    return (date: Date) => scale(date.getTime());
}

/** Produces human-friendly tick values for a Y axis. */
export function niceYTicks(min: number, max: number, tickCount: number = 5): number[] {
    if (min === max) return [min];

    const rawStep = (max - min) / (tickCount - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

    let niceStep: number;
    if (normalized <= 1.5) niceStep = magnitude;
    else if (normalized <= 3.5) niceStep = 2 * magnitude;
    else if (normalized <= 7.5) niceStep = 5 * magnitude;
    else niceStep = 10 * magnitude;

    const niceMin = Math.floor(min / niceStep) * niceStep;
    const niceMax = Math.ceil(max / niceStep) * niceStep;

    const ticks: number[] = [];
    for (let v = niceMin; v <= niceMax + niceStep * 0.01; v += niceStep) {
        ticks.push(Math.round(v * 1e9) / 1e9);
    }
    return ticks;
}

/** Converts string | Date values to Date objects. */
export function toDates(dates: (string | Date)[]): Date[] {
    return dates.map((d) => (d instanceof Date ? d : new Date(d)));
}
