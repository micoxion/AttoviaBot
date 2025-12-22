import { time, ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder, TimestampStyles } from "discord.js";
import { getGobberById } from "../../database/postgres/gobber.js";
import { Gobber } from "../../Gobber/Gobber.js";
import { BuildMineResultsContainer } from "./Containers/MineResults.js";
import { buildSuccessContainer } from "../../commenContainers/Success.js";
import { buildErrorContainer } from "../../commenContainers/Error.js";

export let data = new SlashCommandBuilder()
    .setName("mine")
    .setDescription("Set your Gobber to work!")

export async function execute(interaction: ChatInputCommandInteraction) {
    let gobberEntry = await getGobberById(interaction.user.id)
    let gobber: Gobber //= new Gobber(interaction.user.id, null, null);
    if (gobberEntry) {
        gobber = Gobber.fromExisting(gobberEntry)
    }
    else {
        gobber = new Gobber(interaction.user.id, null, null);
        await gobber.onboardGobber(interaction)
        return;
    }
    let startPoint: number = Date.now();
    let result = await gobber.startMining()

    if (result) {
        if (!gobber.gobberData.mineStartTime) {
            let container = buildErrorContainer(`Uh oh! Something went wrong retrieving your mine start time, feel free to ping <@331634391790911488> and let him know!`, `${gobber.discordid}`)
            await interaction.reply({})
            return;
        }
        let mineDuration = startPoint - gobber.gobberData.mineStartTime
        if (mineDuration > gobber.gobberData.maxAwayMineTime) {
            mineDuration = gobber.gobberData.maxAwayMineTime;
        }
        let seconds = Math.floor((mineDuration / 1000) % 60)
        let minutes = Math.floor((mineDuration / (1000 * 60)) % 60)
        let hours = Math.floor(((mineDuration / (1000 * 60 * 60)) % 24));
        let startTimeString = time(new Date(gobber.gobberData.mineStartTime))
        let container = BuildMineResultsContainer(`${gobber.gobberData.gobberName} started mining at ${startTimeString} 
            and mined for ${hours} hours, ${minutes} minutes and ${seconds} seconds, they collected the following while in the mines! 
            Use /mine again to restart on mining!`, result);
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
    }
    else {
        let endDate: Date = new Date(startPoint + gobber.gobberData.maxAwayMineTime)
        let endDateString = time(endDate, TimestampStyles.LongDateShortTime)
        let container = buildSuccessContainer(`${gobber.gobberData.gobberName} has begun mining! They can mine until ${endDateString}, make sure to collect when that time comes up!`);
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
    }
}