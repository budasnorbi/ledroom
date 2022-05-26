USE mysql;
/* CREATE admin user & grant priv for admin db */
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
CREATE USER 'admin'@'%' IDENTIFIED BY 'admin';

GRANT ALL PRIVILEGES ON admin.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON admin.* TO 'admin'@'%';

FLUSH PRIVILEGES;