const roomConfigs = new Map<string, RoomConfig>();

export class RoomConfig {
    maxDistance: number = 5.32;
}

export function deleteRoomConfig(code: string) {
    roomConfigs.delete(code);
}

export function setRoomConfig(code: string, config: RoomConfig) {
    roomConfigs.set(code, config);
}

export function getRoomConfig(code: string): RoomConfig {
    return roomConfigs.get(code);
}

export function validateRoomConfig(config: RoomConfig): boolean {
    return typeof config === 'object' && config.maxDistance && typeof config.maxDistance === 'number';
}

export function createRoomConfig(code: string) {
    if (!roomConfigs.has(code))
        roomConfigs.set(code, new RoomConfig());
}