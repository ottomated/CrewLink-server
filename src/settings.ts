export class LobbySettings {
    maxDistance: number = 5.32;
}

export function validateLobbySettings(settings: LobbySettings): boolean {
    return typeof settings === 'object' && settings.maxDistance && typeof settings.maxDistance === 'number';
}