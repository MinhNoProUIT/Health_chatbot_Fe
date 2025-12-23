export const formatResponse = (
  statusCode: number,
  body: any,
  headers?: any
) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS", // Thêm PATCH vì bạn có dùng
    "Access-Control-Allow-Headers": "Content-Type,Authorization,user-id", // Cho phép Auth và user-id
    "Access-Control-Allow-Credentials": true,
    ...headers,
  },
  body: typeof body === "string" ? body : JSON.stringify(body),
});
