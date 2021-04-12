export function getMedian(start = 0, end = 0, value = 0) {
  return Math.min(Math.max(start, value), end);
}

export function getLastMatchedThreshold(value: number, thresholds: number[]) {
  let matchedThreshold = 0;
  for (let i = 0; i < thresholds.length; i += 1) {
    if (value >= thresholds[i]) {
      matchedThreshold = thresholds[i];
    }
  }
  return matchedThreshold;
}