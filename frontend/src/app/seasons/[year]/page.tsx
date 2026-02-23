import SeasonDetailPage from "@/components/pages/seasons/SeasonDetailPage";

// This tells Next.js to await the params in page components
export default async function SeasonDetail({ params }: { params: Promise<{ year: string }> }) {
    const { year } = await params;

    return <SeasonDetailPage year={year} />;
}
