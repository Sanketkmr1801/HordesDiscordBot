import requests
import json
import time


headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'}

prestige_bracket = [0, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000]

battle_rank_prestige = [4000, 8000, 12000, 16000, 20000, 24000, 28000, 32000, 36000, 40000, 44000, 48000]
# Rank	 Vanguard Title	 Bloodlust Title	Bonus	Prestige Points
battle_rank_bonuses = [
    {'stat': '5 Movement Speed'},
    {'stat': '50 MP'},
    {'stat': '15% Item Find'},
    {'stat': '5 Min & Max Damage'},
    {'stat': '2 HP & MP Reg./5s'},
    {'stat': '5 Movement Speed'},
    {'stat': '30 HP'},
    {'stat': '15% Item Find'},
    {'stat': '5% Critical'},
    {'stat': '3% Haste'},
    {'stat': '30 HP'}, 
    {'stat': '5 Min & Max Damage'}
]

def prettify(n, w):
    s = str(n)
    w = w - len(s)
    if w < 0: w = 0
    return s + " " * w

def get_prestige_reset_time():
    currentTime = time.gmtime(time.time())
    hour = 24 - currentTime.tm_hour
    min = 60 - currentTime.tm_min
    day = 3 - currentTime.tm_wday

    if(day < 0):
        day += 6
    
    print_message = f" In {day} day, {hour} hour, {min} min"
    print(day, hour, min)
    return print_message

def calculate_prestige_to_battle_rank(prestige):
    for i in range(0, len(battle_rank_prestige)):
        if(prestige < battle_rank_prestige[i]):
            return i

    return len(battle_rank_prestige)

def calculate_prestige_onreset(bracket, prestige):
    prestige = 0.8 * prestige + prestige_bracket[bracket]
    return prestige

def get_fame_per_bracket(faction = 0, both = False):
    prestige_fetch_url = "https://hordes.io/api/pvp/getfactionpercentiles"
    prestige_requirement = requests.get(prestige_fetch_url).json()

    if(both == False):
        prestige_requirement = prestige_requirement[faction]
    
    return prestige_requirement

def get_player_info_by_name(name):
    player_fetch_url = "https://hordes.io/api/playerinfo/search"
    
    data = {"name": name, "order": "fame", "limit": 100, "offset": 0}

    players = requests.post(player_fetch_url, headers = headers, data = json.dumps(data)).json()

    for player in players:
        if(player["name"].lower() == name.lower()):
            return player

def get_player_bracket(fame, faction):
    fame_bracket = get_fame_per_bracket(faction)

    for i in range(0, len(fame_bracket)):
        if(fame < fame_bracket[i]):
            return i

def suggest_prestige(prestige):
    current_battlerank = calculate_prestige_to_battle_rank(prestige)
    prestige_to_hold_battlerank = battle_rank_prestige[current_battlerank - 1]
    prestige_to_climb_battlerank = -1
    print(f"Current Battle Rank: {current_battlerank} Prestige to hold battle rank: {prestige_to_hold_battlerank}")
    
    if(current_battlerank < len(battle_rank_prestige)):
        prestige_to_climb_battlerank = battle_rank_prestige[current_battlerank]

    print(f"Prestige to climb battle rank: {prestige_to_climb_battlerank}")
    prestige_bracket_to_hold_battlerank = 0
    prestige_bracket_to_climb_battlerank = 0

    for i in range(0, len(prestige_bracket)):
        new_prestige = prestige * 0.8 + prestige_bracket[i]

        if(new_prestige >= prestige_to_hold_battlerank):
            prestige_bracket_to_hold_battlerank = i
            break


    for i in range(0, len(prestige_bracket)):
        new_prestige = prestige * 0.8 + prestige_bracket[i]

        if(prestige_to_climb_battlerank != -1):
            if(new_prestige >= prestige_to_climb_battlerank):
                prestige_bracket_to_climb_battlerank = i
                break

    print_message = ""
    print_message += f"\nHold Rank At: Bracket {prestige_bracket_to_hold_battlerank}"
    if(prestige_to_climb_battlerank != -1):
        print_message += f"\nNext Rank At: Bracket {prestige_bracket_to_climb_battlerank}"
    else: print_message += "\nAlready At Max rank"
    return print_message

def predict(name):

    player = get_player_info_by_name(name)
    print(player)

    current_bracket = get_player_bracket(player["fame"], player["faction"])
    current_prestige = player["prestige"]
    current_crown_rank = calculate_prestige_to_battle_rank(current_prestige)
    new_prestige = int(calculate_prestige_onreset(current_bracket, player["prestige"]))
    new_crown_rank = calculate_prestige_to_battle_rank(new_prestige)
    suggestion = suggest_prestige(current_prestige)

    print_message = "\n__Current__\n"
    print_message += f'Name: {player["name"]}\n'
    print_message += f'Crown Rank: {current_crown_rank}, Prestige: {player["prestige"]}, Fame Bracket: {current_bracket}, Fame: {player["fame"]}\n'
    print_message += f"\n__On Reset__\n"
    print_message += f' Crown Rank: {new_crown_rank}, Prestige: {new_prestige}, (12 is last crown)\n'
    print_message += suggestion
    print_message += f"\n**RESET IN: {get_prestige_reset_time()}**"

    print("CURRENT: ")
    print(f'Name: {player["name"]}, Fame Bracket: {current_bracket}, Fame: {player["fame"]}, Prestige: {player["prestige"]}, Crown Rank: {current_crown_rank}')
    print("ON RESET")
    print(f'Prestige: {new_prestige}, Crown Rank: {new_crown_rank} (12 is last crown)')

    return print_message

def get_prestige_info():
    print_message = "```"
    prestige_requirement = get_fame_per_bracket(0, True)
    print_message += "Rank Vangaurd   Bloodlust  Prestige  (Fame Brackets)\n"
    for i in reversed(range(0, len(prestige_requirement[0]))):
        print_message += f"{prettify(i + 1, 4)} {prettify(prestige_requirement[0][i], 10)} {prettify(prestige_requirement[1][i], 10)} {prettify(prestige_bracket[i + 1], 10)}\n"
    print(f"Rank\t Prestige\t Bonus\t ")
    print_message += f"\n\nRank Prestige  Prestige Bonuses  (Crown Ranks)\n"
    for i in reversed(range(0, len(battle_rank_bonuses))):
        stat_bonus = battle_rank_bonuses[i]["stat"]
        print(f"{i + 1} {battle_rank_prestige[i]} {stat_bonus}")
        print_message += f"{prettify(i + 1, 4)} {prettify(battle_rank_prestige[i], 9)} {stat_bonus}\n"
    print_message += "```"
    return print_message

