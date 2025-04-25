const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    major: { type: String, required: true },
    year: { type: String, required: true },
    bio: { type: String, required: true },
    insta_link: { type: String, required: true },
    filename: { type: String, required: true },
    unique_id: { type: String, required: true },
});

module.exports = UserSchema;