export default function getTime(time: string | undefined): number | undefined {
  if (!time) {
    return undefined;
  }
  const utcTime = time.match("Z") ? time : time.concat("Z");
  return new Date(utcTime).getTime();
}
