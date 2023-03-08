import requests
import json
import threading

headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'}

clan_member_fetch_url = "https://hordes.io/api/claninfo/info"
clan_search_url = "https://hordes.io/api/claninfo/list"

class CustomThread(threading.Thread):
    def __init__(self, group=None, target=None, name=None,
                 args=(), kwargs={}, Verbose=None):
        threading.Thread.__init__(self, group, target, name, args, kwargs)
        self._return = None
 
    def run(self):
        if self._target is not None:
            self._return = self._target(*self._args, **self._kwargs)
             
    def join(self, *args):
        threading.Thread.join(self, *args)
        return self._return

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


def download_clan_info_by_tag(tag):
        clan = {}
        clan_data = requests.post(clan_member_fetch_url, headers = headers, data = json.dumps({"tag": tag})).json()
        
        if(clan_data.get("members") != None):
            clan[tag] = []
            for member in clan_data["members"]:
                if(member["online"]):
                    clan[tag].append(member)
        
        return clan
        

# t1 = threading.Thread(target = download_specific_clan_info, args = ("ae", 1))
# t2 = threading.Thread(target = download_specific_clan_info, args = ("lf", 1))

# t1.start()
# t2.start()

# t1.join()
# t2.join()

# t1 = CustomThread(target = download_clan_info_by_tag, args = ("-AE",))
# t2 = CustomThread(target = download_clan_info_by_tag, args = ("~LF~",))
# t3 = CustomThread(target = download_clan_info_by_tag, args = ("~LF~",))
# t4 = CustomThread(target = download_clan_info_by_tag, args = ("~LF~",))
# t1.start()
# t2.start()
# t3.start()
# t4.start()
# print(t1.join())
# print(t2.join())
# print(t3.join())
# print(t4.join())
