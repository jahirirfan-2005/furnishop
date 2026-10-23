import handler from './gateway.js';

export default async function healthHandler(req, res) {
  req.query = req.query || {};
  req.query.route = 'health.php';
  return handler(req, res);
}
