const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
    jwksUri: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_3YfJifhBe/.well-known/jwks.json`,
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
}

module.exports = { verifyToken };
