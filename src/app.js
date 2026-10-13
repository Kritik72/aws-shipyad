const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const state = require('./state');
const healthRoutes = require('./routes/health');
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // correct client IPs behind the AWS ALB ingress
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:'],
          'connect-src': ["'self'"],
          'upgrade-insecure-requests': null
        }
      }
    })
  );

  if (process.env.NODE_ENV !== 'test') {
    // Skip probe noise in logs
    app.use(morgan(config.logFormat, { skip: (req) => ['/health', '/ready'].includes(req.path) }));
  }

  app.use((req, res, next) => {
    state.requestCount += 1;
    next();
  });

  app.use(express.json({ limit: '10kb' }));
  app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1h' }));

  // Values available to every view
  app.use((req, res, next) => {
    res.locals.app = {
      name: config.name,
      version: config.version,
      env: config.env,
      hostname: config.hostname
    };
    res.locals.currentPath = req.path;
    res.locals.nav = [
      { href: '/', label: 'Home' },
      { href: '/services', label: 'Services' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/architecture', label: 'Architecture' },
      { href: '/api-docs', label: 'API' },
      { href: '/contact', label: 'Contact' }
    ];
    res.locals.scripts = [];
    next();
  });

  app.use(healthRoutes);
  app.use('/api', apiRoutes);
  app.use(pageRoutes);

  // 404
  app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found', path: req.path });
    }
    res.status(404).render('404', { title: 'Page not found' });
  });

  // Error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    if (req.path.startsWith('/api/') || req.is('application/json')) {
      return res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
    }
    res.status(status).render('404', { title: 'Something went wrong' });
  });

  return app;
}

module.exports = createApp;
