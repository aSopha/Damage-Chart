import { REGEX_MAPS } from "./Constants"
import { regexIndexOf } from "./util"

export const segmentLogsByType = (entireLog, segmentType) => {
  const segments = []
  let startIndex = regexIndexOf(entireLog, REGEX_MAPS[segmentType].startRegex ,0)
  let offset = (regexIndexOf(entireLog, REGEX_MAPS[segmentType].endRegex ,startIndex))
  let endIndex = entireLog.slice(offset).indexOf('\r\n') + 4 + offset
  if(startIndex >= 0 && endIndex >= 0) {
    segments.push({type: segmentType, startIndex, endIndex})
  }
    while ((regexIndexOf(entireLog, REGEX_MAPS[segmentType].startRegex, endIndex) > 0) && (regexIndexOf(entireLog, REGEX_MAPS[segmentType].endRegex, endIndex) > 0)) {
      startIndex = regexIndexOf(entireLog, REGEX_MAPS[segmentType].startRegex, endIndex)
      offset = (regexIndexOf(entireLog, REGEX_MAPS[segmentType].endRegex ,endIndex))
      endIndex = entireLog.slice(offset).indexOf('\r\n') + 4 + offset
      segments.push({type: segmentType, startIndex, endIndex})
    }
  return segments
 
}