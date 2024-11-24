export interface Lump {
    name: string;
    offset: number;
    size: number;
}

interface BSPHeader {
    version: number;
    lumps: Lump[];
}

const HEADER30 = [
    "ENTITIES",
    "PLANES",
    "TEXTURES",
    "VERTICES",
    "VISIBILITY",
    "NODES",
    "TEXINFO",
    "FACES",
    "LIGHTING",
    "CLIPNODES",
    "LEAVES",
    "MARKSURFACES",
    "EDGES",
    "SURFEDGES",
    "MODELS",
    "HEADER_LUMPS",
] as const

export const parseHeader = (buffer: Buffer) => {
    const view = new DataView(buffer.buffer);
    const version = view.getUint32(0, true);

    const lumps = {} as Record<typeof HEADER30[number], Lump>

    for (let i = 0; i < HEADER30.length; i++) {
        const lumpType = HEADER30[i];
        const offset = view.getUint32(i * 8 + 4, true);
        const size = view.getUint32(i * 8 + 8, true);
        lumps[lumpType] = { name: lumpType, offset, size };
    }

    return {
        version,
        lumps,
    };
}

export interface Vertex {
    x: number;
    y: number;
    z: number;
}

export function parseVertices(buffer: Buffer, lump: { offset: number, length: number }) {
    const vertices: { x: number, y: number, z: number }[] = [];
    const vertexCount = lump.length / 12; // Каждая вершина занимает 12 байт (3 float)

    for (let i = 0; i < vertexCount; i++) {
        const x = buffer.readFloatLE(lump.offset + i * 12);
        const y = buffer.readFloatLE(lump.offset + i * 12 + 4);
        const z = buffer.readFloatLE(lump.offset + i * 12 + 8);
        vertices.push({ x, y, z });
    }

    return vertices;
}


export function parsePlanes(buffer: Buffer, lump: { offset: number, length: number }) {
    const planes: { normal: { x: number, y: number, z: number }, dist: number }[] = [];
    const planeCount = lump.length / 20; // Каждая плоскость занимает 20 байт

    for (let i = 0; i < planeCount; i++) {
        const normalX = buffer.readFloatLE(lump.offset + i * 20);
        const normalY = buffer.readFloatLE(lump.offset + i * 20 + 4);
        const normalZ = buffer.readFloatLE(lump.offset + i * 20 + 8);
        const dist = buffer.readFloatLE(lump.offset + i * 20 + 12);
        planes.push({ normal: { x: normalX, y: normalY, z: normalZ }, dist });
    }

    return planes;
}


export function parseEdges(buffer: Buffer, lump: { offset: number, length: number }) {
    const edges: { startVertex: number, endVertex: number }[] = [];
    const edgeCount = lump.length / 4; // Каждое ребро состоит из двух значений, по 2 байта на каждое, т.е. 4 байта на одно ребро

    // Пройдем по всем рёбрам
    for (let i = 0; i < edgeCount; i++) {
        // Чтение индексов вершин для рёбер
        const startVertex = buffer.readInt16LE(lump.offset + i * 4);       // Чтение первого индекса (startVertex)
        const endVertex = buffer.readInt16LE(lump.offset + i * 4 + 2);   // Чтение второго индекса (endVertex)

        // Добавляем ребро в массив
        edges.push({ startVertex, endVertex });
    }

    return edges;
}


export function parseTextures(buffer: Buffer, lump: { offset: number, length: number }) {
    const textures: { name: string }[] = [];
    const textureCount = lump.length / 72; // Каждая текстура занимает 72 байта

    for (let i = 0; i < textureCount; i++) {
        const name = buffer.toString('utf-8', lump.offset + i * 72, lump.offset + i * 72 + 64).trim();
        textures.push({ name });
    }

    return textures;
}
