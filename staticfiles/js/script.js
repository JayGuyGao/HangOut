var esEndpoint = 'https://search-group6-activity-website-gv3gkyysjd5b7hnkji7hcmghzi.us-east-1.es.amazonaws.com/activities_test/activity/';

/******************** helper function ********************/

function createNode(type, classes) {
  var node = document.createElement(type);
  classes.forEach(function(c) {
    node.classList.add(c);
  });
  return node;
}

/******************** helper function ********************/
function getUser() {
  var accessToken = localStorage.getItem('hangout_accesstoken');
  var idToken = localStorage.getItem('hangout_idtoken');
  var refreshToken = localStorage.getItem('hangout_refreshtoken');
  var account = localStorage.getItem('hangout_account');
  console.log('Account:' + account);
  if (account == null) {
    location.href = 'https://s3.amazonaws.com/group6-activity-website/login_form.html';
  }
  $('#show-username').html('<span class="fa fa-user"></span>' + account);
}

function logout() {
  localStorage.removeItem('hangout_accesstoken');
  localStorage.removeItem('hangout_idtoken');
  localStorage.removeItem('hangout_refreshtoken');
  localStorage.removeItem('hangout_account');
  location.href = 'https://s3.amazonaws.com/group6-activity-website/login_form.html';
}

function fillInfo() {
  var info = {
    token: localStorage.getItem('hangout_accesstoken'),
  }
  $.ajax({
        url: 'https://w217imcezl.execute-api.us-east-1.amazonaws.com/test/profile',
        type: 'put',
        dataType: 'json',
        contentType: "application/json",
        headers: {'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('hangout_idtoken'),
                },
        data: JSON.stringify(info),
        success: function (data) {
            //alert(data.msg);
            console.log(data.id);
            console.log(data.phone);
            console.log(data.age);
            console.log(data.gender);
            console.log(data.nickname);
            if (data.phone) {
              $("input[name='phone']").val(data.phone);
            }
            if (data.age) {
              $("input[name='age']").val(data.age);
            }
            if (data.nickname) {
              $("input[name='nickname']").val(data.nickname);
            }
            if (data.gender == 'male') {
              $("input[id='male']").attr('checked', true);
              $("input[id='female']").attr('checked', false);
            }
            else {
              $("input[id='male']").attr('checked', false);
              $("input[id='female']").attr('checked', true);
            }
            $("input[name='sex']").val(data.gender);
        },
    });
}

function getActivities() {
  fetch(esEndpoint + '_search')
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      console.log(data.hits.hits);
      renderAllActivities(data.hits.hits);
    })
    .catch(function (error) {
      console.log(error);
  });
}

function renderAllActivities(activities) {
  var frame = document.getElementById('activities-frame');
  while (frame.hasChildNodes()) {
    frame.removeChild(frame.lastChild);
  }
  activities.forEach(function(activity) {
    frame.appendChild(renderActivity(activity));
  });
}

// function renderActivity(activity) {
//   // create list item
//   var node = document.createElement("LI");
//   node.setAttribute('id', activity._id);
//   node.appendChild(document.createTextNode(JSON.stringify(activity._source)));

//   // create delete button
//   var button = document.createElement("button");
//   button.innerHTML = 'Delete'
//   button.onclick = function() { deleteActivity(activity._id) };
//   node.appendChild(button);

//   return node;
// }


function renderActivity(activity) {
  var node = createNode('div', ['list-group']);
  var activityDiv = createNode('div', ['sub-list-group']);
  node.appendChild(activityDiv);

  // activityImgLink
  var activityImgLink = createNode('a', []);
  activityImgLink.setAttribute('href', '/activity_detail/' + activity._id);

  var activityImg = createNode('img', ['activity-img']);
  activityImg.setAttribute('src', activity._source.picture);
  activityImgLink.appendChild(activityImg);

  // activityNameLink
  var activityNameLink = createNode('a', ['list-group-item', 'active']);
  var activityName = createNode('h4', ['list-group-item-heading']);
  activityName.innerHTML = activity._source.name;
  activityNameLink.appendChild(activityName);

  var activityDate = createNode('h5', ['list-group-item-heading']);
  activityDate.innerHTML = activity._source.start_time;
  activityNameLink.appendChild(activityDate);

  // activityDesDiv
  var activityDesDiv = createNode('div', ['list-group-item']);

  var activityIcon = createNode('h4', ['list-group-item-heading']);
  activityIcon.appendChild(createNode('span', ['glyphicon', 'glyphicon-map-marker']));
  activityIcon.appendChild(document.createTextNode(activity._source.place));
  activityDesDiv.appendChild(activityIcon);

  var activityDes = createNode('p', ['list-group-item-text']);
  activityDes.textContent = activity._source.explanation;
  activityDesDiv.appendChild(activityDes);

  // joinButton
  var joinButton = createNode('button', ['act-btn', 'btn', 'btn-md', 'btn-danger', 'pull-right']);
  joinButton.textContent = 'Join';
  joinButton.onclick = function() { deleteActivity(activity._id) };

  // add all div into frame
  [activityImgLink, activityNameLink, activityDesDiv, joinButton].forEach(function(child) {
    activityDiv.appendChild(child);
  });


  return node;
}

function deleteActivity(activityId) {
  fetch(esEndpoint + activityId, { method: "DELETE" })
    .then(function (res) {
      console.log(res);
      getActivities();
    })
    .catch(function (error) {
      console.log(error);
    });
}

function postActivity() {
  var form = document.getElementById('new_activity');
  var activities = composeNewActivity(form.elements);
  console.log(activities);
  fetch(esEndpoint, {
    headers: { 'Content-Type': 'application/json' },
    method: "POST",
    body: JSON.stringify(activities)
    })
    .then(function (res) {
      console.log(res);
      if (res.statusText === 'Created') { getActivities(); }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function composeNewActivity(elements) {
  var obj ={};
  for(var i = 0; i < elements.length ; ++i){
      var item = elements.item(i);
      if (item.name !== '') {
        obj[item.name] = item.value;
      }
  }
  return obj;
}


function getMyAttActs() {
    var info = {
        id: localStorage.getItem('hangout_id'),
        username: localStorage.getItem('hangout_account'),
        token: localStorage.getItem('hangout_accesstoken'),
    }
    $.ajax({
        url: 'https://w217imcezl.execute-api.us-east-1.amazonaws.com/test/profile',
        type: 'put',
        dataType: 'json',
        contentType: "application/json",
        headers: {'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('hangout_idtoken'),
                },
        data: JSON.stringify(info),
        success: function (data) {
            console.log(data);
            renderMyActs(data.activities);
        },
    })
}

function getMyCrtActs() {
    var info = {
        id: localStorage.getItem('hangout_id'),
        username: localStorage.getItem('hangout_account'),
        token: localStorage.getItem('hangout_accesstoken'),
    }
    $.ajax({
        url: 'https://w217imcezl.execute-api.us-east-1.amazonaws.com/test/profile',
        type: 'put',
        dataType: 'json',
        contentType: "application/json",
        headers: {'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('hangout_idtoken'),
                },
        data: JSON.stringify(info),
        success: function (data) {
            console.log(data);
            renderMyActs(data.activities);
        },
    })
}

function renderMyActs(acts) {
    var frame = document.getElementById('activities-frame');
    acts.forEach(function(act) {
        frame.appendChild(renderMyAct(act));
    });
}

function renderMyAct(act) {
    var node = createNode('div', ['col-lg-10', 'my-att-act']);
    var divNode = createNode('div', ['col-lg-10', 'list-group']);
    node.appendChild(divNode);

    var actLinkNode = createNode('a', ['list-group-item', 'active']);
    actLinkNode.setAttribute('href', '/activity_detail/' + act.id);
    var actNameNode = createNode('h4', 'list-group-item-heading');
    actNameNode.innerHTML = act.name;
    var actTimeNode = createNode('h5', 'list-group-item-heading');
    actTimeNode.innerHTML = act.start_time;
    actLinkNode.appendChild(actNameNode);
    actLinkNode.appendChild(actTimeNode);
    divNode.appendChild(actLinkNode);

    var actDescriptionNode = createNode('div', ['list-group-item']);
    actDescriptionNode.innerHTML = "<h4 class='list-group-item-heading'> <span class='glyphicon glyphicon-map-marker' aria-hidden:true></span>" + act.place + "</h4><p class='list-group-item-text'>" + act.explanation + "</p>"
    divNode.appendChild(actDescriptionNode);

    var buttonNode = createNode('div', []);
    if (act.status == "already_in") {
        buttonNode.innerHTML = '<button type="submit" class="btn btn-md pull-right disabled" style="position:relative;top:4px">Joined</button>';
    }
    else if (act.status == "expired") {
        buttonNode.innerHTML = '<button type="submit" class="btn btn-md pull-right disabled" style="position:relative;top:4px">Expired</button>';
    }
    else if (act.status == "available") {
        buttonNode.innerHTML = '<form role="form" method="post" action=""><input type="hidden" name="activity_id" value={{activity.id}} /><input type="hidden" name="form_type" value="apply_activity" /><button type="submit" class="btn btn-md btn-danger pull-right" style="position:relative;top:4px">Apply</button></form>';
    }
    divNode.appendChild(buttonNode);
}



