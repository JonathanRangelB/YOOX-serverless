export function convertToBase36(intValue : number) {
    return intValue.toString(36).padStart(6, "0").toUpperCase()
}
