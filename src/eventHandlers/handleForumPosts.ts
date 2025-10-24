import { ChannelType, EmbedBuilder, Message, MessageFlags, ThreadChannel } from "discord.js";
import { buildSuccessContainer } from "../commenContainers/Success.js";
import { recordMessageTracked } from "../database/postgres/messagesCounted.js";
import { updateWordCount, updateStreak } from "../database/postgres/writers.js";
import { logToFile } from "../utilities/logger.js";
import { createWorker } from "tesseract.js";
import { buildMistakeContainer } from "../commenContainers/Mistake.js";
import { countWords } from "../utilities/word-counter.js";
import { createRequire } from 'node:module';
import { buildErrorContainer } from "../commenContainers/Error.js";
const require = createRequire(import.meta.url);
const { BTForumId, SWForumId, BTTags, SWTags } = require('../../config.json')


async function trackForumPostWords(thread: ThreadChannel, message: Message, wordCountToAdd: number) {
  let newWordCount = await updateWordCount(message.author.id, wordCountToAdd, message.author.username)
  logToFile("Updated word count for " + message.author.username)
  //await recordMessageTracked(message.id, message.author.id, message.author.username)
  await recordMessageTracked(message.id)
  logToFile("Message successfully tracked")
  await message.react("✅");
  logToFile(`${message.author.username} : ${message.author.id} | ${thread.name}\n
          Message ID: ${message.id} | Wordcount = ${wordCountToAdd}
              \n${message.content}`)
  let reply = await updateStreak(message.author.id, message.author.username, message)
  let container = buildSuccessContainer("<@" + message.author.id + "> " + wordCountToAdd + " words added to your total! Your new wordcount is: " + newWordCount + reply)
  // let embed = new EmbedBuilder()
  //       .setColor(0xc57bf3)
  //       .setTitle(message.author.username + '\'s words counted.')
  //       .setDescription(wordCountToAdd + " words added to your total! Your new wordcount is: " + newWordCount + reply)
  await thread.send({components: [container], flags: MessageFlags.IsComponentsV2})//wordCountToAdd + " words added to your total! Your new wordcount is: " + newWordCount + reply)
}

export async function handleForumPost(thread: ThreadChannel) {
    if (!thread.parent || thread.parent.type != ChannelType.GuildForum) {
    return;
  }
  if (thread.parent.id === BTForumId && !thread.appliedTags.includes(BTTags.PromptSuggestion) && !thread.appliedTags.includes(BTTags.MetaDiscussion)) {
    //must wait to ensure the forum post's starter message is properly available in the API
    await new Promise(resolve => setTimeout(resolve, 2000))
    let message = await thread.fetchStarterMessage().catch((reason) => {console.log(reason)}) //messages.values().toArray()[0];
    let maxRetry = 10
    let tries = 0
    while (message == null && tries < maxRetry) {
      await new Promise(resolve => setTimeout(resolve, 500))
      message = await thread.fetchStarterMessage().catch((reason) => {console.log(reason)})
      tries++;
    }
    if (message == null) {
      const errorContainer = buildErrorContainer("Could not retrieve starter message of thread, please manually count the message. Sorry ;-;")
      await thread.send({components: [errorContainer], flags: MessageFlags.IsComponentsV2})
      return;
    }
    const attachments = message.attachments
    console.log("Attachments: ", attachments)
    if (attachments.size >= 1 && thread.appliedTags.includes(BTTags.Screenshot)) {
      let wordCountTotal = 0
      for (const [id, attachment] of attachments) {
        console.log("Attachment: ", attachment)
        logToFile("An image was posted by " + message.author.username);
        //await thread.send("We are working on supporting images with tessaract soon but for now a manual word count command is in the works!");
        const worker = await createWorker('eng');
        console.log("Attachment url: " + attachment.url)
        const ret = await worker.recognize(attachment.url);
        logToFile("Tesseract read attachment as: " + ret.data.text);
        wordCountTotal += countWords(ret.data.text);
      }
      logToFile("Tracking build Together image post: " + thread.name + " | Message: " + message.id);
      await trackForumPostWords(thread, message, wordCountTotal)
      return
    } else if (message.content == undefined || message.content == "") {
      let container = buildMistakeContainer("I saw no words to count, if you supplied a screenshot with some writing make sure you use the Screenshot tag!")
      await thread.send({components: [container], flags: MessageFlags.IsComponentsV2});
      return
    }
    let wordCount = countWords(message.content)
    logToFile("Tracking created Build Together post: " + thread.name + " | Message: " + message.id)
    trackForumPostWords(thread, message, wordCount)
  }
  if (thread.parent.id === SWForumId && !thread.appliedTags.includes(SWTags.MetaDiscussion)) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    let message = await thread.fetchStarterMessage().catch((reason) => {console.log(reason)}) //messages.values().toArray()[0];
    let maxRetry = 10
    let tries = 0
    while (message == null && tries < maxRetry) {
      await new Promise(resolve => setTimeout(resolve, 500))
      message = await thread.fetchStarterMessage().catch((reason) => {console.log(reason)})
      tries++;
    }
    if (message == null) {
      const errorContainer = buildErrorContainer("Could not retrieve starter message of thread, please manually count the message. Sorry ;-;")
      await thread.send({components: [errorContainer], flags: MessageFlags.IsComponentsV2})
      return;
    }
    const attachments = message.attachments
    console.log("Attachments: ", attachments)
    if (attachments.size >= 1 && thread.appliedTags.includes(SWTags.Screenshot)) {
      let wordCountTotal = 0
      for (const [id, attachment] of attachments) {
        console.log("Attachment: ", attachment)
        logToFile("An image was posted by " + message.author.username);
        //await thread.send("We are working on supporting images with tessaract soon but for now a manual word count command is in the works!");
        const worker = await createWorker('eng');
        console.log("Attachment url: " + attachment.url)
        const ret = await worker.recognize(attachment.url);
        logToFile("Tesseract read attachment as: " + ret.data.text);
        wordCountTotal += countWords(ret.data.text);
      }
      logToFile("Tracking build Together image post: " + thread.name + " | Message: " + message.id);
      trackForumPostWords(thread, message, wordCountTotal)
      return
    } else if (message.content == undefined || message.content == "") {
      let embed = new EmbedBuilder().setDescription("I saw no words to count, if you supplied a screenshot with some writing make sure you use the Screenshot tag!");
      await thread.send({embeds: [embed]})
      return
    }
    
    let wordCount = countWords(message.content)
    logToFile("Tracking created Share Writing post: " + thread.name + " | Message: " + message.id)
    trackForumPostWords(thread, message, wordCount)
  }
}