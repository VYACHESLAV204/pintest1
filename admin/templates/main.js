let PageState = 'chats'
TOKEN = '7b70a343259f58b492cd49d9dac4d38c9bb9d2541a98a1ba59d131050867e1c3'
const container = document.createElement('div')
if (PageState === 'chats') {
	container.innerHTML = `<div class="position-container">
        <div class="headercontainer"><h3>Chats <span id="ws-id"></span></h3></div>
        <div id='chats' ></div>
        
    </div>`
}
document.body.appendChild(container)

let client_id = 1
let myId = document.querySelector('#ws-id')
myId.textContent = client_id
let ws = new WebSocket('ws://localhost:8000/chat/ws/admin/' + TOKEN)


ws.onmessage = function (event) {
	setTimeout(function () {
		let fileData = event.data.split(': ')
		let fileName = fileData[1]
		let messages = document.getElementById('messages')
		let message = document.createElement('div')
		message.className = 'MyMessage'
		let content = document.createTextNode(event.data)
		let clientId = fileData[0].split(' ')[1]
		if (event.data.includes("'text':")) {
			if (myId.textContent === clientId?.slice(1)) {
				content = document.createTextNode(
					event.data.substring(
						event.data.indexOf("'text': ") + 9,
						event.data.indexOf("'}")
					)
				)
				message.className = 'MyMessage'
			} else if (!clientId) {
				content = document.createTextNode(
					event.data.substring(
						event.data.indexOf("'text': ") + 9,
						event.data.indexOf("'}")
					)
				)
				message.className = 'MyMessage'
			} else {
				content = document.createTextNode(
					event.data.substring(
						event.data.indexOf("'text': ") + 9,
						event.data.indexOf("'}")
					)
				)
				message.className = 'OthereMessage'
			}
		}
		if (event.data.includes('file:')) {
			if (myId.textContent === clientId.slice(1)) {
				content = document.createTextNode(
					event.data.substring(event.data.indexOf(': ') + 2)
				)
				message.className = 'MyMessage'
			} else {
				content = document.createTextNode(
					event.data.substring(event.data.indexOf(': ') + 2)
				)
				message.className = 'OthereMessage'
			}
			let downloadBtn = document.createElement('button')
			downloadBtn.textContent = 'Download'
			downloadBtn.addEventListener('click', function () {
				fetch('http://127.0.0.1:8000/chat/download/' + fileName)
					.then((response) => response.blob())
					.then((blob) => {
						const url = window.URL.createObjectURL(new Blob([blob]))
						const a = document.createElement('a')
						a.href = url
						a.download = fileName
						document.body.appendChild(a)
						a.click()
						window.URL.revokeObjectURL(url)
					})
					.catch((error) => console.error('Error:', error))
			})
			message.appendChild(content)
			message.appendChild(downloadBtn)
		} else {
			message.appendChild(content)
		}
		messages.appendChild(message)
		messages.scrollTop = messages.scrollHeight - messages.clientHeight
	}, 1000)
}
function sendMessage(event) {
	let input = document.getElementById('messageText')
	ws.send(JSON.stringify(input.value))
	input.value = ''

	event.preventDefault()
}
function handleFileSelect(event) {
	let file = event.target.files[0]
	event.preventDefault()
	if (file) {
		const ext = file.name
		fetch('http://127.0.0.1:8000/chat/filename', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: '*/*',
			},
			body: JSON.stringify({
				filename: ext,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				let reader = new FileReader()
				reader.onload = function (e) {
					let fileContent = e.target.result
					ws.send(fileContent) // Отправка содержимого файла по WebSocket
				}
				reader.readAsArrayBuffer(file)
			})
			.catch((error) => console.error('Error:', error))
	}
}

fetch('http://127.0.0.1:8000/chat/get_chats/' + TOKEN)
	.then((response) => response.json())
	.then((data) => {
		const chats = data
		CreateOptions(chats)
	})

const CreateOptions = (chats) => {
	console.log(chats.data)
	container.innerHTML = `<div class="position-container">
        <div class="headercontainer"><h3>Chats <span id="ws-id"></span></h3></div>
        <div id='chats' ></div>
        
    </div>`
	chats.data.forEach((chat) => {
		const userDiv = document.createElement('div') // Define userDiv here
		const Innertext = document.createElement('p')
		Innertext.textContent = chat
		Innertext.classList.add('Inner_chats_text')
		userDiv.classList.add('user-div')
		userDiv.appendChild(Innertext)
		userDiv.addEventListener('click', (e) => {
			e.preventDefault()
			fetch(
				`http://127.0.0.1:8000/chat/set_current_chat/${chat}/${TOKEN}`
			)
				.then((res) => res.json())
				.then((data) => {
					PageState = 'chat'
					container.innerHTML = `<div class="position-container">             <div class="headercontainer" style="display:flex;align-items: center" >  <img src="./Vector.svg" class="BackArrow" /><h3 style="margin: 0px 105px;">ID Собеседника: <span id="ws-id">${data}</span></h3>           </div>                 <div id='messages' ></div>                 <div class="form-container">                     <form action="" onsubmit="sendMessage(event)">                         <label class="fileInputLabel" for="fileInput"><img src="./free-icon-add-file-1090923.svg" alt=""/></label>                         <input  type="text" id="messageText" autocomplete="off" placeholder="Enter your message"/>                         <button class="sendButton"><img src="./Send-256x256.svg" alt=""/></button>                         <input type="file" name="fileInput" id="fileInput" onchange="handleFileSelect(event)" />                     </form>                 </div>             </div>`
					img = document.getElementsByClassName('BackArrow')[0]
					img.addEventListener('click', () => {
						PageState = 'chats'
						fetch('http://127.0.0.1:8000/chat/get_chats/' + TOKEN)
							.then((response) => response.json())
							.then((data) => {
								const chats = data
								CreateOptions(chats)
							})
					})
				})
		})

		document.getElementById('chats').appendChild(userDiv)
	})
}
