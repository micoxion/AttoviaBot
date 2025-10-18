import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SlashCommandBuilder, User } from "discord.js";
import { getLeaderboardTopTen } from "../../database/postgres/players.js";
import { Player } from "../../Player/Player.js";

export let data = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Who's in the Attovia top ten!?")

    export async function execute(interaction: ChatInputCommandInteraction) {
        let topTen = await getLeaderboardTopTen()
        const container = new ContainerBuilder()
        .setAccentColor(0xc57bf3)
        const guild = interaction.guild
        if (!guild) return;
        for (let i = 0; i < topTen.length; i++) {
            let player = Player.fromExisting(topTen[i])
            console.log(player.charactername, " : ", player.discordid)
            let member = guild.members.cache.get(player.discordid)
            if (!member) {
                member = await guild.members.fetch(player.discordid)
            }
            console.log(member?.user.username, " : ", member?.user.avatarURL())
            let section = new SectionBuilder()
            .addTextDisplayComponents(textDisplay => 
                textDisplay.setContent(`# ${i + 1} <@${player.discordid}>\n## \`Level ${player.level} | ${player.xp}/${player.xpNeeded(player.level) + player.xp} XP\``)
            )
            .setThumbnailAccessory(thumbnail =>
                thumbnail.setURL(member?.user.avatarURL() || "")
            )
            container.addSectionComponents(section)
        }
        await interaction.reply({components: [container], flags: MessageFlags.IsComponentsV2})
    }