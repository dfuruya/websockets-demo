import express from 'express'
import http from 'http'
import url from 'url'
import bodyParser from 'body-parser'
import WebSocket from 'ws'

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(function (req, res) {
  res.send('index')
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true)
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  ws.on('close', function close() {
    console.log('disconnected')
  })

  ws.on('error', function error(err) {
    console.log(`error: ${err}`)
  })

  ws.on('open', function open() {
    console.log('opened')
  })

  ws.on('message', function incoming(data) {
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  })
})

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port)
})
