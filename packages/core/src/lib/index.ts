export function formatGuid<T extends string | undefined>(guid: T) {
    if (!guid && guid?.length !== 32) {
        return guid;
    }
    return [
        guid.slice(0, 8),
        guid.slice(8, 12),
        guid.slice(12, 16),
        guid.slice(16, 20),
        guid.slice(20, 32),
    ].join('-');
}

export function itemName(path: string) {
    return path
        .replaceAll('/', '')
        .replace(/[^a-zA-Z0-9_]/g, '-')
        .toLowerCase();
}

function unify(a: string) {
    if (a.length < 3) {
        return a;
    }
    if (a[0] === '{' && a[a.length - 1] === '}') {
        return a.slice(1, -1);
    }
    return a;
}

export function uuidCompare(a: string, b: string) {
    return unify(a).toLowerCase() === unify(b).toLowerCase();
}
