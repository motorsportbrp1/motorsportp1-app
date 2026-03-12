import SessionAnalyzerPage from "@/components/pages/SessionAnalyzerPage";

export default async function SessionPage({
    params,
}: {
    params: Promise<{ year: string; round: string; type: string }>;
}) {
    const resolvedParams = await params;

    return (
        <SessionAnalyzerPage
            initialYear={Number(resolvedParams.year)}
            initialRound={Number(resolvedParams.round)}
            initialSession={resolvedParams.type}
        />
    );
}
