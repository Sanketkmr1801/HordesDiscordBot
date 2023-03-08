import discord
from prestige_info import predict, get_prestige_info

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

token = "MTA4MTU3MjkzNzY3MDMzNjY1Mg.GBB4wO._pWS0tUF9mmKHBvtdAbQ2yEqSR0u1DTsqCfEDo"

@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))

@client.event
async def on_message(message):
    if message.author == client.user: return
    if(message.content[0] == "!"):
        command = message.content.split(" ")[0]

        if(command.lower() == "!prestige"):
            name = message.content.split(" ")[1]
            await message.channel.send(predict(name))

        if(command.lower() == "!pinfo"):
            await message.channel.send(get_prestige_info())    
client.run(token = token)