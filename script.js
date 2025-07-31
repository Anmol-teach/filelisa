// script.js
let socket;
window.addEventListener('load', () => {
  socket = new WebSocket(`wss://${location.host}`);
  socket.onopen = () => {
    if (location.pathname.includes("receive")) {
      socket.send(JSON.stringify({ type: "registerReceiver" }));
    }
  };
  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "receiverList" && document.getElementById("userList")) {
      const usersEl = document.getElementById("users");
      usersEl.innerHTML = "";
      data.users.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        li.onclick = () => sendFileTo(user);
        usersEl.appendChild(li);
      });
      document.getElementById("userList").style.display = "block";
    }
    if (data.type === "incomingFile" && document.getElementById("incoming")) {
      const link = document.createElement("a");
      link.href = data.file;
      link.download = data.filename;
      link.textContent = `Download ${data.filename}`;
      document.getElementById("incoming").innerHTML = "";
      document.getElementById("incoming").appendChild(link);
    }
  };
});
function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file");
  const reader = new FileReader();
  reader.onload = () => {
    window._fileData = reader.result;
    window._fileName = file.name;
    socket.send(JSON.stringify({ type: "getReceivers" }));
  };
  reader.readAsDataURL(file);
}
function sendFileTo(userId) {
  if (!window._fileData || !window._fileName) return alert("No file uploaded");
  socket.send(JSON.stringify({
    type: "sendFile",
    to: userId,
    file: window._fileData,
    filename: window._fileName
  }));
  alert("File sent to " + userId);
}
