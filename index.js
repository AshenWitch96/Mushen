require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return

  if (message.content.toLowerCase().includes('sd')) {
    setTimeout(() => {
      message.reply('Reply after 8 minutes ⏰')
    }, 8 * 60 * 1000)
  }
})

client.login(process.env.TOKEN)