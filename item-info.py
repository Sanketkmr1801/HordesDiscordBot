import httpx
import json
from datetime import datetime
client = httpx.Client(http2=True)

headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'}

url = "https://hordes.io/api/item/get"

cookies = {"sid": "s%3AGWEoCTWLEDndF2rr0cj5TFzBbhyTpVoi.V4P9FTPc7mLwD2C4X1hMi3xNon5DnjwK0oGd3nZU%2F3Y	"}

headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'}

data = {"ids": [124763159]}

res = client.post(url, cookies = cookies, headers = headers, data = json.dumps(data))

print(res.json())

# Item Lookup
# Adventurer's Rucksack +6
# Rare Bag 83%
# 15 Bag Slots 
# + 3.5% Critical 56%
# + 3.5% Haste 89%
# + 14 Dexterity 78%

[{'id': 124763159, 'slot': None, 'bound': 0, 'type': 'bag', 'upgrade': 6, 'tier': 1,
   'rolls': [83, 89, 28, 87, 95, 12, 72, 68, 78, 16, 79, 94, 1, 83, 44, 24, 3, 50, 61, 50, 92], 'stacks': None}]


rndArrayFixed = lambda t, e: t[int(e*t.length)]


class CoreItem:
    def __init__(self, t):
        self.dbid = t
        self.stats = {}
        self.dirty = False

    def hydrate(self, t):
        if not self.dirty:
            self.bound = t['bound']
            self.type = t['type']
            self.tier = t['tier']
            self.logic = logic[self.type + self.tier]
            self.auction = datetime.datetime.strptime(t['auction'], '%Y-%m-%d %H:%M:%S.%f') if t.get('auction') else None
            self.auctionprice = t.get('auctionprice')
            self.owner = t.get('name')
            self.stash = datetime.datetime.strptime(t['stash'], '%Y-%m-%d %H:%M:%S.%f') if t.get('stash') else None
            if self.logic is None:
                raise Exception(f"Unknown item {t['type']}{t['tier']}")
            self.upgrade = t.get('upgrade')
            self.stats.clear()
            if t.get('rolls'):
                if self.setRolls(t['rolls']):
                    self.quality = self.nextRoll()
                    for e, t in self.logic.stats.items():
                        self.stats[e] = {
                            'type': 'base',
                            'qual': self.quality,
                            'value': math.floor(t['min'] + (t['max'] - t['min']) * (self.quality / 100) ** 2 + upgradeGains[e] * self.upgrade)
                        }
                    t = min(4, round((self.quality / 100) ** 1.5 * 3.6))
                    for i in range(t):
                        roll = self.nextRoll()
                        stat_key = -1
                        while stat_key in self.stats:
                            stat_key = int(rndArrayFixed(randomStatKeys, roll / 101))
                            roll = (roll + 5) % 100
                        n = (self.nextRoll() + self.quality) / 2
                        self.stats[stat_key] = {
                            'type': 'bonus',
                            'qual': n,
                            'value': math.ceil(max((randomStats[stat_key]['min'] + (randomStats[stat_key]['max'] - randomStats[stat_key]['min']) * (n / 100) ** 2) * self.logic['level'] * types[self.type]['weight'], upgradeGains[stat_key]) + upgradeGains[stat_key] * self.upgrade)
                        }
                self.quality = self.logic.get('quality', self.quality)
                self.stacks = None
            else:
                self.stacks = t.get('stacks')
                self.quality = self.logic.get('quality', 0)
            self.gs = 0
            if self.logic.get('gs'):
                self.gs = self.logic['gs']
            else:
                for e, t in self.stats.items():
                    if e == 17:
                        continue
                    n = t['value'] / upgradeGains[e]
                    if self.type == 'shield' and t['type'] == 'base':
                        n *= .5
                    if self.type == 'orb' and t['type'] == 'base':
                        n *= .7
                    self.gs += n
            self.gs = round(self.gs)

    def setRolls(self, t):
        self.rolls = t
        self.currentRoll = 0

    def nextRoll(self):
        if self.currentRoll == len(self.rolls):
            raise Exception("roll maximum reached")
        roll = self.rolls[self.currentRoll]
        self.currentRoll