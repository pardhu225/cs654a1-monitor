var socket = io();

var bv1 = document.getElementById('bv1');
var bv2 = document.getElementById('bv2');
var bvs1 = document.getElementById('bvs1');
var bvs2 = document.getElementById('bvs2');

socket.on('report', r => {
    document.getElementById('report').innerHTML = JSON.stringify(r);
    if(r[0].pingStatus===true) {
        bv1.style.color = "green";
        bvs1.innerHTML = "&bull;";
        if(r[0].serviceStatus === true) {
            bvs1.style.color = "yellow";
        } else {
            bvs1.style.color = "black";
        }
    } else {
        bvs1.innerHTML = "&times;";
        bvs1.style.color = "black";
        bv1.style.color = "red";
    }
    if(r[1].pingStatus===true) {
        bv2.style.color = "green";
        bvs2.innerHTML = "&bull;";
        if(r[1].serviceStatus === true) {
            bvs2.style.color = "yellow";
        } else {
            bvs2.style.color = "black";
        }
    } else {
        bvs2.innerHTML = "&times;";
        bvs2.style.color = "black";
        bv2.style.color = "red";
    }
});

function calculate() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            var obj = JSON.parse(xhttp.responseText);
            document.getElementById("result").innerHTML = obj.sum;
            document.getElementById("rand").innerHTML = obj.rand;
        }
        if (this.readyState == 4 && this.status == 503) {
            alert("Failed to fetch the answer");
        }

    };
    var n1 = document.getElementById("n1").value;
    var n2 = document.getElementById("n2").value;
    xhttp.open("GET", `crit-serv?n1=${n1}&n2=${n2}`, true);
    xhttp.send();
}