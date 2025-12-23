import { APIGatewayProxyEvent } from "aws-lambda";
import { ReminderService } from "../services/reminderService";
import { formatResponse } from "../utils/responseFormatter";
import { withAuth } from "../utils/authRequire";

const service = new ReminderService();

const toggleMedicationCore = async (
  event: APIGatewayProxyEvent,
  userId: string
) => {
  try {
    const { medicationId, isActive } = JSON.parse(event.body || "{}");

    if (!medicationId || isActive === undefined) {
      return formatResponse(400, {
        message: "Missing medicationId or isActive status",
      });
    }

    await service.toggleMedication(userId, medicationId, isActive);
    return formatResponse(200, { message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    return formatResponse(500, { message: "Internal Server Error", error });
  }
};

export const handler = withAuth(toggleMedicationCore);
