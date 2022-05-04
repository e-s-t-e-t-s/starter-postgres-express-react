const Router = require('express-promise-router');
const Posts = require('../../components/posts');
const auth = require('../../components/auth/helpers');

module.exports = (app) => {
  const router = Router();
  const posts = Posts(app);

  // Get post summaries
  router.get('/', auth.authenticate, async (req, res) => {
    const data = await posts.getSummaries();
    res.json(data);
  });

  return Router().use('/post-summaries', router);
};
