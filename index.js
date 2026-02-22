require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

const SOFI_BOT_ID = '853629533855809596'
const DROP_LISTEN_TIME = 30 * 1000
const COOLDOWN_TIME = 8 * 60 * 1000

const activeListeners = new Map()

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`)
})

client.on('messageCreate', async (message) => {

  // ===== USER SD COMMAND =====
  if (!message.author.bot) {

    const content = message.content.toLowerCase()

    if (content !== 'sd') return

    const channelId = message.channel.id
    const userId = message.author.id

    console.log(`📝 SD command from ${message.author.tag}`)

    if (activeListeners.has(channelId)) {
      console.log(`⚠️ Already listening here`)
      return
    }

    console.log(`👂 Listening for Sofi drop for 30 seconds...`)

    const timeout = setTimeout(() => {
      console.log(`⌛ No drop detected — stopped listening`)
      activeListeners.delete(channelId)
    }, DROP_LISTEN_TIME)

    activeListeners.set(channelId, { userId, timeout })
  }

  // ===== SOFI MESSAGE =====
  if (message.author.id === SOFI_BOT_ID) {

    const channelId = message.channel.id

    if (!activeListeners.has(channelId)) return

    // Normalize message (remove markdown like **)
    const normalized = message.content
      .toLowerCase()
      .replace(/\*/g, '')

    console.log(`🤖 Sofi message detected:`)
    console.log(normalized)

    if (!normalized.includes('is dropping cards')) {
      console.log(`❌ Not drop message`)
      return
    }

    console.log(`🎴 Drop detected — starting cooldown timer`)

    const data = activeListeners.get(channelId)

    clearTimeout(data.timeout)
    activeListeners.delete(channelId)

    setTimeout(async () => {
      try {
        await message.channel.send(`<@${data.userId}> you can drop again in Sofi`)
        console.log(`🔔 Reminder sent`)
      } catch (err) {
        console.log(`❌ Reminder failed`, err)
      }
    }, COOLDOWN_TIME)
  }

})

client.login(process.env.TOKEN)