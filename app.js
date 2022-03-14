// variables
let header_close = document.getElementById("close_")
let text_ = document.getElementById("text_")
let chat_box = document.getElementById("chat_box_")
let fileinput = document.getElementById("the_send_box_file_input")
let BTN_attach = document.getElementById("attach")
let BTN_run_send = document.getElementById("run_send")
let all_files = document.getElementById("files")
let the_chat_app = document.getElementById("the_chat_app")
let the_chat_app_icon = document.getElementById("the_chat_app_icon")
if (!localStorage.getItem("chat_history")) {
  localStorage.setItem("chat_history", JSON.stringify([]))
}
let AllFileAttatched = []
let socket;
let ChatRoomId;
// addToChat 
function addToChat(addToChat_opject = { text = "", type = "", link =[] } = {}) {
  if (addToChat_opject.type == "text" && addToChat_opject.text.length >= 1) {
    let item = `<div class="text"> ${addToChat_opject.text} </div>`;
    start_send(addToChat_opject.text)
    chat_box.innerHTML += item;
    text_.value = ""
    all_files.innerHTML = ""
    AllFileAttatched = []
    chat_box.scrollTop = chat_box.scrollHeight;
    return "text Add"
  } else if (addToChat_opject.type == "img" && addToChat_opject.link.length >= 1) {
    let imgs = "";
    for (let img of addToChat_opject.link) {
      if (img.type.startsWith("image/jpeg") || img.type.startsWith("image/png")) {
        let the_file = `<div class="img "> <img src="${img.link}" alt=""> </div>`
        imgs += the_file
      }
    }
    chat_box.innerHTML += imgs;
    load_file_in_HTML(AllFileAttatched)
    text_.value = ""
    all_files.innerHTML = ""
    AllFileAttatched = []
    chat_box.scrollTop = chat_box.scrollHeight;
    return "img Add"
  } else if (addToChat_opject.type == "textwithimg" && addToChat_opject.link.length >= 1 && addToChat_opject.text.length) {
    let imgs = "";
    for (let img of addToChat_opject.link) {
      if (img.type.startsWith("image/jpeg") || img.type.startsWith("image/png")) {
        let the_file = `<div class="img "> <img src="${img.link}" alt=""> </div>`
        imgs += the_file
      }
    }
    let text = `<div class="text"> ${addToChat_opject.text} </div>`;
    chat_box.innerHTML += imgs;
    chat_box.innerHTML += text;
    load_file_in_HTML(AllFileAttatched)
    text_.value = ""
    all_files.innerHTML = ""
    AllFileAttatched = []
    chat_box.scrollTop = chat_box.scrollHeight;
  }
}
// File 
function attatchFile() {
  fileinput.click()
  fileinput.onchange = e => {
    var file = e.target.files[0];
    let file_detalis = {
      id: new Date().getTime(),
      name: file.name,
      size: file.size,
      type: file.type
    }
    console.log(file);

    // AllFileAttatched.push(file_detalis)
    // attatchFile_add(AllFileAttatched);
    // console.log(AllFileAttatched);
  }
}
//formatBytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
// load_file_in_HTML
function load_file_in_HTML(files) {
  let allHtmlFiles = "";
  for (let file of files) {
    let the_file = `<li class="file" id="${file.id}"> <p class="name">${file.name}</p> <div id="delate_file"> <p class="size">${formatBytes(file.size)}</p> <p class="close_file" onClick="attatchFile_remove(this.id)">✖</p> </div> </li>`
    allHtmlFiles += the_file
  }
  all_files.innerHTML = allHtmlFiles
}
// attatchFile_add
function attatchFile_add(files) {
  load_file_in_HTML(files)
}
// attatchFile_remove
function attatchFile_remove(id) {
  var index = AllFileAttatched.map(x => {
    return x.Id;
  }).indexOf(id);
  AllFileAttatched.splice(index, 1);
  console.log(AllFileAttatched);
  load_file_in_HTML(AllFileAttatched)
}
function getHistory() {
  let localStorage_history = JSON.parse(localStorage.getItem("chat_history"))
  if (localStorage_history) {
    for (let msg of localStorage_history) {
      console.log(msg);
      if (msg.type == "text" && msg.isSend == true) {
        document.getElementById("chat_box_").innerHTML += `<div class="text"> ${msg.text} </div>`
      }
      if (msg.type == "text" && msg.isSend == false) {
        document.getElementById("chat_box_").innerHTML += `<div class="text support"> ${msg.text} </div>`
      }
      if (msg.type == "Image" && msg.isSend == true) {
        document.getElementById("chat_box_").innerHTML += `<div class="img "> <img src="${msg.url}" alt=""> </div>`
      }
      if (msg.type == "Image" && msg.isSend == false) {
        document.getElementById("chat_box_").innerHTML += `<div class="img support"> <img src="${msg.url}" alt=""> </div>`
      }
    }
  }
}
// check if user login 
if (check_user_login()) {
  the_chat_app.classList.add("login_true");
  initSocket();

  getHistory()
} else {
  the_chat_app.classList.remove("login_true")
}
// Login
function login_get_values() {
  let uuid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
  let name = document.getElementById("login_name");
  let email = document.getElementById("login_email");
  let phone = document.getElementById("login_phone");
  let p = document.getElementById("login_p");
  let user = {
    id: uuid,
    name: "",
    email: "",
    phone: 0
  }
  p.innerHTML = ""
  if (name.value.match(/\s*(?:[\w\.]\s*){3,10}$/) && email.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/) && phone.value.match(/^\d{10,20}$/)) {
    console.log("all ok", name.value, email.value, phone.value);
    user.name = name.value
    user.email = email.value
    user.phone = phone.value
    set_local_user(JSON.stringify(user));
    document.getElementById("login_chat_app").style.display = "none"
    document.getElementById("the_send_box_").style.display = "block"
  }
  if (!name.value.match(/\s*(?:[\w\.]\s*){3,10}$/)) {
    p.innerHTML += "Name is short <br>"
    name.style.border = "1px solid #ff2a2a";
  } else {
    name.style.border = "1px solid #dfdfdf";
  }
  if (!email.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    p.innerHTML += "Not Valid Email <br>"
    email.style.border = "1px solid #ff2a2a";
  } else {
    email.style.border = "1px solid #dfdfdf";
  }
  if (!phone.value.match(/^\d{10,20}$/)) {
    p.innerHTML += "Phone Number Not (10-20) Digit<br>"
    phone.style.border = "1px solid #ff2a2a";
  } else {
    phone.style.border = "1px solid #dfdfdf";
  }
  initSocket();
  console.log(user);
}
// LocalStorge 
function set_local_user(data) {
  localStorage.setItem("tecfy_user_data", data);
}
function check_user_login() {
  if (localStorage.getItem("tecfy_user_data")) {
    return true
  } else {
    return false
  }
}
// web soket 
function start_send(text) {
  let Message = {
    type: "newMessage",
    requestId: "111111111",
    data: {
      roomId: ChatRoomId,
      message: {
        type: "text",
        text: text
      }
    }
  }
  // let getmasseg = JSON.stringify(Message)
  socket.send(JSON.stringify(Message));
}
function sendmasseg(masseg) {
  let localStorage_history = JSON.parse(localStorage.getItem("chat_history"))
  localStorage_history.push(
    {
      type: "text",
      text: masseg,
      isSend: false
    }
  )
  localStorage.setItem("chat_history", JSON.stringify(localStorage_history))
  document.getElementById("chat_box_").innerHTML += `<div class="text support"> ${masseg} </div>`
  chat_box.scrollTop = chat_box.scrollHeight;
}
function sendimg(img) {
  document.getElementById("chat_box_").innerHTML += `<div class="img support"> <img src="${img}" alt=""> </div>`
  chat_box.scrollTop = chat_box.scrollHeight;
}
function initSocket() {
  document.getElementById("the_send_box_").style.display = "none"
  if (socket) return;
  console.log('try open connection..');
  let user = JSON.parse(localStorage.getItem("tecfy_user_data"))
  socket = new WebSocket(`wss://ticketsrv.tecfy.co/ws?clientid=${user.id}&name=${user.name}&mobile=${user.phone}&email=${user.email}`);
  socket.onopen = function (e) {
    // TODO: 
    console.log('connection opened');
    document.getElementById("the_send_box_").style.display = "block"
  };
  // message received - show the message in div#messages
  socket.onmessage = function (event) {
    if (!ChatRoomId) {
      ChatRoomId = JSON.parse(event.data).data.id;
    }

    // console.log(JSON.parse(event.data).data.id);
    let ms = JSON.parse(event.data);
    console.log(ms.data.message);
    if (ms.data.message) {
     
      if (ms.data.message.type == "text") {
        console.log("ms.data.message.text",ms.data.message.text);
        sendmasseg(ms.data.message.text)
      }
      if (ms.data.message.type == "Image") {
        sendimg(ms.url)
      }
    }

  }
}
function oninit_() {
  document.getElementById("loginNow").addEventListener("click", () => {
    login_get_values()
  })
  BTN_run_send.addEventListener("click", (e) => {



    if (text_.value.length >= 1 && AllFileAttatched.length >= 1) {
      // text and imgs  
      addToChat({ text: text_.value, type: "textwithimg", link: AllFileAttatched })
    } else if (text_.value.length >= 1 && AllFileAttatched.length == 0) {
      // text ony 
      console.log("text_.value>>>>", text_.value);

      let localStorage_history = JSON.parse(localStorage.getItem("chat_history"))
      localStorage_history.push(
        {
          type: "text",
          text: text_.value,
          isSend: true
        }
      )
      localStorage.setItem("chat_history", JSON.stringify(localStorage_history))

      addToChat({ text: text_.value, type: "text" })

    } else if (text_.value.length == 0 && AllFileAttatched.length >= 1) {
      // img ony 
      addToChat({ type: "img", link: AllFileAttatched })
    } else if (text_.value.length == 0 && AllFileAttatched.length == 0) {
      // Nobbb
    }
  })
  BTN_attach.addEventListener("click", attatchFile)
  the_chat_app_icon.addEventListener("click", () => {
    chat_box.scrollTop = chat_box.scrollHeight;
    the_chat_app.classList.toggle("open");
  })
  header_close.addEventListener("click", () => {
    the_chat_app.classList.toggle("open");
  })

}
oninit_()