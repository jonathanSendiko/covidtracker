const mongoose = require("mongoose");
const Position = require("./Position");

const deviceSchema = new mongoose.Schema({
  devid: {
    type: String,
    require: true,
    min: 1,
  },
  name: {
    type: String,
    min: 1,
    max: 255,
  },
  nik: String,
  birth: {
    type: String,
    min: 8,
  },
  gender: {
    type: String,
    enum: ["laki-laki", "perempuan"],
  },
  address: {
    type: String,
    min: 1,
  },
  suspectDate: {
    type: String,
    min: 8,
  },
  status: {
    type: String,
    enum: ["registered", "unregistered"],
    required: true,
  },
  pulse: [
    {
      type: Number,
    },
  ],
});

deviceSchema.statics.getDeviceById = async function ({ devid }) {
  const device = await this.findOne({ devid });
  const position = await Position.findOne({ devid });
  if (device) {
    if (device.status == "registered") {
      return {
        _id: device._id,
        devid: device.devid,
        status: device.status,
        address: device.address,
        birth: device.birth,
        gender: device.gender,
        name: device.name,
        nik: device.nik,
        suspectDate: device.suspectDate,
        area: position.area,
        pulse: device.pulse,
      };
    }
    return { status: "unregistered" };
  }
  throw Error("not_found");
};

deviceSchema.statics.register = async function ({
  devid,
  name,
  nik,
  birth,
  gender,
  address,
  suspectDate,
}) {
  const device = await this.findOneAndUpdate(
    { devid },
    { name, nik, birth, gender, address, suspectDate, status: "registered", pulse:[] },
    { new: true }
  );
  if (device) {
    console.log(device);
    return { status: "registered" };
  }
  throw Error("not_found");
};

deviceSchema.statics.updateDevice = async function ({
  devid,
  name,
  nik,
  birth,
  gender,
  address,
  suspectDate,
}) {
  const device = await this.findOneAndUpdate(
    { devid },
    { name, nik, birth, gender, address, suspectDate },
    { new: true }
  );
  if (device) {
    // console.log(device)
    return device;
  }
  throw Error("not_found");
};

deviceSchema.statics.unregisterDevice = async function ({ devid }) {
  const device = await this.findOne({ devid });
  // console.log(await this.find({}))
  if (device) {
    if (device.status == "registered") {
      const unreg = await this.findOneAndReplace(
        { devid },
        { _id: device._id, devid, status: "unregistered" },
        { new: true }
      );
      return unreg;
    }
    throw Error("already_unregistered");
  }
  throw Error("not_found");
};

deviceSchema.statics.updatePulse = async function ({ devid, pulse }) {
  const device = await this.findOne({ devid });
  console.log(device);

  if (device) {
    await device.pulse.push(pulse);
    const updatedDevice = await device.save();
    return updatedDevice;
  }
  throw Error("not_found");
};

const Device = mongoose.model("device", deviceSchema, "device");

module.exports = Device;
