import requests
import json
from multithreading import download_clan_info_by_tag
import time

# headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'}

# print(download_clan_info_by_tag(None))

currentTime = time.gmtime(time.time())
hour = 24 - currentTime.tm_hour
min = 60 - currentTime.tm_min
day = 3 - currentTime.tm_wday

if(day < 0):
    day += 6
print(day, hour, min)