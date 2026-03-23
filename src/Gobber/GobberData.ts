import { Gobber } from "./Gobber.js";
import { Resource, ResourceType } from "./GobberTypes/Resources.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { GobberEmojis } = require('../../config.json')

const rexFunction = /^\/Function\(.*\)\/$/s;

export function replacer(key: any, value: any) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries())
        };
    } else if (typeof value === "function") {
        return "/Function(" + value.toString() + ")/";
    }
    return value;
}

export function reviver(key: any, value: any) {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    } else if (typeof value === "string" && rexFunction.test(value)) {
        const functionText = value.substring(10, value.length - 2);
        return (0, eval)("(" + functionText + ")");
    }
    return value;
}

export function encodeGobberData(gobberData: GobberData): string {
    let simpleObject: any = {}

    simpleObject.gobberName = gobberData.gobberName;
    simpleObject.mineRate = gobberData.mineRate;
    simpleObject.isMining = gobberData.isMining;

    simpleObject.ore = {};
    simpleObject.ore.resourceType = [];
    simpleObject.ore.oreInfo = [];

    for (const [resourceType, ore] of gobberData.ore) {
        simpleObject.ore.resourceType.push(resourceType);
        simpleObject.ore.oreInfo.push(ore);
    }

    simpleObject.currency = gobberData.currency;
    simpleObject.mineStartTime = gobberData.mineStartTime;
    simpleObject.maxAwayMineTime = gobberData.maxAwayMineTime;


    return JSON.stringify(simpleObject)
}

export function decodeGobberData(stringData: string): GobberData {
    let simpleObject = JSON.parse(stringData);
    let gobber = new GobberData();
    gobber.gobberName = simpleObject.gobberName;
    gobber.mineRate = simpleObject.mineRate;
    gobber.isMining = simpleObject.isMining;

    for (let i = 0; i < simpleObject.ore.resourceType.length; i++) {
        gobber.ore.set(simpleObject.ore.resourceType[i], simpleObject.ore.oreInfo[i]);
    }

    gobber.currency = simpleObject.currency;
    gobber.mineStartTime = simpleObject.mineStartTime;
    gobber.maxAwayMineTime = simpleObject.maxAwayMineTime;

    return gobber;
}

export class OreInfo extends Resource {
    health: number;
    rarityValue: number;
    quantity: number;
    unlockPrice: ClipPrice;
    value: ClipPrice;
    unlocked: boolean;
    owned: number = 0;

    constructor(health: number, rarityValue: number, quantity: number, unlockPrice: ClipPrice, type: ResourceType, name: string, value: ClipPrice, iconURL: string = "", unlocked: boolean = false) {
        super(name, iconURL, type);
        this.health = health;
        this.rarityValue = rarityValue;
        this.quantity = quantity;
        this.unlockPrice = unlockPrice;
        this.unlocked = unlocked;
        this.type = type;
        this.value = value;
    }

    toString(): string {
        return `${this.emojiId} ${this.name}`;
    }
}

export class ClipOperator {
    static isPurchasable(gobber: Gobber, clipPrice: ClipPrice): boolean {
        let currencyOwned = gobber.gobberData.currency
        return currencyOwned.shards >= clipPrice.shards &&
            currencyOwned.clips >= clipPrice.clips &&
            currencyOwned.tats >= clipPrice.tats &&
            currencyOwned.pieces >= clipPrice.pieces;
    }

    static multiply(x: number, clipPrice: ClipPrice): ClipPrice {
        let shards = Math.floor(clipPrice.shards * x);
        let clips = Math.floor(clipPrice.clips * x);
        let tats = Math.floor(clipPrice.tats * x);
        let pieces = Math.floor(clipPrice.pieces * x);
        return new ClipPrice(shards, clips, tats, pieces);
    }

    static async purchase(gobber: Gobber, clipPrice: ClipPrice): Promise<ClipPrice | null> {
        if (this.isPurchasable(gobber, clipPrice)) {
            gobber.gobberData.currency = ClipOperator.subtract(gobber.gobberData.currency, clipPrice);
            await gobber.updateGobber()
            return null;
        } else {
            let missingShards = clipPrice.shards - gobber.gobberData.currency.shards
            if (missingShards < 0) {
                missingShards = 0
            }
            let missingClips = clipPrice.clips - gobber.gobberData.currency.clips
            if (missingClips < 0) {
                missingClips = 0
            }
            let missingTats = clipPrice.tats - gobber.gobberData.currency.tats;
            if (missingTats < 0) {
                missingTats = 0
            }
            let missingPieces = clipPrice.pieces - gobber.gobberData.currency.pieces;
            if (missingPieces < 0) {
                missingPieces = 0;
            }
            return new ClipPrice(missingShards, missingClips, missingTats, missingPieces);
        }
    }

    static toString(clipPrice: ClipPrice): string {
        let priceString = "";
        if (clipPrice.shards != 0) {
            priceString += `${clipPrice.shards} ${GobberEmojis.Shard} `
        }
        if (clipPrice.clips != 0) {
            priceString += `${clipPrice.clips} ${GobberEmojis.Clip} `
        }
        if (clipPrice.tats != 0) {
            priceString += `${clipPrice.tats} ${GobberEmojis.Tat} `
        }
        if (clipPrice.pieces != 0) {
            priceString += `${clipPrice.pieces} Pieces`;
        }
        return priceString;
    }

    static add(clipPrice: ClipPrice, other: ClipPrice): ClipPrice {
        return new ClipPrice(clipPrice.shards + other.shards, clipPrice.clips + other.clips, clipPrice.tats + other.tats, clipPrice.pieces + other.pieces);
    }

    static subtract(clipPrice: ClipPrice, other: ClipPrice): ClipPrice {
        return new ClipPrice(clipPrice.shards - other.shards, clipPrice.clips - other.clips, clipPrice.tats - other.tats, clipPrice.pieces - other.pieces);
    }
}

export class ClipPrice {
    shards: number
    clips: number
    tats: number
    pieces: number

    constructor(shards: number = 0, clips: number = 0, tats: number = 0, pieces: number = 0) {
        this.shards = shards
        this.clips = clips
        this.tats = tats
        this.pieces = pieces
    }

    // isPurchasable(gobber: Gobber): boolean {
    //     let currencyOwned = gobber.gobberData.currency
    //     return currencyOwned.shards >= this.shards &&
    //         currencyOwned.clips >= this.clips &&
    //         currencyOwned.tats >= this.tats &&
    //         currencyOwned.pieces >= this.pieces;
    // }

    // multiply(x: number): ClipPrice {
    //     let shards = Math.floor(this.shards * x);
    //     let clips = Math.floor(this.clips * x);
    //     let tats = Math.floor(this.tats * x);
    //     let pieces = Math.floor(this.pieces * x);
    //     return new ClipPrice(shards, clips, tats, pieces);
    // }

    // //returns true if purchased successfully, otherwise returns a ClipPrice representing the missing currency
    // async purchase(gobber: Gobber): Promise<ClipPrice | null> {
    //     if (this.isPurchasable(gobber)) {
    //         gobber.gobberData.currency = gobber.gobberData.currency.subtract(this);
    //         await gobber.updateGobber()
    //         return null;
    //     } else {
    //         let missingShards = this.shards - gobber.gobberData.currency.shards
    //         if (missingShards < 0) {
    //             missingShards = 0
    //         }
    //         let missingClips = this.clips - gobber.gobberData.currency.clips
    //         if (missingClips < 0) {
    //             missingClips = 0
    //         }
    //         let missingTats = this.tats - gobber.gobberData.currency.tats;
    //         if (missingTats < 0) {
    //             missingTats = 0
    //         }
    //         let missingPieces = this.pieces - gobber.gobberData.currency.pieces;
    //         if (missingPieces < 0) {
    //             missingPieces = 0;
    //         }
    //         return new ClipPrice(missingShards, missingClips, missingTats, missingPieces);
    //     }
    // }

    // toString(): string {
    //     let priceString = "";
    //     if (this.shards != 0) {
    //         priceString += `${this.shards}${GobberEmojis.Shard} `
    //     }
    //     if (this.clips != 0) {
    //         priceString += `${this.clips}${GobberEmojis.Clip}`
    //     }
    //     if (this.tats != 0) {
    //         priceString += `${this.tats}${GobberEmojis.Tat}`
    //     }
    //     if (this.pieces != 0) {
    //         priceString += `${this.pieces} Pieces`;
    //     }
    //     return priceString;
    // }

    // add(other: ClipPrice): ClipPrice {
    //     return new ClipPrice(this.shards + other.shards, this.clips + other.clips, this.tats + other.tats, this.pieces + other.pieces);
    // }

    // subtract(other: ClipPrice): ClipPrice {
    //     return new ClipPrice(this.shards - other.shards, this.clips - other.clips, this.tats - other.tats, this.pieces - other.pieces);
    // }
}

export class GobberData {
    gobberName: string = "Gobber";
    mineRate: number = 1;
    isMining: boolean = false;
    ore: Map<ResourceType, OreInfo> = new Map<ResourceType, OreInfo>();
    static baseOre: Map<ResourceType, OreInfo> = new Map<ResourceType, OreInfo>([
        [ResourceType.copper, new OreInfo(1, 1, 1, new ClipPrice(), 
            ResourceType.copper, "Copper Ore", new ClipPrice(1, 0, 0, 0), "", true)
        ],
        [ResourceType.iron, new OreInfo(100, .8, 1, new ClipPrice(0, 50), 
            ResourceType.iron, "Iron Ore", new ClipPrice(0, 1, 0, 0))
        ],
        [ResourceType.gold, new OreInfo(10000, .2, 1, new ClipPrice(0, 200), 
            ResourceType.gold, "Gold Ore", new ClipPrice(0, 0, 1, 0))
        ]
    ]);
    currency: ClipPrice = new ClipPrice(0, 0, 0, 0);
    mineStartTime: number | null = null;
    maxAwayMineTime: number = 600000; //ten minutes in milliseconds
    constructor(decodedGobberData: GobberData | null = null) {
        if (!decodedGobberData) {
            this.ore = GobberData.baseOre
            return;
        }
        this.gobberName = decodedGobberData.gobberName;
        this.mineRate = decodedGobberData.mineRate;
        this.isMining = decodedGobberData.isMining;
        for (const [resourceType, oreInfo] of decodedGobberData.ore) {
            this.ore.set(resourceType, new OreInfo(oreInfo.health, oreInfo.rarityValue, oreInfo.quantity, oreInfo.unlockPrice, oreInfo.type, oreInfo.name, oreInfo.value, oreInfo.emojiId, oreInfo.unlocked))
        }
        this.currency = decodedGobberData.currency;
        this.mineStartTime = decodedGobberData.mineStartTime;
        this.maxAwayMineTime = decodedGobberData.maxAwayMineTime;
    }
}