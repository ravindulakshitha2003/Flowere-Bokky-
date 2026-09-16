import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: "USER"
    }

});

const AuthUser = mongoose.model("User", userSchema);

export default AuthUser;