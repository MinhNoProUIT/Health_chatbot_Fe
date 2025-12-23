const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { withAuth } = require("../utils/authRequire");
const { formatResponse } = require("../utils/response");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = process.env.APPOINTMENTS_TABLE;

const createAppointmentHandler = async (event, userId) => {
    console.log("Event:", JSON.stringify(event));
    console.log("Authorized UserId:", userId);

    try {
        if (!event.body) {
            return formatResponse(400, { message: "Request body is required" });
        }

        const body = JSON.parse(event.body);

        // Validate required fields
        const requiredFields = [
            "appointmentId",
            "hospitalName",
            "doctorName",
            "appointmentDate",
            "appointmentTime",
            "patientName",
            "patientPhone",
            "patientEmail",
        ];

        for (const field of requiredFields) {
            if (!body[field]) {
                return formatResponse(400, {
                    message: `Missing required field: ${field}`,
                });
            }
        }

        const appointment = {
            userId,
            appointmentId: body.appointmentId,
            hospitalName: body.hospitalName,
            hospitalAddress: body.hospitalAddress || "",
            hospitalPhone: body.hospitalPhone || "",
            doctorName: body.doctorName,
            doctorPhone: body.doctorPhone || "",
            appointmentDate: body.appointmentDate,
            appointmentTime: body.appointmentTime,
            patientName: body.patientName,
            patientPhone: body.patientPhone,
            patientEmail: body.patientEmail,
            symptoms: body.symptoms || "",
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const command = new PutCommand({
            TableName: TABLE,
            Item: appointment,
        });

        console.log("Saving to DynamoDB...");
        await docClient.send(command);

        console.log("Appointment created:", appointment.appointmentId);

        return formatResponse(201, {
            success: true,
            message: "Appointment created successfully",
            data: appointment,
        });
    } catch (err) {
        console.error("Error createAppointment:", err);
        return formatResponse(500, {
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
};

exports.handler = withAuth(createAppointmentHandler);
