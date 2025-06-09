var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('ea3', { title: 'Einsendeaufgabe 3' });
});

module.exports = router;