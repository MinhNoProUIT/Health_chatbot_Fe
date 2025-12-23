import { APIGatewayProxyEvent } from "aws-lambda";
import { ReminderService } from "../services/reminderService";
import { formatResponse } from "../utils/responseFormatter";
import { withAuth } from "../utils/authRequire";

const service = new ReminderService();

const deleteMedicationCore = async (
  event: APIGatewayProxyEvent,
  userId: string
) => {
  try {
    const { medicationId } = JSON.parse(event.body || "{}");

    if (!medicationId) {
      return formatResponse(400, { message: "Missing medicationId" });
    }

    await service.deleteMedication(userId, medicationId);
    return formatResponse(200, { message: "Deleted successfully" });
  } catch (error) {
    return formatResponse(500, { message: "Error deleting medication", error });
  }
};

export const handler = withAuth(deleteMedicationCore);
