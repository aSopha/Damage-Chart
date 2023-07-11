export const regexIndexOf = (text, re, i) => {
  var indexInSuffix = text.slice(i).search(re);
  return indexInSuffix < 0 ? indexInSuffix : indexInSuffix + i;
}

export const formatSeconds = (time) => {
  const minutes = Math.floor(time/60).toString()
  let seconds = (time%60).toString();
  if (seconds.length < 2) {
    seconds = '0'+seconds
  }
  return (`${minutes}:${seconds}`)
}