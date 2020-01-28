const xss = require('xss');
const Treeize = require('treeize');

const EventsService = {
    getUsersEvents(db, user_id) {
        return db
            .from('planit_events AS event')
            .select(
                'event.id',
                'event.user_id',
                'event.event_name',
                'event.event_date',
                'event.event_start',
                'event.event_end',
                'event.venue',
                'event.budget',
                'event.guests'
            )
            .where('event.user_id', user_id)
            .orderBy('id', 'desc');
    },
    getById(db, id) {
        return db
            .from('planit_events AS event')
            .select(
                'event.id',
                'event.user_id',
                'event.event_name',
                'event.event_date',
                'event.event_start',
                'event.event_end',
                'event.venue',
                'event.budget',
                'event.guests'
            )
            .where('event.id', id)
            .first();
    },
    insertEvent(db, newEvent) {
        return db
            .insert(newEvent)
            .into('planit_events')
            .returning('*')
            .then(([event]) => event)
            .then(event => 
                EventsService.getById(db, event.id)    
            );
    },
    deleteEvent(db, id) {
        return db('planit_events')
            .where({ id })
            .delete();
    },
    updateEvent(db, id, newEventFields) {
        return db('planit_events')
            .where({ id })
            .update(newEventFields);
    },
    serializeEvent(event) {
        const eventTree = new Treeize();
        const eventData = eventTree.grow([ event ]).getData()[0];

        const cleanVenue = {
            name: xss(eventData.venue.name),
            address_street: xss(eventData.venue.address_street),
            address_city: xss(eventData.venue.address_city),
            address_state: xss(eventData.venue.address_state),
            address_zip: eventData.venue.address_zip
        }

        return {
            id: eventData.id,
            user_id: eventData.user_id,
            event_name: xss(eventData.event_name),
            event_date: eventData.event_date,
            event_start: eventData.event_start,
            event_end: eventData.event_end,
            venue: cleanVenue,
            budget: eventData.budget,
            guests: eventData.guests
        };
    },
    serializeEvents(events) {
        return events.map(this.serializeEvent);
    },
};

module.exports = EventsService;