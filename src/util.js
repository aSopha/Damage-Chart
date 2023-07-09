export const regexIndexOf = (text, re, i) => {
  var indexInSuffix = text.slice(i).search(re);
  return indexInSuffix < 0 ? indexInSuffix : indexInSuffix + i;
}
