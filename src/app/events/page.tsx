import { EventRegistration } from "../../components/EventRegisterForm";
import { issueCaptcha, upcomingMondaySessions } from "../../lib/event";

export const metadata = {
  title: "Monday Investor Session",
  description: "Register for a Monday 7:30 PM investor session in the next month.",
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
