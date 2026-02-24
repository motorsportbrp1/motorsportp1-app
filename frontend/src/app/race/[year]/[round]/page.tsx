import RaceDetailPage from "@/components/pages/races/RaceDetailPage";

export default function RacePage({ params }: { params: { year: string, round: string } }) {
    // Assuming you have logic here to find raceId based on year and round, 
    // or you pass raceId down directly. Let's assume you fetch it or the page fetches it.
    // We will just pass raceId as a prop. Let's pass year and round for now or derive raceId out of it in the page.
    // We'll modify RaceDetailPage to accept year and round or assume we get id.
    // For now, I will use a dummy ID '1121' just so it renders, but in reality you need to pass the proper UUID.
    return <RaceDetailPage raceId="1121" />;
}
