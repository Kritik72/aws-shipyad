const express = require('express');
const store = require('../data/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    environments: store.getEnvironments(),
    stages: store.stages
  });
});

router.get('/services', (req, res) => {
  res.render('services', { title: 'Services', services: store.services });
});

router.get('/dashboard', (req, res) => {
  res.locals.scripts = ['/js/dashboard.js'];
  res.render('dashboard', { title: 'Dashboard' });
});

router.get('/architecture', (req, res) => {
  res.render('architecture', { title: 'Architecture', environments: store.getEnvironments() });
});

router.get('/api-docs', (req, res) => {
  res.locals.scripts = ['/js/api-console.js'];
  res.render('api-docs', { title: 'API' });
});

router.get('/contact', (req, res) => {
  res.locals.scripts = ['/js/contact.js'];
  res.render('contact', { title: 'Contact' });
});

module.exports = router;
