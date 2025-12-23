import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

export const TABLE_NAME = process.env.REMINDER_TABLE || "ReminderTable";

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string; // HH:mm format
  takeWithFood: boolean;
  isActive: boolean;
  createdAt: string;
  type: "MEDICATION";
}

export interface IntakeLog {
  userId: string;
  medicationId: string;
  takenAt: string; // ISO Timestamp
  date: string; // YYYY-MM-DD
  type: "LOG";
}

// Helper interface for the UI Dashboard
export interface DailyReminderItem extends Medication {
  isTaken: boolean;
}

export interface ReminderStats {
  totalActive: number;
  complianceRate: number;
  weeklyIntakeCount: number;
}
