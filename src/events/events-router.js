const express = require('express');
const path = require('path');
const EventsService = require('./events-service');
const { requireAuth } = require('../middleware/jwt-auth');

const eventsRouter = express.Router();
const jsonBodyParser = express.json();

//GET User's Events
eventsRouter
    .route('/')
    .all(requireAuth)
    .get(jsonBodyParser, (req, res, next) => {
        EventsService.getUsersEvents(
            req.app.get('db'),
            req.headers.user_id
        )
            .then(events => {
                res.status(200).json(EventsService.serializeEvents(events));
            })
            .catch(next);
    })
    //Add New Event
    .post(jsonBodyParser, (req, res, next) => {
        const { event_name, event_date, event_start, event_end, venue, budget, guests } = req.body;
        const user_id = req.headers.user_id;
        const newEvent = { event_name };
        
        for (const [key, value] of Object.entries(newEvent))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });

        newEvent.event_date = (event_date === '') ? null : event_date;
        newEvent.event_start = (event_start === '') ? null : event_start;
        newEvent.event_end = (event_end === '') ? null : event_end;
        newEvent.venue = venue;
        newEvent.budget = budget;
        newEvent.guests = guests;
        newEvent.user_id = user_id;

        EventsService.insertEvent(
            req.app.get('db'),
            newEvent
        )
            .then(event => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${event.id}`))
                    .json(EventsService.serializeEvent(event));
            })
            .catch(next);
    });

    //GET, UPDATE, or DELETE a single Event
    eventsRouter
        .route('/:event_id')
        .all(requireAuth)
        .all((req, res, next) => {
            EventsService.getById(
                req.app.get('db'),
                req.params.event_id
            )
                .then(event => {
                    if (!event)
                        return res.status(404).json({
                            error: { message: `Event doesn't exist` }
                        });
                    res.event = event;
                    next();
                })
                .catch(next);
        })
        //GET Event
        .get((req, res, next) => {
            res.json(EventsService.serializeEvent(res.event));
        })
        //DELETE Event
        .delete((req, res, next) => {
            EventsService.deleteEvent(
                req.app.get('db'),
                req.params.event_id
            )
                .then(() => {
                    res.status(204).end();
                })
                .catch(next);
        })
        //PATCH Event
        .patch(jsonBodyParser, (req, res, next) => {
            const { event_name, event_date, event_start, event_end, venue, budget, guests } = req.body;
            const eventToUpdate = { event_name, event_date, event_start, event_end, venue, budget, guests };

            const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
            if (numberOfValues === 0)
                return res.status(400).json({
                    error: { message: `Request body must contain event_name, event_date, event_start, event_end, venue, budget, or guests` }
                });
            
            EventsService.updateEvent(
                req.app.get('db'),
                req.params.event_id,
                eventToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end();
                })
                .catch(next);
        });

        module.exports = eventsRouter;