axios = require('axios')
const {Canvas} = require('canvas')
const {CoreItem} = require('./pve')
const {items} = require('./items')
const puppeteer = require('puppeteer');

token = "blank"
const sid = "s%3AIQG6VdkDIcxvNgwLVwBoka5roe74Abad.5YE71sARi5MTSDqU%2BgZ6AJDG9TnR2JhbbGXqprzEGtY"

const prestigeBracket = [0, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000]

const battleRankPrestige = [4000, 8000, 12000, 16000, 20000, 24000, 28000, 32000, 36000, 40000, 44000, 48000]
const buffStatTable = {
    "arctic": {"Critical": 12},
    "enchant": {"Min Dmg": 8, "Max Dmg": 17},
    "unholy": {"Min Dmg": 12, "Max Dmg": 16, "HP": 200},
    "crusader": {"Defense": 120, "MP Reg./5s": 8.8},
    "canine": {"Haste": 40},
    "temporal": {"Haste": 12},
    "cranial": {"Critical": 12}
  }

const classCode = {
  0: 'Warrior',
  1: 'Mage',
  2: 'Arhcer',
  3: 'Shaman'
}

const factionCode = {
  0: "Vanguard",
  1: "Bloodlust"
}

const colorObj = {
    "common": "Grey",
    "uncommon": "#3fb85d",
    "rare": "#2184FC",
    "epic": "#B32EFF",
    "legendary": "#FF9E00",
    "godly": "#FF2715"
}

const statObj = ['Strength', 'Stamina', 'Dexterity', 'Intelligence', 'Wisdom', 'Luck', 'HP', 'MP', 'HP Reg./5s', 'MP Reg./5s', 'Min Dmg', 'Max Dmg', 'Defense', 'Block', 'Critical', 'Move Spd', 'Haste', 'Atk Spd', 'Item Find', 'Bag Slots', 'Fame', 'Rating', 'Stat Points', 'Skill Points', 'Skill Points (Max)', 'Gear Score', 'PvP Level', '% Increased Dmg.', '% Increased Aggro Generation', '% Movement Spd. Reduction', 'Healing Reduction']

url = "https://hordes.io/api/item/get"

data = {"ids": ["117700716"]}

axios.defaults.withCredentials = true;

const options = {
    headers: {Cookie : `sid=${sid}`}
}

function prestigeToBattleRank(prestige) {
  for (let i = 0; i < battleRankPrestige.length; i++) {
    if (prestige < battleRankPrestige[i]) {
      return i;
    }
  }
  return battleRankPrestige.length;
}

const colorCssClass = {
  "common": "white",
  "uncommon": "green",
  "rare": "blue",
  "epic": "purp",
  "legendary": "orange",
  "godly": "red"
}

const getRarityOfItem = (percent) => {
    if(percent <= 50) return "common"
    if(percent <= 69) return "uncommon"
    if(percent <= 89) return "rare"
    if(percent <= 98) return "epic"
    if(percent <= 109) return "legendary"
    return "godly"
}

const getMessageColor = (percent) => {
    rarity = getRarityOfItem(percent)
    return colorObj[rarity]
}

const capitalize = (s) => {
    if(!s) return ""
    return s[0].toUpperCase() + s.slice(1)
}

const getItemCanvas = (item = "", width = 220, height = 220, scaleFactor = 5) => {

    //Prepare the canvas
    itemName = items[item.type][item.tier]["name"]
    const canvas = new Canvas(width * scaleFactor, height * scaleFactor)
    
    const context = canvas.getContext('2d')
    context.scale(scaleFactor, scaleFactor)
    context.imageSmoothingEnabled = true
    context.fillStyle = '#000'
    context.fillRect(0, 0, width, height)
    context.strokeStyle = getMessageColor(item.quality)
    context.lineWidth = 5
    context.strokeRect(0, 0, width, height)

    context.fillStyle = "White"
    context.font = "30px Arial"

    baseStatFont = "14px Arial"
    bonusStatFont = "14px Arial"
    gearScoreFont = "12px Arial"
    idFont = "11px Arial"
    mediumFont = "16px Arial"
    smallFont = "13px Arial"
    fonts = [
        "18px Arial",
        "15px Arial",
        gearScoreFont
    ]

    hinc = [35, 20, 20, 0, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19]
    colors = []
    curHinc = hinc[0]

    printMessage = []
    if(itemName.length > 19) {
        printMessage.push(`${itemName} +${item.upgrade}`)
        fonts[0] = mediumFont
        fonts[1] = smallFont
    } else {
        printMessage.push(`${itemName} +${item.upgrade}`)
    }
    colors.push(getMessageColor(item.quality))
    
    if(item.upgrade === null) item.upgrade = "0" 
    printMessage.push(`T${item.tier} ${capitalize(getRarityOfItem(item.quality))} ${capitalize(item.type)} ${item.quality}%`)
    colors.push("White")

    gearScoreMessage = `GS:${item.gs}`
    colors.push(colorObj["uncommon"])
    printMessage.push(gearScoreMessage)

    idMessage = `\t\tID:${item.id}`, 6
    colors.push(colorObj["common"])
    fonts.push(idFont)
    printMessage.push(idMessage)

    for(let key in item.stats) {
        stat = item.stats[key]
        if(key == "Atk Spd") continue
        bonusMessage = ""
        if(stat.type === "base") {
            bonusMessage += `${stat.value} ${key} `
            fonts.push(baseStatFont)
        } else if(stat.type === "bonus") {
            bonusMessage += `+ ${stat.value} ${key} ${stat.qual}%`
            fonts.push(bonusStatFont)
        }
        printMessage.push(bonusMessage)
        colors.push(getMessageColor(stat.qual))
    }

    console.log("TOTAL MESSAGES PRINTED: ", printMessage.length)
    //populating the canvas
    for(let i = 0; i < printMessage.length; i++) {
        if(printMessage[i] === undefined) continue
        context.font = fonts[i]
        context.fillStyle = colors[i]
        context.fillText(printMessage[i], 11, curHinc)
        curHinc += hinc[i + 1]
    }

    return canvas
}

const combineCanvases = (canvases, padding = 1) => {
    try {
        let hlimit = 3, wlimit = 3
        let originalHeight = canvases[0].height, originalWidth = canvases[0].width
        let len = canvases.length
        let col = 1, row = 1
        if(len >= hlimit) col = hlimit
        else col = len
        row = Math.ceil(len / wlimit)
        const combinedCanvas = new Canvas(width = originalWidth * col + padding * len, height = originalHeight * row + padding * len)
        const context = combinedCanvas.getContext('2d')
    
        let canvasIdx = 0
        for(let i = 0; i < hlimit; i++) {
            for(let j = 0; j < wlimit; j++) {
                console.log("drawing new canvas at ", j * width, j)
                context.drawImage(canvases[canvasIdx++], j * (originalWidth + padding), i * (originalHeight + padding))
                if(canvasIdx >= len) return combinedCanvas
            }
        }
    
        return combinedCanvas
    } catch (e) {
        return undefined
    }

}

function prettify(n, w) {
    let s = String(n);
    w = w - s.length;
    if (w < 0) w = 0;
    return s + " ".repeat(w);
}

const getItem = async (ids, itemUpgradeTable = []) => {
    data = {ids: ids}
    const res = await axios.post(url, data, options)
    .then(response => {
      newItems = []
        let items = response.data
        if(!items["fail"]) {
            for(let i = 0; i < items.length; i++) {
                let coreItem = new CoreItem(items[i]["id"])
                items[i].upgrade = itemUpgradeTable[items[i]["id"]]
                coreItem.hydrate(items[i])

                const {stats, quality, gs, upgrade, bound, type, tier, dbid} = coreItem
                const level = coreItem.logic.level
                verbose_stats = {}
                for(let [key, val] of stats) {
                    // new_stat = {statObj[key]: val}
                    verbose_stats[statObj[key]] = val
                    if(statObj[key] === "Critical" || statObj[key] === "Haste" || statObj[key] === "Block") {
                        verbose_stats[statObj[key]]["value"] /= 10
                        verbose_stats[statObj[key]]["value"] += "%"
                        continue
                    }
                    if(statObj[key] === "MP Reg./5s" || statObj[key] === "HP Reg./5s") {
                        verbose_stats[statObj[key]]["value"] /= 10
                        continue
                    }
                    if(statObj[key] === "Item Find") {
                        verbose_stats[statObj[key]]["value"] += "%"
                        continue 
                    }
                }
                let newItem = {
                    stats: verbose_stats,
                    quality: quality,
                    gs: gs,
                    upgrade: upgrade,
                    bound: bound,
                    type: type,
                    tier: tier,
                    id: dbid,
                    level: level
                }
                newItems.push(newItem)
            }
            return newItems
        }
    });
    return res
}

async function getPlayerInfo(name) {
  const playerFetchUrl = "https://hordes.io/api/playerinfo/search";
  
  const data = {"name": name, "order": "fame", "limit": 100, "offset": 0};
  
  const response = await fetch(playerFetchUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  const players = await response.json();
  
  for (const player of players) {
    if (player.name.toLowerCase() == name.toLowerCase()) {
      return player;
    }
  }
}

const getArenaRatingIndex = (elo) => {
    if(elo >= 2200) return 4
    if(elo >= 2000) return 3
    if(elo >= 1800) return 2
    if(elo >= 1600) return 1
    return 0
}

const getStats = async (items, player, options) => {
  let {statPointStat, buffs, isMaxPrestige} = options
  playerClass = player.pclass
  if(isMaxPrestige === true) player.prestige = battleRankPrestige[battleRankPrestige.length - 1]

  const mainStats = ["Strength", "Stamina", "Dexterity", "Intelligence", "Wisdom", "Luck"]
  const stats = {
    "HP": 100 + player.level * 8,
    "HP Reg./5s": 2,
    "MP": 100,
    "MP Reg./5s": 3,
    "Defense": 15,
    "Block": 0,
    "Min Dmg": 0,
    "Max Dmg": 0,
    "Atk Spd": 10,
    "Critical": 5.0,
    "Haste": 0,
    "Move Spd": 15,
    "Bag Slots": 0,
    "Item Find": 0.5,
    "Gear Score": 0,
    "Strength": 10,
    "Stamina": 12,
    "Dexterity": 10,
    "Intelligence": 10,
    "Wisdom": 10,
    "Luck": 5,
    "Move Spd": 105,
  }
  const statConversionTable = {
    "Strength": {"HP": 2, "HP Reg./5s": 0.03},
    "Stamina": {"Defense": 1, "HP": 4},
    "Dexterity": {"Critical": 0.05},
    "Intelligence": {"MP": 0.8, "Critical": 0.04},
    "Wisdom": {"MP": 0.8, "Haste": 0.03},
    "Luck": {"Critical": 0.02, "Item Find": 0.5}
  }
  if(classCode[player.pclass] !== "arch") {
    buffs["cranial"] = false
  }
  const buffUrlTable = {
    "arctic": "https://hordes.io/assets/ui/skills/22.webp?v=5699699",
    "enchant": "https://hordes.io/assets/ui/skills/24.webp?v=5699699",
    "unholy": "https://hordes.io/assets/ui/skills/19.webp?v=5699699",
    "crusader": "https://hordes.io/assets/ui/skills/20.webp?v=5699699",
    "canine": "https://hordes.io/assets/ui/skills/28.webp?v=5699699",
    "temporal": "https://hordes.io/assets/ui/skills/25.webp?v=5699699",
    "cranial": "https://hordes.io/assets/ui/skills/26.webp?v=5699699"
  }
  const charmTable = {
    "Little Bell": 0,
    "Hardened Egg": 1,
    "Tattooed Skull": 2,
    "Ship Penant": 3,
    "Blue Marble": 4,
  }
  const charmUrl = []
  let buffHtmlTag = ""
  for(let buff in buffs) {
    if(buffs[buff] === true) {
        buffStatBonus = buffStatTable[buff]
        buffUrl = buffUrlTable[buff]
        buffHtmlTag += 
        `<div style="position: relative;">
        <img src="${buffUrl}" style="width: 25px;">
        <div class="bufftext">4</div>
        </div>`
        for(let statName in buffStatBonus) {
            stats[statName] += buffStatBonus[statName]
        }
    }
  }

  classStat = {
    0: "Strength",
    1: "Intelligence",
    2: "Dexterity",
    3: "Wisdom"
  }
  bloodlineStat = classStat[playerClass]

  //Miscellenious stat addition / argument input
  stats[bloodlineStat] += 1 * player.level
  stats["Stamina"] += 2 * (player.level - 1)
  if(statPointStat === undefined) statPointStat = bloodlineStat
  stats[statPointStat] += player.level * 3

  //input class code
  const bloodlineStatTable = {
    0: {"Min Dmg": 0.3, "Max Dmg": 0.3, "HP Reg./5s": 0.3},
    1: {"Min Dmg": 0.4, "Max Dmg": 0.4},
    2: {"Min Dmg": 0.4, "Max Dmg": 0.4}, 
    3: {"Min Dmg": 0.4, "Max Dmg": 0.4},
  }

  bloodlineStatBonus = bloodlineStatTable[playerClass]
  for(let stat in bloodlineStatBonus) {
    if(!statConversionTable[bloodlineStat][stat]) {
      statConversionTable[bloodlineStat][stat] = bloodlineStatBonus[stat]
    } else {
      statConversionTable[bloodlineStat][stat] += bloodlineStatBonus[stat]
    }
  }

  let battleRank = prestigeToBattleRank(player.prestige)

  const prestigeBonusStats = {
    1 :  {"Move Spd": 5},// 5 Movement Speed
    2 :  {"MP": 50},// 50 MP
    3 :  {"Item Find": 15},// 15% Item Find
    4 :  {"Min Dmg": 5, "Max Dmg": 5},// 5 Min & Max Damage
    5 :  {"MP Reg./5s": 2, "HP Reg./5s": 2},// 2 HP & MP Reg./5s
    6 :  {"Mov Spd": 5},// 5 Movement Speed
    7 :  {"HP": 30},// 30 HP
    8 :  {"Item Find": 15},// 15% Item Find
    9 :  {"Critical": 5},// 5% Critical
    10 :  {"Haste": 3},// 3% Haste
    11 :  {"HP": 30},// 30 HP
    12 :  {"Min Dmg": 5, "Max Dmg": 5}, // 5 Min & Max Damage
  }

  for(let i = 1; i <= battleRank; i++) {
    let prestigeBonusStat = prestigeBonusStats[i]
    for(let stat in prestigeBonusStat) {
      if(!stats[stat]) {
        stats[stat] = prestigeBonusStat[stat]
      } else {
        stats[stat] += prestigeBonusStat[stat]
      }
    }
  }

  for(let item of items) {
    let itemStats = item["stats"]
    for(let statName in itemStats) {
      let statVal = itemStats[statName]["value"]
      if(statName === "Haste" || statName === "Critical" || statName === "Item Find" || statName === "Block") {
        statVal = Number(itemStats[statName]["value"].split("%")[0])
      }
      if(!stats[statName]) {
        stats[statName] = statVal
      } else {
        stats[statName] += statVal
      }
    }
    stats["Gear Score"] += item["gs"]
  }

  for(let statName in statConversionTable) {
    const bonusStats = statConversionTable[statName]
    for(let bonusStatName in bonusStats) {
      stats[bonusStatName] += bonusStats[bonusStatName] * stats[statName]
    }
  }

  for(let statName in stats) {
    if(String(stats[statName]).split(".")[1]) {
      len = String(stats[statName]).split(".")[1].length
      if(len > 3) stats[statName] = stats[statName].toFixed(2)
    }
  }

  async function screenshotHtml(html) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({
      width: 640,
      height: 480,
      deviceScaleFactor: 2
    });
    await page.setContent(html);
    const elementHandle = await page.$('#statSheet');

    
    const screenShotBuffer = await elementHandle.screenshot();
    await browser.close();
    return screenShotBuffer
    }

    distinctSlots = [ "weapon",  "armlet",  "armor",  "bag",  "boot",  "glove",  "ring",  "amulet",  "offhand"]
    
    itemSlots = {
      "hammer": "weapon",
      "bow": "weapon",
      "staff": "weapon",
      "sword": "weapon",
      "armlet": "armlet",
      "armor": "armor",
      "bag": "bag",
      "boot": "boot",
      "glove": "glove",
      "ring": "ring",
      "amulet": "amulet",
      "quiver": "offhand",
      "shield": "offhand",
      "totem": "offhand",
      "orb": "offhand"
    }
    itemUrl = {
      
    }
    noItemUrl = {

    }
    slotCss = {

    }
    slotUpgrade = {

    }
    itemUrlQValue = {
      "common": "0",
      "uncommon": "1",
      "rare": "2",
      "epic": "3",
      "legendary": "1",
      "godly": "1"
    }
    //bunch of true and false

    seedNoItemUrl = 101
    for(let slot of distinctSlots) {
      noItemUrl[slot] = `https://hordes.io/assets/ui/slotbg/${seedNoItemUrl++}.webp?v=5699699`
    }

    const specialCss = {}
    //specialCssTable is for hue
    const specialCssTable = {
        "legendary": 285,
        "godly": 225    
    }
    for(let item of items) {
      if(item.type.toLowerCase() === "charm") {
        charmUrl.push(`https://hordes.io/assets/items/charm/charm${item.tier}_q3.webp?v=5700123`)
        continue
      }
      let quality = item.quality
      let type = item.type
      let tier = item.tier
      let upgrade = item.upgrade
      let slot = itemSlots[type]
      let rarity = getRarityOfItem(quality)
      itemUrl[slot] = `https://hordes.io/assets/items/${type}/${type}${tier}_q${itemUrlQValue[rarity]}.webp?v=5700123`
      slotCss[slot] = `${colorCssClass[rarity]} filled`
      slotUpgrade[slot] = "+" + upgrade
      if(rarity == "legendary" || rarity === "godly") {
        specialCss[slot] = `style="filter: hue-rotate(${specialCssTable[rarity]}deg);"`
      } else {
        specialCss[slot] = ""
      }
    }
    const charmSlotCss = []
    for(let i = 0; i < 2; i++) {
        if(!charmUrl[i]) {
            charmUrl[i] = `https://hordes.io/assets/ui/slotbg/111.webp?v=5699699`
            charmSlotCss[i] = "grey"
        } else {
            charmSlotCss[i] = "purp"
        }
    }
    for(let slot of distinctSlots) {
      if(!itemUrl[slot]) {
        itemUrl[slot] = noItemUrl[slot]
        slotCss[slot] = "grey"
        slotUpgrade[slot] = ""
      }
    }
    let eHP = Math.round((stats["HP"]) * 100 / (100 - (1 - Math.exp(-(Number(stats["Defense"])) * 0.0022)) * 0.87) * (125/(125 - Number(stats["Block"]))))
    let eDps = Math.round((Number(stats["Min Dmg"]) + Number(stats["Max Dmg"])) / 2 * (100 + Number(stats["Critical"])) / 100 * (100 + Number(stats["Haste"])) / 100)
    let eBurst = Math.round((Number(stats["Min Dmg"]) + Number(stats["Max Dmg"])) / 2 * (100 + Number(stats["Critical"])) / 100)
    const arenaRatingUrl = `https://hordes.io/assets/ui/elo/${getArenaRatingIndex(player.elo)}.svg?v=5699699`
    const htmlString = 
  `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StatSheet</title>
      <style> .l-canvas,.l-ui{
        position:absolute;
        width:100%;
        height:100%;
        pointer-events:none
    }
    .bufftext{
    background-color: #10131dcc;
    position: absolute;
    color: #dae8ea;
    right: 0;
    bottom: 3px;
    line-height: 8px;
    font-size: 13px;
    padding: 2px 1px 3px;
    border-radius: 2px;
    z-index: 10;
    font-weight: 700
    }
    .l-ui{
        z-index:2;
        user-select:none;
        -moz-user-select:none;
        overflow:hidden
    }
    .l-canvas{
        z-index:0
    }
    .l-corner-lr,.l-corner-ll,.l-corner-ul,.l-corner-ur{
        padding:4px;
        position:absolute
    }
    .l-corner-ur{
        right:0;
        top:0;
        transform-origin:top right
    }
    .l-corner-ul{
        left:0;
        top:0;
        transform-origin:top left
    }
    .l-corner-ll{
        left:0;
        bottom:0;
        transform-origin:bottom left
    }
    .l-corner-lr{
        right:0;
        bottom:0;
        transform-origin:bottom right
    }
    .l-upperLeftModal{
        position:absolute;
        margin:87px 4px 0 4px;
        left:0;
        right:0;
        z-index:10;
        transform-origin:top left
    }
    @font-face{
        font-display:fallback;
        font-family:"hordes";
        font-style:normal;
        font-weight:normal;
        src:local("Quicksand Medium"), local("Quicksand-Medium"), url(https://fonts.gstatic.com/s/quicksand/v9/6xKodSZaM9iE8KbpRA_p2HcYT8L_.woff2) format("woff2");
        unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD
    }
    @font-face{
        font-display:fallback;
        font-family:"hordes";
        font-style:normal;
        font-weight:bold;
        src:local("Quicksand Bold"), local("Quicksand-Bold"), url(https://fonts.gstatic.com/s/quicksand/v9/6xKodSZaM9iE8KbpRA_pkHEYT8L_.woff2) format("woff2");
        unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD
    }
    :root{
        --primary:#F5C247;
        --secondary:#a6dcd5;
        --fame:#FE48FC;
        --exp:#FAA244;
        --pvp:#EA00FF;
        --party:#2ED3F6;
        --mana:#026EF4;
        --grey:#5b858e;
        --panel:rgba(16, 19, 29, 0.8);
        --name:#DAE8EA;
        --spell:#E7D510;
        --item:#E7D510;
        --enemy:#F42929;
        --health:#33D123;
        --f0:#458BD9;
        --f1:#C32929;
        --f2:#A2A2A2;
        --c0:#C7966F;
        --c1:#21A9E1;
        --c2:#98CE64;
        --c3:#1C51FF;
        --c4:#A35AC2;
        --c5:#AD4F4F;
        --clan:#EE960B;
        --global:#FFCB9D;
        --purp:#9E3BF9;
        --blue:#0681EA;
        --green:#34CB49
    }
    .bgf0{
        background:linear-gradient(0deg, #458BD9 0%, #3a73b3 49%, #458BD9 50%)
    }
    .bgf1{
        background:linear-gradient(0deg, #C32929 0%, #9f2527 49%, #C32929 50%)
    }
    .bgf2{
        background:linear-gradient(0deg, #A2A2A2 0%, #858587 49%, #A2A2A2 50%)
    }
    .bgc0{
        background:linear-gradient(0deg, #C7966F 0%, #a27c5f 49%, #C7966F 50%)
    }
    .bgc1{
        background:linear-gradient(0deg, #21A9E1 0%, #1e8bba 49%, #21A9E1 50%)
    }
    .bgc2{
        background:linear-gradient(0deg, #98CE64 0%, #7da956 49%, #98CE64 50%)
    }
    .bgc3{
        background:linear-gradient(0deg, #1C51FF 0%, #1a45d2 49%, #1C51FF 50%)
    }
    .bgc4{
        background:linear-gradient(0deg, #A35AC2 0%, #864ca1 49%, #A35AC2 50%)
    }
    .bgc5{
        background:linear-gradient(0deg, #AD4F4F 0%, #8e4345 49%, #AD4F4F 50%)
    }
    .bgenemy{
        background:linear-gradient(0deg, #F42929 0%, #c62527 49%, #F42929 50%)
    }
    .bgmana{
        background:linear-gradient(0deg, #026EF4 0%, #055cc9 49%, #026EF4 50%)
    }
    .bghealth{
        background:linear-gradient(0deg, #33D123 0%, #2cab22 49%, #33D123 50%)
    }
    .bgexp{
        background:linear-gradient(0deg, #FAA244 0%, #cb853c 49%, #FAA244 50%)
    }
    .bggrey{
        background:linear-gradient(0deg, #5b858e 0%, #4c6e77 49%, #5b858e 50%)
    }
    .bgblack{
        background:linear-gradient(0deg, rgba(16, 19, 29, 0.8) 0%, rgba(16, 19, 29, 0.84) 49%, rgba(16, 19, 29, 0.8) 50%)
    }
    .bgspell{
        background:linear-gradient(0deg, rgba(231, 213, 16, 0.5) 49%, rgba(207, 191, 14, 0.5) 50%)
    }
    .bgtut{
        background:linear-gradient(0deg, #F5C247 0%, #c79f3f 49%, #F5C247 50%)
    }
    .bgpurp{
        background:linear-gradient(0deg, #9E3BF9 0%, #8233cd 49%, #9E3BF9 50%)
    }
    .btn,kbd,.card,.panel,.panel-bright,.panel-black,select option{
        padding:4px;
        border-radius:3px;
        pointer-events:all
    }
    .border{
        border-radius:3px
    }
    .border.auto{
        border:3px solid #f3e551
    }
    .border.party{
        border:3px solid #0ac8f1
    }
    .border.primary{
        border:3px solid #F5C247
    }
    .border.secondary{
        border:3px solid #11b59c
    }
    .border.white{
        border:3px solid #5b858e
    }
    .border.white.glow{
        box-shadow:inset 0 0 0px 3px #323232, inset 0 0 6px 7px #354e53
    }
    .border.green{
        border:3px solid #34CB49
    }
    .border.green.glow{
        box-shadow:inset 0 0 0px 3px #162818, inset 0 0 6px 7px #185d22
    }
    .border.blue{
        border:3px solid #0681EA
    }
    .border.blue.glow{
        box-shadow:inset 0 0 0px 3px #0d283f, inset 0 0 6px 7px #034278
    }
    .border.purp{
        border:3px solid #9E3BF9
    }
    .border.purp.glow{
        box-shadow:inset 0 0 0px 3px #42176a, inset 0 0 6px 7px #5e05af
    }
    .border.teal{
        border:3px solid #2db393
    }
    .border.red{
        border:3px solid #DE1A17
    }
    .border.red.glow{
        box-shadow:inset 0 0 0px 3px #271515, inset 0 0 6px 7px #511414
    }
    .border.yellow{
        border:3px solid #E7D510
    }
    .border.orange{
        border:3px solid #F48C10
    }
    .border.cyan{
        border:3px solid #3BCFE5
    }
    .border.grey{
        border:3px solid #293c40
    }
    .border.grey.glow{
        box-shadow:inset 0 0 0px 3px black, inset 0 0 6px 7px #070b0b
    }
    .border.black{
        border:3px solid rgba(16, 19, 29, 0.8)
    }
    .border.f0{
        border:3px solid #458BD9
    }
    .border.f1{
        border:3px solid #C32929
    }
    .border.f2{
        border:3px solid #A2A2A2
    }
    .border.c0{
        border:3px solid #C7966F
    }
    .border.c1{
        border:3px solid #21A9E1
    }
    .border.c2{
        border:3px solid #98CE64
    }
    .border.c3{
        border:3px solid #1C51FF
    }
    .border.c4{
        border:3px solid #A35AC2
    }
    .border.c5{
        border:3px solid #AD4F4F
    }
    .panel,.panel-bright,.panel-black,select option{
        color:#a6dcd5
    }
    .textright{
        text-align:right
    }
    .panel-black,select option{
        background-color:rgba(16, 19, 29, 0.8)
    }
    .panel-bright{
        background-color:#19202d
    }
    .panel-black.selected{
        background-color:rgba(91, 133, 142, 0.2);
        box-shadow:0 0 4px 0px #eae41b, inset 0 0 9px 2px #f1c421
    }
    .card{
        background-color:rgba(16, 19, 29, 0.5);
        padding:24px
    }
    .cardinfo{
        margin-top:4px
    }
    .cardinfo:not(:last-child){
        margin-bottom:12px
    }
    kbd{
        background-color:rgba(91, 133, 142, 0.4);
        color:#fff;
        padding:0 3px;
        font-family:inherit
    }
    .btn{
        padding:3px;
        cursor:pointer;
        border:3px solid rgba(0, 0, 0, 0);
        color:#DAE8EA;
        transition:background-color 0.15s, color 0.15s, border 0.15s;
        font-weight:bold;
        white-space:nowrap;
        text-overflow:ellipsis;
        overflow:hidden
    }
    .btn.auto{
        background-color:#f3e551
    }
    .btn.auto:hover{
        border:3px solid white;
        background-color:#f5e968
    }
    .btn.party{
        background-color:#0ac8f1
    }
    .btn.party:hover{
        border:3px solid #fbfeff;
        background-color:#1fd0f5
    }
    .btn.primary{
        background-color:#F5C247
    }
    .btn.primary:hover{
        border:3px solid white;
        background-color:#f6ca5f
    }
    .btn.secondary{
        background-color:#11b59c
    }
    .btn.secondary:hover{
        border:3px solid #cbfaf3;
        background-color:#13ccb0
    }
    .btn.white{
        background-color:#5b858e
    }
    .btn.white:hover{
        border:3px solid #f2f6f6;
        background-color:#66939d
    }
    .btn.green{
        background-color:#34CB49
    }
    .btn.green:hover{
        border:3px solid white;
        background-color:#48d05b
    }
    .btn.blue{
        background-color:#0681EA
    }
    .btn.blue:hover{
        border:3px solid aliceblue;
        background-color:#118ef9
    }
    .btn.purp{
        background-color:#9E3BF9
    }
    .btn.purp:hover{
        border:3px solid white;
        background-color:#aa54fa
    }
    .btn.teal{
        background-color:#2db393
    }
    .btn.teal:hover{
        border:3px solid #e6f9f4;
        background-color:#32c7a4
    }
    .btn.red{
        background-color:#E72926
    }
    .btn.red:hover{
        border:3px solid #f6dada;
        background-color:#bb2f2f
    }
    .btn.yellow{
        background-color:#E7D510
    }
    .btn.yellow:hover{
        border:3px solid #fefef8;
        background-color:#f0de21
    }
    .btn.orange{
        background-color:#EE960B
    }
    .btn.orange:hover{
        border:3px solid #fffdf9;
        background-color:#f5a11e
    }
    .btn.cyan{
        background-color:#3BCFE5
    }
    .btn.cyan:hover{
        border:3px solid white;
        background-color:#52d5e8
    }
    .btn.grey{
        background-color:#293c40
    }
    .btn.grey:hover{
        border:3px solid #a4bfc5;
        background-color:#334b50
    }
    .btn.black{
        background-color:rgba(16, 19, 29, 0.8)
    }
    .btn.black:hover{
        border:3px solid rgba(120, 134, 180, 0.8);
        background-color:rgba(25, 30, 45, 0.8)
    }
    .btn.f0{
        background-color:#458BD9
    }
    .btn.f0:hover{
        border:3px solid white;
        background-color:#5a98dd
    }
    .btn.f1{
        background-color:#C32929
    }
    .btn.f1:hover{
        border:3px solid #fcefef;
        background-color:#d43232
    }
    .btn.f2{
        background-color:#A2A2A2
    }
    .btn.f2:hover{
        border:3px solid white;
        background-color:#afafaf
    }
    .btn.c0{
        background-color:#C7966F
    }
    .btn.c0:hover{
        border:3px solid white;
        background-color:#cea381
    }
    .btn.c1{
        background-color:#21A9E1
    }
    .btn.c1:hover{
        border:3px solid white;
        background-color:#37b2e4
    }
    .btn.c2{
        background-color:#98CE64
    }
    .btn.c2:hover{
        border:3px solid white;
        background-color:#a5d477
    }
    .btn.c3{
        background-color:#1C51FF
    }
    .btn.c3:hover{
        border:3px solid white;
        background-color:#3665ff
    }
    .btn.c4{
        background-color:#A35AC2
    }
    .btn.c4:hover{
        border:3px solid white;
        background-color:#ad6dc9
    }
    .btn.c5{
        background-color:#AD4F4F
    }
    .btn.c5:hover{
        border:3px solid #fefdfd;
        background-color:#b65f5f
    }
    .btn.small{
        font-size:13px;
        font-weight:bold
    }
    .btn.minibtn{
        font-size:13px;
        font-weight:bold;
        padding:0
    }
    .btn.active{
        border:3px solid rgba(255, 255, 255, 0.8);
        color:#DAE8EA
    }
    .btn kbd{
        margin-right:3px
    }
    .btn.disabled{
        color:#364c56;
        border:3px solid #364c56;
        cursor:auto;
        pointer-events:none
    }
    .btn.checkbox{
        width:0.5em;
        height:0.5em;
        display:inline-block;
        vertical-align:text-top;
        cursor:pointer;
        border:3px solid #5b858e
    }
    .btn.checkbox.active{
        background-color:#DAE8EA;
        border:3px solid #DAE8EA;
        box-shadow:inset 0px 0px 0px 3px #5b858e
    }
    .btnbar{
        display:flex
    }
    .btnbar .btn{
        float:left
    }
    .btnbar :not(:last-child){
        margin-right:3px
    }
    input,.input,textarea,select{
        font:inherit;
        pointer-events:auto;
        box-sizing:border-box;
        border-radius:3px;
        border:0;
        margin:0;
        display:block;
        width:100%;
        background-color:#3d595f;
        outline:none;
        border:3px solid #a4bfc5;
        color:#DAE8EA;
        transition:background-color 0.3s, border 0.2s
    }
    input.focus,input:focus,.input.focus,.input:focus,textarea.focus,textarea:focus,select.focus,select:focus{
        border:3px solid #e2ebec;
        background-color:#27353f
    }
    input::-webkit-outer-spin-button,input::-webkit-inner-spin-button,.input::-webkit-outer-spin-button,.input::-webkit-inner-spin-button,textarea::-webkit-outer-spin-button,textarea::-webkit-inner-spin-button,select::-webkit-outer-spin-button,select::-webkit-inner-spin-button{
        -webkit-appearance:none;
        margin:0
    }
    input[type=number],.input[type=number],textarea[type=number],select[type=number]{
        -moz-appearance:textfield
    }
    input.disabled,.input.disabled,textarea.disabled,select.disabled{
        color:#5b858e;
        border:3px solid #364c56;
        cursor:auto;
        pointer-events:none
    }
    textarea{
        resize:none
    }
    ::placeholder{
        color:#759ea7
    }
    .formatted, input[type="number"], input[type="text"], input[type="search"], textarea, select{
        padding:5px 8px
    }
    .big{
        padding:10px 15px
    }
    .context{
        position:absolute;
        z-index:12;
        background-color:#10131d;
        padding:4px 0;
        min-width:100px
    }
    .choice{
        color:#F5C247;
        cursor:pointer;
        padding:0 4px
    }
    .choice:hover{
        color:#DAE8EA;
        background-color:rgba(245, 194, 71, 0.2)
    }
    .choice:active,.choice.active{
        color:#DAE8EA;
        background-color:rgba(245, 194, 71, 0.1)
    }
    .choice.disabled{
        color:#5b858e;
        cursor:auto;
        pointer-events:none
    }
    .texticon{
        height:1em;
        vertical-align:-0.23em
    }
    .texticon:not(:last-child){
        padding-right:0.15em
    }
    .bold{
        font-weight:bold
    }
    .svgicon{
        height:1.15em;
        vertical-align:-0.2em;
        padding:0
    }
    .svgicon.big{
        transform:scale(1.3)
    }
    .round{
        border-radius:50%
    }
    .capitalize{
        text-transform:capitalize
    }
    .absCentered{
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%)
    }
    .textcenter{
        text-align:center
    }
    a{
        color:#F5C247;
        text-decoration:none;
        transition:0.2s color
    }
    a:hover{
        color:#fae2a8
    }
    .btn.textGM, .textGM{
        color:#00ffa1
    }
    .btn.textnotice, .textnotice{
        color:#9DE74D
    }
    .textglow{
        color: #79e9f9;
    }
    .btn.textsystem, .textsystem{
        color:#4DE751
    }
    .btn.texterror, .texterror{
        color:#F42929
    }
    .btn.textparty, .textparty{
        color:#2ED3F6
    }
    .btn.textpvp, .textpvp{
        color:#EA00FF
    }
    .btn.textexp, .textexp{
        color:#FAA244
    }
    .btn.textwhisper, .textwhisper{
        color:#EF3EFF
    }
    .btn.textto, .textto{
        color:#EF3EFF
    }
    .btn.textfrom, .textfrom{
        color:#EF3EFF
    }
    .btn.textfaction, .textfaction{
        color:#F68E7A
    }
    .btn.textglobal, .textglobal{
        color:#FFCB9D
    }
    .btn.textlog, .textlog{
        color:#DAE8EA
    }
    .btn.textcombat, .textcombat{
        color:#DAE8EA
    }
    .btn.textlvlup, .textlvlup{
        color:#EE960B
    }
    .btn.textprestige, .textprestige{
        color:#eab379
    }
    .btn.textfame, .textfame{
        color:#FE48FC
    }
    .btn.textprimary, .textprimary{
        color:#F5C247
    }
    .btn.textsecondary, .textsecondary{
        color:#a6dcd5
    }
    .btn.textgreen, .textgreen{
        color:#34CB49
    }
    .btn.textblue, .textblue{
        color:#0681EA
    }
    .btn.textred, .textred{
        color:#F42929
    }
    .btn.textyellow, .textyellow{
        color:#E7D510
    }
    .btn.textorange, .textorange{
        color:#EE960B
    }
    .btn.textgrey, .textgrey{
        color:#5b858e
    }
    .btn.textcyan, .textcyan{
        color:#3BCFE5
    }
    .btn.textpurp, .textpurp{
        color:#9E3BF9
    }
    .btn.textwhite, .textwhite{
        color:#DAE8EA
    }
    .btn.textblack, .textblack{
        color:#10131d
    }
    .btn.textf0, .textf0{
        color:#458BD9
    }
    .btn.textf1, .textf1{
        color:#C32929
    }
    .btn.textf2, .textf2{
        color:#A2A2A2
    }
    .btn.textc0, .textc0{
        color:#C7966F
    }
    .btn.textc1, .textc1{
        color:#21A9E1
    }
    .btn.textc2, .textc2{
        color:#98CE64
    }
    .btn.textc3, .textc3{
        color:#4f78ff
    }
    .btn.textc4, .textc4{
        color:#A35AC2
    }
    .btn.textc5, .textc5{
        color:#AD4F4F
    }
    .btn.textclan, .textclan{
        color:#EE960B
    }
    .btn.textgold, .textgold{
        color:#FBD08D
    }
    .btn.textsilver, .textsilver{
        color:#B9D5EB
    }
    .btn.textcopper, .textcopper{
        color:#E5BDAF
    }
    .btn.textsub, .textsub{
        color:#0ceccd
    }
    canvas{
        display:block
    }
    @media(max-width: 600px), (max-height: 450px){
        .uiscaled{
            transform:scale(0.9)
        }
    }
    @media(max-width: 550px), (max-height: 400px){
        .uiscaled{
            transform:scale(0.8)
        }
    }
    @media(max-width: 500px), (max-height: 350px){
        .uiscaled{
            transform:scale(0.7)
        }
    }
    @media(max-width: 450px), (max-height: 300px){
        .uiscaled{
            transform:scale(0.65)
        }
    }
    @media(max-width: 400px), (max-height: 280px){
        .uiscaled{
            transform:scale(0.6)
        }
    }
    table{
        border-collapse:collapse;
        width:100%;
        color:#5b858e
    }
    th, td{
        padding:8px;
        text-align:left;
        max-width:40px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        line-height:1.2em;
        border-left:1px dotted #10131d;
        border-right:1px dotted #10131d
    }
    tr{
        padding:4px
    }
    tr.striped{
        transition:0.1s background-color
    }
    tr.striped:nth-child(odd){
        background-color:#151b26
    }
    tr.striped:hover{
        background-color:#1e2737
    }
    tr.selected{
        color:#DAE8EA;
        background-color:rgba(245, 194, 71, 0.2)
    }
    tr.selected:nth-child(odd){
        background-color:rgba(245, 194, 71, 0.25)
    }
    tr.selected:hover{
        background-color:rgba(245, 194, 71, 0.4)
    }
    label{
        margin-bottom:8px;
        font-weight:bold;
        display:block
    }
    .grid{
        display:grid;
        grid-gap:4px
    }
    .grid.two{
        grid-template-columns:1fr 1fr
    }
    .grid.three{
        grid-template-columns:1fr 1fr 1fr
    }
    .grid.four{
        grid-template-columns:1fr 1fr 1fr 1fr
    }
    .marg-top{
        margin-top:4px
    }
    .marg-bot{
        margin-bottom:4px
    }
    .subnav{
        display:flex
    }
    .subnav input, select{
        width:auto
    }
    .subnav:not(:first-child){
        margin-top:8px
    }
    .navbtn:not(:last-child){
        margin-right:8px
    }
    select{
        font-size:0.9em
    }
    th, tr{
        cursor:pointer
    }
    .fadeIn{
        animation:svelte-1vbnriq-fadein 0.5s
    }
    @keyframes svelte-1vbnriq-fadein{
        {
            opacity:0
        }
        {
            opacity:1
        }
    }
    .video{
        position:relative;
        padding-bottom:56.25%;
        height:0;
        border-radius:6px;
        overflow:hidden
    }
    .scrollbar{
        scrollbar-width:thin;
        scrollbar-color:#5b858e #0000;
        overflow-y:auto
    }
    .scrollbar-fix{
        overflow-y:scroll
    }
    .scrollbar::-webkit-scrollbar-thumb{
        background-color:#5b858e;
        border-radius:3px
    }
    .scrollbar::-webkit-scrollbar{
        width:12px
    }
    .statnumber{
        font-weight:bold;
        justify-self:end
    }
    .finder{
        max-height:calc(1.25em + 6px + 10px)
    }
    .finder input{
        background-color:unset !important;
        border:unset !important
    }
    .finder .focus{
        z-index:12
    }
    .finder .results{
        position:absolute;
        top:100%;
        left:0
    }
    .finder .result{
        padding:5px 8px;
        cursor:pointer
    }
    .finder .result:hover{
        background-color:#3e3625
    }
    .finder .sel{
        background-color:#55482a
    }
    .finder .divider{
        margin:5px 8px;
        border-bottom:1px solid rgba(91, 133, 142, 0.1)
    }
    .finder .container{
        position:relative
    }
    body{
        overscroll-behavior:none;
        background-color:#10131d;
        padding:0;
        margin:0;
        overflow:hidden;
        box-sizing:border-box;
        font-size:15px;
        font-family:"hordes", sans-serif
    }
    .container.svelte-1mq2czx{
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:100;
        background-color:#10131d
    }
    .version.svelte-1mq2czx{
        text-transform:capitalize;
        position:absolute;
        bottom:0px
    }
    .layout.svelte-1j9lddf{
        display:grid;
        grid-template-rows:1fr auto
    }
    .container.svelte-1j9lddf{
        position:relative;
        transform-origin:bottom
    }
    .actionbarcontainer.svelte-1j9lddf{
        margin-bottom:4px;
        position:absolute;
        transform:translateX(-50%);
        bottom:0;
        left:50%;
        z-index:3
    }
    .container.svelte-afakdv.svelte-afakdv{
        max-width:780px;
        max-height:70%
    }
    .layout.svelte-afakdv.svelte-afakdv{
        display:grid;
        grid-gap:4px;
        grid-template:"s s" auto "c i" auto "p p" auto/1fr 5fr;
        height:100%
    }
    .choice.svelte-afakdv.svelte-afakdv{
        text-transform:capitalize;
        font-size:13px
    }
    .search.svelte-afakdv.svelte-afakdv{
        grid-area:s;
        display:grid;
        grid-template-columns:400px 1fr auto auto auto;
        grid-gap:8px;
        position:relative
    }
    .choices.svelte-afakdv.svelte-afakdv{
        grid-area:c;
        height:44vh
    }
    .items.svelte-afakdv.svelte-afakdv{
        grid-area:i;
        height:44vh
    }
    .buytable.svelte-afakdv.svelte-afakdv{
        display:grid;
        grid-template-rows:auto 1fr;
        height:100%
    }
    .buytblhead.svelte-afakdv.svelte-afakdv{
        display:grid;
        grid-template-columns:30px 2.5fr 0.4fr 1.4fr 0.6fr 0.9fr 0.9fr;
        grid-gap:3px;
        padding:0;
        font-size:12px;
        margin:3px 0
    }
    .buy.svelte-afakdv.svelte-afakdv{
        display:grid;
        grid-template-columns:30px 2.5fr 0.4fr 1.4fr 0.6fr 1.8fr;
        grid-gap:3px;
        margin-bottom:3px;
        padding:0
    }
    .buy.item.svelte-afakdv.svelte-afakdv{
        grid-template-rows:30px;
        cursor:pointer
    }
    .buy.item.svelte-afakdv>span.svelte-afakdv{
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap
    }
    .post.svelte-afakdv.svelte-afakdv{
        grid-area:p;
        display:grid;
        grid-template-columns:43px 1fr auto 100px auto;
        grid-template-rows:43px;
        grid-gap:8px
    }
    .postStacks.svelte-afakdv.svelte-afakdv{
        grid-template-columns:43px 1fr auto 100px auto auto
    }
    .confirm.svelte-afakdv.svelte-afakdv{
        grid-area:p;
        display:grid;
        grid-template-columns:1fr auto auto;
        grid-template-rows:43px;
        grid-gap:8px;
        justify-items:end
    }
    .marg.svelte-afakdv.svelte-afakdv{
        margin:4px 0;
        align-self:center
    }
    .divider.svelte-afakdv.svelte-afakdv{
        margin:5px 8px;
        border-bottom:1px solid rgba(91, 133, 142, 0.1)
    }
    .container.svelte-1u9u6qj{
        width:350px
    }
    .upgradeslot.svelte-1u9u6qj{
        display:grid;
        width:46px;
        height:46px;
        margin:16px auto 0 auto;
        text-align:left
    }
    .upgradebutton.svelte-1u9u6qj{
        width:100%
    }
    .upgrade.svelte-1u9u6qj{
        display:grid;
        grid-gap:8px;
        width:150px;
        margin:8px auto 16px auto;
        justify-items:center;
        text-align:left
    }
    .costgrid.svelte-1u9u6qj{
        display:grid;
        grid-gap:4px;
        grid-auto-rows:30px
    }
    .flash_success.svelte-1u9u6qj{
        animation-timing-function:ease-out;
        animation-name:svelte-1u9u6qj-animUp;
        animation-duration:1.5s
    }
    @keyframes svelte-1u9u6qj-animUp{
        0%{
            box-shadow:0px 0px 0px 0px #FFB034
        }
        20%{
            box-shadow:0px 0px 8px 20px #FFF
        }
        100%{
            box-shadow:0px 0px 3px 0px #FFB034
        }
    }
    .flash_fail.svelte-1u9u6qj{
        animation-timing-function:ease-out;
        animation-name:svelte-1u9u6qj-animDown;
        animation-duration:0.8s
    }
    @keyframes svelte-1u9u6qj-animDown{
        0%{
            box-shadow:0px 0px 0px 0px #981E18
        }
        20%{
            box-shadow:0px 0px 5px 20px #EA2020
        }
        100%{
            box-shadow:0px 0px 3px 0px #981E18
        }
    }
    .container.svelte-ggsnc{
        width:max-content
    }
    .items.svelte-ggsnc{
        display:grid;
        grid-gap:4px;
        max-width:575px;
        grid-auto-rows:46px;
        grid-template-columns:repeat(11, 46px);
        margin:4px 0
    }
    .stats2.svelte-ggsnc{
        font-size:13px
    }
    .statcol.svelte-ggsnc{
        display:grid;
        grid-template-columns:auto auto;
        align-content:start;
        column-gap:3px;
        align-items:center
    }
    .statbtn.svelte-ggsnc{
        pointer-events:all;
        border:unset !important
    }
    .statbtn.disabled.svelte-ggsnc{
        opacity:0.5;
        background-color:#5b858e
    }
    .inputcontainer.svelte-16y0b84.svelte-16y0b84{
        display:grid;
        grid-template-columns:auto 1fr;
        grid-gap:4px;
        align-items:center
    }
    .inputcontainer.svelte-16y0b84 input.svelte-16y0b84{
        background-color:unset;
        border:none
    }
    .inputcontainer.svelte-16y0b84 input.svelte-16y0b84:focus{
        border:none
    }
    .lowercontainer.svelte-16y0b84.svelte-16y0b84{
        position:relative
    }
    .command.svelte-16y0b84.svelte-16y0b84{
        text-transform:capitalize;
        padding:3px 5px;
        font-weight:bold
    }
    .chatsection.svelte-16y0b84.svelte-16y0b84{
        position:relative
    }
    .hidden.svelte-16y0b84.svelte-16y0b84{
        visibility:hidden
    }
    .commandlist.svelte-16y0b84.svelte-16y0b84{
        position:absolute;
        left:0;
        bottom:100%;
        margin-bottom:4px
    }
    .time.svelte-16y0b84.svelte-16y0b84{
        font-size:11px;
        color:#5b858e;
        width:2.8em;
        display:inline-block
    }
    .content.svelte-16y0b84.svelte-16y0b84{
        display:inline;
        white-space:nowrap
    }
    .sender.svelte-16y0b84.svelte-16y0b84{
        pointer-events:all;
        cursor:pointer
    }
    .sender.svelte-16y0b84.svelte-16y0b84:hover{
        background-color:rgba(16, 19, 29, 0.5)
    }
    .line.svelte-16y0b84.svelte-16y0b84{
        pointer-events:none;
        text-shadow:1px 1px #000;
        margin-right:0.35em;
        overflow:hidden;
        direction:ltr
    }
    .linewrap.svelte-16y0b84.svelte-16y0b84{
        display:inline;
        border-radius:3px;
        background-color:rgba(16, 19, 29, 0.3);
        padding:0 3px
    }
    .frame.svelte-16y0b84.svelte-16y0b84{
        flex:1 1 auto;
        overflow-y:scroll;
        overflow-x:hidden;
        direction:rtl;
        scrollbar-width:none
    }
    .frame.svelte-16y0b84.svelte-16y0b84::-webkit-scrollbar{
        display:none
    }
    .container.svelte-16y0b84.svelte-16y0b84{
        height:240px;
        width:450px;
        max-height:50%;
        max-width:50%;
        min-width:300px;
        display:grid;
        grid-template-rows:1fr auto auto;
        z-index:2;
        font-size:14px
    }
    @media(max-width: 1300px){
        .container.svelte-16y0b84.svelte-16y0b84{
            margin-bottom:110px
        }
    }
    .channel.svelte-16y0b84.svelte-16y0b84{
        display:inline-block;
        background-color:rgba(16, 19, 29, 0.4)
    }
    .textGM.svelte-16y0b84.svelte-16y0b84,.textworld.svelte-16y0b84.svelte-16y0b84{
        background-color:rgba(16, 19, 29, 0.8)
    }
    .channelselect.svelte-16y0b84.svelte-16y0b84{
        position:absolute;
        top:0;
        opacity:0.15;
        display:flex;
        margin-bottom:4px;
        pointer-events:all
    }
    .channelselect.svelte-16y0b84>small.svelte-16y0b84{
        line-height:1em;
        margin-right:4px
    }
    .channelselect.svelte-16y0b84.svelte-16y0b84:hover{
        opacity:1
    }
    .container.svelte-1rc4ub7{
        min-width:350px;
        max-width:600px;
        width:90%;
        height:80%;
        min-height:350px;
        max-height:600px;
        z-index:9
    }
    .clanView.svelte-1rc4ub7{
        margin:8px
    }
    .modemenu.svelte-1rc4ub7{
        margin:32px
    }
    .clanInfoBox.svelte-1rc4ub7{
        margin:100px
    }
    .panel-black.svelte-6t8hqd{
        padding:8px
    }
    .offline.svelte-6t8hqd{
        opacity:0.5
    }
    .helmet.svelte-6t8hqd{
        opacity:0.1;
        top:0px;
        width:250px;
        pointer-events:none
    }
    .hero.svelte-6t8hqd{
        position:relative
    }
    label.svelte-7uvqsx{
        margin-top:16px
    }
    .container.svelte-m4f7d2{
        z-index:6
    }
    .wrapper.svelte-m4f7d2{
        width:230px;
        cursor:pointer
    }
    .buttons.svelte-m4f7d2{
        line-height:1;
        font-size:13px
    }
    .pattern.svelte-16344pz{
        position:absolute;
        left:0;
        top:0;
        width:100%;
        height:100%;
        background:repeating-linear-gradient(to right, #0004 0px, #0004 3px, #0000 3px, #0000 5%)
    }
    .container.svelte-16344pz{
        border-top:3px solid rgba(16, 19, 29, 0.8)
    }
    .container.svelte-1wip79f{
        position:absolute;
        bottom:4px;
        right:4px;
        box-sizing:border-box
    }
    .title.svelte-1wip79f{
        font-weight:bold;
        font-size:20px
    }
    .name.svelte-uxs0uj{
        font-weight:bold
    }
    .container.svelte-uxs0uj{
        min-width:300px;
        max-width:400px;
        width:30%;
        height:350px;
        z-index:5;
        padding:12px
    }
    .container.svelte-1axz35n{
        z-index:7
    }
    .slotcontainer.svelte-1axz35n{
        grid-auto-rows:46px;
        right:4px;
        pointer-events:all;
        display:grid;
        grid-gap:3px;
        margin:4px 0
    }
    .filter.svelte-1axz35n{
        font-size:13px
    }
    .gold.svelte-1axz35n{
        padding:4px 8px;
        background-color:#10131d;
        float:right
    }
    .container.svelte-1npf5af{
        float:right;
        clear:right;
        position:relative
    }
    .warIcon.svelte-1npf5af{
        position:absolute;
        left:-9px;
        bottom:-9px;
        padding:0
    }
    .partyframes.svelte-1xmlhk{
        margin-top:4px;
        display:grid;
        grid-gap:4px;
        grid-template-rows:1fr
    }
    .container.svelte-voya4q{
        width:350px
    }
    .ranktitle.svelte-voya4q{
        font-size:1.2em
    }
    .stats.svelte-voya4q{
        font-size:0.9em;
        display:grid;
        grid-gap:4px;
        grid-template-columns:2fr 3fr
    }
    .container.svelte-jnzoj3{
        width:400px
    }
    .reportdescription.svelte-jnzoj3{
        width:100%;
        resize:none
    }
    .container.svelte-1dzs2t1{
        min-width:200px
    }
    .container.svelte-1dzs2t1{
        text-align:center;
        padding:12px
    }
    .unavailable.svelte-1dzs2t1{
        pointer-events:none
    }
    .text.svelte-dujqu3{
        position:absolute;
        width:100%;
        text-align:center;
        text-shadow:2px 2px 0px #000
    }
    .location.svelte-dujqu3{
        margin-top:15vh;
        font-size:30px;
        top:10vh;
        text-transform:capitalize
    }
    .error.svelte-dujqu3{
        font-size:20px;
        font-weight:bold;
        bottom:30vh
    }
    .container.svelte-ntyx09{
        position:absolute;
        top:100px;
        left:50%;
        transform:translate(-50%, 0);
        min-width:350px;
        max-width:800px;
        width:90%;
        height:80%;
        min-height:350px;
        max-height:500px;
        z-index:9
    }
    .divide.svelte-ntyx09{
        height:100%;
        display:grid;
        grid-gap:16px;
        grid-template-columns:150px 1fr
    }
    .menu.svelte-ntyx09{
        padding-left:12px
    }
    .settings.svelte-ntyx09{
        display:grid;
        grid-template-columns:1fr 1fr;
        grid-gap:8px;
        align-items:center
    }
    .bar.svelte-1v6qmvo{
        pointer-events:all;
        display:grid;
        grid-gap:2px;
        grid-auto-rows:46px;
        grid-auto-columns:46px;
        grid-auto-flow:column
    }
    .container.svelte-e2mar4{
        max-width:50%;
        width:min-content
    }
    .skilllist.svelte-e2mar4{
        display:grid;
        grid-template-columns:auto auto;
        grid-gap:4px
    }
    .skillbox.svelte-e2mar4{
        display:grid;
        grid-template-columns:46px 120px 1fr;
        grid-auto-rows:46px;
        grid-gap:8px;
        width:230px
    }
    .skillpoints.svelte-e2mar4{
        display:grid;
        grid-template-columns:repeat(auto-fit, 20px);
        grid-auto-rows:15px;
        grid-gap:4px;
        margin-top:3px
    }
    .flexer.svelte-e2mar4{
        height:100%;
        display:flex;
        flex-direction:column
    }
    .name.svelte-e2mar4{
        margin-top:3px;
        white-space:nowrap;
        text-overflow:ellipsis;
        overflow:hidden
    }
    .bar.svelte-e2mar4{
        display:grid;
        grid-template-columns:1fr auto auto;
        grid-gap:4px;
        align-items:center;
        margin-bottom:4px
    }
    .incbtn.svelte-e2mar4{
        padding:0;
        text-align:center;
        padding:0;
        border:0 !important;
        font-family:monospace;
        font-weight:bolder;
        line-height:1
    }
    .btnbar.svelte-1wol45y{
        margin-top:2px;
        float:right;
        clear:right
    }
    .container.svelte-1ilvxqc{
        display:flex;
        width:max-content;
        max-height:70%
    }
    .slotcontainer.svelte-1ilvxqc{
        right:4px;
        pointer-events:all;
        display:grid;
        grid-gap:3px;
        margin:4px 0;
        grid-auto-rows:46px
    }
    .gold.svelte-1ilvxqc{
        padding:4px 8px
    }
    .formelements.svelte-1ilvxqc{
        display:flex;
        justify-content:flex-end
    }
    .container.svelte-1un8upk{
        min-width:450px;
        max-width:600px;
        width:90%;
        z-index:11
    }
    .btnbar.svelte-133q4bd{
        float:right
    }
    .targetframes.svelte-17up9g6{
        display:grid;
        grid-gap:5px;
        z-index:3;
        align-items:end;
        margin:0 auto 4px auto;
        max-width:600px;
        grid-template-columns:1fr 1fr
    }
    .container.svelte-46w0ts{
        max-width:407px;
        z-index:5
    }
    .slotcontainer.svelte-46w0ts{
        right:4px;
        pointer-events:all;
        display:grid;
        grid-gap:3px;
        margin:4px 0;
        grid-auto-rows:46px;
        grid-template-columns:repeat(auto-fill, 46px)
    }
    .info.svelte-46w0ts{
        display:inline-block;
        margin-bottom:16px
    }
    .tut.svelte-wv9du9{
        border:5px solid #F5C247;
        position:absolute;
        z-index:99;
        box-sizing:border-box;
        animation:svelte-wv9du9-indicator 1s;
        box-shadow:#000 0px 0px 20px 20px
    }
    .msg.svelte-wv9du9{
        position:absolute;
        left:50%;
        bottom:0;
        width:30%;
        max-width:300px;
        min-width:200px;
        transform:translate(-50%, -130px);
        z-index:100;
        border-radius:3px;
        padding:10px;
        background-color:#10131d;
        pointer-events:all;
        padding:20px
    }
    .msgtext.svelte-wv9du9{
        font-size:15px;
        margin-bottom:4px
    }
    @keyframes svelte-wv9du9-indicator{
        0%{
            transform:scale(1.5);
            opacity:0
        }
        100%{
            transform:scale(1);
            opacity:1
        }
    }
    .complete.svelte-wv9du9{
        animation:svelte-wv9du9-complete 1s;
        animation-fill-mode:forwards
    }
    @keyframes svelte-wv9du9-complete{
        0%{
            opacity:1
        }
        100%{
            opacity:0
        }
    }
    .layout.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9{
        display:grid;
        grid-template-rows:auto 1fr;
        max-height:100%
    }
    .container.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9{
        min-width:500px;
        max-width:700px;
        width:90%;
        height:80%;
        min-height:250px;
        max-height:500px;
        z-index:9
    }
    .statboard.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9{
        font-size:13px
    }
    .statboard.svelte-g2pdl9 tbody.svelte-g2pdl9>tr.svelte-g2pdl9>td.svelte-g2pdl9{
        padding-top:3px;
        padding-bottom:3px
    }
    .infosmall.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9{
        font-size:14px;
        text-align:center;
        font-weight:bold;
        display:block
    }
    .infobig.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9.svelte-g2pdl9{
        font-size:24px;
        text-align:center;
        font-weight:bold;
        display:block
    }
    .bar.svelte-i7i7g5{
        background-color:rgba(45, 66, 71, 0.7);
        border-radius:1.5px;
        position:relative;
        color:#DAE8EA;
        overflow:hidden;
        text-shadow:1px 1px 2px #10131d;
        white-space:nowrap;
        text-transform:capitalize;
        font-weight:bold
    }
    .bar.dark.svelte-i7i7g5{
        background:rgba(27, 78, 90, 0.88)
    }
    .progressBar{
        border-radius:1.5px;
        height:100%
    }
    .bgexp.svelte-i7i7g5{
        border-right:3px solid #fdd3a7
    }
    .bgtut.svelte-i7i7g5{
        transition:width 0.3s
    }
    .right.svelte-i7i7g5{
        position:absolute;
        right:7px;
        z-index:1
    }
    .left.svelte-i7i7g5{
        padding-left:4px;
        position:relative;
        z-index:1
    }
    .slot.svelte-1rfiesb{
        position:relative;
        box-shadow:none;
        overflow:hidden
    }
    .slot.positive.svelte-1rfiesb{
        border:2px solid #161E32
    }
    .slot.negative.svelte-1rfiesb{
        border:2px solid #960808
    }
    .icon.svelte-1rfiesb{
        display:block
    }
    .time.svelte-1rfiesb{
        color:#E7D510;
        font-size:14px;
        background-color:#00000077;
        z-index:11
    }
    .container.svelte-1rfiesb{
        color:#fff
    }
    .soon.svelte-1rfiesb{
        opacity:0.5
    }
    .stacks.svelte-1rfiesb{
        right:1px;
        bottom:0px;
        font-size:12px
    }
    .overlay.svelte-1rfiesb{
        top:0;
        left:0;
        width:100%;
        position:absolute;
        z-index:9
    }
    .container.svelte-svpjti{
        z-index:1000;
        min-width:728px;
        min-height:90px;
        top:4px;
        pointer-events:all;
        position:absolute;
        transform-origin:top right;
        top:4px;
        right:321px;
        transform:scale(0.8)
    }
    @media(max-width: 1369px){
        .container.svelte-svpjti{
            transform:scale(0.7)
        }
    }
    @media(max-width: 1295px){
        .container.svelte-svpjti{
            transform:scale(0.6)
        }
    }
    @media(max-width: 1210px){
        .container.svelte-svpjti{
            transform:scale(0.55)
        }
    }
    .blocktext.svelte-svpjti{
        position:absolute;
        left:50%;
        transform:translate(-50%, 0)
    }
    .slottitle{
        font-size:20px;
        font-weight:bold;
        margin-top:4px
    }
    .type.svelte-e3ao5j{
        text-transform:capitalize
    }
    .pack.svelte-e3ao5j{
        margin:8px 0
    }
    .description.svelte-e3ao5j{
        font-size:13px;
        font-weight:bold;
        color:#5b858e
    }
    .container.svelte-e3ao5j{
        max-width:240px
    }
    .comparecontainer.svelte-e3ao5j{
        position:absolute;
        right:100%;
        top:-3px;
        margin-right:8px
    }
    .value.svelte-e3ao5j{
        background-color:#19202d
    }
    .infocol.svelte-17jb1r5{
        text-transform:capitalize
    }
    .result.svelte-17jb1r5{
        display:grid;
        grid-template-columns:1fr 70px 70px
    }
    .notification.svelte-9nlpzp{
        text-align:center;
        position:absolute;
        top:150px;
        left:50%;
        transform:translate(-50%, 0);
        padding:16px 24px;
        cursor:pointer
    }
    .icon.svelte-9nlpzp{
        position:absolute;
        top:-45px;
        transform:translate(-50%, 0)
    }
    .name.svelte-erbdzy{
        margin-right:0.35em;
        font-weight:bold
    }
    .icon.svelte-erbdzy{
        height:1.1em;
        vertical-align:-0.23em
    }
    .container.svelte-14w0l4b{
        max-width:260px
    }
    .pad.svelte-14w0l4b{
        padding-top:8px
    }
    .slotskill{
        border-radius:3px;
        height:100%
    }
    .slot.svelte-18ojcpo.svelte-18ojcpo{
        position:relative
    }
    .slot.svelte-18ojcpo img.svelte-18ojcpo{
        max-width:100%;
        pointer-events:none
    }
    .overlay.svelte-18ojcpo.svelte-18ojcpo{
        bottom:0;
        left:0;
        width:100%;
        height:100%;
        position:absolute;
        z-index:9
    }
    .overlay.cd.svelte-18ojcpo.svelte-18ojcpo{
        background-color:rgba(0, 0, 0, 0.5);
        border-top:2px solid rgba(218, 232, 234, 0.5)
    }
    .overlay.offCd.svelte-18ojcpo.svelte-18ojcpo{
        animation-timing-function:ease-out;
        animation-name:svelte-18ojcpo-animoffCd;
        animation-duration:0.4s
    }
    .overlay.queued.svelte-18ojcpo.svelte-18ojcpo{
        box-shadow:inset 0 0 3px 3px rgba(231, 213, 16, 0.5)
    }
    .overlay.oom.svelte-18ojcpo.svelte-18ojcpo{
        background-color:rgba(2, 110, 244, 0.4)
    }
    .overlay.range.svelte-18ojcpo.svelte-18ojcpo{
        background-color:rgba(244, 41, 41, 0.3)
    }
    .overlay.combat.svelte-18ojcpo.svelte-18ojcpo{
        background-color:rgba(0, 0, 0, 0.65)
    }
    .overlay.hidden.svelte-18ojcpo.svelte-18ojcpo{
        display:none
    }
    @keyframes svelte-18ojcpo-animoffCd{
        0%{
            background-color:#92CAFF00
        }
        20%{
            background-color:#92CAFF99
        }
        100%{
            background-color:#92CAFF00
        }
    }
    .slottext{
        pointer-events:none;
        position:absolute;
        line-height:8px;
        font-size:13px;
        background-color:rgba(16, 19, 29, 0.8);
        padding:2px 1px 3px 1px;
        border-radius:2px;
        z-index:10;
        font-weight:bold
    }
    .slottext.key{
        color:#5b858e;
        right:3px;
        top:3px
    }
    .slottext.stacks{
        color:#DAE8EA;
        right:3px;
        bottom:3px
    }
    .slottext:empty{
        padding:0
    }
    .slotdescription{
        position:absolute;
        width:max-content;
        padding:8px;
        z-index:11;
        pointer-events:none;
        background-color:#10131d;
        color:#a6dcd5
    }
    .icon.svelte-18ojcpo.svelte-18ojcpo{
        display:block
    }
    .filled.svelte-18ojcpo.svelte-18ojcpo{
        cursor:pointer
    }
    .filled.svelte-18ojcpo.svelte-18ojcpo:hover{
        box-shadow:0 0 5px 2px #0F0F16, inset 0 0 2px 3px #272929, inset 0 0 6px 5px #6e8490
    }
    @keyframes svelte-18ojcpo-autocast{
        0%{
            left:0;
            top:0
        }
        25%{
            left:100%;
            top:0
        }
        50%{
            left:100%;
            top:100%
        }
        75%{
            left:0;
            top:100%
        }
        100%{
            left:0;
            top:0
        }
    }
    .filled.svelte-18ojcpo .autocast.svelte-18ojcpo{
        box-sizing:border-box;
        position:absolute;
        width:5px;
        height:5px;
        border-radius:50%;
        animation:svelte-18ojcpo-autocast 2s cubic-bezier(0.8, 0.5, 0.2, 0.5) infinite;
        z-index:11;
        transform:translate(-50%, -50%);
        background-color:rgba(250, 243, 176, 0.85);
        box-shadow:0px 0px 3px 2px rgba(245, 233, 104, 0.65)
    }
    .time.svelte-18ojcpo.svelte-18ojcpo{
        color:#E7D510;
        font-size:18px;
        background-color:#00000077;
        z-index:11
    }
    .container.svelte-sh553q{
        position:absolute;
        z-index:13;
        pointer-events:none;
        width:40px;
        height:40px;
        background-color:#10131d
    }
    .spinner.svelte-twvoek.svelte-twvoek{
        position:absolute;
        left:50%;
        top:50%;
        width:35px;
        height:10px;
        margin:-7px -17px;
        display:flex;
        justify-content:space-between
    }
    .spinner.svelte-twvoek>div.svelte-twvoek{
        width:10px;
        height:10px;
        background-color:#5b858e;
        border-radius:100%;
        animation:svelte-twvoek-sk-bouncedelay 1.4s infinite ease-in-out both
    }
    .spinner.svelte-twvoek .bounce1.svelte-twvoek{
        animation-delay:-0.32s
    }
    .spinner.svelte-twvoek .bounce2.svelte-twvoek{
        animation-delay:-0.16s
    }
    @keyframes svelte-twvoek-sk-bouncedelay{
        0%,80%,100%{
            transform:scale(0)
        }
        40%{
            transform:scale(1)
        }
    }
    .name.svelte-13wcf6i{
        position:absolute;
        bottom:4px;
        left:4px;
        font-size:12px
    }
    .textbox.svelte-13wcf6i{
        background-color:rgba(16, 19, 29, 0.7);
        padding:2px;
        border-radius:3px;
        line-height:1em
    }
    .stream.svelte-13wcf6i{
        display:block;
        color:unset;
        user-select:none;
        cursor:pointer;
        border-radius:3px;
        color:#fff
    }
    .viewcount.svelte-13wcf6i{
        font-size:12px;
        position:absolute;
        top:4px;
        right:4px
    }
    .preview.svelte-13wcf6i{
        width:100%;
        height:70px;
        overflow:hidden;
        border-radius:3px;
        position:relative;
        background-position:center;
        background-color:#10131d;
        background-size:cover;
        box-sizing:border-box
    }
    .sparkle.svelte-cbx1m{
        color:#fff;
        animation:svelte-cbx1m-sparkleAnim 4s infinite alternate ease-in-out;
        position:absolute
    }
    @keyframes svelte-cbx1m-sparkleAnim{
        0%{
            transform:translate(-50%, 10px)
        }
        100%{
            transform:translate(-50%, -10px)
        }
    }
    .artwork.svelte-cbx1m{
        transform:translate(-50%, -60%);
        position:absolute;
        left:50%;
        top:50%;
        width:60%;
        max-width:160px;
        animation:svelte-cbx1m-artAnim 4s infinite alternate ease-in-out
    }
    @keyframes svelte-cbx1m-artAnim{
        0%{
            transform:translate(-50%, -52%) rotate(7deg)
        }
        100%{
            transform:translate(-50%, -48%) rotate(5deg)
        }
    }
    .artcontainer.svelte-cbx1m{
        position:relative
    }
    .split.svelte-cbx1m{
        display:grid;
        grid-gap:30px;
        grid-template-columns:1fr 1fr;
        margin-bottom:1em
    }
    .old.svelte-cbx1m{
        text-decoration:line-through;
        color:#5b858e
    }
    .bar.svelte-1apx3f3{
        font-family:monospace;
        font-size:12px;
        float:right;
        line-height:1em;
        margin-right:4px;
        background-color:#00000070;
        letter-spacing:-0.05em;
        padding:1px
    }
    .bars.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        position:relative;
        grid-area:ba;
        box-shadow:0px 0px 0px 2px #ffffff00;
        padding:3px
    }
    .bars.targetable.svelte-mohsod.svelte-mohsod.svelte-mohsod:hover{
        background-color:rgba(31, 36, 55, 0.8);
        box-shadow:0px 0px 0px 2px #ffffff55;
        cursor:pointer
    }
    .bars.target.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        box-shadow:0px 0px 0px 2px #ffffff77;
        background-color:rgba(27, 32, 49, 0.8)
    }
    .bars.target.svelte-mohsod.svelte-mohsod.svelte-mohsod:hover{
        background-color:rgba(32, 38, 59, 0.8);
        box-shadow:0px 0px 0px 2px #ffffff99
    }
    .grid.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        display:grid;
        grid-gap:3px;
        pointer-events:all;
        grid-gap:0px
    }
    .grid.left.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        grid-template:"i ba" auto/2em 1fr
    }
    .grid.left.svelte-mohsod>.iconcontainer.svelte-mohsod>.pclass.svelte-mohsod{
        right:0
    }
    .grid.left.svelte-mohsod>.bars.svelte-mohsod>.tag.svelte-mohsod{
        left:-15px
    }
    .grid.left.svelte-mohsod>.bars.svelte-mohsod>.combat.svelte-mohsod{
        left:-28px
    }
    .grid.right.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        grid-template:"ba i" auto/1fr 2em
    }
    .grid.right.svelte-mohsod>.iconcontainer.svelte-mohsod>.pclass.svelte-mohsod{
        left:0
    }
    .grid.right.svelte-mohsod>.bars.svelte-mohsod>.tag.svelte-mohsod{
        right:-15px
    }
    .grid.right.svelte-mohsod>.bars.svelte-mohsod>.combat.svelte-mohsod{
        right:-28px
    }
    .icon.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        box-sizing:border-box;
        display:block;
        background-clip:content-box;
        position:absolute
    }
    .iconcontainer.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        position:relative;
        width:auto;
        height:100%;
        grid-area:i;
        z-index:0
    }
    .tag.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        width:1.6em;
        box-shadow:none;
        z-index:4;
        top:-10px
    }
    .combat.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        background-color:#F42929;
        top:-5px;
        width:15px;
        height:15px
    }
    .pclass.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        z-index:3;
        height:2em
    }
    .deco.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        position:absolute;
        top:1em;
        left:1em;
        transform:translate(-50%, -50%) rotate(45deg);
        width:2em;
        height:2em;
        z-index:2;
        background-color:rgba(16, 19, 29, 0.8);
        border-radius:3px
    }
    .buffarray.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        position:absolute;
        bottom:100%;
        width:100%;
        margin-bottom:3px;
        display:flex
    }
    .buffarray.party.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        left:100%;
        top:0;
        margin-left:3px
    }
    .buffarray.default.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        left:0;
        flex-wrap:wrap-reverse
    }
    .castbar.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        position:absolute;
        top:0;
        left:0;
        font-size:0.7em;
        height:100%;
        border-right:3px solid #f1e239
    }
    .hpdelta.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        position:absolute;
        top:0;
        left:0;
        font-size:1.3em;
        height:100%;
        transition:width 0.2s;
        transition-delay:0.1s;
        z-index:-1
    }
    .hpdelta.bghealth.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        background:#F42929
    }
    .hpdelta.bgenemy.svelte-mohsod.svelte-mohsod.svelte-mohsod{
        background:#FFE010
    }
    .titleframe.svelte-yjs4p5{
        line-height:1em;
        display:flex;
        align-items:center;
        position:relative;
        letter-spacing:0.5px
    }
    .title.svelte-yjs4p5{
        width:100%;
        padding-left:4px;
        font-weight:bold
    }
    .titleicon.svelte-yjs4p5{
        margin:3px
    }
    .window.svelte-yjs4p5{
        padding:5px;
        height:100%;
        display:grid;
        grid-template-rows:30px 1fr;
        grid-gap:4px;
        transform-origin:inherit;
        min-width:fit-content
    }
    .slot.svelte-yjs4p5{
        min-height:0
    }
    </style>
    </head>
    <body>
      <div class="l-upperLeftModal container uiscaled svelte-ggsnc" id="statSheet">
        <div class="window panel-black svelte-yjs4p5">
          <div class="titleframe svelte-yjs4p5">
            <img src="https://hordes.io/assets/ui/icons/char.svg?v=5699699" class="titleicon svgicon svelte-yjs4p5">
            <div class="textprimary title svelte-yjs4p5">
              <div name="title">Character</div>
            </div>
            ${buffHtmlTag}
            <img src="https://hordes.io/assets/ui/icons/cross.svg?v=5699699" class="btn black svgicon">
          </div>
          <div class="slot  svelte-yjs4p5">
            <div class="grid" style="grid-template-columns: 3fr 2fr;">
              <div class="statcol panel-black svelte-ggsnc" style="grid-template-columns: 1fr 2fr;">
                <span>Name</span>
                <span class="bold textwhite">${player.name}</span>
                <span>Level</span>
                <span class="bold textwhite">${player.level}</span>
                <span>Class</span>
                <span class="bold textc${player.pclass} svelte-ggsnc">
                  <img class="texticon" src="https://hordes.io/assets/ui/classes/${player.pclass}.webp?v=5699699"> ${classCode[player.pclass]} </span>
                <span>Faction</span>
                <span class="bold textf${player.faction} svelte-ggsnc">
                  <img class="texticon" src="https://hordes.io/assets/ui/factions/${player.faction}.webp?v=5699699"> ${capitalize(factionCode[player.faction])} </span>
                <span>Prestige</span>
                <span class="bold textprestige">
                  <img class="texticon" src="https://hordes.io/assets/ui/currency/prestige.svg?v=5699699"> ${player.prestige} (Rank ${prestigeToBattleRank(player.prestige)}/12) </span>
                <span>Rating</span>
                <span>
                  <span>
                    <span class="bold textpvp">
                      <img class="svgicon" src="${arenaRatingUrl}"> ${player.elo} </span>
                  </span> ( <span>
                    <span class="textgold">
                      <img class="svgicon" src="https://hordes.io/assets/ui/currency/medal.svg?v=5699699"> 120 </span>
                  </span> per day) </span>
                <span>Medals</span>
                <span>
                  <span class="textgold">
                    <img class="svgicon" src="https://hordes.io/assets/ui/currency/medal.svg?v=5699699"> 0 </span>
                </span>
              </div>
              <div id="statpoints" class="statcol panel-black svelte-ggsnc" style="grid-template-columns: 1fr auto auto;">
                <span>Strength</span>
                <span class="statnumber textgreen">${stats["Strength"]}</span>
                <img src="https://hordes.io/assets/ui/icons/arrow.svg?v=5699699" class="btn disabled svgicon statbtn svelte-ggsnc">
                <span>Stamina</span>
                <span class="statnumber textgreen">${stats["Stamina"]}</span>
                <img src="https://hordes.io/assets/ui/icons/arrow.svg?v=5699699" class="btn  disabled svgicon statbtn svelte-ggsnc">
                <span>Dexterity</span>
                <span class="statnumber textgreen">${stats["Dexterity"]}</span>
                <img src="https://hordes.io/assets/ui/icons/arrow.svg?v=5699699" class="btn  disabled svgicon statbtn svelte-ggsnc">
                <span>Intelligence</span>
                <span class="statnumber textgreen">${stats["Intelligence"]}</span>
                <img src="https://hordes.io/assets/ui/icons/arrow.svg?v=5699699" class="btn  disabled svgicon statbtn svelte-ggsnc">
                <span>Wisdom</span>
                <span class="statnumber textgreen">${stats["Wisdom"]}</span>
                <img src="https://hordes.io/assets/ui/icons/arrow.svg?v=5699699" class="btn  disabled svgicon statbtn svelte-ggsnc">
                <span>Luck</span>
                <span class="statnumber textgreen">${stats["Luck"]}</span>
                <img src="https://hordes.io/assets/ui/icons/arrow.svg?v=5699699" class="btn  disabled svgicon statbtn svelte-ggsnc">
              </div>
            </div>
            <div id="equipslots" class="items svelte-ggsnc">
              <div  id="" class="border ${slotCss["weapon"]}  slot  svelte-18ojcpo">
                <span class="slottext stacks">${slotUpgrade["weapon"]}</span>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img ${specialCss["weapon"]} class="icon  svelte-18ojcpo" src="${itemUrl["weapon"]}">
              </div>
              <div  id="" class="border ${slotCss["armlet"]}  slot  svelte-18ojcpo">
                <span class="slottext stacks">${slotUpgrade["armlet"]}</span>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img ${specialCss["armlet"]} class="icon  svelte-18ojcpo" src="${itemUrl["armlet"]}">
              </div>
              <div  id="" class="border ${slotCss["armor"]}  slot  svelte-18ojcpo">
                <span class="slottext stacks">${slotUpgrade["armor"]}</span>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img ${specialCss["armor"]} class="icon  svelte-18ojcpo" src="${itemUrl["armor"]}">
              </div>
              <div  id="" class="border ${slotCss["bag"]}  slot  svelte-18ojcpo">
                <span class="slottext stacks">${slotUpgrade["bag"]}</span>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img ${specialCss["bag"]} class="icon  svelte-18ojcpo" src="${itemUrl["bag"]}">
              </div>
              <div  id="" class="border ${slotCss["boot"]}  slot  svelte-18ojcpo">
                <span class="slottext stacks">${slotUpgrade["boot"]}</span>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img ${specialCss["boot"]} class="icon  svelte-18ojcpo" src="${itemUrl["boot"]}">
              </div>
              <div  id="" class="border ${slotCss["glove"]}  slot  svelte-18ojcpo">
                <span class="slottext stacks">${slotUpgrade["glove"]}</span>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img ${specialCss["glove"]} class="icon  svelte-18ojcpo" src="${itemUrl["glove"]}">
              </div>
              <div  id="" class="border ${slotCss["ring"]}  slot  svelte-18ojcpo">
                <span class="slottext stacks">${slotUpgrade["ring"]}</span>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img ${specialCss["ring"]} class="icon  svelte-18ojcpo" src="${itemUrl["ring"]}">
              </div>
              <div  id="" class="border ${slotCss["amulet"]}  slot  svelte-18ojcpo">
                <span class="slottext stacks">${slotUpgrade["amulet"]}</span>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img ${specialCss["amulet"]} class="icon  svelte-18ojcpo" src="${itemUrl["amulet"]}">
              </div>
              <div  id="" class="border ${slotCss["offhand"]}  slot  svelte-18ojcpo">
                <span class="slottext stacks">${slotUpgrade["offhand"]}</span>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img ${specialCss["offhand"]} class="icon  svelte-18ojcpo" src="${itemUrl["offhand"]}">
              </div>
              <div id="" class="border ${charmSlotCss[0]}  slot  svelte-18ojcpo">
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img class="icon  svelte-18ojcpo" src="${charmUrl[0]}">
              </div>
              <div id="" class="border ${charmSlotCss[1]} slot  svelte-18ojcpo">
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <div class="overlay hidden svelte-18ojcpo"></div>
                <img class="icon  svelte-18ojcpo" src="${charmUrl[1]}">
              </div>
            </div>
            <div class="grid three stats2 svelte-ggsnc">
              <div class="statcol panel-black svelte-ggsnc">
                <span>HP</span>
                <span class="statnumber textprimary">${stats["HP"]}</span>
                <span>HP Reg./5s</span>
                <span class="statnumber textprimary">${stats["HP Reg./5s"]}</span>
                <span>MP</span>
                <span class="statnumber textprimary">${stats["MP"]}</span>
                <span>MP Reg./5s</span>
                <span class="statnumber textprimary">${stats["MP Reg./5s"]}</span>
                <span>Defense</span>
                <span class="statnumber textprimary">${stats["Defense"]}</span>
                <span>Block</span>
                <span class="statnumber textprimary">${stats["Block"]}%</span>
              </div>
              <div class="statcol panel-black svelte-ggsnc">
                <span>Min Dmg.</span>
                <span class="statnumber textprimary">${stats["Min Dmg"]}</span>
                <span>Max Dmg.</span>
                <span class="statnumber textprimary">${stats["Max Dmg"]}</span>
                <span>Atk Spd.</span>
                <span class="statnumber textprimary">${stats["Atk Spd"]}</span>
                <span>Critical</span>
                <span class="statnumber textprimary">${stats["Critical"]}%</span>
                <span>Haste</span>
                <span class="statnumber textprimary">${stats["Haste"]}%</span>
              </div>
              <div class="statcol panel-black svelte-ggsnc">
                <span>Move Spd.</span>
                <span class="statnumber textprimary">${stats["Move Spd"]}</span>
                <span>Item Find</span>
                <span class="statnumber textprimary">${stats["Item Find"]}%</span>
                <span>Gear Score</span>
                <span class="statnumber textprimary">${stats["Gear Score"]}</span>
                <span class="textglow">eHP</span>
                <span class="statnumber textprimary">${eHP}</span>
                <span class="textglow">eDPS</span>
                <span class="statnumber textprimary">${eDps}</span>
                <span class="textglow">eBurst</span>
                <span class="statnumber textprimary">${eBurst}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script src="getStatSheet.js"></script>
    </body>
  </html>
  `
    return screenshotHtml(htmlString);

}

const parseAuxi = (str) => {
    const regex = /(\d{7,})\n?([^\n\+]+)\+?(\d)?\n?/g
    const ids = []
    const itemUpgradeTable = {}
    for(let match of str.matchAll(regex)) {
      const id = match[1]
      ids.push(id)
      let itemUpgradeValue = match[3]
      itemUpgradeTable[id] = itemUpgradeValue
    }
    return {
      ids, itemUpgradeTable
    }
  }
  

const parseOptions = (options) => {
// 'crus unholy maxprestige arctic enchant'
options = options.split(" ")
const buffTable = {
    "crus": "crusader",
    "unholy": "unholy",
    "arctic": "arctic",
    "aura": "arctic",
    "enchant": "enchant",
    "ench": "enchant",
    "canine": "canine",
    "k9": "canine",
    "temporal": "temporal",
    "temp": "temporal",
    "cranial": "cranial",
    "cran": "cranial",
    "crusader": "crusader"
}
const statPointTable = {
    "fullstam": "Stamina",
    "fullint": "Intelligence",
    "fulldex": "Dexterity",
    "fullwis": "Wisdom",
    "fullluck": "Luck",
    "fullstr": "Strength"
}

const prestigeTable = {
    "maxprestige": true,
    "fullprestige": true
}

let isMaxPrestige = false
const buffs = {}
let statPointStat
let isMaxBuff = false
for(let option of options) {
    option = option.toLowerCase()
    if(option === "maxbuffs" || option === "fullbuffs" || option === "allbuffs") {
        isMaxBuff = true
        break
    }
}
if(!isMaxBuff) {
    for(let option of options) {
        option = option.toLowerCase()
        let buff = buffTable[option]
        if(buff) {
        buffs[buff] = true
        }
    }
} else {
    for(buffName in buffStatTable) {
        if(buffName === "canine") continue
        buffs[buffName] = true
    }
}

for(let option of options) {
    option = option.toLowerCase()
    statPointStat = statPointTable[option]
    if(statPointStat) {
    break
    }
}

for(let option of options) {
    option = option.toLowerCase()
    if(prestigeTable[option]) {
    isMaxPrestige = true
    }
}

const parsedOptions = {
    statPointStat: statPointStat,
    buffs: buffs,
    isMaxPrestige: isMaxPrestige
}
return parsedOptions
}

const parseArguments = (arguments) => {
    // const {statPointStat, buffs, isMaxPrestige} = options
    let seperators = /[-:]/
    let res = arguments.split(seperators)
    let playerName = res[0].split(" ")[0]
    let options = res[0].split(" ").slice(1).join(" ")
    let auxi = res[res.length - 1]
    const parsedOptions = parseOptions(options)
    const parsedAuxi = parseAuxi(auxi)
    return {
        playerName: playerName,
        options: parsedOptions,
        auxi: parsedAuxi
    }
}

const parseItemIds = (arguments) => {
    const regex = /(\d+)\s*[\+]\s*(\d+)?|(\d+)/g
    let ids = []
    let itemUpgradeTable = {}
    for(let match of arguments.matchAll(regex)) {
        // console.log(match[1], match[2], [match[3]])
        const id = match[1] | match[3]
        ids.push(id)
        const itemUpgradeValue = match[2] | 0
        itemUpgradeTable[id] = itemUpgradeValue
    }
    return {itemUpgradeTable, ids}
}
const {Client, GatewayIntentBits, AttachmentBuilder, RateLimitError} = require("discord.js");

const client = new Client({
    intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});
client.on("ready", () =>{
    console.log("bot is online"); //message when bot is online
});
client.on("messageCreate", async (message) => {
    try {
    if(message.author.bot) return

    if(message.content[0] === "!") {
        let command = message.content.split(" ")[0].toLowerCase()
        if(command === "!item") {
            const arguments = message.content.split(" ").slice(1).join(" ")
            const parsedArguments = parseItemIds(arguments) 
            console.log(parsedArguments)
            const newItems = await getItem(parsedArguments.ids, parsedArguments.itemUpgradeTable)
            let itemCanvas = []
            if(!newItems) return
            for(let i = 0; i < newItems.length; i++) {
                if(newItems[i].type.toLowerCase() == "charm" && newItems.length >= 9) continue
              itemCanvas.push(getItemCanvas(newItems[i]))
            }
            if(itemCanvas) {
                const combinedCanvas = combineCanvases(itemCanvas)
                if(!combinedCanvas) {
                    await message.reply("Item Not Found")
                    return
                }
                const buffer = combinedCanvas.toBuffer('image/png')
                const attachment = new AttachmentBuilder(buffer, 'combinedCanvas.png');   
                message.reply({ files: [attachment] });
            } else {
                message.reply("Item Not Found!")
            }
        }

        if(command == "!playergear") {
          const arguments = message.content.split(" ").slice(1).join(" ")
          const {options, auxi, playerName} = parseArguments(arguments)
          const name = playerName
          const ids = auxi.ids
          const player = await getPlayerInfo(name)
          const newItems = await getItem(ids, auxi.itemUpgradeTable)
          const buffer = await getStats(newItems, player, options)
          const attachment = new AttachmentBuilder(buffer, 'combinedCanvas.png');   
          await message.reply({ files: [attachment] });
        }

        if(command == "!viewgear") {
            const auxi = message.content.split(" ").slice(1).join(" ")
            const parsedAuxi = parseAuxi(auxi)
            const ids = parsedAuxi.ids
            const itemUpgradeTable = parsedAuxi.itemUpgradeTable
            const newItems = await getItem(ids, itemUpgradeTable)
            let itemCanvas = []
            for(let i = 0; i < newItems.length; i++) {
                if(newItems[i].type.toLowerCase() == "charm") continue
              itemCanvas.push(getItemCanvas(newItems[i]))
            }
            if(itemCanvas) {
                const combinedCanvas = combineCanvases(itemCanvas)
                if(!combinedCanvas) {
                    await message.reply("Item Not Found")
                    return
                }
                const buffer = combinedCanvas.toBuffer('image/png')
                const attachment = new AttachmentBuilder(buffer, 'combinedCanvas.png');   
                message.reply({ files: [attachment] });
            } else {
                message.reply("Item Not Found!")
            }
        }

        if(command == "!player") {
          const name = message.content.split(" ")[1]
          const playerInfo = await getPlayerInfo(name)
          console.log(playerInfo)
          let playerInfoString = ``
          for(let attr in playerInfo) {
            if(attr === "id") continue
            playerInfoString += `${attr}: ${playerInfo[attr]}\n`
          }
          await message.reply("```" + playerInfoString + "```")
        }

        if(command == "!cal") {
            const math = require('mathjs')
            const arguments = message.content.split(" ").slice(1).join(" ")
            console.log(arguments)
            message.reply(`${math.evaluate(arguments.trim())} is the answer, There you go, only if you learnt maths at preschool you wont have to use me`)
        }
    }} catch(e) {
        console.log(e)
        message.reply(`${message.author.username}, Check syntax or input XD, blank sucks btw L blank`)
    }
});
client.login(token)
