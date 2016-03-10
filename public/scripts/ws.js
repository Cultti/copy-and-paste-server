function startWebsocket() {
    var loc = window.location, new_uri;
if (loc.protocol === "https:") {
    new_uri = "wss:";
} else {
    new_uri = "ws:";
}
new_uri += "//" + loc.host;
new_uri += loc.pathname + "ws";

var ws = new WebSocket(new_uri);

ws.onopen = function() {
    // Web Socket is connected, send data using send()
    ws.send("Message to send");
    alert("Message is sent...");
};

ws.onmessage = function (evt) {
    var received_msg = evt.data;
    alert("Message is received...");
};

ws.onclose = function() {
    // websocket is closed.
    alert("Connection is closed...");
};
}