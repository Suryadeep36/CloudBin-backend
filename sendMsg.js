import client from "./discord_bot.js";
import { AttachmentBuilder } from "discord.js";

export default async function sendFile(filename, data) {

    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    const buffer = Buffer.from(data);
    const file = new AttachmentBuilder(buffer, {
      name: filename
    });
    try {
      const message = await channel.send({ content: 'Here is your file:', files: [file] });
      return message.id;
    } catch (error) {
      console.error('Error sending file:', error);
      throw error; 
    }
  }
  