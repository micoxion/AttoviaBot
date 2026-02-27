import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags, ButtonStyle, APIMessageComponentEmoji, ActionRowData, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Events, Interaction, ContainerBuilder, ThumbnailBuilder } from "discord.js";
import { createRequire } from 'node:module';
import { EventEmitterCleanup } from "../../utilities/interactionCleanup.js";
const require = createRequire(import.meta.url);
const { ABPictures } = require('../../../config.json')

export let data = new SlashCommandBuilder()
        .setName("server-info")
        .setDescription("Get a verbose rundown of the server and how you can participate!")

export async function execute(interaction: ChatInputCommandInteraction) {
    let container = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay 
                    .setContent(
                        "### 📣 Administration 📝\n" +
                        "- <#1232399840055398420> Please read this :)\n" +
                        "- <#1309324855677550717> Anything server wide or community oriented gets posted here! Like web fishing game nights, and the weekly Sharing Saturday reminder.\n" +
                        "- <#1346603740848984186> Any social posts supported by the Sapphire Bot get posted here! Grab the <@&1346594304851710122> role if you want to be pinged by this channel!\n" +
                        "- <#1255936478614126757> Whenever I push new updates or documents to the Attovia wiki I will send a message here and ping the <@&1255993879149285408> role!\n" +
                        "- <#1232405575321780297> If you have any recommendations, suggestions or questions regarding the server send them here!\n" +
                        "- <#1332074921060339876> Go here to get any relevent roles you see listed here! If a category has a role next to it you will need that role to see the channels there!\n" +
                        "### 🔔 Attovian Dailies 📰\n" +
                        "- <#1389271495582417057> Not currently active but you can still answer any of <@512108088061591583>'s previous questions that are there!\n" +
                        "- <#1387457544770813974> Grab the <@&1387467938306723851> role if you want to be pinged by <@827694081362231357> whenever they post a new daily fact!\n" +
                        "- <#1417198716653146136> <@527633223681966107> posts daily video game music for you to enjoy! Grab the <@&1417198974988718110> role if you want to be pinged when he does so!\n" +
                        "- <#1419748827455422574> Our server has come to regularly play wordle, play with us here! No spoilers!\n" +
                        "### 🔎Attovian Tour🔍\n" +
                        "- <#1232400118066708611> Where we all once stood :head_shaking_vertically:.\n" +
                        "- <#1462887040453574697> Some common questions and guidance about the forums and QnAs.\n" +
                        "- <#1232753006055919687> If you are so inclined feel free to introduce yourself to us here or see how other's have introduced themselves! No requirement to do so though so please don't feel any pressure!\n" +
                        "- <#1470859783186677952> Info, answers and a guide for how to get your writing read aloud on World Hammer!\n" +
                        "### 🍻 Common Room 🗣\n" +
                        "- <#1232395395129282595> For any general discussion or chatting! We aren't strict at all on what that means so don't think too hard about it xD\n" +
                        "- <#1352395627761373204> For anyone to post any kind of positive message, image, meme or statement! A place to encourage and to be encouraged <3\n" +                        
                        "- <#1332852995099983964> Share any fun, wacky, serious, dramatic or otherwise interesting session highlights from TTRPGs your running or playing in!\n" +
                        "- <#1339006716037173401> For our adorable furry friends to get some attention which they never get enough of <3\n" +
                        "- <#1474507950264680499> All discussion and sharing of video games.\n" +
                        "- <#1344914250539339777> For any kind of hobby sharing/discussion! Show us what cool hyperfixations you have, we've all got them here :joy:\n" +
                        "- <#1470470777731158097> Share your music interests here!\n" +
                        "- <#1363912693328908500> A place for pictures of hobbies, collections, food and anything you want to show off!\n" +
                        "- <#1237126681139871857> Does what it says on the tin baby, post and enjoy memes!\n" +
                        "- <#1397962622116171796> Help grow the server's tree!\n"                    
                    )
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("AttoviaBot looks happy")
                    .setURL(ABPictures.happy)
            )
    )
    .setAccentColor(0xc57bf3)
    .addActionRowComponents(
        actionRowComponent => actionRowComponent
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("next-page")
                    .setLabel("Page 2")
                    .setEmoji("➡️" as APIMessageComponentEmoji)
                    .setStyle(ButtonStyle.Secondary)
            )
    )
    let container2 = new ContainerBuilder().addSectionComponents(
        section => section
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent(                        
                        "### 🌏 World Building 🌌 <@&1232395644702949396>\n" +                        
                        "- <#1332787076676190310> Before the forum writing was posted here, feel free to look over what people posted many months ago!\n" +
                        "- <#1332787171584901183> Discuss and talk shop with World Builders about all things World Building!\n" +
                        "- <#1332788312716476608> Any cool resources you know of that you think others might find interesting for the purposes of World Building you should share with us here! Or checkout what other cool tools people have shared :AttoviaFire:\n" +
                        "- <#1335010811516555274> Share maps and art from your setting(s)!\n" +
                        "- <#1374429330012115056> Have a question about someone's setting/world? Ask them here!\n" +
                        "- <#1376960471554457671> Currently an unnused project similar to Shoutout Saturday that never took off!\n" +
                        "### Forums\n" +
                        "- <#1332787009923580048> Every day I post the Build Together prompt for the day in this channel! If you have an idea for a prompt post it in the <#1390165892947640482> forum and tag it as a Prompt Suggestion!\n" +
                        "- <#1390165892947640482> This is the Build Together forum where you can post your response to the daily promtp! Make sure to check out the tags and the post guidelines!\n" +
                        "- <#1403469524673499227> The general share writing forum, any kind of creative writing you want to share can be shared here just check the post guidelines!\n" +
                        "- <#1390084868855042182> If you have an interesting thought for a plot, character or really any kind of concept that might elicit an interesting piece of art that you don't care to have ownership over, drop it here for anyone to use! Or use something someone else has put here! But please give some kind of attribution!\n" +
                        "### Let's Play!\n" +
                        "- <#1334390484583448659> Read this before playing in or running a game!\n" +
                        "- <#1334282710814031882> If you are looking for players for a campaign or oneshot, post here after reading the rules!\n" +
                        "- <#1334282750164996201> General scheduling channel for those without their own.\n" +
                        "- <#1337300510042099733> Share campaign ideas you might not want to run yourself.\n" +
                        "🐲 Dungeon Mastery 🎲 <@&1232395729977213099>\n" +
                        "- <#1402798909830463579> Share your homebrews for any TTRPG system here with the community!\n" +
                        "- <#1333853327414526073> For all things TTRPG discussion! Keep it civil, but go ham >.<\n" +
                        "- <#1333853418854289469> For sharing advice with your fellow DM/GMs!\n" +
                        "- <#1332766498649014313> Show us what tools you use when running TTRPGs!\n" +
                        "- <#1332786726447612096> Chat about more niche stuff here! Gone are the 5th Editions and Pathfinders from this blessed place :P\n" +
                        "- <#1232406679820173372> Anything DM/GM oriented you find neat!\n" +
                        "- <#1232407610842681344> A less organized way to share homebrews.\n" +
                        "- <#1344422315982717021> Want advice from fellow DM/GMs? Ask here!\n" +
                        "### spammy\n" +
                        "- <#1333590743838756947> For tracking your server level! I'll let you know when you level up, but feel free to use `/level` or `/leaderboard` any time here!\n" +
                        "- <#1333590850252570675> Any bot commands that might spam another channel can go here :)\n" +
                        "- <#1349807102792695903> Just post whatever here so long as it doesn't break server rules :P\n" +
                        "- <#1367558860222627940> Do you create content? Do you do commissions? Please post here and let us know what you do/offer!\n" +
                        "- <#1375886343657361478> Used to move the Attovian calendar forward when the main campaign progresses in time!\n"
                    )
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setDescription("AttoviaBot looks happy")
                    .setURL(ABPictures.happy)
            )
    )
    .setAccentColor(0xc57bf3)
    .addActionRowComponents(
        actionRowComponent => actionRowComponent
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("previous-page")
                    .setLabel("Page 1")
                    .setEmoji("⬅️" as APIMessageComponentEmoji)
                    .setStyle(ButtonStyle.Secondary)
            )
    )
    let response = await interaction.reply({components: [container], flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2})
    let buttonEmitter = interaction.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId === "next-page") {
            await interaction.deferReply({flags: MessageFlags.Ephemeral})
            await response.edit({components: [container2], flags: MessageFlags.IsComponentsV2})
            await interaction.deleteReply();
        }
        if (interaction.customId === "previous-page") {
            await interaction.deferReply({flags: MessageFlags.Ephemeral})
            await response.edit({components: [container], flags: MessageFlags.IsComponentsV2})
            await interaction.deleteReply();
        }
    })
    await EventEmitterCleanup(buttonEmitter, interaction, 100000);
}