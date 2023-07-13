import { ATTRIBUTES_MAP, spellBlackList, WOW_SPEC_CLASS_LOOKUP, WOW_CLASS_COLOR_LOOKUP } from './Constants';
import { formatSeconds } from './util';
import * as moment from 'moment';

export const parseEvents = (combatLog, filterDamageNotDoneToPlayers) => {
  const lines = combatLog.split('\r\n')
  const spellDamageLines = lines.filter((line) => {
    return (line.includes('_DAMAGE') && !line.includes('SWING_'))
  })
  const spellDamageAbsorbedLines = lines.filter((line) => {
    return (line.includes('SPELL_ABSORBED'))
  })

  // used exclusively to determine pet owners
  const swingDamagePetLines = lines.filter((line) => {
    return (line.includes('SWING_DAMAGE') && !line.includes('_LANDED') && line.includes('Pet-'))
  })

  const swingDamageLines = lines.filter((line) => {
    return line.includes('SWING_DAMAGE_LANDED')
  })

  const summonLines = lines.filter((line) => {
    return line.includes('_SUMMON')
  })
  const combatantInfoLines = lines.filter((line) => {
    return line.includes('COMBATANT_INFO')
  })
  const spellHealLines = lines.filter((line) => {
    return (line.includes('SPELL_HEAL') && !line.includes('_ABSORBED'))
  })
  
  const summonEvents = parseEventsByType(summonLines, 'summonAttributes')
  let spellDamageEvents = parseEventsByType(spellDamageLines, 'spellDamageAttributes')
  let spellAbsorbedEvents = parseEventsByType(spellDamageAbsorbedLines, 'spellAbsorbedAttributes')
  let swingDamageLandedEvents = parseEventsByType(swingDamageLines, 'swingDamageLandedAttributes')
  let swingDamagePetEvents = parseEventsByType(swingDamagePetLines, 'swingDamageAttributes')
  const parsedCombatantInfo = parseEventsByType(combatantInfoLines, 'combatantAttributes')
  let spellHealEvents = parseEventsByType(spellHealLines, 'spellHealAttributes')
  const players = setupPlayers(parsedCombatantInfo)
  
  const petDamagedEvents = spellDamageEvents.filter((event) => {
    return (event.destGUID.includes('Pet-'))
  })

  if (filterDamageNotDoneToPlayers) {
    spellDamageEvents = filterDamageToPlayers(spellDamageEvents)
    swingDamageLandedEvents = filterDamageToPlayers(swingDamageLandedEvents)
    spellAbsorbedEvents = filterDamageToPlayers(spellAbsorbedEvents)
  }

  addPetsToPlayers(summonEvents,players)
  let playersWithPets =  addDamagedPetsToPlayers(petDamagedEvents, addPetsToPlayersFromSwingDamage(swingDamagePetEvents, addPetsToPlayers(summonEvents,players)))

  const playerDamageEvents = [
      ...spellDamageEvents.filter((event) => {
        return playersWithPets.get(event.sourceGUID)
    }),
      ...swingDamageLandedEvents.filter((event) => {
        return playersWithPets.get(event.sourceGUID)
    }),
      ...spellAbsorbedEvents.filter((event) => {
      return playersWithPets.get(event.sourceGUID)
    })
  ]
  const playerHealEvents = spellHealEvents.filter((event) => {
    return playersWithPets.get(event.sourceGUID)
  })
  const populatedPlayers = populateHealEventsIntoPlayers(
    playerHealEvents,
    populateDamageEventsIntoPlayers(playerDamageEvents, playersWithPets)
  )
  
  const petEvents = [
    ...getPetEventsFromDamageEvents(spellDamageEvents, populatedPlayers),
    ...getPetEventsFromDamageEvents(swingDamageLandedEvents, populatedPlayers),
    ...getPetEventsFromDamageEvents(spellAbsorbedEvents, populatedPlayers)
  ]

  const playerData = populatePlayerNames(populatedPlayers)
  
  const binnedPlayerEvents = binPlayerAndPetEvents(playerDamageEvents, petEvents, playerData)

  const filteredBinnedEvents = binnedPlayerEvents.filter(n => n)
  return {filteredBinnedEvents, players: playerData}
}

const parseEventsByType = (lines, type) => {
  let events = []
  for (const line of lines) {
    if(line.length>0) {
      const event = parseEventFromLine(line, type)
      if(event) {
        events.push(event)
      }
    }
  }
  return events
}
const addPetsToPlayers = (summonEvents, players) => {
  const playersWithPets = new Map(players)
  for (const event of summonEvents) {
    const currentPlayer = playersWithPets.get(event.sourceGUID);
    
    if(currentPlayer) {
      if(!currentPlayer.pets.includes(event.destGUID)) {
        currentPlayer.pets.push(event.destGUID)
        playersWithPets.set(event.sourceGUID, currentPlayer )
      }
    }
  }
  return playersWithPets

}

// If a summon event is missed, we can still get the owner of the pet if it's damaged
const addDamagedPetsToPlayers = (petDamagedEvents, players) => {
  const playersWithPets = new Map(players)
  for (const event of petDamagedEvents) {
    const ownerGUID = event.ownerGUID
    if (ownerGUID) {
      const owner = playersWithPets.get(ownerGUID)
      if (!owner.pets.includes(event.destGUID)) {
        owner.pets.push(event.destGUID)
        playersWithPets.set(ownerGUID, owner)
      }
    } 
  }
  return playersWithPets
}
// If a summon event is missed,  we can still get the owner from a pet SWING_DAMAGE event
const addPetsToPlayersFromSwingDamage = (petSwingDamageEvents, players) => {
  const playersWithPets = new Map(players)
  for (const event of petSwingDamageEvents) {
    const ownerGUID = event.ownerGUID
    if (ownerGUID) {
      const owner = playersWithPets.get(ownerGUID)
      if (owner && !owner.pets.includes(event.sourceGUID)) {
        owner.pets.push(event.sourceGUID)
        playersWithPets.set(ownerGUID, owner)
      }
    } 
  }
  return playersWithPets
}

const filterDamageToPlayers = (events) => {
  return events.filter((event) => {
    return event.destGUID.includes('Player')
  })
}

const getPetEventsFromDamageEvents = (damageEvents, players) => {
  const playersList = Array.from(players.values())
  const petEvents = []  
  for (const event of damageEvents) {
    for(const player of playersList) {
      if(player.pets.includes(event.sourceGUID)) {
        petEvents.push(event)
      }
    }
  }
  return petEvents
}

const truncateEvents = (events, startTime) => {
  const sortedEvents = events.sort((x , y) => {
    return y.timestamp - x.timestamp
  })
  return sortedEvents.map((event) => {
    let relativeTime
    const truncatedDateTime = moment(event.date+'-'+event.timestamp, 'MM/DD-HH:mm:ss.SSS');
    truncatedDateTime.milliseconds(0)
    if (!startTime) {
      startTime = truncatedDateTime
      relativeTime = 0
    } else {
      relativeTime = (truncatedDateTime - startTime)/1000
    }
    return {...event, relativeTime}
  })
}

const getPetOwnerNameFromEvent = (event, players) => {
  const playersList = Array.from(players.values())
  for(const index in playersList) {
    if(playersList[index].pets.includes(event.sourceGUID)) {
      return playersList[index].name
    }
  }
}

const sortEventsByTime = (events) => {
  return events.sort((x,y) => {
    return parseFloat(x.date.replaceAll('/','') +  x.timestamp.replaceAll(':','')) - parseFloat(y.date.replaceAll('/','') + y.timestamp.replaceAll(':',''))
    })
}

const binPlayerAndPetEvents = (playerEvents, petEvents, players) => {
  const sortedPlayerEvents = sortEventsByTime(playerEvents)
  const sortedPetEvents = sortEventsByTime(petEvents)
  const firstPlayerEventStartTime = moment(sortedPlayerEvents[0].date+'-'+sortedPlayerEvents[0].timestamp, 'MM/DD-HH:mm:ss.SSS');
  const firstPetEventStartTime = moment(sortedPlayerEvents[0].date+'-'+sortedPlayerEvents[0].timestamp, 'MM/DD-HH:mm:ss.SSS');
  const startTime = firstPlayerEventStartTime < firstPetEventStartTime ? firstPlayerEventStartTime : firstPetEventStartTime
  const truncatedPlayerEvents = truncateEvents(sortedPlayerEvents, startTime.milliseconds(0))
  const truncatedPetEvents = truncateEvents(sortedPetEvents, startTime.milliseconds(0))
  const binnedPlayerDamage = truncatedPlayerEvents.reduce((acc, currentEvent) => {
    if (!acc[currentEvent.relativeTime]) {
      acc[currentEvent.relativeTime] = {}
    }
    const sourceName = currentEvent.sourceName
    if (!acc[currentEvent.relativeTime][sourceName]) {
      acc[currentEvent.relativeTime][sourceName] = 0
      acc[currentEvent.relativeTime].time = currentEvent.relativeTime
      acc[currentEvent.relativeTime].formattedTime = formatSeconds(currentEvent.relativeTime)

    } 
    const combinedDamage = combineDealtAndAbsorbedDamage(currentEvent)
    acc[currentEvent.relativeTime][sourceName] += combinedDamage
    return acc;
  },[])

  const binnedPlayerAndPetDamage = truncatedPetEvents.reduce((acc, currentEvent) => {
    if (!acc[currentEvent.relativeTime]) {
      acc[currentEvent.relativeTime] = {}
    }
    const sourceName = getPetOwnerNameFromEvent(currentEvent, players)
    if (!acc[currentEvent.relativeTime][sourceName]) {
      acc[currentEvent.relativeTime][sourceName] = 0
      acc[currentEvent.relativeTime].time = currentEvent.relativeTime
      acc[currentEvent.relativeTime].formattedTime = formatSeconds(currentEvent.relativeTime)
    } 
    const combinedDamage = combineDealtAndAbsorbedDamage(currentEvent)
    acc[currentEvent.relativeTime][sourceName] += combinedDamage
    return acc;
  }, binnedPlayerDamage)
  return binnedPlayerAndPetDamage

}

const setupPlayers = (combatantInfo) => {
  const players = new Map()
  for (const combatant of combatantInfo) {
    const { wowClass, color } = getWowClassAndColor(combatant.currentSpecID)
    combatant.class = wowClass
    combatant.color = color
    combatant.pets = []
    players.set(combatant.playerGUID, combatant)
  }
  return players
}

const parseEventFromLine = (line, eventType) => {
  const values = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
  const event = {}
  let attributesMapKey = eventType
  if (eventType === 'spellAbsorbedAttributes' && values.length < 20) {
    attributesMapKey = 'swingAbsorbedAttributes'
  }
  for (let i = 0; i < ATTRIBUTES_MAP[attributesMapKey].length; i++) {
      const formattedValue = values[i].trim().replace(/\n/g, '').replace(/(^"|"$)/g, '').trim().replace(/\s+/g, ' ')
      if (i === 0) {
          const [date, timestamp, subevent] = formattedValue.split(/\s+/)
          Object.assign(event, { date, timestamp, subevent })
      } else if (ATTRIBUTES_MAP[attributesMapKey][i]) {
          event[ATTRIBUTES_MAP[attributesMapKey][i]] = formattedValue
      }
  }
  if (spellBlackList.includes(event.spellName)) {
    return undefined
  }
  
  return event
}

const populateDamageEventsIntoPlayers = (lines, players) => {
  const populatedPlayers = new Map(players);
  for (const line of lines) {
    const player = populatedPlayers.get(line.sourceGUID)
    if(!player.damageLog) {
      player.totalDamage = 0
      player.damageLog = []
      populatedPlayers.set(line.sourceGUID, player)
    }
    player.damageLog.push(line)
    const combinedDamage = combineDealtAndAbsorbedDamage(line)
    player.totalDamage += combinedDamage
    populatedPlayers.set(line.sourceGUID,player)
  }
  return populatedPlayers
}

const populateHealEventsIntoPlayers = (lines, players) => {
  const populatedPlayers = new Map(players);
  for (const line of lines) {
    const player = populatedPlayers.get(line.sourceGUID)
    if(!player.healLog) {
      player.healLog = []
      populatedPlayers.set(line.sourceGUID, player)
    }
    player.healLog.push(line)
    populatedPlayers.set(line.sourceGUID,player)
  }
  return populatedPlayers
}

const combineDealtAndAbsorbedDamage = (line) => {
  return (line.subevent === 'SPELL_ABSORBED') ? parseInt(line.absorbed) : (parseInt(line.amount))
}
const populatePlayerNames = (players) => {
  for (const [player, data] of players.entries()) {
    const playerName = data.damageLog ? data.damageLog[0].sourceName : data.healLog[0].sourceName
    data.name = playerName
    players.set(player, data)
  }
  return players
}

function getWowClassAndColor(specId) {
  for (const wowClass in WOW_SPEC_CLASS_LOOKUP) {
      if (WOW_SPEC_CLASS_LOOKUP[wowClass].includes(parseInt(specId))) {
          return { wowClass, color: WOW_CLASS_COLOR_LOOKUP[wowClass] }
      }
  }
}
