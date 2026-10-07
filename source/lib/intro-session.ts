/** One entrance per document visit; another only after 25 minutes of inactivity. */
export const INTRO_TIMEOUT = 25 * 60 * 1000;
export const ORB_DURATION = 6250;
export function createIntroSession(initialPath: string, now: number) {
  let entered = false;
  let lastActivity = now;
  let expired = false;
  return {
    enter(path: string, time: number) {
      expired ||= time - lastActivity >= INTRO_TIMEOUT;
      const show =
        path === "/" && ((!entered && initialPath === "/") || expired);
      entered = true;
      if (show) {
        expired = false;
        lastActivity = time;
      }
      return show;
    },
    activity(path: string, time: number) {
      expired ||= time - lastActivity >= INTRO_TIMEOUT;
      lastActivity = time;
      if (path === "/" && expired) {
        expired = false;
        return true;
      }
      return false;
    },
    finish(time: number) {
      entered = true;
      expired = false;
      lastActivity = time;
    },
  };
}
