/* global fetch, WebSocket, location */
(() => {
  const messages = document.querySelector('#messages')
  const msgBox = document.querySelector('.msgBox')
  const elStatus = document.querySelector('#status')
  const elTyping = document.querySelector('#typing')
  const inputContainer = document.querySelector('#inputContainer')
  const wsButton = document.querySelector('#wsButton')
  const wsInput = document.querySelector('#wsInput')

  let ws
  let typingTimeout

  const receiveMessage = message => {
    elTyping.innerHTML = ''
    const div = document.createElement('div')
    div.classList.add('message')
    div.classList.add('other')
    div.innerHTML = `<span>${message.date}</span>${message.text}`
    messages.appendChild(div)
    msgBox.scrollTop = msgBox.scrollHeight
  }

  const typingMessage = () => {
    elTyping.innerHTML = 'User is typing...'
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    typingTimeout = setTimeout(() => {
      elTyping.innerHTML = ''
    }, 1500)
  }

  const messageTypeMap = {
    receive: receiveMessage,
    typing: typingMessage,
  }

  const init = () => {
    if (ws) {
      ws.onerror = ws.onopen = ws.onclose = null
      ws.close()
    }
    ws = new WebSocket(`ws://${location.host}`)
    ws.onerror = () => showStatus('Error')
    ws.onopen = () => showStatus('Connected')
    ws.onclose = () => showStatus('Session Disconnected')
    ws.onmessage = event => {
      const res = JSON.parse(event.data)
      // const { type, text } = res
      console.log(res.type, res.text)
      messageTypeMap[res.type](res)
    }
    wsInput.focus()
  }

  const fmt = message => {
    const { type, text } = message
    const msg = {
      type,
      text,
      date: new Date().toLocaleTimeString(),
    }
    return msg
  }

  const showStatus = status => {
    elStatus.innerHTML = status
  }

  wsInput.oninput = ev => {
    const text = wsInput.value
    console.log(text)
    try {
      const data = fmt({ text, type: 'typing' })
      ws.send(JSON.stringify(data))
    } catch(e) {
      console.log(e)
    }
  }

  inputContainer.onsubmit = ev => {
    ev.preventDefault()
    const text = wsInput.value
    wsInput.value = ''
    try {
      const data = fmt({ text, type: 'receive' })
      ws.send(JSON.stringify(data))
      const div = document.createElement('div')
      div.classList.add('message')
      div.classList.add('self')
      div.innerHTML = `<span>${data.date}</span>${text}`
      messages.appendChild(div)
      msgBox.scrollTop = msgBox.scrollHeight
    } catch(e) {
      console.log(e)
    }
  }

  window.addEventListener('beforeunload', () => ws.close())

  init()
})()
