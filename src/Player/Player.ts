import { Client, ContainerBuilder, ContainerComponent, MessageFlags, TextChannel } from "discord.js";
import { createRequire } from 'node:module';
import { buildSuccessContainer } from "../commenContainers/Success.js";
import { MyschemaPlayers } from "kysely-codegen";
import { updatePlayer } from "../database/postgres/players.js";
const require = createRequire(import.meta.url);
const { guildId } = require('../../config.json')

class Archetype {
    name: string = "Student"
}

// export function PlayerFromExisting(player: MyschemaPlayer): Player {
//     return new Player(player.discordid, player.xp, player.totalxp, player.level, player.charactername)
// }

export class Player implements MyschemaPlayers {
    discordid: string;
    xp: number = 0;
    totalxp: number = 0;
    level: number = 0;
    charactername: string;

    static fromExisting(player: MyschemaPlayers): Player {
        return new this(player.discordid, player.charactername, player.totalxp, player.level, player.xp)
    }

    constructor(discordId: string, characterName: string, total_xp: number = 0, level: number = 0, xp: number = 0) {
        this.discordid = discordId
        this.xp = xp
        this.totalxp = total_xp
        this.level = level
        this.charactername = characterName
    }

    getStatusContainer(profpic: string): ContainerBuilder {
        let row1 = `${this.charactername}: Level ${this.level}\n`
        let row2 = `Progress to next level: ${this.xp}/${this.xp + this.xpNeeded(this.level)}`
        let container = new ContainerBuilder().addSectionComponents(
            section => section
                .addTextDisplayComponents(
                    textDisplay => textDisplay.setContent(row1 + row2)
                )
                .setThumbnailAccessory(
                    thumbnail => thumbnail
                        .setDescription("User profile pic")
                        .setURL(profpic)
                )
        )
        return container
    }

    xpNeeded(level: number): number {
        return 5 * (level ** 2) + (50 * level) + 100 - this.xp
    }

    async addXp(xp: number, client: Client, channelId: string) {
        const guild = client.guilds.cache.get(guildId)
        if (!guild) {
            throw("Guild not found with id: " + guildId)
        }
        const channel = await guild.channels.fetch(channelId) as TextChannel
        let xpNeeded = this.xpNeeded(this.level)
        let difference = xpNeeded - xp        
        this.totalxp += xp
        while (difference <= 0) {
            this.level += 1;
            let message
            if (this.level == 1) {
                message = `All hail <@${this.discordid}>, for they have taken their first step towards the realm of the [Abbaki](https://attovia.wiki/Races/Cosmic/Abbaki)!`
            } else {
                message = `All hail <@${this.discordid}>, for they are ${this.level} steps towards the realm of the [Abbaki](https://attovia.wiki/Races/Cosmic/Abbaki)!`
            }
            const container = buildSuccessContainer(message)
            await channel.send({components: [container], flags: MessageFlags.IsComponentsV2})
            xp = xp - xpNeeded
            this.xp = 0
            xpNeeded = this.xpNeeded(this.level)
            difference = xpNeeded - xp
        }
        this.xp += xp
        updatePlayer(this.discordid, this)
    }
}