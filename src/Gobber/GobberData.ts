import { Gobber } from "./Gobber.js";
import { Resource, ResourceType } from "./GobberTypes/Resources.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { GobberEmojis } = require('../../config.json')

export function replacer(key: any, value: any) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries())
        };
    } else {
        return value;
    }
}

export function reviver(key: any, value: any) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
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

    isPurchasable(gobber: Gobber): boolean {
        let currencyOwned = gobber.gobberData.currency
        return currencyOwned.shards >= this.shards &&
            currencyOwned.clips >= this.clips &&
            currencyOwned.tats >= this.tats &&
            currencyOwned.pieces >= this.pieces;
    }

    //returns true if purchased successfully, otherwise returns a ClipPrice representing the missing currency
    async purchase(gobber: Gobber): Promise<ClipPrice | boolean> {
        if (this.isPurchasable(gobber)) {
            gobber.gobberData.currency.shards -= this.shards;
            gobber.gobberData.currency.clips -= this.clips;
            gobber.gobberData.currency.tats -= this.tats;
            gobber.gobberData.currency.pieces -= this.pieces;
            await gobber.updateGobber()
            return true;
        } else {
            let missingShards = this.shards - gobber.gobberData.currency.shards
            if (missingShards < 0) {
                missingShards = 0
            }
            let missingClips = this.clips - gobber.gobberData.currency.clips
            if (missingClips < 0) {
                missingClips = 0
            }
            let missingTats = this.tats - gobber.gobberData.currency.tats;
            if (missingTats < 0) {
                missingTats = 0
            }
            let missingPieces = this.pieces - gobber.gobberData.currency.pieces;
            if (missingPieces < 0) {
                missingPieces = 0;
            }
            return new ClipPrice(missingShards, missingClips, missingTats, missingPieces);
        }
    }

    getPriceString(): string {
        let priceString = "";
        if (this.shards != 0) {
            priceString += `${this.shards}${GobberEmojis.Shard} `
        }
        if (this.clips != 0) {
            priceString += `${this.clips}${GobberEmojis.Clip}`
        }
        if (this.tats != 0) {
            priceString += `${this.tats}${GobberEmojis.Tat}`
        }
        if (this.pieces != 0) {
            priceString += `${this.pieces} Pieces`;
        }
        return priceString;
    }
}

export class GobberData {
    gobberName: string = "Gobber";
    mineRate: number = 1;
    isMining: boolean = false;
    ore: Map<ResourceType, OreInfo> = new Map<ResourceType, OreInfo>([
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
    currency = {
        shards: 0,
        clips: 0,
        tats: 0,
        pieces: 0
    };
    mineStartTime: number | null = null;
    maxAwayMineTime: number = 600000 //ten minutes in milliseconds
}