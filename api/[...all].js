import mod from '../backend/app.js';

const app = mod.default || mod;

export default function handler(req, res) {
  return app(req, res);
}
