import fs from 'fs/promises';
import path from 'path';

export interface Storage<T> {
    get(key: string): Promise<T | undefined>;
    getAll(): Promise<((T & { id: string }) | undefined)[]>;
    save(key: string, value: T): Promise<void>;
}

export class FileStorage<T> implements Storage<T> {
    constructor(private readonly folders: string[]) {}
    async getAll(): Promise<((T & { id: string }) | undefined)[]> {
        const files = await fs.readdir(path.join(...this.folders));
        return await Promise.all(
            files.map((file) => {
                const id = file.replace('.json', '');
                return this.get(id).then((data) =>
                    data ? { id, ...data } : undefined,
                );
            }),
        );
    }

    async get(key: string): Promise<T | undefined> {
        const filePath = this.getFilePath(key);
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (e) {
            throw e;
        }
    }

    async save(key: string, value: T): Promise<void> {
        const filePath = this.getFilePath(key);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
    }

    private getFilePath(key: string) {
        return path.join(...this.folders, key + '.json');
    }
}
