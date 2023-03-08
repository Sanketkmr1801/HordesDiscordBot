import discord
import os
from multithreading import CustomThread
from player_info import get_top_player_clan_list 
import json
import requests

class_code = {
    0: 'war',
    1: 'mage',
    2: 'arch',
    3: 'sham'
}

clan_position_code = {
    0: "member",
    1: "assistant",
    2: "officer",
    3: "owner"
}

faction_code = {
    0: "vg",
    1: "bl"
}

headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'}

clan_member_fetch_url = "https://hordes.io/api/claninfo/info"
clan_search_url = "https://hordes.io/api/claninfo/list"

def download_clan_info_by_tag(tag):
        clan = {}
        clan_data = requests.post(clan_member_fetch_url, headers = headers, data = json.dumps({"tag": tag})).json()
        
        if(clan_data.get("members") != None):
            clan[tag] = []
            clan["faction"] = clan_data["faction"]
            clan["tag"] = clan_data["tag"]
            for member in clan_data["members"]:
                if(member["online"]):
                    clan[tag].append(member)
                    print("...")
        
        return clan

def member_to_string(dict): 
    res = ""
    res += f'{dict["name"]}({dict["level"]}) {class_code[dict["class"]]} {clan_position_code[dict["clanrole"]]}'
    return res 

def print_clans(clans):
    print_messages = []
    print_message = ""
    for tag in clans:
        print_message = ""
        class_count = [0, 0, 0, 0]
        total_online = 0
        if(len(clans[tag]) == 0): continue
        seperator = f'\n\n{tag}\n'
        print(seperator)
        print_message += seperator
        for member in clans[tag]:
            class_count[member["class"]] += 1
            total_online += 1
            print(member)
            print_message += member_to_string(member) + "\n"

        class_message = f"War: {class_count[0]}, Mage: {class_count[1]}, Arch: {class_count[2]}, Sham: {class_count[3]}"
        total_player_message = f"Total: {total_online}"
        print_message += class_message + " " + total_player_message + "\n"
        print(class_message)
        print(total_player_message)
        print_messages.append(print_message)

    return print_messages

def get_clan_list_by_name(name, limit):
    limited_clan_list = []
    clan_list = requests.post(clan_search_url, headers = headers, data = json.dumps({"name": name, "order": 1})).json()
    current = 0
    for clan in clan_list["clans"]:
        current += 1
        limited_clan_list.append(clan)
        if(current > limit):
            break
    
    return limited_clan_list

def download_specific_clan_info(name, limit):

    clan_list = get_clan_list_by_name(name, limit)
    clans = {}

    for clan in clan_list:
        clan_data = requests.post(clan_member_fetch_url, headers = headers, data = json.dumps({"tag": clan["tag"]})).json()
        
        if(clan_data.get("members") != None):

            clan_members = clan_data["members"]
            clans[clan["tag"]] = []

            for member in clan_members:
                status = member["online"]
                if(status):
                    clans[clan["tag"]].append(member)
                    print(".*.")
    return clans

def get_clan_list():
    clan_url = "https://hordes.io/api/claninfo/list"
    clan_fetch_data = {"name": "", "order": 1}


    clan_list = requests.post(clan_url, headers = headers, data = json.dumps(clan_fetch_data)).json()
    clan_list = clan_list["clans"]

    return clan_list

#returns list of bl or vg clans
def download_clan_by_faction(faction, limit):
    current = 0
    clan_list = get_clan_list()
    clans = {}
    filtered_clan_list = []

    for clan in clan_list:
        if(clan["faction"] == faction):
            current += 1
            filtered_clan_list.append(clan)

        if current >= limit:
            break
    thread_list = []
    for clan in filtered_clan_list:
        clan_thread = CustomThread(target = download_clan_info_by_tag, args = (clan["tag"], ))
        clan_thread.start()
        thread_list.append(clan_thread)

    for clan_thread in thread_list:
        clan_data = clan_thread.join()
        clans[clan_data["tag"]] = clan_data[clan_data["tag"]]
    return clans

# Returns a dict of all_clans , 0 key for VG, 1 for BL
def download_top_clan_info(limit, priority_clan_list = []):
    clan_list = {}

    all_clans = {0: {}, 1: {}}
 
    clan_url = "https://hordes.io/api/claninfo/list"
    clan_fetch_data = {"name": "", "order": 1}

    if(len(priority_clan_list) == 0):
        clan_list = requests.post(clan_url, headers = headers, data = json.dumps(clan_fetch_data)).json()
        clan_list = clan_list["clans"]
    else:
        clan_list = priority_clan_list

    current = 0
    thread_list = []
    for clan in clan_list:
        current += 1
        if (current > limit): break
        clan_thread = CustomThread(target = download_clan_info_by_tag, args = (clan["tag"], ))
        clan_thread.start()
        thread_list.append(clan_thread)

    for clan_thread in thread_list:
        clan_data = clan_thread.join()
        all_clans[clan_data["faction"]][clan_data["tag"]] = clan_data[clan_data["tag"]]

    return all_clans

def print_all_clans(limit):
    all_clans = download_top_clan_info(limit)
    print("==========================================VG CLANS=========================================\n")
    print_clans(all_clans[0])
    print("==========================================BL CLANS=========================================\n")
    print_clans(all_clans[1])

async def bot_print_clans(clans, message):
    res = "```"
    for clan in clans:
        if clan != None:
            res += clan
    res += "```"
    await message.channel.send(f"{res}")

# print(download_clan_info_by_tag("-AE"))

# DISCORD CODE BELOW

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

token = ""

with open("token.txt", 'r') as file:
    token = file.read()


@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))

@client.event
async def on_message(message):
    if message.author == client.user: return

    if(message.content[0] == "!"):
        command = message.content.split(" ")[0]

        if(command.lower() == "!vg"):
            vg_clans = print_clans(download_clan_by_faction(0, 10))
            await bot_print_clans(vg_clans, message)
            await message.channel.send("Done")


        if(command.lower() == "!bl"):
            bl_clans = print_clans(download_clan_by_faction(1, 10))
            await bot_print_clans(bl_clans, message)
            await message.channel.send("Done")

        if(command.lower() == "!topclans"):
            all_clans = download_top_clan_info(20)
            vg_clans = print_clans(all_clans[0])
            bl_clans = print_clans(all_clans[1])

            await message.channel.send("\n__**VG CLANS**__")
            await bot_print_clans(vg_clans, message)
            
            await message.channel.send("\n__**BL CLANS**__")
            await bot_print_clans(bl_clans, message)

            await message.channel.send("Done")

        if(command.lower() == "!allclans"):
            clan_list = get_top_player_clan_list(2)
            all_clans = download_top_clan_info(20, clan_list)
            vg_clans = print_clans(all_clans[0])
            bl_clans = print_clans(all_clans[1])

            await message.channel.send("__**VG CLANS**__")
            await bot_print_clans(vg_clans, message)
            
            await message.channel.send("__**BL CLANS**__")
            await bot_print_clans(bl_clans, message)

            await message.channel.send("Done")

        if(command.lower() == "!clan"):
            input = message.content
            clan_input = input.split(" ")[1]
            result = print_clans(download_specific_clan_info(clan_input, 1))
            if(len(result) != 0):
                await message.channel.send(result[0])
            else: 
                await message.channel.send("**No members online**")
            await message.channel.send("Done")

client.run(token = token)
