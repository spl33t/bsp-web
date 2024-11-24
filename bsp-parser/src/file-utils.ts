import * as fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Получаем путь к текущему файлу и директорию
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

// Корректный путь к папке "maps"
const mapsDir = path.resolve(currentDir, "../../maps");

export async function getMap(name: string) {
    const mapPath = path.join(mapsDir, name); // Построение полного пути

    try {
        const data = await fs.readFile(mapPath); // Асинхронное чтение файла
        //console.info("Длина файла:", data.length);
        return data // Возвращаем Buffer
    } catch (err) {
        console.error(`Ошибка при чтении карты ${mapPath}:`, (err as Error).message);
        throw err; // Пробрасываем ошибку дальше
    }
}

export async function saveMap(name: string, data: Record<any, any>) {
    const mapPath = path.join(mapsDir, `${name}.json`); // Построение полного пути

    await fs.writeFile(mapPath, JSON.stringify(data, null, 2), "utf-8")

    console.log(`Карта сохранена в ${mapPath}`);
}