import client from "./discord_bot.js";
export default async function deleteMsgById(msgId) {
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    await channel.messages.delete(msgId);
}