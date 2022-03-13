export const FORMAT = {
	YMD: 'yyyy/MM/dd',
	Y_M_D: 'yyyy-MM-dd',
};
export const toString = (date: Date, mask: string, fallbackValue: any) => {
	const y = date.getFullYear();
	let m = `${date.getMonth() + 1}`;
	let d = `${date.getDate()}`;
	m = m.length > 1 ? m : `0${m}`;
	d = d.length > 1 ? d : `0${d}`;
	switch (mask) {
		case FORMAT.YMD:
			return `${y}/${m}/${d}`;
		case FORMAT.Y_M_D:
			return `${y}-${m}-${d}`;
		default:
			return fallbackValue;
	}
};

export const toNumber = (str: string, precision: number, fallbackValue?: any) => {
	try {
		return parseFloat(parseFloat(str).toFixed(precision));
	} catch (ex) {
		return fallbackValue;
	}
};
