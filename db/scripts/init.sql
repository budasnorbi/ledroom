CREATE DATABASE ledroom;
USE ledroom;

CREATE TABLE songs(
  id INT NOT NULL AUTO_INCREMENT,
  bpm INT DEFAULT 0,
  beat_offset FLOAT DEFAULT 0,
  beat_around_end FLOAT DEFAULT 0,
  path TEXT NOT NULL,
  name TINYTEXT NOT NULL,
  selected_region_id VARCHAR(36) DEFAULT NULL,
  last_time_position FLOAT DEFAULT 0,
  volume FLOAT DEFAULT 0.1,
  selected BOOlEAN DEFAULT 0,
  PRIMARY KEY(id)
);

CREATE TABLE regions(
  id VARCHAR(36) NOT NULL,
  song_id INT,
  start_time FLOAT DEFAULT 0,
  end_time FLOAT DEFAULT 0,
  PRIMARY KEY(id),
  FOREIGN KEY (song_id) REFERENCES songs(id)
);

CREATE TABLE effects(
  id INT NOT NULL AUTO_INCREMENT,
  effect_id int NOT NULL,
  region_id int,
  PRIMARY KEY(id),
  FOREIGN KEY (region_id) REFERENCES songs(id)
);

USE mysql;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
CREATE USER 'admin'@'%' IDENTIFIED BY 'admin';

GRANT ALL PRIVILEGES ON admin.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON admin.* TO 'admin'@'%';

GRANT ALL PRIVILEGES ON ledroom.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON ledroom.* TO 'admin'@'%';

FLUSH PRIVILEGES;
