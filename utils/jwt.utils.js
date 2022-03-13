// Imports
var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

// Exported functions
module.exports = {
    generateTokenForUser: function(userData) {
        return jwt.sign({
                userId: userData.id,
                isAdmin: userData.isAdmin
            },
            JWT_SIGN_SECRET, {
                expiresIn: '2h'
            })
    },
    parseAuthorization: function(authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },
    getUserId: function(authorization) {
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);
        if (token != null) {
            try {
                var jwToken = jwt.verify(token, JWT_SIGN_SECRET);
                if (jwToken != null)
                    userId = jwToken.userId;

            } catch (err) {}
        }
        return userId;
    }
}