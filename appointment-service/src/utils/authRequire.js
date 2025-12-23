const { verifyToken } = require("./verifyJwt");
const { formatResponse } = require("./response");

const withAuth = (handler) => {
    return async (event) => {
        try {
            const authHeader = event.headers?.authorization || event.headers?.Authorization;
            if (!authHeader) {
                return formatResponse(401, { message: "Missing Authorization header" });
            }

            const token = authHeader.split(" ")[1];
            const decoded = await verifyToken(token);

            const userId = decoded.sub;
            if (!userId) {
                return formatResponse(401, { message: "Invalid token payload" });
            }

            return await handler(event, userId);
        } catch (err) {
            return formatResponse(401, { message: "Unauthorized", detail: err.message });
        }
    };
};

module.exports = { withAuth };
