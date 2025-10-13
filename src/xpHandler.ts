import { Client } from "discord.js";
import { Player } from "./Player/Player.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { levelChannelId } = require('../config.json')

const maxXp = 25
const minXp = 15

export async function xpHandler(client: Client, players: MapIterator<Player>) {
    for (const player of players) {
        player.addXp(Math.floor(Math.random() * (maxXp - minXp + 1) + minXp), client, levelChannelId)
    }
}

export async function addXpToOnePlayer(client: Client, player: Player) {
    player.addXp(Math.floor(Math.random() * (maxXp - minXp + 1) + minXp), client, levelChannelId)
}