import EditPropertyClient from "./EditPropertyClient";
import { getPropertyById } from "@/lib/api/properties";

type ParamsType = Promise<{ id: string }>;

export default async function Page({ params }: { params: ParamsType }) {
  const { id } = await params;
  const propertyData = await getPropertyById(id);

  
  const allowedStatus = ["active", "inactive", "pending"] as const;
  const normalizedStatus: typeof allowedStatus[number] = allowedStatus.includes(propertyData.status as any)
    ? propertyData.status as typeof allowedStatus[number]
    : "pending";

  return (
    <EditPropertyClient
      id={id}
      property={{ ...propertyData, status: normalizedStatus }}
    />
  );
}