var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('ea2', { title: 'Einsendeaufgabe 2' });
});

module.exports = router;