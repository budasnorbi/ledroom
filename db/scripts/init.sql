CREATE DATABASE ledroom;

USE mysql;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
CREATE USER 'admin'@'%' IDENTIFIED BY 'admin';

GRANT ALL PRIVILEGES ON admin.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON admin.* TO 'admin'@'%';

GRANT ALL PRIVILEGES ON ledroom.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON ledroom.* TO 'admin'@'%';

FLUSH PRIVILEGES;