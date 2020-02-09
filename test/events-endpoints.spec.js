const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Events Endpoints', () => {
    let db;

    const {
        testEvents,
        testUsers,
    } = helpers.makeFixtures();

    before('make knex instance', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe('GET /api/events', () => {
        beforeEach('insert events', () =>
            helpers.seedEvents(
                db,
                testEvents,
                testUsers
            )
        );
        
        it(`responds with 200 and all of the User's events`, () => {
            expectedEvent = testEvents.filter(event => event.user_id == 1);
            
            return supertest(app)
                .get('/api/events')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .set('user_id', testUsers[0].id)
                .expect(200, expectedEvent);
        });
    });

    describe('POST /api/events', () => {
        beforeEach('insert users', () => 
            helpers.seedUsers(
                db,
                testUsers
            )
        );

        it('returns 201 and new event', () => {
            newEvent = testEvents[0];

            return supertest(app)
                .post('/api/events')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .set('user_id', testUsers[0].id)
                .send(newEvent)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.user_id).to.eql(newEvent.user_id);                   
                    expect(res.body.event_name).to.eql(newEvent.event_name);
                    expect(res.body.event_date).to.eql(newEvent.event_date);
                    expect(res.body.event_start).to.eql(newEvent.event_start);
                    expect(res.body.event_end).to.eql(newEvent.event_end);
                    expect(res.body.venue).to.eql(newEvent.venue);
                    expect(res.body.budget).to.eql(newEvent.budget);
                    expect(res.body.guests).to.eql(newEvent.guests);
                })
                .expect(res => 
                  db
                    .from('planit_events')
                    .select('*')
                    .where({ id: res.body.id })
                    .first()
                    .then(row => {
                        expect(row.event_name).to.eql(newEvent.event_name);
                        expect(row.event_date).to.eql(newEvent.event_date);
                        expect(row.event_start).to.eql(newEvent.event_start);
                        expect(row.event_end).to.eql(newEvent.event_end);
                        expect(row.venue).to.eql(newEvent.venue);
                        expect(row.budget).to.eql(newEvent.budget);
                        expect(row.guests).to.eql(newEvent.guests);
                    })
                );
        });
    });

    describe('DELETE /api/events/:event_ id', () => {
        beforeEach('insert events', () => {
            return helpers.seedEvents(
                db,
                testEvents,
                testUsers
            );
        });

        it('deletes the event and returns 204', () => {
            const idToDelete = 2;
            const userId = 2;
            const expectedEvents = testEvents.filter(event => event.id !== idToDelete && event.user_id === userId);
            console.log(testEvents[idToDelete]);
            return supertest(app)
                .delete(`/api/events/${idToDelete}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                .set('user_id', testUsers[1].id)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/events`)
                        .set('user_id', testUsers[1].id)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                        .expect(expectedEvents)
                );
        });
    });

    describe('PATCH /api/events/:event_id', () => {
        beforeEach('insert events', () => {
            return helpers.seedEvents(
                db,
                testEvents,
                testUsers
            );
        });

        it('responds 204 and updates the event', () => {
            const idToUpdate = 2;
            const updateEvent = {
                event_name: 'updated event name',
            };
            const expectedEvent = {
                ...testEvents[idToUpdate - 1],
                ...updateEvent
            };

            console.log(expectedEvent);
            
            return supertest(app)
                .patch(`/api/events/${idToUpdate}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                .send(updateEvent)
                .expect(204)
                .then(res => 
                    supertest(app)
                    .get(`/api/events/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .expect(expectedEvent)
                );
        });
    });
});