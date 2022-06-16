import express from "express"
var app = express()

app.get('/', function (req, res) {
  res.send('hello world')
})

app.listen(2721)
