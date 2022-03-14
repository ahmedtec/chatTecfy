document.addEventListener("DOMContentLoaded", function () {
  console.log("document loded")
  start()
});

async function start() {
  //static actions
  // openchat
  document.getElementById("the_chat_app_icon").addEventListener("click", () => {
    document.getElementById("the_chat_app").classList.toggle("open");
  })
  //closechat
  document.getElementById("close_").addEventListener("click", () => {
    document.getElementById("the_chat_app").classList.toggle("open");
  })
  // Global Varibles 
  let files = [];
  let socket;
  if (localStorage.getItem("tecfy_user_data")) {
    //remove login form
    document.getElementById("login_chat_app").style.display = "none"
    document.getElementById("the_send_box_").style.display = "block"
    // start socket 
    let user = JSON.parse(localStorage.getItem("tecfy_user_data"))
    socket = await new WebSocket(`wss://ticketsrv.tecfy.co/ws?clientid=${user.id}&name=${user.name}&mobile=${user.phone}&email=${user.email}`);
    // send
    document.getElementById("run_send").addEventListener("click", () => { send(document.getElementById("text_").value, files) })

    document.getElementById("attach").addEventListener("click", attatchFile)
  } else {
    // login handel 
  }

  function send(text = "", files = []) {
    if (text && files.length >= 1) {
      console.log("text and file", text, files);
    } else if (text) {
      console.log("text only", text);
    } else if (files.length >= 1) {
      console.log("files only", files);
    }
  }
  function attatchFile() {
    let fileinput = document.getElementById("the_send_box_file_input")
    fileinput.click()
    fileinput.onchange = e => {
      var file = e.target.files[0];
      let file_detalis = {
        id: new Date().getTime(),
        name: file.name,
        size: file.size,
        type: file.type
      }
      files.push(file_detalis)
      console.log(files);

      load_file_in_HTML(files);
    }
  }
  function load_file_in_HTML(files) {

    let allHtmlFiles = "";
    for (let file of files) {
      let the_file = `<li class="file" id="${file.id}"> <p class="name">${file.name}</p> <div id="delate_file"> <p class="size">${formatBytes(file.size)}</p> <p class="close_file" onClick="attatchFile_remove(this.id)">✖</p> </div> </li>`
      allHtmlFiles += the_file
    }
    document.getElementById("files").innerHTML = allHtmlFiles
  }
}