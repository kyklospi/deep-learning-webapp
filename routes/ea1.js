var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('ea1', { title: 'Einsendeaufgabe 1' });
});

module.exports = router;