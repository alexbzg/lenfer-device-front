export function zeropad(val) {
  return val < 10 ? '0' + val : val.toString();
}
	
export const MONTHS_GENITIVE = ["", "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", 
  "сентября", "октября", "ноября", "декабря"];

export function zeropad_range (limit, shift=0) {
    return [...Array(limit).keys()].map(item => zeropad(item + shift))
}
