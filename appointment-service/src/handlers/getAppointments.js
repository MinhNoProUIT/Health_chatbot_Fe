const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { withAuth } = require("../utils/authRequire");
const { formatResponse } = require("../utils/response");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = process.env.APPOINTMENTS_TABLE;

const getAppointmentsHandler = async (event, userId) => {
    console.log("Event:", JSON.stringify(event));
    console.log("Authorized UserId:", userId);

    try {
        const command = new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
            ScanIndexForward: false,
        });

        console.log("Querying DynamoDB...");
        const result = await docClient.send(command);

        if (!result.Items || result.Items.length === 0) {
            console.log("No appointments found for user:", userId);
            return formatResponse(200, {
                success: true,
                message: "No appointments found",
                data: [],
                count: 0,
            });
        }

        console.log(`Found ${result.Items.length} appointments`);

        return formatResponse(200, {
            success: true,
            message: "Appointments retrieved successfully",
            data: result.Items,
            count: result.Items.length,
        });
    } catch (err) {
        console.error("Error getAppointments:", err);
        return formatResponse(500, {
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
};

exports.handler = withAuth(getAppointmentsHandler);
