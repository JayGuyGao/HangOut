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
  $('#show-username').html('<span class="fa fa-user"></span>' + account);
}

function logout() {
  localStorage.removeItem('hangout_accesstoken');
  localStorage.removeItem('hangout_idtoken');
  localStorage.removeItem('hangout_refreshtoken');
  localStorage.removeItem('hangout_account');
  location.href = 'https://s3.amazonaws.com/group6-activity-website/login_form.html';
}

function getActivities() {
  // fetch(esEndpoint + composeQuery())
  console.log(composeQuery());
  fetch(esEndpoint + '_search' + composeQuery(), {
    headers: { 'Content-Type': 'application/json' },
    method: 'GET'
  })
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
      // getActivities();
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
      // if (res.statusText === 'Created') { getActivities(); }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function composeNewActivity(elements) {
  var obj ={};
  for(var i = 0; i < elements.length ; ++i){
      var item = elements.item(i);
      if (item.name !== '' && item.value !== '') {
        obj[item.name] = item.value;
      }
  }
  return obj;
}

function composeQuery() {
  var form = document.getElementById('search-form');
  var type = form.elements.type.value;
  var kw = form.elements.kw.value;

  var ret = '';
  ret += kw === ''? '' : '(' + kw + ')';
  if (type !== '0') {
    ret += (ret.length > 0 ? 'AND' : '') + '(type:' + type + ')';
  }
  return ret.length > 0? '?q=' + ret : ret;
}
