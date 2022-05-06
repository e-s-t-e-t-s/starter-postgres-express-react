process.env.NODE_ENV = 'test';

const request = require('supertest');
const migrate = require('../scripts/db-migrate');
const seed = require('../scripts/db-seed');
const App = require('./app');

describe('Run basic server tests', () => {
  let app = {};
  let jwtToken;

  // Run migrations, clear DB, then seeding
  beforeAll(async () => {
    await migrate();
    const { db } = await seed.openDB();
    await seed.clearDB(db);
    await seed.seed(db);
    await seed.closeDB(db);
  }, 30000);

  // Wait for the app to load
  beforeAll(async () => {
    app = await App();
  }, 30000);

  it('should have a successful DB connection', () => {
    const db = app.get('db');
    return expect(typeof db).toBe('object');
  });

  it(
    'should respond 200 to the [GET /]',
    (done) => request(app).get('/').expect(200, done)
  );

  it(
    'should respond 401 to [GET api/post-summaries] when not logged in (unauthorized)',
    (done) => request(app).get('/api/post-summaries').expect(401, done)
  );

  it(
    'should respond with an JWT access token when logging in at [GET login/auth] ',
    (done) => {
      request(app)
        .post('/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password'
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body).toEqual({
            user: {
              id: expect.any(Number),
              email: expect.any(String),
              firstName: 'User',
              lastName: 'Test',
              createdAt: expect.any(String)
            },
            token: expect.any(String)
          });
          jwtToken = res.body.token;
          done();
        });
    }
  );

  it(
    'should get post summaries from [GET /api/post-summaries] using the JWT token',
    (done) => {
      request(app)
        .get('/api/post-summaries')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .end((err, res) => {
          res.body.forEach((e) => expect(e).toEqual({
            title: expect.any(String),
            count: expect.any(Number)
          }));
          done();
        });
    }
  );
});
