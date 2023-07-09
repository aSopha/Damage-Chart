export const spellBlackList = [
  'Void Shift',
  'Cauterize'
]

const spellAbsorbedAttributes = [
  'subevent',
  'sourceGUID',
  'sourceName',
  'sourceFlags',
  'sourceRaidFlags',
  'destGUID',
  'destName',
  'destFlags',
  'destRaidFlags',
  'spellId',
  'spellName',
  'spellSchool',
  'absorbSourceGUID',
  'absorbSourceName',
  'absorbSourceFlags',
  'absorbSourceRaidFlags',
  'absorbSpellId',
  'absorbSpellName',
  'absorbSpellSchool',
  'absorbed',
  'baseAmount',
  null,

]
const swingAbsorbedAttributes = [
  'subevent',
  'sourceGUID',
  'sourceName',
  'sourceFlags',
  'sourceRaidFlags',
  'destGUID',
  'destName',
  'destFlags',
  'destRaidFlags',
  'absorbSourceGUID',
  'absorbSourceName',
  'absorbSourceFlags',
  'absorbSourceRaidFlags',
  'absorbSpellId',
  'absorbSpellName',
  'absorbSpellSchool',
  'absorbed',
  'baseAmount',
  null
]
const spellDamageAttributes = [
  'subevent',
  'sourceGUID',
  'sourceName',
  'sourceFlags',
  'sourceRaidFlags',
  'destGUID',
  'destName',
  'destFlags',
  'destRaidFlags',
  'spellId',
  'spellName',
  'spellSchool',
  'infoGUID',
  'ownerGUID',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'amount',
  'baseAmount',
  null,
  null,
  null,
  null,
  'absorbed'
]
const spellHealAttributes = [
  'subevent',
  'sourceGUID',
  'sourceName',
  'sourceFlags',
  'sourceRaidFlags',
  'destGUID',
  'destName',
  'destFlags',
  'destRaidFlags',
  'spellId',
  'spellName',
  'spellSchool',
  'infoGUID',
  'ownerGUID',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'amount',
]
const swingDamageAttributes = [
  'subevent',
  'sourceGUID',
  'sourceName',
  'sourceFlags',
  'sourceRaidFlags',
  'destGUID',
  'destName',
  'destFlags',
  'destRaidFlags',
  'infoGUID',
  'ownerGUID',
]
const swingDamageLandedAttributes = [
  'subevent',
  'sourceGUID',
  'sourceName',
  'sourceFlags',
  'sourceRaidFlags',
  'destGUID',
  'destName',
  'destFlags',
  'destRaidFlags',
  'infoGUID',
  'ownerGUID',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'amount',
  'baseAmount',
  null,
  null,
  null,
  null,
  'absorbed'
]
const summonAttributes = [
  'subevent',
  'sourceGUID',
  'sourceName',
  'sourceFlags',
  'sourceRaidFlags',
  'destGUID',
  'destName',
  'destFlags',
  'destRaidFlags',
  'spellId',
  'spellName',
  'spellSchool',
]
const combatantAttributes = [
  'subevent',
  'playerGUID',
  'faction',
  'strength',
  'agility',
  'stamina',
  'intelligence',
  'dodge',
  'parry',
  'block',
  'critMelee',
  'critRanged',
  'critSpell',
  'speed',
  'lifesteal',
  'hasteMelee',
  'hasteRanged',
  'hasteSpell',
  'avoidance',
  'mastery',
  'versatilityDamageDone',
  'versatilityHealingDone',
  'versatilityDamageTaken',
  'armor',
  'currentSpecID'
]
export const ATTRIBUTES_MAP = {
  spellDamageAttributes,
  swingDamageLandedAttributes,
  spellAbsorbedAttributes,
  swingAbsorbedAttributes,
  swingDamageAttributes,
  summonAttributes,
  combatantAttributes,
  spellHealAttributes,
}

export const WOW_SPEC_CLASS_LOOKUP = {
  'Demon Hunter': [577, 581, 1456],
  Druid: [102, 103, 104, 105, 1447],
  'Death Knight': [250, 251, 252, 1455],
  Evoker: [1467, 1468, 1473, 1465],
  Hunter: [253, 254, 255, 1448],
  Mage: [62, 63, 64, 1449],
  Monk: [268, 270, 269, 1450],
  Paladin: [65, 66, 70, 1451],
  Priest: [256, 257, 258, 1452],
  Rogue: [259, 260, 261, 1453],
  Shaman: [262, 263, 264, 1444],
  Warlock: [265, 266, 267, 1454],
  Warrior: [71, 72, 73, 1446],
}

export const WOW_CLASS_COLOR_LOOKUP = {
  'Demon Hunter': '	#A330C9',
  Druid: '#FF7C0A',
  'Death Knight': '#C41E3A',
  Evoker: '#33937F',
  Hunter: '#AAD372',
  Mage: '#3FC7EB',
  Monk: '#00FF98',
  Paladin: '#F48CBA',
  Priest: '#FFFFFF',
  Rogue: '#FFF468',
  Shaman: '#0070DD',
  Warlock: '#8788EE',
  Warrior: '#C69B6D',
}

const arenaStartRegex = /\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}.\d{1,3}  ARENA_MATCH_START/g;
const arenaEndRegex = /\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}.\d{1,3}  ARENA_MATCH_END/g;

const dungeonStartRegex = /\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}.\d{1,3}  CHALLENGE_MODE_START/g;
const dungeonEndRegex = /\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}.\d{1,3}  CHALLENGE_MODE_END/g;

export const REGEX_MAPS = {
  arena: {
    startRegex: arenaStartRegex,
    endRegex: arenaEndRegex
  },
  dungeon: {
    startRegex: dungeonStartRegex,
    endRegex: dungeonEndRegex
  }
}

export const STROKE_LIST = [
  "1",
  "5 5 8 5",
  "10 10 13 10",
  "15 15 20 15",
  "4 4 4 4",
  "5 5 5 5",
  "5 5 8 5",
  "10 10 13 10",
  "15 15 20 15",
  "4 4 4 4",
  "5 5 5 5",
  "5 5 8 5",
  "10 10 13 10",
  "15 15 20 15",
  "4 4 4 4",
  "5 5 5 5",
]

export const PRECISION_MAP = {
  'high': 1,
  'medium': 5,
  'low': 30,
}