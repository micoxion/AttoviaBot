import { Client, MessageFlags } from "discord.js";
import { getLastBotCheckin, updateLastOnline } from "../database/postgres/botStats.js";
import { createRequire } from 'node:module';
import { buildMistakeContainer } from "../commenContainers/Mistake.js";
const require = createRequire(import.meta.url);
const { botCommands, botTesting } = require('../../config.json')

export async function checkStatus(client: Client) {
    let lastCheckin = await getLastBotCheckin()
    if (lastCheckin && lastCheckin.lastonline) {
        let now: number = Date.now();
        let lastCheckinMilli = lastCheckin.lastonline.getTime();
        let timeDif = (now - lastCheckinMilli) / 36e5;

        if (timeDif > 1) {
            //send message here
            let channel = client.channels.cache.get(botCommands)
            if (channel && channel.isSendable()) {
                let container = buildMistakeContainer(`<@&1232395644702949396> I was down for ${timeDif.toFixed(2)} hours. If you had words I didn't count in that time make sure you use my manual wordcount commands to maintain streaks! \`/commands\` to see those!`);
                await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
        }
        // else if (timeDif > .2) {
        //     let channel = client.channels.cache.get(botCommands)
        //     if (channel && channel.isSendable()) {
        //         let container = buildMistakeContainer(`I was down for ${timeDif} hours.`);
        //         await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        //     }
        // }
    }
    await updateLastOnline()
}