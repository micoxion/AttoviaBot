export enum ResourceType {
    copper,
    iron,
    gold
}

export class Resource {
    type: ResourceType;
    name: string;
    emojiId: string;

    constructor(name: string, emojiId: string, type: ResourceType) {
        this.name = name;
        this.emojiId = emojiId;
        this.type = type;
    }
}