import { REGEX_MAPS } from "./Constants"
import { regexIndexOf } from "./util"

export const segmentLogsByType = (entireLog, segmentType) => {
  const segments = []
  let startIndex = regexIndexOf(entireLog, REGEX_MAPS[segmentType].startRegex ,0)
  let shuffleRoundEnd = regexIndexOf(entireLog, REGEX_MAPS[segmentType].shuffleRoundEndRegex, startIndex+1)
  let offset = (regexIndexOf(entireLog, REGEX_MAPS[segmentType].endRegex, startIndex))
  if (segmentType === 'shuffle') {
    offset = shuffleRoundEnd < offset ? shuffleRoundEnd : offset;
  }
  let endIndex = entireLog.slice(offset).indexOf('\r\n') + 4 + offset
  if(startIndex >= 0 && endIndex >= 0) {
    segments.push({type: segmentType, startIndex, endIndex})
  }
  let nextStart = regexIndexOf(entireLog, REGEX_MAPS[segmentType].startRegex, endIndex)
  let nextEnd = regexIndexOf(entireLog, REGEX_MAPS[segmentType].endRegex, endIndex)
    while (nextStart > 0 && nextEnd > 0) {
      if(segmentType === 'shuffle') {
        startIndex = shuffleRoundEnd
      } else {
        startIndex = nextStart
      }
      shuffleRoundEnd = regexIndexOf(entireLog, REGEX_MAPS[segmentType].shuffleRoundEndRegex, startIndex+1)
      offset = (regexIndexOf(entireLog, REGEX_MAPS[segmentType].endRegex ,startIndex))
      
      if (segmentType === 'shuffle' && shuffleRoundEnd !== -1) {
        offset = shuffleRoundEnd < offset ? shuffleRoundEnd : offset;
      }
      endIndex = entireLog.slice(offset).indexOf('\r\n') + 4 + offset
      if ((startIndex !== -1 && endIndex !== -1) && startIndex < endIndex) {
        segments.push({type: segmentType, startIndex, endIndex})
      }
      if (segmentType === 'shuffle') {
        nextStart = shuffleRoundEnd
      } else {
        nextStart = regexIndexOf(entireLog, REGEX_MAPS[segmentType].startRegex, endIndex)
      }
      nextEnd = regexIndexOf(entireLog, REGEX_MAPS[segmentType].endRegex, endIndex)
    }
  return segments
 
}