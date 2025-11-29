class OreInfo {
    health: number;
    rarityValue: number;
    quantity: number;

    constructor(health: number, rarityValue: number, quantity: number) {
        this.health = health;
        this.rarityValue = rarityValue;
        this.quantity = quantity;
    }
}

export class GobberData {
    gobberName: string = "Gobber";
    mineRate: number = 1;
    areOwned = {
        copper: 0,
        iron: 0,
        gold: 0
    };
    copperInfo: OreInfo = new OreInfo(1, 100, 1);
    ironInfo: OreInfo = new OreInfo(100, 80, 1);
    goldInfo: OreInfo = new OreInfo(10000, 40, 1);
    currency = {
        shards: 0,
        clips: 0,
        tats: 0,
        pieces: 0
    };
    mineStartTime: number | null = null;
    maxAwayMineTime: number = 600000 //ten minutes in milliseconds
}