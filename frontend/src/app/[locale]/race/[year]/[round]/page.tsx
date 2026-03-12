import RaceDetailPage from "@/components/pages/races/RaceDetailPage";

export default async function RacePage({ params }: { params: Promise<{ year: string, round: string }> }) {
    const resolvedParams = await params;
    return <RaceDetailPage year={Number(resolvedParams.year)} round={Number(resolvedParams.round)} />;
}

