const mongoose = require("mongoose");
const Notification = require("./Notification");

const logSchema = new mongoose.Schema({
  devid: {
    type: String,
    require: true,
    min: 5,
  },
  lat: {
    type: String,
    require: true,
    min: 1,
  },
  long: {
    type: String,
    require: true,
    min: 1,
  },
  pulse: {
    type: String,
    required: true,
    min: 1,
  },
  timestamp: {
    type: Number,
    require: true,
  },
});

logSchema.statics.logPos = async function ({ devid, lat, long, pulse }) {
  const logPosition = await this.create({
    devid,
    lat,
    long,
    pulse,
    timestamp: Date.now(),
  });
  if (logPosition) {
    if (logPosition.pulse < 50 || logPosition.pulse > 120) {
      const body = `Suspect dengan ID perangkat ${devid} memiliki detak jantung diluar batas`;
      const notif = await Notification.create({
        topic: "Pulse",
        title: devid,
        body: body,
        timestamp: Date.now(),
      });
    }

    return logPosition;
  }
  throw Error("Device not found");
};

const Logger = mongoose.model("log", logSchema, "log");

module.exports = Logger;
