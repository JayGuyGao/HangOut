function getActivity() {
  fetch('https://w217imcezl.execute-api.us-east-1.amazonaws.com/test')
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      document.getElementById('placeholder').textContent = data;
    })
    .catch(function (error) {
      console.log(error);
  });
}
