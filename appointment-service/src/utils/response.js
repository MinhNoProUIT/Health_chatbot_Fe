const formatResponse = (statusCode, body, headers) => ({
    statusCode,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
});

module.exports = { formatResponse };
