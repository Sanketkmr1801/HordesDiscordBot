// Set up Discord.js client
const Discord = require('discord.js');
const {Client, GatewayIntentBits, AttachmentBuilder} = require("discord.js");
const client = new Discord.Client({
    intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});
const prefix = '!'; // You can change the prefix here

client.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'input') {
    // Prompt for user input
    const prompt = await message.channel.send('Please enter your input: ');

    // Wait for user response
    const filter = (response) => response.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1 });

    collector.on('end', async (collected) => {
      // Delete the prompt message
      await prompt.delete();

      // Send output message
      const input = collected.first().content;
      await message.channel.send(`Your input is: ${input}`);
    });
  }
});
client.login('MTA4Mjc1OTQwMzg4NDc5Mzk1OQ.GNzVmS.Xhsi5PzoBDN8ttxAYeJVdQqEPmTcEexnQ_RBc8');