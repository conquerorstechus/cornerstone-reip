import { createHmac, timingSafeEqual } from "crypto";

export const EVENT_TIME_ZONE = "America/New_York";
export const EVENT_TITLE = "Monday Investor Session";
export const EVENT_HOST = "Sam Kasimalla";
export const EVENT_DURATION_MINUTES = 60;

const DEFAULT_WEBHOOK = "https://n8n.srv1393511.hstgr.cloud/webhook/event-registration";
const DEFAULT_MEETING_LINK = "https://meet.google.com/hgy-yoss-wek";

export function eventRegistrationWebhook(): string {
  return process.env.EVENT_REGISTRATION_WEBHOOK_URL?.trim() || DEFAULT_WEBHOOK;
}

/** Meeting link sent with the registration. EVENT_MEETING_URL overrides the default. */
export function configuredMeetingLink(): string {
  const link = process.env.EVENT_MEETING_URL?.trim();
  return link && link.startsWith("http") ? link : DEFAULT_MEETING_LINK;
}

function captchaSecret(): string {
  return process.env.EVENT_CAPTCHA_SECRET?.trim() || "reip-event-captcha-v1";
}

export type CaptchaChallenge = {
  a: number;
  b: number;
  token: string;
};

export function issueCaptcha(): CaptchaChallenge {
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 2 + Math.floor(Math.random() * 8);
  const exp = Date.now() + 15 * 60 * 1000;
  const payload = `${exp}.${a + b}`;
  const sig = createHmac("sha256", captchaSecret()).update(payload).digest("base64url");
  return { a, b, token: `${payload}.${sig}` };
}

export function verifyCaptcha(token: string, given: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [exp, answer, sig] = parts;
  const payload = `${exp}.${answer}`;
  const expected = createHmac("sha256", captchaSecret()).update(payload).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  if (!Number.isFinite(Number(exp)) || Number(exp) < Date.now()) return false;
  return String(given).trim() === answer;
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
};

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const map = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: map.weekday ?? "",
  };
}

/** UTC instant for a wall-clock time in America/New_York. */
function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const seen = zonedParts(new Date(utcGuess), EVENT_TIME_ZONE);
  const seenUtc = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute);
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(utcGuess + (desired - seenUtc));
}

export type MondaySession = {
  id: "monday-730";
  title: string;
  host: string;
  timeZone: string;
  start: string;
  end: string;
  weekdayShort: string;
  monthShort: string;
  dayNum: string;
  dateLine: string;
  timeLine: string;
  whenLabel: string;
};

export function upcomingMondaySession(now = new Date()): MondaySession {
  const today = zonedParts(now, EVENT_TIME_ZONE);
  const todayStart = zonedTimeToUtc(today.year, today.month, today.day, 0, 0);

  let start: Date | null = null;
  for (let add = 0; add < 14; add++) {
    const probe = new Date(todayStart.getTime() + add * 24 * 60 * 60 * 1000);
    const parts = zonedParts(probe, EVENT_TIME_ZONE);
    if (parts.weekday !== "Mon") continue;
    const candidate = zonedTimeToUtc(parts.year, parts.month, parts.day, 19, 30);
    if (candidate.getTime() > now.getTime()) {
      start = candidate;
      break;
    }
  }
  if (!start) {
    start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  const end = new Date(start.getTime() + EVENT_DURATION_MINUTES * 60 * 1000);

  const dateLine = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(start);
  const startTime = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
  const endTime = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(end);
  const monthShort = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    month: "short",
  })
    .format(start)
    .toUpperCase();
  const dayNum = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    day: "numeric",
  }).format(start);

  return {
    id: "monday-730",
    title: EVENT_TITLE,
    host: EVENT_HOST,
    timeZone: EVENT_TIME_ZONE,
    start: start.toISOString(),
    end: end.toISOString(),
    weekdayShort: "MON",
    monthShort,
    dayNum,
    dateLine,
    timeLine: `${startTime} – ${endTime}`,
    whenLabel: `${dateLine} · ${startTime} – ${endTime}`,
  };
}
