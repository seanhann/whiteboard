var isDrawing, points = [ ], remotesPoints = [], ctx;

var socket = io.connect('http://kyra-wang.com');
socket.on('point', function(data){
      remotesPoints.push(data);
      drawPoints(remotesPoints);
});
socket.on('end', function(data){
      remotesPoints.length = 0;
});
socket.on('clean', function(data){
    clean();
});
window.onbeforeunload = function(){
    socket.emit('clean');
};

function clean(){
      remotesPoints.length = 0;
      points.length = 0;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawPoints(points){
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
}

$(function(){
    var el = document.getElementById('canvas');
    ctx = el.getContext('2d');
    
    ctx.lineWidth = 10;
    ctx.lineJoin = ctx.lineCap = 'round';
    
    
    el.onmousedown = function(e) {
      isDrawing = true;
      points.push({ x: e.clientX, y: e.clientY });
      socket.emit('point', { x: e.clientX, y: e.clientY });
    };
 
    el.onmousemove = function(e) {
      if (!isDrawing) return;
    
      //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      points.push({ x: e.clientX, y: e.clientY });
      socket.emit('point', { x: e.clientX, y: e.clientY });
      drawPoints(points); 
    };
    
    el.onmouseup = function() {
      isDrawing = false;
      points.length = 0;
      socket.emit('end');
    };

    el.addEventListener("touchstart", function (e) {
        e.preventDefault();
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    }, false);

    el.addEventListener("touchend", function (e) {
        e.preventDefault();
      var mouseEvent = new MouseEvent("mouseup", {});
      canvas.dispatchEvent(mouseEvent);
    }, false);

    el.addEventListener("touchmove", function (e) {
        e.preventDefault();
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    }, false);
});

function offer(){
    answer = connection = new RTCPeerConnection({iceServers: [{url: 'stun:stun.l.google.com:19302' }], iceCandidatePoolSize: 8});
    channel = connection.createDataChannel('dataChannel', { ordered: true, negotiated: true, id: 1023 });

    channel.onopen = function(event) {
        console.log('channel open');
        channel.send('Hi you!');
    }
    channel.onmessage = function(event) {
        console.log(event.data);
    }


    connection.onicegatheringstatechange = function(){
        console.log(connection.iceGatheringState);
        if(connection.iceGatheringState == "complete"){
            socket.emit('ip', connection.localDescription);
        }
    }

    connection.createOffer().then(function(desc){
        console.log(desc);
        connection.setLocalDescription(desc); 
    });

}
offer();
