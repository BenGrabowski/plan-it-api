const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = require('../src/auth/auth-service');

function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: 'test-user-1',
            password: 'password',
          },
          {
            id: 2,
            user_name: 'test-user-2',
            password: 'password',
          },
          {
            id: 3,
            user_name: 'test-user-3',
            password: 'password',
          },
          {
            id: 4,
            user_name: 'test-user-4',
            password: 'password',
          },
    ];
}

function makeEventsArray() {
    return [
        {
            id: 1,
            user_id: 1,
            event_name: 'test1',
            event_date: '2020-02-09T07:00:00.000Z',
            event_start: '13:00:00',
            event_end: '18:00:00',
            venue: {
                name: 'test venue 1',
                address_street: '123 Main St.',
                address_city: 'Denver',
                address_state: 'CO',
                address_zip: '12345'
            },
            budget: {
                total: 1000,
                venue: 100,
                food: 100,
                drinks: 100,
                decorations: 100,
                other: 100
            },
            guests: {
                max: 100,
                list: ['test1', 'test2']
            }
        },
        {
            id: 2,
            user_id: 2,
            event_name: 'test2',
            event_date: '2020-02-10T07:00:00.000Z',
            event_start: '15:00:00',
            event_end: '19:00:00',
            venue: {
                name: 'test venue 2',
                address_street: '456 Main St.',
                address_city: 'Denver',
                address_state: 'CO',
                address_zip: '54321'
            },
            budget: {
                total: 2000,
                venue: 200,
                food: 200,
                drinks: 200,
                decorations: 200,
                other: 200
            },
            guests: {
                max: 200,
                list: ['test3', 'test4']
            }
        },
        {
            id: 3,
            user_id: 3,
            event_name: 'test3',
            event_date: '2020-02-11T07:00:00.000Z',
            event_start: '18:00:00',
            event_end: '22:00:00',
            venue: {
                name: 'test venue 3',
                address_street: '789 Main St.',
                address_city: 'Denver',
                address_state: 'CO',
                address_zip: '99999'
            },
            budget: {
                total: 3000,
                venue: 300,
                food: 300,
                drinks: 300,
                decorations: 300,
                other: 300
            },
            guests: {
                max: 300,
                list: ['test1', 'test2']
            }
        }
    ]
}

function makeFixtures() {
    const testUsers = makeUsersArray();
    const testEvents = makeEventsArray();
    return {testUsers, testEvents};
}

function cleanTables(db) {
    return db.raw(
        `TRUNCATE
            planit_users,
            planit_events
            RESTART IDENTITY CASCADE`
    );
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }));
    return db.into('planit_users').insert(preppedUsers)
      .then(() =>
        db.raw(
          `SELECT setval('planit_users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      );
}

function seedEvents(db, events, users) {
    return db.transaction(async trx => {
        await seedUsers(trx, users);
        await trx.into('planit_events').insert(events);
        await trx.raw(
          `SELECT setval('planit_events_id_seq', ?)`,
          [events[events.length -1].id]
        );
      });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = AuthService.createJwt(user.user_name, { user_id: user.id });
    return `Bearer ${token}`;
}

module.exports = {
    makeUsersArray,
    makeEventsArray,
    makeFixtures,
    seedUsers,
    seedEvents,
    cleanTables,
    makeAuthHeader,
};

