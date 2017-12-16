var esEndpoint = 'https://search-group6-activity-website-gv3gkyysjd5b7hnkji7hcmghzi.us-east-1.es.amazonaws.com/activities/activity/';

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
  var frame = document.getElementById('placeholder');
  while (frame.hasChildNodes()) {
    frame.removeChild(frame.lastChild);
  }
  activities.forEach(function(activity) {
    frame.appendChild(renderActivity(activity));
  });
}

function renderActivity(activity) {
  // create list item
  var node = document.createElement("LI");
  node.setAttribute('id', activity._id);
  node.appendChild(document.createTextNode(JSON.stringify(activity._source
)));

  // create delete button
  var button = document.createElement("button");
  button.innerHTML = 'Delete'
  button.onclick = function() { deleteActivity(activity._id) };
  node.appendChild(button);

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
  var form = document.getElementById('new-post-form');
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
