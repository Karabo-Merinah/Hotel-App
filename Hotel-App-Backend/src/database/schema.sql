
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    provider VARCHAR(30),
    provider_id VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(9, 6) NOT NULL CHECK ( longitude BETWEEN -180 AND 180),
    star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
    policies TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE hotel_images (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels (id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL
);

CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL 
);

CREATE TABLE hotel_amenities (
    hotel_id INTEGER NOT NULL REFERENCES hotels (id) ON DELETE CASCADE,
    amenity_id INTEGER NOT NULL REFERENCES amenities (id) ON DELETE CASCADE,
    PRIMARY KEY (hotel_id, amenity_id)
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels (id) ON DELETE CASCADE,
    room_type VARCHAR(80) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    price_per_night NUMERIC(10, 2) NOT NULL CHECK (price_per_night >= 0),
    total_rooms INTEGER NOT NULL CHECK (total_rooms >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    room_id INTEGER NOT NULL REFERENCES rooms (id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    number_of_rooms INTEGER NOT NULL CHECK (number_of_rooms > 0),
    number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CHECK (check_out > check_in)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings (id),
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('paid', 'failed')),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE favourites (
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    hotel_id INTEGER NOT NULL REFERENCES hotels (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, hotel_id)
);
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    hotel_id INTEGER NOT NULL REFERENCES hotels (id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, hotel_id)
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- data for insert statements 

-- hotel data 

INSERT INTO hotels
(name, description, address, city, latitude, longitude, star_rating, policies)
VALUES

('Wander Inn Polokwane','Comfortable accommodation in the heart of Polokwane.','15 Biccard Street','Polokwane',
    -23.9045,29.4689,4,'Check-in: 14:00. Check-out: 10:00. No smoking.'),

('Wander Inn Pretoria','Modern accommodation suitable for business and leisure.','123 Church Street','Pretoria',
    -25.7479,28.2293,4,'Check-in: 14:00. Check-out: 10:00.'),

('Wander Inn Johannesburg','Convenient accommodation with comfortable rooms.','45 Main Street','Johannesburg',
    -26.2041,28.0473,5,'Check-in: 14:00. Check-out: 11:00.');

-- amenities data

INSERT INTO amenities (name)VALUES('Free WiFi'),('Swimming pool'),('Parking'),('Breakfast included'),('Air conditioning'),('Gym'),
('Restaurant'),('Airport shuttle') ON CONFLICT (name) DO NOTHING;


--assigning amenities to hotels 

INSERT INTO hotel_amenities (hotel_id, amenity_id) SELECT hotels.id, amenities.id FROM hotels, amenities
WHERE hotels.name IN ( 'Wander Inn Polokwane','Wander Inn Pretoria','Wander Inn Johannesburg')
AND amenities.name IN ('Free WiFi','Parking','Breakfast included','Air conditioning')


-- Additional amenities for Pretoria
INSERT INTO hotel_amenities (hotel_id, amenity_id) SELECT hotels.id, amenities.id FROM hotels, amenities
WHERE hotels.name = 'Wander Inn Pretoria' AND amenities.name IN ('Gym','Restaurant')


-- Additional amenities for Johannesburg
INSERT INTO hotel_amenities (hotel_id, amenity_id) SELECT hotels.id, amenities.id
FROM hotels, amenities WHERE hotels.name = 'Wander Inn Johannesburg'
AND amenities.name IN ('Swimming pool','Gym','Restaurant','Airport shuttle')


--inserting rooms in different branches 

INSERT INTO rooms (hotel_id, room_type, description, capacity, price_per_night, total_rooms)
VALUES

-- Standard Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Polokwane' ORDER BY id DESC LIMIT 1),'Standard Room','Comfortable room with a double bed.',
    2,850.00,10),

-- Deluxe Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Polokwane' ORDER BY id DESC LIMIT 1),'Deluxe Room','Spacious room with a king-size bed.',
    2,1200.00,5),

-- Family Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Polokwane' ORDER BY id DESC LIMIT 1),'Family Room','Large room suitable for families.',
    4,1800.00,4),

-- Single Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Polokwane' ORDER BY id DESC LIMIT 1),'Single Room','Comfortable room with one single bed for solo travellers.',
    1,650.00,8),

-- Double Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Polokwane' ORDER BY id DESC LIMIT 1),'Double Room','Spacious room with one double bed for two guests.',
    2,950.00,6),

-- Twin Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Polokwane' ORDER BY id DESC LIMIT 1),'Twin Room','Comfortable room with two separate single beds.',
    2,1000.00,5),

-- Triple Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Polokwane' ORDER BY id DESC LIMIT 1),'Triple Room','Room with three beds suitable for three guests.',
    3,1350.00,4),

-- Queen Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Polokwane' ORDER BY id DESC LIMIT 1),'Queen Room','Elegant room featuring a queen-size bed.',
    2,1150.00,5);


INSERT INTO rooms(hotel_id, room_type, description, capacity, price_per_night, total_rooms)
VALUES

-- Standard Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Pretoria' ORDER BY id DESC LIMIT 1),'Standard Room','Comfortable room with essential amenities.',
    2, 900.00,8),

-- Deluxe Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Pretoria' ORDER BY id DESC LIMIT 1),'Deluxe Room','Spacious room with modern facilities.',
    2,1400.00,6),

-- Family Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Pretoria' ORDER BY id DESC LIMIT 1),'Family Room','Comfortable accommodation for families.',
    4,1900.00,4),

-- King Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Pretoria' ORDER BY id DESC LIMIT 1),'King Room','Spacious room featuring a king-size bed.',
    2,1500.00,6),

-- Studio Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Pretoria' ORDER BY id DESC LIMIT 1),'Studio Room','Open-plan room with sleeping area, kitchenette and seating space.',
    2, 1700.00,4),

-- Executive Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Pretoria' ORDER BY id DESC LIMIT 1),'Executive Room','Premium room with workspace for business travellers.',
    2,1900.00,5),

-- Quad Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Pretoria' ORDER BY id DESC LIMIT 1),'Quad Room','Spacious room with two double beds for four guests.',
    4,2100.00,4),

-- Accessible Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Pretoria' ORDER BY id DESC LIMIT 1),'Accessible Room','Room designed with step-free access and mobility-friendly facilities.',
    2,1200.00,
    3
);


INSERT INTO rooms(hotel_id, room_type, description, capacity, price_per_night, total_rooms)
VALUES

-- Standard Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Johannesburg' ORDER BY id DESC LIMIT 1),'Standard Room','Modern room suitable for short stays.',
    2,1100.00,12),

-- Deluxe Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Johannesburg' ORDER BY id DESC LIMIT 1),'Deluxe Room','Luxury room with additional space.',
    2,1600.00,8),

-- Family Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Johannesburg' ORDER BY id DESC LIMIT 1),'Family Room','Spacious accommodation for families.',
    4,2200.00,5),

-- Executive Suite
((SELECT id FROM hotels WHERE name = 'Wander Inn Johannesburg' ORDER BY id DESC LIMIT 1),'Executive Suite','Premium suite with separate living area and luxury amenities.',
    2,2800.00, 4),

-- Penthouse Suite
((SELECT id FROM hotels WHERE name = 'Wander Inn Johannesburg' ORDER BY id DESC LIMIT 1),'Penthouse Suite','Luxury top-floor suite with panoramic city views.',
    4,5500.00,2),

-- Connecting Rooms
((SELECT id FROM hotels WHERE name = 'Wander Inn Johannesburg' ORDER BY id DESC LIMIT 1),'Connecting Rooms','Two connected bedrooms with an internal door.',
    4,3200.00,3),

-- Boutique Room
((SELECT id FROM hotels WHERE name = 'Wander Inn Johannesburg' ORDER BY id DESC LIMIT 1),'Boutique Room','Uniquely decorated room with stylish furnishings.',
    2,2200.00,5),

-- Luxury Suite
((SELECT id FROM hotels WHERE name = 'Wander Inn Johannesburg' ORDER BY id DESC LIMIT 1),'Luxury Suite','Spacious suite with a private lounge and city views.',
    3,3800.00,3);
