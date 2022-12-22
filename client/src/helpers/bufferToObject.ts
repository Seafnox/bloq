export function bufferToObject<T extends Object>(data: ArrayBuffer): T {
    // Bytes -> JSON string -> Object.
    let decoder = new TextDecoder();
    let jsonStr = decoder.decode(data);
    return JSON.parse(jsonStr);
}
