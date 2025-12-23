import { APIGatewayProxyEvent } from "aws-lambda";
import { ReminderService } from "../services/reminderService";
import { formatResponse } from "../utils/responseFormatter";
import { withAuth } from "../utils/authRequire";

const service = new ReminderService();

const markAsTakenCore = async (event: APIGatewayProxyEvent, userId: string) => {
  try {
    const { medicationId } = JSON.parse(event.body || "{}");

    if (!medicationId) return formatResponse(400, { message: "ID Required" });

    const result = await service.markAsTaken(userId, medicationId);
    return formatResponse(200, result);
  } catch (error) {
    return formatResponse(500, { message: "Internal Error", error });
  }
};

export const handler = withAuth(markAsTakenCore);
