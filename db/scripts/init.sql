CREATE DATABASE ledroom;
USE ledroom;

CREATE TABLE songs(
  id INT NOT NULL AUTO_INCREMENT,
  bpm INT DEFAULT 0,
  beat_offset FLOAT DEFAULT 0,
  beat_around_end FLOAT DEFAULT 0,
  path TEXT NOT NULL,
  name TINYTEXT NOT NULL,
  selected_region_id INT NOT NULL DEFAULT -1,
  duration FLOAT DEFAULT 0,
  last_time_position FLOAT DEFAULT 0,
  volume FLOAT DEFAULT 0.1,
  PRIMARY KEY(id)
);

USE mysql;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
CREATE USER 'admin'@'%' IDENTIFIED BY 'admin';

GRANT ALL PRIVILEGES ON admin.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON admin.* TO 'admin'@'%';

GRANT ALL PRIVILEGES ON ledroom.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON ledroom.* TO 'admin'@'%';

FLUSH PRIVILEGES;
