import { notFound } from "next/navigation";
import ElectivePage from "../../elective_page";
import { getElectiveConfig, getAllElectiveSlugs } from "../../../lib/electiveConfig";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ElectiveSlugPage({ params }: Props) {
  const { slug } = await params;
  const config = getElectiveConfig(slug);

  if (!config) {
    notFound();
  }

  return <ElectivePage config={config} />;
}

export async function generateStaticParams() {
  return getAllElectiveSlugs().map((slug) => ({ slug }));
}
