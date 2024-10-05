export function convertToBase36(intValue : number) {
    return intValue.toString(36).padStart(6, "0").toUpperCase()
}

export function convertFromBase36ToNumber(base36Value : string) {
    return parseInt(base36Value, 36);
}