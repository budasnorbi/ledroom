CREATE DATABASE ledroom;
USE ledroom;

CREATE TABLE songs(
  id INT NOT NULL AUTO_INCREMENT,
  bpm INT,
  beat_offset DECIMAL,
  beat_around_end DECIMAL,
  path TEXT NOT NULL,
  name TINYTEXT NOT NULL,
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
