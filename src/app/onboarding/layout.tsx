import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={dmSans.className}>{children}</div>;
}
