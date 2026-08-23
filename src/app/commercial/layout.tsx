import { ComingSoon } from "../../components/Ui";

export const metadata = { title: "Commercial" };

export default function CommercialLayout({ children }: { children: React.ReactNode }) {
  return <ComingSoon title="Commercial properties">{children}</ComingSoon>;
}
