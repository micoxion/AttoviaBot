const { guildId, BTTags } = require('../config.json')
const { countWords } = require('../utility/word-counter.js')

exports.intialize = async function(client) {
    const guild = client.guilds.cache.get(guildId)
    const buildTogetherForum = await guild.channels.fetch("1390165892947640482")
    console.log(buildTogetherForum)
    const archived = await buildTogetherForum.threads.fetchArchived({fetchAll: true, limit: 100}, false)
    const active = await buildTogetherForum.threads.fetchActive()
    //console.log(archived)
    //console.log(active)
    const forumThreads = guild.channels.cache.filter((x) => {return x = x.isThread() && x.parentId === "1390165892947640482"});
    let archivedCount = 0
    let activeCount = 0
    console.log(archived.threads)
    for (const [k, v] of archived.threads) {
        if (v.appliedTags.includes(BTTags.PromptSuggestion)) {
            continue;
        }

        archivedCount++;
        console.log("Archived thread named: ", v.name)
    }
    for (const [k, v] of active.threads) {
        if (v.appliedTags.includes(BTTags.PromptSuggestion)) {
            continue;
        }
        activeCount++;
        console.log("Active thread named: ", v.name)
        if (v.name == "The Power Of The People. [[R&B]]") {
            const messages = await v.messages.fetch({limit: 100})
            console.log(countWords(messages.first().content))
            console.log(messages.first().content)
            console.log(messages.first().author)
        }
    }
    console.log("Archived count: ", archivedCount, " Active count: ", activeCount)
}