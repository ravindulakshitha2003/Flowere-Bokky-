import jwt from "jsonwebtoken";

export function generateToken(user) {

    return jwt.sign(

        {
            id: user._id,
            username: user.username,
            role: user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "1h"
        }

    );
}