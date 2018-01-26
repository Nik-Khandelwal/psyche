$('document').ready(function() {
  $(".button-collapse").sideNav();
  $('.tap-target').tapTarget('open');
  $('ul.tabs').tabs();
  $('.modal').modal();
  testEnabledNotification();
});
$(window).on('load', function() {
  document.getElementById('pre-loader').style.display = 'none';
});
var game_state = 'not_playing';
var main_divs = document.getElementsByClassName('main-content');

function testEnabledNotification() {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    Materialize.toast("Your Browser Doesn't support Notifications!", 3000);
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    Materialize.toast('Notifications Enabled!', 3000);
    // var notification = new Notification("Hi there!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        Materialize.toast('Notifications Enabled!', 3000);
        // var notification = new Notification("Notifications Enabled");
      } else if (Notification.permission === "denied") {
        Materialize.toast("You have blocked Notifications, We won't be able to inform you when your match starts!", 3000);
      }
    });
  }

  else if (Notification.permission === "denied") {
    Materialize.toast("You have blocked Notifications, We won't be able to inform you when your match starts!", 3000);
  }
}

function generateGroupCode() {
  if (game_state == 'not_playing') {
    Materialize.toast('Creating Closed Group!', 3000);
    document.getElementById('group-code-wrapper').innerHTML = "Loading...";
    showDiv(1);
    var userName = document.getElementById('user-name-span').innerHTML;
    var csrf_token = getCookie('csrftoken');
    var json_data = {
      "message": "Create_Closed_Group",
      "userName": userName
    }
    var send_data = JSON.stringify(json_data);
    var ajaxRequest = new XMLHttpRequest();
    var url = '/create_group/';
    ajaxRequest.open("GET", url, true);
    ajaxRequest.setRequestHeader("Content-type", "application/json");
    ajaxRequest.onreadystatechange = function() {
      if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
          var json_response = JSON.parse(ajaxRequest.responseText);
          if (json_response.groupCode) {
            // Open Please Wait for others page
            document.getElementById('group-code-wrapper').innerHTML = json_response.groupCode;
            document.getElementById('current-group').innerHTML = json_response.groupCode;
            openWebSockets('Closed', json_response.groupCode, userName);
          } else {
            Materialize.toast('Error Creating Group!', 2000);
          }
      } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
        Materialize.toast('There was an Unexpected Error from Server!', 2000);
      }
    }
    ajaxRequest.send(send_data);
  } else {
    Materialize.toast('Please finish your current game first!', 4000);
  }
}

function submitGroupCode() {
  var group_code = document.getElementById('group_code_field').value;
  var csrf_token = getCookie('csrftoken');
  var userName = document.getElementById('user-name-span').innerHTML;
  if (group_code != '') {
    var json_data = {
      "group_code": group_code,
      "message": "Joining_Group_Code",
      "userName":userName,
      "csrftoken": {
        "csrfmiddlewaretoken": csrf_token
      }
    }
    var send_data = JSON.stringify(json_data);
    Materialize.toast('Verifying Group Code...', 2000);
    var ajaxRequest = new XMLHttpRequest();
    var url = '/submitGroupCode/';
    ajaxRequest.open("POST", url, true);
    ajaxRequest.setRequestHeader("Content-type", "application/json");
    ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
    ajaxRequest.onreadystatechange = function() {
      if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
          var json_response = JSON.parse(ajaxRequest.responseText);
          if (json_response.success == 1) {
            // Open Please Wait for others page
            document.getElementById('current-group').innerHTML = group_code;
            showDiv(2);
            openWebSockets('Open', group_code, userName);
          } else {
            Materialize.toast('Incorrect/Expired Group Code!', 2000);
            updateOpenGroupCode();
          }
      } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
        Materialize.toast('There was an Unexpected Error!', 2000);
      }
    }
    ajaxRequest.send(send_data);
  } else {
    Materialize.toast('Please Enter a Group Code!', 2000);
  }
}
function showDiv(div_no) {
  hideAllDivs();
  main_divs[div_no].style.display = 'block';
  if (div_no == 1 || div_no == 2 || div_no == 8) {
    document.getElementById('quit-match-btn').style.display = 'block';
  } else {
    document.getElementById('quit-match-btn').style.display = 'none';
  }
  if (div_no == 0) {
    game_state = 'not_playing';
    document.getElementById('group_code_field').value = '';
  } else {
    game_state = 'playing';
  }
}
function hideAllDivs() {
  for (var i = 0; i < main_divs.length; i++) {
    main_divs[i].style.display = 'none';
  }
}
function quit_match() {
  // Send Websocket request to Logout user of all matches and Display Main Page.
  var groupCode = document.getElementById('current-group').innerHTML;
  var userName = document.getElementById('user-name-span').innerHTML;
  Materialize.toast('Processing Request!', 2000);
  var json_data = {
    "group_code": groupCode,
    "message": "Exiting_Group",
    "userName":userName
  }
  showDiv(0);
  webSocketBridge.send(json_data);
  updateOpenGroupCode();
}
function getCookie(name) {
  var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}
function countdown(count) {
  if (count==0) {
    // Call Start Next Round Function
    startNewRound();
  } else {
    document.getElementById('countdown-span').innerHTML = count;
    setTimeout(function() {
      countdown(count-1)
    }, 1000);
  }
}
function start_in_countdown(count) {
  if (count==0) {
    // Call Show Question Div Function
    showDiv(3);
  } else {
    document.getElementById('starts-in-count').innerHTML = count;
    setTimeout(function() {
      start_in_countdown(count-1)
    }, 1000);
  }
}
// Question Div Code
function setbg(color) {
  document.getElementById("styled").style.background=color
}
function setcolor(color) {
  document.getElementById("styled").style.color=color
}
function startClosedMatch() {
  var group_code = document.getElementById('group-code-wrapper').innerHTML;
  var userName = document.getElementById('user-name-span').innerHTML;
  var json_data = {
    "group_code": group_code,
    "message": "Start_Closed_Match",
    "userName":userName
  }
  Materialize.toast('Processing your Request...', 2000);
  webSocketBridge.send(json_data);
}
function fetchQuestion() {
  document.getElementById('ques-text').innerHTML = 'Fetching Question...';
  document.getElementById('styled').value = '';
  var groupCode = document.getElementById('current-group').innerHTML;
  var userName = document.getElementById('user-name-span').innerHTML;
  var json_data = {
    "group_code": groupCode,
    "message": "Send_Question",
    "userName":userName
  }
  webSocketBridge.send(json_data);
}
function submitAns() {
  // Submit Ans to Backend using Websockets and show user please wait page.
  var answer = document.getElementById('styled').value;
  var groupCode = document.getElementById('current-group').innerHTML;
  var userName = document.getElementById('user-name-span').innerHTML;
  if (answer != '') {
    var json_data = {
      "answer": answer,
      "group_code": groupCode,
      "message": "Submitting_Answer",
      "userName":userName
    }
    Materialize.toast('Submitting Answer!!', 3000);
    showDiv(4);
    document.getElementById('submit-auto-in-count').style.display = 'none';
    webSocketBridge.send(json_data);
  } else {
    Materialize.toast('Please Type an Answer before Submitting!', 2000);
  }
}
function updateAnswers(data) {
  showDiv(5);
  document.getElementById('answer-options-wrapper').innerHTML = '';
  for (var i = 0; i < data.answers.length; i++) {
    document.getElementById('answer-options-wrapper').innerHTML += '<div class="row"> <div class="col m1 s0"></div><div class="col m10 s12 answer-options pink darken-4" userName="'+data.answers[i].name+'" onclick="submitSelectedAns('+i+')"> <h5 class="answer-options-answer">'+data.answers[i].ans+'<h5> </div><div class="col m1 s0"></div></div>';
  }
}
function submitSelectedAns(num) {
  var userName = document.getElementById('user-name-span').innerHTML;
  if (document.getElementsByClassName('answer-options')[num].getAttribute('userName') != userName) {
    var answer = document.getElementsByClassName('answer-options-answer')[num].innerHTML;
    var groupCode = document.getElementById('current-group').innerHTML;
    var json_data = {
      "selected_ans": answer,
      "group_code": groupCode,
      "message": "Selected_Answer",
      "userName":userName
    }
    showDiv(6);
    webSocketBridge.send(json_data);
  } else {
    Materialize.toast('You cannot choose your own Answer!', 3000);
  }
}
function updatePsyched(data) {
  var userName = document.getElementById('user-name-span').innerHTML;
  for (var i = 0; i < data.length; i++) {
    if (data[i].name == userName) {
      if (data[i].psyched_by == '') {
        document.getElementById('psyched-by-msg').style.display = 'none';
        document.getElementById('correct-ans').style.display = 'inline-block';
      } else {
        document.getElementById('psyched-by-msg').style.display = 'inline-block';
        document.getElementById('pyched-by-user').innerHTML = data[i].psyched_by;
        document.getElementById('correct-ans').style.display = 'none';
      }
      document.getElementById('psyched-user-collection').innerHTML = '';
      for (var i = 0; i < data[i].psyched.length; i++) {
        var user = data[i].psyched[i];
        document.getElementById('psyched-user-collection').innerHTML += '<li class="collection-item dismissable custom-list">'+user+'</li>';
      }
      showDiv(7);
      if (data[i].finished == 1) {
        document.getElementById('next-round').style.display = 'none';
        document.getElementById('leaderboard-show-btn').style.display = 'block';
      } else {
        document.getElementById('next-round').style.display = 'inline';
        document.getElementById('leaderboard-show-btn').style.display = 'none';
        countdown(10);
      }
    } else {
      // Do nothing
    }
  }
}
function startNewRound() {
  // Start a new Round
  document.getElementById('styled').value = '';
  showDiv(3);
  fetchQuestion();
}
function fetchLeaderboard() {
  var groupCode = document.getElementById('current-group').innerHTML;
  var userName = document.getElementById('user-name-span').innerHTML;
  var json_data = {
    "group_code": groupCode,
    "message": "Send_Leaderboard",
    "userName":userName
  }
  Materialize.toast('Fetching Leaderboard!', 3000);
  webSocketBridge.send(json_data);
  document.getElementById('leaderboard-users').innerHTML = "";
  showDiv(8);
}
function showLeaderboard(data) {
  document.getElementById('leaderboard-users').innerHTML = "";
  for (var i = 0; i < data.users.length; i++) {
    if (i==0) {
      document.getElementById('leaderboard-users').innerHTML += '<li class="collection-item avatar center"> <img src="/static/psych/images/gold-medal.svg" alt="" class="circle"> <span class="title leaderboard-name">'+data.users[i]+'</span> </li>'
    } else if (i==1) {
      document.getElementById('leaderboard-users').innerHTML += '<li class="collection-item avatar center"> <img src="/static/psych/images/silver-medal.svg" alt="" class="circle"> <span class="title leaderboard-name">'+data.users[i]+'</span> </li>'
    } else if (i==2) {
      document.getElementById('leaderboard-users').innerHTML += '<li class="collection-item avatar center"> <img src="/static/psych/images/bronze-medal.svg" alt="" class="circle"> <span class="title leaderboard-name">'+data.users[i]+'</span> </li>'
    } else {
      document.getElementById('leaderboard-users').innerHTML += '<li class="collection-item avatar center"> <img src="/static/psych/images/normal-medal.svg" alt="" class="circle"> <span class="title leaderboard-name">'+data.users[i]+'</span> </li>'
    }
  }
  Materialize.toast('Updated!', 2000);
}

function updateQuestion(data, type) {
  document.getElementById('submit-auto-in-count').style.display = 'block';
  autoCountdown(40);
  if (type == 'Text') {
    document.getElementById('ques-text').innerHTML = data.question;
    document.getElementById('ques-text1').innerHTML = data.question;
  } else if (type == 'Image') {
    document.getElementById('ques-text').innerHTML = data.question;
    document.getElementById('ques-text1').innerHTML = data.question;
    document.getElementById('ques-text').innerHTML += '<img src="/static/psych/images/loading_icon.gif" class="question-img">';
    document.getElementsByClassName('question-img')[0].src = data.quesImg;
  }
}

function sendNotification() {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    Materialize.toast("Your Browser Doesn't support Notifications!", 3000);
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    Materialize.toast('Your Match is about to Begin!', 3000);
    var notification = new Notification("Your Match is about to Begin!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        Materialize.toast('Your Match is about to Begin!', 3000);
        var notification = new Notification("Your Match is about to Begin!");
      }
    });
  }

  else if (Notification.permission === "denied") {
    Materialize.toast("You have blocked Notifications, We won't be able to inform you when your match starts!", 3000);
  }
}


function updateOpenGroupCode() {
  var userName = document.getElementById('user-name-span').innerHTML;
  var json_data = {
    "message": "Update_Open_Group_Code",
    "userName": userName
  }
  var send_data = JSON.stringify(json_data);
  var ajaxRequest = new XMLHttpRequest();
  var url = '/create_open_group/';
  ajaxRequest.open("GET", url, true);
  ajaxRequest.setRequestHeader("Content-type", "application/json");
  ajaxRequest.onreadystatechange = function() {
    if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
      var json_response = JSON.parse(ajaxRequest.responseText);
      if (json_response.groupCode) {
        // Open Please Wait for others page
        document.getElementById('group-code').innerHTML = json_response.groupCode;
      } else {
        Materialize.toast('Error Fetching Group Code!', 2000);
      }
    } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
      Materialize.toast('There was an Unexpected Error from Server!', 2000);
    }
  }
  ajaxRequest.send(send_data);
}

// ------------- Websockets ---------------

var ws_path = '/chat/stream/';
var webSocketBridge;
function openWebSockets(type, groupCode, userName) {
  Materialize.toast('Initializing!', 3000);
  webSocketBridge = new channels.WebSocketBridge();
  webSocketBridge.connect(ws_path);
  console.log("Hello");
  this.send = function (message, callback) {
    this.waitForConnection(function () {
        webSocketBridge.send(message);
        if (typeof callback !== 'undefined') {
          callback();
        }
    }, 1000);
};

this.waitForConnection = function (callback, interval) {
    if (webSocketBridge.readyState === 1) {
        callback();
    } else {
        var that = this;
        // optional: implement backoff for interval here
        setTimeout(function () {
            that.waitForConnection(callback, interval);
        }, interval);
    }
};
this.send({
                        "command": "join",
                        "room": 1
                    });
this.send({
                            "command": "send",
                            "room": 1,
                            "message": "hvhvh",
                        });
  // Handle incoming messages

  webSocketBridge.listen(function(data) {
    console.log(data);
    if (data.error) {
      Materialize.toast('Error While Connecting!', 3000);
    }  else if (data.message == 'Error_Closed_Group') {
      Materialize.toast('You need atleast 2 people to start a Closed Match!', 3000);
    } else if (data.message == 'Start_Match') {
      sendNotification();
      showDiv(9);
      start_in_countdown(3);
      fetchQuestion();
    } else if (data.message == 'Question-Text') {
      updateQuestion(data, 'Text');
    } else if (data.message == 'Question-Img') {
      updateQuestion(data, 'Image');
    } else if (data.message == 'Answers') {
      updateAnswers(data);
    } else if (data[0].message == 'Psyched') {
      updatePsyched(data);
    } else if (data.message == 'Leaderboard') {
      showLeaderboard(data);
    }
  });
  webSocketBridge.socket.onopen = function() {
    Materialize.toast('Connected!', 3000);
    if (type == 'Open') {
      var json_data = {
        "group_code": groupCode,
        "message": "Start_Open_Match",
        "userName": userName
      }
      webSocketBridge.send(json_data);
    }
  };
  webSocketBridge.socket.onclose = function() {
    Materialize.toast('Disconnected!', 3000);
  };
}

// ---------- Countdown Code ---------------

function autoCountdown(count) {
  document.getElementById('submit-auto-in-count').style.display=='block'
  if (count==0 && document.getElementById('submit-auto-in-count').style.display=='block') {
    // Submit Blank Answer
    document.getElementById('styled').value = ' ';
    submitAns();
  } else if (count==0 && document.getElementById('submit-auto-in-count').style.display!='block') {
    // Terminate Countdown
  } else {
    document.getElementById('submit-auto-in-count').innerHTML = count;
    setTimeout(function() {
      autoCountdown(count-1)
    }, 1000);
  }
}