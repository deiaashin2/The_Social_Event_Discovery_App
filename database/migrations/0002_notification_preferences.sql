--mocked designed for database migration to add notification preferences for users
CREATE TABLE notification_preferences (
  user_id INT PRIMARY KEY,
  rsvp BOOLEAN DEFAULT true,
  mention BOOLEAN DEFAULT true,
  reminder BOOLEAN DEFAULT true
);