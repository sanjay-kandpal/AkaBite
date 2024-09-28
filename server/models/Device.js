const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSessionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deviceId: { type: String, required: true },
    lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeviceSession', DeviceSessionSchema);