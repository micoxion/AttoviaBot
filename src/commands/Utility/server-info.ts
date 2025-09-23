import { EmbedBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server-info")
        .setDescription("Get a verbose rundown of the server and how you can participate!"),
    async execute(interaction: ChatInputCommandInteraction) {
        let embed = new EmbedBuilder()
            .setColor(0xc57bf3)
            .setTitle("Server Info")
            .setAuthor({ name: 'AttoviaBot', iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription("### Overview\n" +
                "We are a community of World Builders, Writers, Dungeon Masters, Artists and generally just lots of creative types! Primarily the focus here is World Building but even if that's not your jam there is nothing stopping you from sharing whatever it is your passionate about here!\n\n" +
                "For those of you who are coming here for the world building side the most important things to track are the World Building category channels, and the <#1332787009923580048> channel where I post the daily Build Together prompt that you can post your response to in the <#1390165892947640482> forum! If you tag your response with Shoutout Saturday I'll read it aloud in the Shoutout Saturday bi-monthly video!\n\n" +
                "Everything else is listed in more detail in the below sections split up by channel category. Feel free to ping any <@&1348749811972833330> or <@331634391790911488> if you have any questions!"
            )
            .setFields(
                { 
                    name: "📣 Administration 📝", 
                    value: 
                    "- <#1232399840055398420> Please read this :)\n" +
                    "- <#1309324855677550717> Anything server wide or community oriented gets posted here! Like web fishing game nights, and the weekly Sharing Saturday reminder.\n" +
                    "- <#1346603740848984186> Any social posts supported by the Sapphire Bot get posted here! Grab the <@&1346594304851710122> role if you want to be pinged by this channel!\n" +
                    "- <#1255936478614126757> Whenever I push new updates or documents to the Attovia wiki I will send a message here and ping the <@&1255993879149285408> role!\n" +
                    "- <#1232400118066708611> Where we all once stood :head_shaking_vertically:.\n" +
                    "- <#1232405575321780297> If you have any recommendations, suggestions or questions regarding the server send them here!\n" +
                    "- <#1332074921060339876> Go here to get any relevent roles you see listed here!\n"
                },
                {
                    name: "🔔 Attovian Dailies 📰",
                    value: 
                    "- <#1389271495582417057> Not currently active but you can still answer any of <@512108088061591583>'s previous questions that are there!\n" +
                    "- <#1387457544770813974> Grab the <@&1387467938306723851> role if you want to be pinged by <@827694081362231357> whenever they post a new daily fact!\n" +
                    "- <#1417198716653146136> <@527633223681966107> posts daily video game music for you to enjoy! Grab the <@&1417198974988718110> role if you want to be pinged when he does so!\n" +
                    "- <#1419748827455422574> Our server has come to regularly play wordle, play with us here! No spoilers!"
                },
                {
                    name: "🍻 Common Room 🗣",
                    value:
                    "- <#1232395395129282595> For any general discussion or chatting! We aren't strict at all on what that means so don't think too hard about it xD\n" +
                    "- <#1352395627761373204> For anyone to post any kind of positive message, image, meme or statement! A place to encourage and to be encouraged <3\n" +
                    "- <#1232753006055919687> If you are so inclined feel free to introduce yourself to us here or see how other's have introduced themselves! No requirement to do so though so please don't feel any pressure!\n" +
                    "- <#1332852995099983964> Share any fun, wacky, serious, dramatic or otherwise interesting session highlights from TTRPGs your running or playing in!\n" +
                    "- <#1339006716037173401> For our adorable furry friends to get some attention which they never get enough of <3\n" +
                    "- <#1344914250539339777> For any kind of hobby sharing/discussion! Show us what cool hyperfixations you have, we've all got them here :joy:\n"
                },
                { 
                    name: "",
                    value:
                    "- <#1363912693328908500> A place for pictures of hobbies, collections, food and anything you want to show off!\n" +
                    "- <#1237126681139871857> Does what it says on the tin baby, post and enjoy memes!\n" +
                    "- <#1397962622116171796> Help grow the server's tree!"
                },
                {
                    name: "Forums",
                    value: 
                    "- <#1332787009923580048> Every day I post the Build Together prompt for the day in this channel! If you have an idea for a prompt post it in the <#1390165892947640482> forum and tag it as a Prompt Suggestion!\n" +
                    "- <#1390165892947640482> This is the Build Together forum where you can post your response to the daily promtp! Make sure to check out the tags and the post guidelines!\n" +
                    "- <#1390084868855042182> If you have an interesting thought for a plot, character or really any kind of concept that might elicit an interesting piece of art that you don't care to have ownership over, drop it here for anyone to use! Or use something someone else has put here! But please give some kind of attribution!\n"
                },
                {
                    name: "⚔ THE BIG GAME 🐉",
                    value:
                    "- <#1344014375253573766> Checkout what the rules of participating are and how it works!\n" +
                    "- <#1344009157405048902> Here you can read how the game has gone so far!\n" +
                    "- <#1344007673409966123> Here you can jump into or check your place in the player queue! When its your turn you'll be pinged by me with the <@&1344009445822431387> role!\n" +
                    "- <#1344747561885503608> For any discussion or hyping up of fellow heros as it relates to the story!\n" +
                    "- <#1345087693708595250> If you have any other questions or are still confused after looking over the rules then ask away here!"
                }
            )
        await interaction.reply({embeds: [embed], ephemeral: true})
    }
}