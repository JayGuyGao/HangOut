var esEndpoint = 'https://search-group6-activity-website-gv3gkyysjd5b7hnkji7hcmghzi.us-east-1.es.amazonaws.com/activities/activity/';

/******************** helper function ********************/

function createNode(type, classes) {
  var node = document.createElement(type);
  classes.forEach(function(c) {
    node.classList.add(c);
  });
  return node;
}

/******************** helper function ********************/

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
  fetch(esEndpoint, {
    headers: { 'Content-Type': 'application/json' },
    method: "POST",
    body: JSON.stringify(composeNewActivity(form.elements))
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
