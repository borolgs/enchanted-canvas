export const randomId = (e = 16) => {
	const t = [];
	for (let n = 0; n < e; n++) {
		t.push(((16 * Math.random()) | 0).toString(16));
	}
	return t.join("");
};
