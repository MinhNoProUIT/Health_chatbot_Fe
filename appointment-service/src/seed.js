const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "Appointments";

const sampleAppointments = [
    {
        userId: "test-user-123",
        appointmentId: `APPT-${uuidv4()}`,
        hospitalName: "Bệnh viện Chợ Rẫy",
        hospitalAddress: "201B Nguyễn Chí Thanh, Quận 5, TP.HCM",
        hospitalPhone: "028 3855 4137",
        doctorName: "BS. Nguyễn Văn A",
        doctorPhone: "0901234567",
        appointmentDate: "2025-12-25",
        appointmentTime: "09:00",
        patientName: "Trần Văn B",
        patientPhone: "0912345678",
        patientEmail: "tranvanb@example.com",
        symptoms: "Đau đầu, chóng mặt",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        userId: "test-user-123",
        appointmentId: `APPT-${uuidv4()}`,
        hospitalName: "Bệnh viện Đại học Y Dược",
        hospitalAddress: "215 Hồng Bàng, Quận 5, TP.HCM",
        hospitalPhone: "028 3855 2222",
        doctorName: "BS. Lê Thị C",
        doctorPhone: "0902345678",
        appointmentDate: "2025-12-26",
        appointmentTime: "10:30",
        patientName: "Nguyễn Thị D",
        patientPhone: "0923456789",
        patientEmail: "nguyenthid@example.com",
        symptoms: "Khó thở, đau ngực",
        status: "confirmed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        userId: "test-user-456",
        appointmentId: `APPT-${uuidv4()}`,
        hospitalName: "Bệnh viện Nhi Đồng 1",
        hospitalAddress: "341 Sư Vạn Hạnh, Quận 10, TP.HCM",
        hospitalPhone: "028 3865 3333",
        doctorName: "BS. Võ Thị G",
        doctorPhone: "0904567890",
        appointmentDate: "2025-12-27",
        appointmentTime: "14:00",
        patientName: "Bé Nguyễn H",
        patientPhone: "0945678901",
        patientEmail: "parent@example.com",
        symptoms: "Sốt cao, ho",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

async function seedAppointments() {
    console.log("🌱 Starting to seed appointments...");

    for (const appointment of sampleAppointments) {
        try {
            const command = new PutCommand({
                TableName: TABLE_NAME,
                Item: appointment,
            });

            await docClient.send(command);
            console.log(`✅ Created appointment: ${appointment.appointmentId} for user: ${appointment.userId}`);
        } catch (error) {
            console.error(`❌ Failed to create appointment:`, error);
        }
    }

    console.log("🎉 Seeding completed!");
}

seedAppointments().catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
});
