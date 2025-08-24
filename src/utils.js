// date formatting helper used by TaskCardGhost
export function fmtDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
}
