export function lineColFromOffset(source: string, offset: number): { line: number; col: number } {
	let line = 1;
	let col = 1;
	for (let i = 0; i < offset && i < source.length; i++) {
		if (source[i] === "\n") {
			line++;
			col = 1;
		} else {
			col++;
		}
	}
	return { line, col };
}
