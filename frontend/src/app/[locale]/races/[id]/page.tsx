import RaceDetailPage from "@/components/pages/races/RaceDetailPage";

export const metadata = {
    title: 'Race Detail | MotorSport P1',
    description: 'Detailed classification and statistics for the race weekend.',
}

export default async function RaceDetailRoute({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <RaceDetailPage raceId={id} />;
}
