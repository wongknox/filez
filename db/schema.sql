-- TODO
DROP DATABASE IF EXISTS filez;
CREATE DATABASE filez;

\connect filez

DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS files;

CREATE TABLE folders (
    id serial PRIMARY KEY,
    name text UNIQUE NOT NULL
);

CREATE TABLE files (
    id serial PRIMARY KEY,
    name text NOT NULL,
    size int NOT NULL,
    folder_id int NOT NULL REFERENCES folders(id) ON DELETE CASCADE, UNIQUE (name, folder_id)
);
