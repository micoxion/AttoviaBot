const express = require('express')
const cors = require('cors')
let { addWriter } = require('./writers.js')
var routes = express.Router();

routes.post("/addWriter", addWriter)

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', routes)

exports.App = app