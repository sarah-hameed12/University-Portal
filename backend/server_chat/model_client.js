const mongodb = require("mongoose");
const schema = mongodb.Schema

const message_schema = new schema(
    {
        message: {
            type: String,
            required: true 
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        imageFileId: mongodb.Schema.Types.ObjectId
    }
)

const p_sender_schema = new schema(
    {
        messages: [message_schema],
        sender: {
            type: String,
            required: true
        }
    }
)

const client_schema = new schema(
    {
        username: {
            type: String,
            required: true,
        },
        message_record: [p_sender_schema]
    }
)

module.exports = mongodb.model("client", client_schema)