import { APIGatewayProxyEvent } from "aws-lambda";
import { ReminderService } from "../services/reminderService";
import { formatResponse } from "../utils/responseFormatter";
import { withAuth } from "../utils/authRequire";

const service = new ReminderService();

const getDailyScheduleCore = async (
  event: APIGatewayProxyEvent,
  userId: string
) => {
  try {
    const result = await service.getDailySchedule(userId);
    return formatResponse(200, result);
  } catch (error) {
    return formatResponse(500, { message: "Internal Error", error });
  }
};

export const handler = withAuth(getDailyScheduleCore);
