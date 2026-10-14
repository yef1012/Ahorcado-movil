export function formatTime(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(wholeSeconds / 60).toString().padStart(2, '0')}:${(wholeSeconds % 60).toString().padStart(2, '0')}`;
}
