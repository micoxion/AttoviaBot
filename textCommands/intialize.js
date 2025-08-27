const { guildId, BTTags, SWTags } = require('../config.json')
const { hasMessageBeenCounted, recordMessageTracked } = require('../database/messagesCounted.js')
const { updateWordCount } = require('../database/writers.js')
const { countWords } = require('../utility/word-counter.js')
const { logToFile } = require('../utility/logger.js')

let total = 0

async function trackMessage(messages) {
    let messageId = messages.at(-1).id
    let messageContent = messages.at(-1).content
    let messageName = messages.at(-1).name
    let user = messages.at(-1).author
    logToFile("Tracking messages: " + messageId)
    let alreadyTracked = await hasMessageBeenCounted(messageId)
    if (alreadyTracked) {
        return;
    }
    await updateWordCount(user.id, countWords(messageContent), user.username)
    logToFile("Updated word count")
    await recordMessageTracked(messageId)        
    logToFile("Recorded message tracked")
    await messages.at(-1).react("✅")
    logToFile(`${user.username} : ${user.id} | ${messageName}\n
            Message ID: ${messageId} | Wordcount = ${countWords(messageContent)}
                \n${messageContent}`)
    total++;
}

exports.intialize = async function(client) {
    total = 0
    const guild = client.guilds.cache.get(guildId)
    const buildTogetherForum = await guild.channels.fetch("1390165892947640482")
    const shareWritingForum = await guild.channels.fetch("1403469524673499227")
    const archivedBT = await buildTogetherForum.threads.fetchArchived({fetchAll: true, limit: 100}, true)
    const activeBT = await buildTogetherForum.threads.fetchActive()
    const archivedSW = await shareWritingForum.threads.fetchArchived({fetchAll: true, limit: 100}, true)
    const activeSW = await shareWritingForum.threads.fetchActive()

    logToFile("=====> Beginning archived BT threads initialization <=====")
    for (const [k, v] of archivedBT.threads) {
        if (v.appliedTags.includes(BTTags.PromptSuggestion)) {
            continue;
        }
        await v.setArchived(false);
        const messages = await v.messages.fetch({limit: 100})
        await trackMessage(messages)
        await v.setArchived(true)
    }

    logToFile("=====> Beginning active BT threads initialization <=====")
    for (const [k, v] of activeBT.threads) {
        if (v.appliedTags.includes(BTTags.PromptSuggestion)) {
            continue;
        }
        //console.log("Active thread named: ", v.name)
        const messages = await v.messages.fetch({limit: 100})
        await trackMessage(messages)
    }

    logToFile("=====> Beginning archived SW threads initialization <=====")
    for (const [k, v] of archivedSW.threads) {
        if (v.appliedTags.includes(SWTags.MetaDiscussion)) {
            continue;
        }
        await v.setArchived(false)
        const messages = await v.messages.fetch({limit: 100})
        await trackMessage(messages)
        await v.setArchived(true)
    }

    logToFile("=====> Beginning active SW threads initialization <=====")
    for (const [k, v] of activeSW.threads) {
        if (v.appliedTags.includes(SWTags.MetaDiscussion)) {
            continue;
        }
        const messages = await v.messages.fetch({limit: 100})
        await trackMessage(messages)
    }

    logToFile("Total messages tracked: " + total);    
}