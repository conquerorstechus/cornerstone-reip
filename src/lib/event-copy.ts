export const EVENT_DESCRIPTION = [
  "Once a week we scrape every active listing that is within 1 hour of Tampa, and under $500K and using N8N and rank the Top 10 by est ROI across Condos, Townhomes, Single Family Homes and Land.",
  "We want to present these properties to you to discuss pros/ cons, and get your feedback, we'll keep it short, fast and on point.",
] as const;

export const PRESENTER_INTRO_URL = "https://sam.tampabayguide.org";
export const PRESENTER_INTRO_LABEL = "sam.tampabayguide.org";

export const EVENT_DISCLAIMER =
  "Any property analysis presented is for educational and informational purposes only and should not be considered an appraisal or legal, tax, or financial advice.";

/** Plain-text description used on the page and in the registration email. */
export function eventDescriptionText(): string {
  return [
    ...EVENT_DESCRIPTION,
    `Presenter Intro: ${PRESENTER_INTRO_LABEL}`,
    `Disclaimer: ${EVENT_DISCLAIMER}`,
  ].join("\n\n");
}
