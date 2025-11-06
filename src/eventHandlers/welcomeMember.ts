import { ContainerBuilder, GuildMember, MessageFlags, SectionBuilder, TextChannel } from "discord.js";
import { logToFile } from "../utilities/logger.js";
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { ABPictures, welcomeChannelId } = require('../../config.json')

export async function welcomeMember(member: GuildMember) {
    logToFile("PERSON JOINING GUILD: " + member.toString())
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId) as TextChannel
    // const textDisplay = new TextDisplayBuilder()
    //   .setContent("Hello <@"+member.id+">! Someone will be along shortly to welcome you properly, in the meantime feel free to get the lay of the land with my /server-info command!");
    //   const thumbnail = new ThumbnailBuilder()
    //     .setURL(client.user?.avatarURL() || "")
    const section = new SectionBuilder()
    .addTextDisplayComponents(
        textDisplay => textDisplay
        .setContent("Hello <@"+member.id+">! Someone will be along shortly to welcome you properly, in the meantime feel free to get the lay of the land with my /server-info command!")
    )
    .setThumbnailAccessory(
        thumbnail => thumbnail
        .setDescription("Cute profile pic of AttoviaBot smiling")
        .setURL(ABPictures.happyChristmas)
    )
    const container = new ContainerBuilder().addSectionComponents(section)
    if (welcomeChannel) {
    await welcomeChannel.send({components: [container], flags: MessageFlags.IsComponentsV2})
    }
}