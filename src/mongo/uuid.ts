/** Generates a UUID meant for database documents */
export function getDbUUID(prefix: string) {
    const parts = [];

    const datePart = Date.now().toString(36)
    const randomPart = crypto.randomUUID().split("-").splice(0, 3).join("-");

    parts.push(prefix, datePart, randomPart);
    return parts.join("-");
}