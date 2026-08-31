const PLATFORM_TO_CODE = {
    spotify:    'sp',
    apple:      'am',
    deezer:     'dz',
    tidal:      'td',
    youtube:    'yt',
    amazon:     'az'
};

const CODE_TO_PLATFORM = Object.fromEntries(
    Object.entries(PLATFORM_TO_CODE).map(([k, v]) => [v, k])
);

const TYPE_TO_CODE = { artist: 'a', song: 's', album: 'l' };
const CODE_TO_TYPE = { a: 'artist', s: 'song', l: 'album' };

function encodePlatformId(platformId: string): string {
    if (/^\d+$/.test(platformId)) {
        return 'n' + parseInt(platformId, 10).toString(36);
    }
    return platformId;
}

function decodePlatformId(encoded: string): string {
    if (encoded.startsWith('n')) {
        return parseInt(encoded.slice(1), 36).toString();
    }
    return encoded;
}

export function linkedId(platform: string, type: string, platformId: string): string {
    const typeCode = TYPE_TO_CODE[type.toLowerCase() as keyof typeof TYPE_TO_CODE];
    const platCode = PLATFORM_TO_CODE[platform.toLowerCase() as keyof typeof PLATFORM_TO_CODE];

    if (!typeCode) throw new Error(`Unknown entity type: ${type}`);
    if (!platCode) throw new Error(`Unknown platform: ${platform}`);

    const encodedId = encodePlatformId(platformId);
    return `${typeCode}${platCode}-${encodedId}`;
}

export function decodeLinkedId(id: string): { platform: string; type: string; platformId: string } | null {
    if (!id || typeof id !== 'string') return null;

    const sepIndex = id.indexOf('-');
    if (sepIndex < 3) return null;

    const prefix = id.slice(0, sepIndex);
    const encodedId = id.slice(sepIndex + 1);

    const typeCode = prefix[0];
    const platCode = prefix.slice(1);

    const type = CODE_TO_TYPE[typeCode as keyof typeof CODE_TO_TYPE];
    const platform = CODE_TO_PLATFORM[platCode as keyof typeof CODE_TO_PLATFORM];

    if (!type || !platform) return null;

    return {
        platform,
        type,
        platformId: decodePlatformId(encodedId)
    };
}

export function isValidLinkedId(id: string): boolean {
    return decodeLinkedId(id) !== null;
}
