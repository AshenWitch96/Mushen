require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const SOFI_BOT_ID = '853629533855809596';
const TIMER = 8 * 60 * 1000;

const pendingSD = new Map();
const cooldowns = new Map();

client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content.toLowerCase() !== 'sd') return;

  const userId = message.author.id;

  if (cooldowns.has(userId) && cooldowns.get(userId) > Date.now()) {
    return;
  }

  pendingSD.set(message.id, {
    userId: userId,
    channelId: message.channel.id,
    createdAt: Date.now()
  });
});

client.on('messageCreate', async (message) => {

  if (message.author.id !== SOFI_BOT_ID) return;

  if (!message.content.toLowerCase().includes('dropping cards')) return;

  if (!message.reference?.messageId) return;

  const data = pendingSD.get(message.reference.messageId);
  if (!data) return;

  const channel = await client.channels.fetch(data.channelId).catch(() => null);
  if (!channel) return;

  setTimeout(async () => {
    await channel.send(`<@${data.userId}> you are ready to drop cards in sofi`);
  }, TIMER);

  cooldowns.set(data.userId, Date.now() + TIMER);
  pendingSD.delete(message.reference.messageId);
});

client.login(process.env.TOKEN);