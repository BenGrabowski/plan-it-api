BEGIN;

INSERT INTO planit_events (user_id, event_name, event_date, event_start, event_end, venue, budget, guests)
VALUES
    (1, 'Wedding', '2021-04-16', '3:00 PM', '10:00 PM', 
    '{"name": "El Chorro", "address_street": "5550 E Lincoln Dr", "address_city": "Paradise Valley", "address_state": "AZ", "address_zip": "85253"}',
    '{"total": 50000, "venue": 20000, "food": 10000, "drinks": 7500, "decorations": 5000, "other": 5000}',
    '{"max": 180, "list": ["Patty", "Joe", "Katie", "Alex", "Matt", "Nancy", "Colton"]}'
    );

COMMIT;