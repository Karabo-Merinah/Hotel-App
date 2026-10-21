
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
    name VARCHAR(80) NOT NULL UNIQUE
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