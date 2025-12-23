import { APIGatewayProxyEvent } from "aws-lambda";
import { ReminderService } from "../services/reminderService";
import { formatResponse } from "../utils/responseFormatter";
import { withAuth } from "../utils/authRequire";

const service = new ReminderService();

const getAllMedicationsCore = async (
  event: APIGatewayProxyEvent,
  userId: string
) => {
  try {
    // userId xịn từ Token
    const result = await service.getAllMedications(userId);
    return formatResponse(200, result);
  } catch (error) {
    console.error(error);
    return formatResponse(500, { message: "Internal Server Error", error });
  }
};

export const handler = withAuth(getAllMedicationsCore);
