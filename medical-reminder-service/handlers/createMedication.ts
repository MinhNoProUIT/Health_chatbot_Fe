import { APIGatewayProxyEvent } from "aws-lambda";
import { ReminderService } from "../services/reminderService";
import { formatResponse } from "../utils/responseFormatter";
import { withAuth } from "../utils/authRequire"; // Import Middleware

const service = new ReminderService();

// 1. Tách logic chính ra, nhận userId làm tham số thứ 2
const createMedicationCore = async (
  event: APIGatewayProxyEvent,
  userId: string
) => {
  try {
    // userId ở đây là HÀNG XỊN (đã được verify từ Token)
    // Không cần dòng lấy header nữa!

    const body = JSON.parse(event.body || "{}");

    if (!body.name || !body.time)
      return formatResponse(400, { message: "Missing fields" });

    const result = await service.createMedication(body, userId); // Truyền userId vào service
    return formatResponse(201, result);
  } catch (err) {
    return formatResponse(500, { message: "Internal Error", error: err });
  }
};

// 2. Bọc lại bằng withAuth trước khi export
export const handler = withAuth(createMedicationCore);
