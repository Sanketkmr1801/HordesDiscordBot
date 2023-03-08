import json
import requests

headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'}

url = "https://hordes.io/api/playerinfo/search"


def get_top_player_clan_list(offset):
    players = {}
    clan_tags = {}
    for i in range(0, offset + 1):
        data = {"name": "", "order": "fame", "limit": 100, "offset": i * 100}
        res = requests.post(url, headers = headers, data = json.dumps(data)).json()
        for record in res:
            players[record["name"]] = record

    for name in players:

        clan_tag = players[name]["clan"]
        if(clan_tags.get(clan_tag) == None):
            clan_tags[clan_tag] = 1
        else:
            clan_tags[clan_tag] += 1

    del clan_tags[None]
    count = 0
    clan_list = []
    for tag in clan_tags:
        if(clan_tags[tag] != 1):
            count += 1
            clan_list.append({"tag": tag})

    print(f"Count: {count}")     

    return clan_list
