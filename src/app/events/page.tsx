import Link from "next/link";
import { EventRegisterForm } from "../../components/EventRegisterForm";
import { issueCaptcha, upcomingMondaySession } from "../../lib/event";

export const metadata = {
  title: "Monday Investor Session",
  description: "Register for the upcoming Monday 7:30 PM investor session.",
};

export default function EventPage() {
  const session = upcomingMondaySession();
  const captcha = issueCaptcha();

  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex items-center justify-between text-sm">
        <Link href="/" className="font-semibold tracking-wide text-[#6b7280] hover:text-[#111827]">
          REIP
        </Link>
        <span className="text-[#6b7280]">Weekly session</span>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article>
          <div className="overflow-hidden rounded-3xl bg-[linear-gradient(145deg,#5b21b6_0%,#db2777_55%,#fb7185_100%)] px-6 py-8 text-white shadow-[0_12px_40px_rgba(91,33,182,0.25)] sm:px-8 sm:py-10">
            <div className="inline-flex flex-col items-center rounded-2xl bg-white px-4 py-2 text-[#111827]">
              <span className="text-[11px] font-bold tracking-[0.16em] text-[#db2777]">{session.weekdayShort}</span>
              <span className="text-2xl font-bold leading-none">{session.dayNum}</span>
              <span className="text-[11px] font-semibold tracking-wide text-[#6b7280]">{session.monthShort}</span>
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">{session.title}</h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/90">
              A weekly look at Greater Tampa deals — cash flow, offers, and what to watch. One hour.
              The meeting link arrives by email after you register.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111827] text-sm font-semibold text-white">
              SK
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">Hosted by {session.host}</p>
              <p className="text-sm text-[#6b7280]">REIP · Greater Tampa</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm text-[#374151]">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-[#6b7280] uppercase">When</dt>
              <dd className="mt-0.5 font-medium text-[#111827]">{session.whenLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-[#6b7280] uppercase">Where</dt>
              <dd className="mt-0.5">Online. The link is in your confirmation email and calendar invite.</dd>
            </div>
          </dl>
        </article>

        <EventRegisterForm session={session} captcha={captcha} />
      </div>
    </div>
  );
}
