import client from "./discord_bot.js";
export default async function getAttechmentUrlByMessageId(msgId) {
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    const fetchedMessage = await channel.messages.fetch(msgId);
    for (let [key, value] of fetchedMessage.attachments) {
      return value; 
    }
}