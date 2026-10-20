import { EventRegistration } from "../../components/EventRegisterForm";
import { issueCaptcha, upcomingMondaySessions } from "../../lib/event";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Weekly Top 10 Tampa Deals",
  description:
    "Once a week we rank the top Tampa deals under $500K — condos, townhomes, single family homes, and land. Mondays, 7:30–8:00 PM.",
};

export default function EventPage() {
  const sessions = upcomingMondaySessions();
  const captcha = issueCaptcha();

  return (
    <div className="mx-auto max-w-5xl">
      <EventRegistration sessions={sessions} captcha={captcha} />
    </div>
  );
}
