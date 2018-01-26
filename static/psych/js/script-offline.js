$('document').ready(function() {
  $(".button-collapse").sideNav();
  $('.collapsible').collapsible();
  $('.tap-target').tapTarget('open');
  $('ul.tabs').tabs();
});
$(window).on('load', function() {
  document.getElementById('pre-loader').style.display = 'none';
});
var game_state = 'not_playing';
var main_divs = document.getElementsByClassName('main-content');

function generateGroupCode() {
  if (game_state == 'not_playing') {
    // Send AJAX Request to create a Closed Group
    Materialize.toast('Creating Closed Group!', 3000);
    var csrf_token = getCookie('csrftoken');
    var ajaxRequest = new XMLHttpRequest();
    var url = 'https://api.myjson.com/bins/grs91';
    ajaxRequest.open("GET", url, true);
    ajaxRequest.setRequestHeader("Content-type", "application/json");
    // ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
    ajaxRequest.onreadystatechange = function() {
      if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
          var json_response = JSON.parse(ajaxRequest.responseText);
          if (json_response.groupCode) {
            // Open Please Wait for others page
            document.getElementById('group-code-wrapper').innerHTML = json_response.groupCode;
            showDiv(1);
          } else {
            Materialize.toast('Error Creating Group!', 2000);
          }
      } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
        // Materialize.toast('There was an Unexpected Error from Server!', 2000);
      }
    }
    ajaxRequest.send("");
    showDiv(1);
  } else {
    Materialize.toast('Please finish your current game first!', 4000) // 4000 is the duration of the toast
  }
}

function submitGroupCode() {
  var group_code = document.getElementById('group_code_field').value;
  if (group_code != '') {
    var csrf_token = getCookie('csrftoken');
    var json_data = {
      "group_code": group_code,
      "csrfmiddlewaretoken": csrf_token
    }
    var send_data = JSON.stringify(json_data);
    Materialize.toast('Verifying Group Code...', 2000);
    var ajaxRequest = new XMLHttpRequest();
    var url = 'url';
    ajaxRequest.open("POST", url, true);
    ajaxRequest.setRequestHeader("Content-type", "application/json");
    ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
    ajaxRequest.onreadystatechange = function() {
      if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
          var json_response = JSON.parse(ajaxRequest.responseText);
          if (json_response.success == 1) {
            // Open Please Wait for others page
            showDiv(2);
          } else {
            Materialize.toast('Incorrect/Expired Group Code!', 2000);
          }
      } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
        // Materialize.toast('There was an Unexpected Error!', 2000);
      }
    }
    ajaxRequest.send(send_data);
    showDiv(2);
  } else {
    Materialize.toast('Please Enter a Group Code!', 2000);
  }
}
function getCookie(name) {
  var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
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
  // Send AJAX request to Logout user of all matches and Display Main Page.
  Materialize.toast('Processing Request!', 2000);
  var csrf_token = getCookie('csrftoken');
  var json_data = {
    "csrfmiddlewaretoken": csrf_token
  }
  var send_data = JSON.stringify(json_data);
  var ajaxRequest = new XMLHttpRequest();
  var url = 'url';
  ajaxRequest.open("POST", url, true);
  ajaxRequest.setRequestHeader("Content-type", "application/json");
  ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
  ajaxRequest.onreadystatechange = function() {
    if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
      // Match Quit by user.
      showDiv(0);
    } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
      // Materialize.toast('There was an Unexpected Error!', 2000);
    }
  }
  ajaxRequest.send(send_data);
  showDiv(0);
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
  var group_code = document.getElementById('group_code_field').value;
  var csrf_token = getCookie('csrftoken');
  var json_data = {
    "group_code": group_code,
    "csrfmiddlewaretoken": csrf_token
  }
  var send_data = JSON.stringify(json_data);
  Materialize.toast('Processing your Request...', 2000);
  var ajaxRequest = new XMLHttpRequest();
  var url = 'url';
  ajaxRequest.open("POST", url, true);
  ajaxRequest.setRequestHeader("Content-type", "application/json");
  ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
  ajaxRequest.onreadystatechange = function() {
    if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
      var json_response = JSON.parse(ajaxRequest.responseText);
      if (json_response.success == 1) {
        // Open Question Div
        showDiv(9);
        start_in_countdown(3);
        fetchQuestion();
      } else if (json_response.success == 0) {
        Materialize.toast('You need atleast 2 players to join to start a match!', 2000);
      }
    } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
      // Materialize.toast('There was an Unexpected Error!', 2000);
    }
  }
  ajaxRequest.send(send_data);
  showDiv(9);
  start_in_countdown(3);
  fetchQuestion();
}

var i =0;
var questions = ["Irving Berlin composed 3,000 songs, but could not ","Random Question 2","Random Question 3"]

function fetchQuestion() {
  document.getElementById('ques-text').innerHTML = questions[i++];
  var csrf_token = getCookie('csrftoken');
  var json_data = {
    "csrfmiddlewaretoken": csrf_token
  }
  var send_data = JSON.stringify(json_data);
  var ajaxRequest = new XMLHttpRequest();
  var url = 'url';
  ajaxRequest.open("POST", url, true);
  ajaxRequest.setRequestHeader("Content-type", "application/json");
  ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
  ajaxRequest.onreadystatechange = function() {
    if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
      var json_response = JSON.parse(ajaxRequest.responseText);
      document.getElementById('ques-text').innerHTML = json_response.question;
    } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
      // Materialize.toast('There was an Unexpected Error!', 2000);
    }
  }
  ajaxRequest.send(send_data);
}
function submitAns() {
  // Submit Ans to Backend using AJAX and show user please wait page.
  var answer = document.getElementById('styled').value;
  if (answer != '') {
    var csrf_token = getCookie('csrftoken');
    var json_data = {
      "answer": answer,
      "csrfmiddlewaretoken": csrf_token
    }
    var send_data = JSON.stringify(json_data);
    Materialize.toast('Submitting Answer!!', 3000);
    var ajaxRequest = new XMLHttpRequest();
    var url = 'url';
    ajaxRequest.open("POST", url, true);
    ajaxRequest.setRequestHeader("Content-type", "application/json");
    ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
    ajaxRequest.onreadystatechange = function() {
      if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
        // Open Please Wait Page
        showDiv(4);
      } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
        // Materialize.toast('There was an Unexpected Error!', 2000);
      }
    }
    ajaxRequest.send(send_data);
    showDiv(4);
  } else {
    Materialize.toast('Please Type an Answer before Submitting!', 2000);
  }
  fetchAnswers();
}
function fetchAnswers() {
  document.getElementById('answer-options-wrapper').innerHTML = '';
  var csrf_token = getCookie('csrftoken');
  var json_data = {
    "csrfmiddlewaretoken": csrf_token
  }
  var send_data = JSON.stringify(json_data);
  var ajaxRequest = new XMLHttpRequest();
  var url = 'https://api.myjson.com/bins/16yuv9';
  ajaxRequest.open("GET", url , true);
  ajaxRequest.setRequestHeader("Content-type", "application/json");
  // ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
  ajaxRequest.onreadystatechange = function() {
    if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
      var json_response = JSON.parse(ajaxRequest.responseText);
      showDiv(5);
      // Use the Fetched Answers to display.
      for (var i = 0; i < json_response.answers.length; i++) {
        document.getElementById('answer-options-wrapper').innerHTML += '<div class="row"> <div class="col m1 s0"></div><div class="col m10 s12 answer-options pink darken-4" onclick="submitSelectedAns('+i+')"> <h5>'+json_response.answers[i]+'<h5> </div><div class="col m1 s0"></div></div>';
      }
    } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
      // Materialize.toast('There was an Unexpected Error!', 2000);
    }
  }
  ajaxRequest.send(send_data);
}
function submitSelectedAns(num) {
  var csrf_token = getCookie('csrftoken');
  var json_data = {
    "selected_ans": num,
    "csrfmiddlewaretoken": csrf_token
  }
  var send_data = JSON.stringify(json_data);
  var ajaxRequest = new XMLHttpRequest();
  var url = 'url';
  ajaxRequest.open("POST", url, true);
  ajaxRequest.setRequestHeader("Content-type", "application/json");
  ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
  ajaxRequest.onreadystatechange = function() {
    if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
      // Display Please Wait Page
      showDiv(6);
    } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
      // Materialize.toast('There was an Unexpected Error!', 2000);
    }
  }
  ajaxRequest.send(send_data);
  showDiv(6);
  updatePsyched();
}
function updatePsyched() {
  var csrf_token = getCookie('csrftoken');
  var json_data = {
    "csrfmiddlewaretoken": csrf_token
  }
  var send_data = JSON.stringify(json_data);
  var ajaxRequest = new XMLHttpRequest();
  var url = 'https://api.myjson.com/bins/13geed';
  ajaxRequest.open("GET", url, true);
  ajaxRequest.setRequestHeader("Content-type", "application/json");
  // ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
  ajaxRequest.onreadystatechange = function() {
    if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
      // Display Psyched Div
      var json_response = JSON.parse(ajaxRequest.responseText);
      if (json_response.psyched_by == '') {
        document.getElementById('psyched-by-msg').style.display = 'none';
        document.getElementById('correct-ans').style.display = 'inline-block';
      } else {
        document.getElementById('psyched-by-msg').style.display = 'inline-block';
        document.getElementById('pyched-by-user').innerHTML = json_response.psyched_by;
        document.getElementById('correct-ans').style.display = 'none';
      }
      document.getElementById('psyched-user-collection').innerHTML = '';
      for (var i = 0; i < json_response.psyched.length; i++) {
        var user = json_response.psyched[i];
        document.getElementById('psyched-user-collection').innerHTML += '<li class="collection-item dismissable custom-list">'+user+'</li>';
      }
      showDiv(7);
      if (json_response.finished == 1 || ++attempts == 2) {
        document.getElementById('next-round').style.display = 'none';
        document.getElementById('leaderboard-show-btn').style.display = 'block';
      } else {
        document.getElementById('next-round').style.display = 'inline';
        document.getElementById('leaderboard-show-btn').style.display = 'none';
        countdown(10);
      }
    } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
      // Materialize.toast('There was an Unexpected Error!', 2000);
    }
  }
  ajaxRequest.send(send_data);
  // showDiv(7);
  // document.getElementById('next-round').style.display = 'inline';
  // document.getElementById('leaderboard-show-btn').style.display = 'none';
  // countdown(10);
}
var attempts = 0;
function startNewRound() {
  // Start a new Round
  document.getElementById('styled').value = '';
  showDiv(3);
  fetchQuestion();
}
function showLeaderboard() {
  document.getElementById('leaderboard-users').innerHTML = "";
  showDiv(8);
  var csrf_token = getCookie('csrftoken');
  var json_data = {
    "csrfmiddlewaretoken": csrf_token
  }
  var send_data = JSON.stringify(json_data);
  var ajaxRequest = new XMLHttpRequest();
  var url = 'https://api.myjson.com/bins/16hpl1';
  ajaxRequest.open("GET", url, true);
  ajaxRequest.setRequestHeader("Content-type", "application/json");
  // ajaxRequest.setRequestHeader("X-CSRFToken", csrf_token);
  ajaxRequest.onreadystatechange = function() {
    if (ajaxRequest.readyState === 4 && ajaxRequest.status === 200) {
      // Change Leaderboard Div Content
      var json_response = JSON.parse(ajaxRequest.responseText);
      for (var i = 0; i < json_response.users.length; i++) {
        if (i==0) {
          document.getElementById('leaderboard-users').innerHTML += '<li class="collection-item avatar center"> <img src="images/gold-medal.svg" alt="" class="circle"> <span class="title leaderboard-name">'+json_response.users[i].name+'</span> </li>'
        } else if (i==1) {
          document.getElementById('leaderboard-users').innerHTML += '<li class="collection-item avatar center"> <img src="images/silver-medal.svg" alt="" class="circle"> <span class="title leaderboard-name">'+json_response.users[i].name+'</span> </li>'
        } else if (i==2) {
          document.getElementById('leaderboard-users').innerHTML += '<li class="collection-item avatar center"> <img src="images/bronze-medal.svg" alt="" class="circle"> <span class="title leaderboard-name">'+json_response.users[i].name+'</span> </li>'
        } else {
          document.getElementById('leaderboard-users').innerHTML += '<li class="collection-item avatar center"> <img src="images/normal-medal.svg" alt="" class="circle"> <span class="title leaderboard-name">'+json_response.users[i].name+'</span> </li>'
        }
      }
      Materialize.toast('Updated!', 2000);
    } else if (ajaxRequest.readyState === 4 && ajaxRequest.status != 200) {
      // Materialize.toast('There was an Unexpected Error!', 2000);
    }
  }
  ajaxRequest.send(send_data);
}