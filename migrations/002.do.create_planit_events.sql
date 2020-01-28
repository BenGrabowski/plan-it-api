CREATE TABLE planit_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES planit_users(id) ON DELETE CASCADE NOT NULL,
    event_name TEXT NOT NULL,
    event_date DATE,
    event_start TIME,
    event_end TIME,
    venue  JSON,
    budget JSON,
    guests JSON
);