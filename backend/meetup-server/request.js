const mongoose = require('mongoose');
const location_schema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
})
const meetupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    place: { type: String, required: true },
    time: { type: String, required: true },
    purpose: { type: String, required: true },
    group_size: { type: String, required: true },
    location: { type:location_schema, required: true },
    status: { type: String, required: true },
    interested: { type: [String], required: true },
    accepted: { type: [String], required: true },
    rejected: { type: [String], required: true },
    pending: { type: [String], required: true },
    active: { type: Boolean, required: true },
    id: { type: String, required: true },
    req_id: {type: Number, required: true},
});

const user_meet = new mongoose.Schema({
    user_id: { type: String, required: true },
    requests: {type: [meetupSchema], default: []},
    pending: {type: [Number], default: []},
    accepted: {type: [Number], default: []},
});
module.exports = {request_schema: user_meet, meetupSchema};