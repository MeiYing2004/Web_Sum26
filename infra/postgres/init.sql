CREATE USER bus_trip WITH PASSWORD 'bus123';
CREATE DATABASE bus_trip OWNER bus_trip;
CREATE USER bus_booking WITH PASSWORD 'bus123';
CREATE DATABASE bus_booking OWNER bus_booking;
CREATE USER bus_payment WITH PASSWORD 'bus123';
CREATE DATABASE bus_payment OWNER bus_payment;
CREATE USER bus_ticket WITH PASSWORD 'bus123';
CREATE DATABASE bus_ticket OWNER bus_ticket;
CREATE USER bus_auth WITH PASSWORD 'bus123';
CREATE DATABASE bus_auth OWNER bus_auth;
-- Legacy bus_user DB (SavedPassenger migration source → auth-service `users` / `saved_passengers`)
CREATE USER bus_user WITH PASSWORD 'bus123';
CREATE DATABASE bus_user OWNER bus_user;
CREATE USER bus_analytics WITH PASSWORD 'bus123';
CREATE DATABASE bus_analytics OWNER bus_analytics;
