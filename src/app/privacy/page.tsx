import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How REIP collects, uses, and shares personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">LEGAL</p>
        <h1 className="display mt-1 text-2xl font-semibold sm:text-3xl">Privacy policy</h1>
        <p className="mt-2 text-sm text-taupe">Last updated October 12, 2026.</p>
      </div>

      <div className="space-y-5 rounded-lg border border-[#e5e7eb] bg-white px-5 py-5 text-[14px] leading-relaxed text-[#374151] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <section>
          <h2 className="text-base font-semibold text-[#1e3a5f]">Who we are</h2>
          <p className="mt-2">
            REIP is operated by Cornerstone Digital Technologies for Sam Kasimalla, a Florida real
            estate agent with LPT Realty LLC. This policy covers the REIP website, including deal
            lists, the mortgage calculator, and event registration. Mailing address: 19046 Bruce B
            Downs Blvd, #1376, Tampa, FL 33647. Phone: 908-922-1063.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1e3a5f]">What we collect</h2>
          <p className="mt-2">We collect only what you give us and what the site needs to run:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Name, email, and, on some forms, phone number.</li>
            <li>Which Monday session you register for, and that you agreed to receive emails.</li>
            <li>Which deal you asked about, and mortgage numbers you enter in the calculator.</li>
            <li>
              Basic technical logs from our host, such as IP address and browser type, used to
              deliver and protect the site.
            </li>
          </ul>
          <p className="mt-2">
            We do not ask for Social Security numbers, bank account numbers, or payment card
            numbers on this site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1e3a5f]">How we use it</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Send the event confirmation, meeting link, and calendar invite you requested.</li>
            <li>Send the listing address or quote you asked for.</li>
            <li>
              Send follow-up emails about sessions, deals, and related services when you have
              agreed to receive them.
            </li>
            <li>Run, secure, and fix the site.</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal information. We do not share it for other companies’
            independent advertising.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1e3a5f]">Emails and texts</h2>
          <p className="mt-2">
            Event registration is consent to receive emails about that session and related updates.
            Other forms on the site are consent to be contacted at the email or phone number you
            enter, including texts where a phone number is requested. Message and data rates may
            apply to texts. To opt out of marketing emails and texts, use the{" "}
            <Link href="/opt-out" className="font-semibold text-[#1d4ed8] hover:underline">
              opt-out form
            </Link>
            . That form emails us your request. Opting out does not cancel a confirmation we already
            need to send for a session you registered for.
          </p>
          <p className="mt-2">
            Commercial email includes our name and mailing address, as required by the CAN-SPAM
            Act.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1e3a5f]">Who helps us</h2>
          <p className="mt-2">
            We use service providers to host the site, deliver email, send calendar invites, and
            route form submissions. They may process your information only to perform those
            services. The meeting itself is on Google Meet.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1e3a5f]">How long we keep it</h2>
          <p className="mt-2">
            We keep contact and registration records while they are useful for the session, the
            business relationship, or a legal need, and then delete or de-identify them. You can
            ask us to correct or delete your information through the{" "}
            <Link href="/opt-out" className="font-semibold text-[#1d4ed8] hover:underline">
              opt-out form
            </Link>
            . We may keep a record of an opt-out so we do not contact you again.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1e3a5f]">Security and children</h2>
          <p className="mt-2">
            We use reasonable safeguards for a small business website. No method of transmission or
            storage is perfectly secure. This site is not directed to children under 13, and we do
            not knowingly collect their information.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[#1e3a5f]">Changes</h2>
          <p className="mt-2">
            If we change this policy, we will post the new version on this page and update the date
            above. Continued use of the site after that date means the new version applies.
          </p>
        </section>
      </div>

      <p className="text-[13px] text-[#6b7280]">
        Estimates and licensing notices are on the{" "}
        <Link href="/disclaimers" className="font-semibold text-[#1d4ed8] hover:underline">
          disclaimers
        </Link>{" "}
        page.
      </p>
    </div>
  );
}
