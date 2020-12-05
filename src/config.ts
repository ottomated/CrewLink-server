const roomConfigs = new Map<string, RoomConfig>();

export class RoomConfig {
    maxDistance: number;
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