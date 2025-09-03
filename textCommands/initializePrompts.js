const { dailyPromptChannelId, guildId } = require('../config.json')
const { fetchAllMessages } = require('../utility/fetchAllMessages.js')
const { addPrompt } = require('../database/prompts.js')

exports.initializePrompts = async function(client) {
    const guild = client.guilds.cache.get(guildId);
    const dailyPromptChannel = await guild.channels.fetch(dailyPromptChannelId);
    let messages = await fetchAllMessages(dailyPromptChannel);
    for (const message of messages) {
        
        let content = message.content;
        let day = content.match(/Day ([0-9]+)/)
        if (!day) {
            continue;
        }
        let messageLink = message.url
        day = day[1]
        //day = day[0].match(/[0-9]+/g)[0]
        //console.log("\n", day)
        let promptText = content.match(/[^0-9][>].+/g)
        if (promptText != null && promptText.length > 0) {
            promptText = promptText[0].trim().substring(1).trim()
            //promptText = promptText.trim()
        } else {
            promptText = ""
        }
        let source = content.match(/From.+|from.+/g)
        if (source == null) {
            source = ""
        }
        else {
            source = source[0]
        }
        let date = message.createdAt
        //console.log(message)
        console.log("====> ", content, " | ", promptText, " : ", source, " : ", date, " : \nDAY: ", day)

        await addPrompt({
            day: day,
            prompt: promptText,
            date: date,
            source: source,
            originalMessage: messageLink
        })
        
        //console.log(day)
    }
    //console.log(messages) 1364642570642395186 
}