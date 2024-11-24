import "dotenv/config";
import "reflect-metadata";
import { getMap, saveMap } from "./file-utils";
import { parseEdges, parseHeader, parsePlanes, parseTextures, parseVertices } from "./parse-utils";

bspToJson("box-001.bsp")
bspToJson("Testmap.bsp")

async function bspToJson(mapName: string) {
    const mapBuffer = await getMap(mapName);

    const { lumps, version } = parseHeader(mapBuffer);

    console.log("Версия BSP-файла:", version, lumps);

    // Создаём объект для записи в JSON
    const data = {
        version,
        vertices: parseVertices(mapBuffer, { length: lumps.VERTICES.size, offset: lumps.VERTICES.offset }),
        planes: parsePlanes(mapBuffer, { length: lumps.PLANES.size, offset: lumps.PLANES.offset }),
        edges: parseEdges(mapBuffer, { length: lumps.EDGES.size, offset: lumps.EDGES.offset }),
        //textures
    };

    // Записываем данные в файл
    saveMap(mapName, data)
}
