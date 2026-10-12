import Link from "next/link";

export const metadata = { title: "You’re registered" };

export default function EventThanksPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-16 text-center">
      <p className="text-xs font-semibold tracking-[0.18em] text-[#db2777] uppercase">Registered</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">Check your email</h1>
      <p className="mt-3 text-base leading-relaxed text-[#4b5563]">
        We sent your confirmation and a calendar invite with the meeting link. If you haven’t seen it,
        check your spam folder.
      </p>
      <Link
        href="/events"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white hover:bg-black"
      >
        Back to the event
      </Link>
    </div>
  );
}
