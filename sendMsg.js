import client from "./discord_bot.js";
import { AttachmentBuilder } from "discord.js";

export default async function sendFile(filepath) {
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    const file = new AttachmentBuilder(filepath);
    try {
      const message = await channel.send({ content: 'Here is your file:', files: [file] });
      return message.id;
    } catch (error) {
      console.error('Error sending file:', error);
      throw error; 
    }
  }
  