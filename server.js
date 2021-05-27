const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const mqtt = require('mqtt')
const http = require('http')
const bodyParser = require('body-parser');
const socketio = require('socket.io')
// const axios = require('axios')
// const cors = require('cors')
const geolib = require('geolib')
const expressLayouts = require('express-ejs-layouts')
const Position = require('./models/Position')
const Logger = require('./models/Loggers')
const cookieParser = require('cookie-parser');
const {checkUser} = require('./middleware/authMiddleware')

// Import Route
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes')
const indexRoutes = require('./routes/indexRoutes');
const { device_get } = require('./controllers/deviceController');

const app = express()
const server = http.createServer(app)
const io = socketio(server)
dotenv.config()

// app.use(cors());
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });


//middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressLayouts)
app.use(express.static('public'));
// app.use(express.static(__dirname));
app.use(express.json());
app.use(cookieParser())

app.set('uploads', __dirname + '/public/uploads');


// View Engine
app.set('view engine', 'ejs')

var options = {
    port: process.env.MQTT_PORT,
    host: process.env.MQTT_HOST,
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};

const antaresClient = mqtt.connect(process.env.ANTARES_HOST)
const mqttClient = mqtt.connect(process.env.MQTT_HOST, options)
//test



// Connect MongoDB
mongoose.connect(process.env.DB_CONNECT_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false})
    .then((result)=> server.listen(process.env.PORT, console.log("server running")))
    .catch((err)=>{console.log(err)})

const connection = mongoose.connection
let counter = 0

io.on("connection", (socket) => {
  console.log("socket.io: User connected: ", socket.id);
  socket.emit('init', {counter:counter})
  socket.on('clear', ()=>{
    counter = 0
    io.emit('clear', {counter:counter})
  })
  socket.on("disconnect", () => {
    console.log("socket.io: User disconnected: ", socket.id);
  });
});

// io.on('clear', ()=>{
  
// })

connection.once("open", ()=>{
  console.log('connection open')
  const notifChangeStream = connection.collection("notification").watch()
  notifChangeStream.on("change", (change)=>{
    switch(change.operationType){
      case "insert":
        counter++
        const notif = {
          // _id: change.fullDocument._id,
          // topic: change.fullDocument.topic,
          title: change.fullDocument.title,
          body: change.fullDocument.body,
          timestamp: change.fullDocument.timestamp
        }
        io.emit('notif', {notif:notif,counter:counter})
    }
  })
})




// API Routes
app.use('*', checkUser)
app.use('/', indexRoutes)
app.use('/api/user',authRoutes)
app.use('/api/device', deviceRoutes)

antaresClient.on('connect', function () {
    antaresClient.subscribe('/oneM2M/resp/antares-cse/bd8c8c443410ba45:886a6c0b7af4ff6d/json', function (err) {
      if (!err) {
        antaresClient.publish('presence', 'Hello mqtt')
      }
    })
  })

mqttClient.on('connect', ()=>{
  console.log("connected to mqtt client")
})

antaresClient.on('message', async (topic, message)=> {
    // message is Buffer
    let buffer = JSON.parse(message.toString())
    // const devid = buffer['m2m:rsp'].pc['m2m:cin'].pi
    const res = JSON.parse(buffer['m2m:rsp'].pc['m2m:cin'].con)
    console.log(res.data)

    if(res.data != "NO PAYLOAD"){
      // console.log("hai")
      let data = JSON.parse(res.data)
    if(res.type == 'uplink' && data[1] != "0.000000"){
      const device = await Position.findOne({devid:data[0]})
      console.log(device)
    
      let coords = {
          start:{latitude:device.lat,longitude:device.long},
          end:{latitude:data[1],longitude:data[2]}
      }

        try{
            await Position.updatePos({devid:device.devid,lat:data[1],long:data[2]})
            const distance = geolib.getPreciseDistance(coords.start,coords.end)

            if(distance >= 15){
                try{
                    console.log('logging')
                    await Logger.logPos({devid:device.devid,lat:data[1],long:data[2]})
                }catch(err){
                    console.log(err.message)
                }
            }
            mqttClient.publish('maps', `{\"devid\":\"${device.devid}\",\"lat\":\"${data[1]}\",\"long\":\"${data[2]}\"}`, (err)=>{
              console.log(err)
              if(!err){
                console.log("published")
              }
            }) 
            console.log(`distance : ${distance}`)
        }catch(err){
            console.log(err.message)
        }
      }
    } 
    console.log((res.type))
    // // console.log(buffer)
})


