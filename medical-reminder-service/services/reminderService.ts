import { v4 as uuidv4 } from "uuid";
import {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  docClient,
  TABLE_NAME,
  Medication,
  IntakeLog,
  DailyReminderItem,
  ReminderStats,
} from "../models/medication.model";

export class ReminderService {
  // Create new medication
  async createMedication(
    data: Partial<Medication>,
    userId: string
  ): Promise<Medication> {
    const id = uuidv4();
    const newMed: Medication = {
      id,
      userId,
      name: data.name!,
      dosage: data.dosage!,
      frequency: data.frequency || "DAILY",
      time: data.time!,
      takeWithFood: data.takeWithFood || false,
      isActive: true,
      createdAt: new Date().toISOString(),
      type: "MEDICATION",
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: `MED#${id}`,
        ...newMed,
      },
    });

    await docClient.send(command);
    return newMed;
  }

  // Get meds for today + check if they are taken
  async getDailySchedule(userId: string): Promise<DailyReminderItem[]> {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Fetch all medications
    const medsCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "MED#",
      },
    });

    // 2. Fetch today's intake logs
    const logsCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": `LOG#${today}`,
      },
    });

    const [medsResult, logsResult] = await Promise.all([
      docClient.send(medsCommand),
      docClient.send(logsCommand),
    ]);

    const meds = (medsResult.Items as Medication[]) || [];
    const logs = (logsResult.Items as IntakeLog[]) || [];

    const takenMedIds = new Set(logs.map((log) => log.medicationId));

    // Merge logic: only return active meds, add 'isTaken' flag
    return meds
      .filter((m) => m.isActive)
      .map((med) => ({
        ...med,
        isTaken: takenMedIds.has(med.id),
      }));
  }

  // Log an intake
  async markAsTaken(userId: string, medicationId: string): Promise<IntakeLog> {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const log: IntakeLog = {
      userId,
      medicationId,
      takenAt: now.toISOString(),
      date: today,
      type: "LOG",
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: `LOG#${today}#${medicationId}`,
        ...log,
      },
    });

    await docClient.send(command);
    return log;
  }

  // Trong class ReminderService:

  // Lấy danh sách quản lý (gồm cả Active và Inactive)
  async getAllMedications(userId: string): Promise<Medication[]> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "MED#",
      },
    });

    const result = await docClient.send(command);
    // Trả về hết, không filter isActive
    return (result.Items as Medication[]) || [];
  }

  // Toggle active status (On/Off)
  async toggleMedication(
    userId: string,
    medicationId: string,
    isActive: boolean
  ): Promise<void> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `MED#${medicationId}` },
      UpdateExpression: "set isActive = :active",
      ExpressionAttributeValues: { ":active": isActive },
    });
    await docClient.send(command);
  }

  async deleteMedication(userId: string, medicationId: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: `MED#${medicationId}` },
    });
    await docClient.send(command);
  }

  // Calculate Dashboard Stats
  async getStats(userId: string): Promise<ReminderStats> {
    // Note: In a real heavy-load app, we might use DynamoDB Streams to aggregate stats
    // into a separate Stats item. For now, we query.

    const medsCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": `USER#${userId}`, ":sk": "MED#" },
    });

    const logsCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :logPrefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":logPrefix": "LOG#",
      },
    });

    const [medsRes, logsRes] = await Promise.all([
      docClient.send(medsCommand),
      docClient.send(logsCommand),
    ]);

    const activeMeds = (medsRes.Items || []).filter((m: any) => m.isActive);
    const logs = logsRes.Items || [];

    const totalActive = activeMeds.length;
    // Simple logic: If you have active meds, calculate rate based on total logs found vs expected
    // This is a simplified calculation for the prototype
    const complianceRate =
      totalActive > 0
        ? Math.min(100, Math.round((logs.length / (totalActive * 7)) * 100))
        : 0;

    return {
      totalActive,
      complianceRate,
      weeklyIntakeCount: logs.length,
    };
  }
}
