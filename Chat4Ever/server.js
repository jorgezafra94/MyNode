let express = require('express')
let bodyParser = require('body-parser')
let mongoose = require('mongoose')
const { emit } = require('process')

let app = express()
let http = require('http').Server(app)
let io = require('socket.io')(http)

mongoose.Promise = Promise
let dbUrl = 'mongodb+srv://user:user@cluster0.kwp0z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

app.use(express.static(__dirname))
app.use(bodyParser.json()) // to read info from the body
app.use(bodyParser.urlencoded({extended: false})) // to read info from post jquery

let MessageModule = mongoose.model('Message', {  // este va a ser el esquema de lo que se va a guardar en mongo y el nombre de la coleccion va a ser Message
    name: String,
    message: String
})

app.get('/messages', (req, res) => { //find nos traerá todos los objetos guardados en Mongo ({}) ya que no le especificamos algo 
    MessageModule.find({}, (err, message) => {
        res.send(message)
    })
})

/*
usando promesas


app.post('/messages', (req, res) => {
    let saveMessage = new MessageModule(req.body)
    saveMessage.save()
    .then(() => { // promesas con el then, si retorna algo ese va a ser el parametro del siguiente then
        console.log("saved")
        return MessageModule.findOne({message: "badword"})
    
    })
    .then((myObject) => {
        if (myObject) {
            console.log("this is a badword")
            return MessageModule.deleteOne({_id: myObject.id})
        }
        io.emit("message", req.body) // emitira el evento message con la info del req.body
        res.sendStatus(200)
    })
    .catch((err) => {
        res.sendStatus(500)
        return console.log(err)
    })
})*/


app.post("/messages", async (req, res) => {
    try {
        let newMessage = new MessageModule(req.body)
        newMessage.save()
        
        let badword = await MessageModule.findOne({message: "badword"})
        let clean = await MessageModule.findOne({name: "admin", message: "cleanAll"})

        if (badword) {
            await MessageModule.deleteOne({_id: badword.id})
        } else if (clean){
            await MessageModule.deleteMany({})
            io.emit("clean", "")
        } else {
            io.emit("message", req.body)
            res.sendStatus(200)
        }

    } catch (error) {
        res.sendStatus(500)
        return console.log(err)
    }
})

io.on('connection', (socket)=>{
    console.log("new user connected")
})

mongoose.connect(dbUrl, (err) => {
    console.log("mongoDb connection ", err)
})

http.listen(3000, function(){
    console.log("info",'Server is running at port : ' + 3000);
})