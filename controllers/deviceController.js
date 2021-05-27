const Device = require("../models/Device");
const Logger = require("../models/Loggers");
const Position = require("../models/Position");

function get_polygon_centroid(pts) {
  var first = pts[0],
    last = pts[pts.length - 1];
  if (first.x != last.x || first.y != last.y) pts.push(first);
  var twicearea = 0,
    x = 0,
    y = 0,
    nPts = pts.length,
    p1,
    p2,
    f;
  for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = pts[i];
    p2 = pts[j];
    f = p1.x * p2.y - p2.x * p1.y;
    twicearea += f;
    x += (p1.x + p2.x) * f;
    y += (p1.y + p2.y) * f;
  }
  f = twicearea * 3;
  return { x: x / f, y: y / f };
}

module.exports.add_post = async (req, res) => {
  const { devid } = req.body;

  const addDevice = await Device.findOne({ devid: devid });
  if (!addDevice) {
    await Device.create({ devid: devid, status: "unregistered" });
    res.status(200).json({ status: "success" });
  } else {
    res.status(200).json({ status: "fail" });
  }
};

module.exports.delete_get = async (req, res) => {
  const { devid } = req.query;
  const deleteDevice = await Device.findOneAndDelete({ devid: devid });
  if (deleteDevice) {
    res.status(200).json({ status: "success" });
  } else {
    res.status(200).json({ status: "fail" });
  }
};

module.exports.device_get = async (req, res) => {
  const { devid } = req.query;
  // console.log(devid)
  try {
    const device = await Device.getDeviceById({ devid: devid });

    if (device) return res.status(200).json(device);
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ status: err.message });
  }
};

module.exports.register_post = async (req, res) => {
  const device = req.body;
  let latLngs = [];
  device.area.forEach((index) => {
    latLngs.push({ x: index[0], y: index[1] });
  });
  let data = get_polygon_centroid(latLngs);

  try {
    const register = await Device.register(device);
    await Position.createPos({
      devid: device.devid,
      nik: device.nik,
      area: device.area,
      lat: data.x,
      long: data.y,
      is_ready: false,
    });
    res.status(200).json(register);
  } catch (err) {
    console.log(err.mesage);
    return res.status(401).json({ status: err.message });
  }
};

module.exports.unregister_get = async (req, res) => {
  const { devid } = req.query;
  console.log(typeof devid);
  try {
    const unregister = await Device.unregisterDevice({ devid: devid });
    await Position.findOneAndDelete({ devid: devid });
    await Logger.deleteMany({ devid: devid });
    if (unregister)
      return res
        .status(200)
        .json({ status: "unregistered", unregister: unregister });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ status: "fail", errors: err.message });
  }
};

module.exports.pulse_post = async (req, res) => {
  const { devid } = req.query;
  const { pulse } = req.body;
  try {
    const device = await Device.updatePulse({ devid: devid, pulse: pulse });
    if (device) {
      return res.status(201).json({ msg: "Pulse Posted", data: device });
    }
  } catch (err) {
    return res.status(400).json({ msg: err.message });
  }
};

module.exports.update_post = async (req, res) => {
  const device = req.body;
  try {
    const update = await Device.updateDevice(device);
    const updatedPos = await Position.updateHome({
      devid: device.devid,
      nik: device.nik,
      area: device.area,
    });
    console.log(updatedPos);
    res.status(200).json({ status: "updated", update: update });
  } catch (err) {
    console.log(err.mesage);
    return res.status(400).json({ status: "fail", errors: err.message });
  }
};

module.exports.position_get = async (req, res) => {
  let filter = {};
  let query = Object.keys(req.query);
  let device, position, data;
  if (query[0]) {
    filter[query[0]] = req.query[query[0]];
    device = await Device.findOne(filter);
    if (device) {
      position = await Position.find(filter);
      data = { device: device, position: position };
    } else {
      position = await Position.find({});
      data = position;
      return res.status(200).json({ status: "not_found" });
    }
    // console.log(data)
  } else {
    position = await Position.find(filter);
    data = position;
  }

  res.status(200).json(data);
};

module.exports.log_get = async (req, res) => {
  const { devid, from, to } = req.query;
  let filter = {};
  console.log(req.query);
  if (req.query.devid !== undefined) {
    if (req.query.from !== undefined) {
      if (req.query.to !== undefined) {
        filter = {
          devid,
          timestamp: { $gte: parseInt(from), $lte: parseInt(to) },
        };
      } else {
        filter = {
          devid,
          timestamp: { $gte: parseInt(from), $lte: Date.now() },
        };
      }
    } else {
      filter = { devid };
    }
  }
  console.log(filter);
  const logTime = await Logger.find(filter);
  res.status(200).json(logTime);
};

// module.exports.sensor_get = async (req, res)=>{
//     const filter = {}
//     const data = await Logger.deleteMany(filter)
//     res.status(200).json(data)
// }
