import DriverProfilePage from "@/components/pages/drivers/DriverProfilePage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DriverProfilePage id={id} />;
}
