DROP DATABASE IF EXISTS foodmenuapp;
CREATE DATABASE foodmenuapp;
USE foodmenuapp;
 
-- Users
CREATE TABLE users (
  UserID    INT          NOT NULL AUTO_INCREMENT,
  Email     VARCHAR(100) NOT NULL,
  Password  VARCHAR(255) NOT NULL,
  IsAdmin   TINYINT(1)   DEFAULT 0,
  PRIMARY KEY (UserID),
  UNIQUE KEY (Email)
);
 

  UPDATE users SET Password = 'password123' WHERE Email = 'customer@example.com';
  UPDATE users SET Password = 'password123' WHERE Email = 'admin@example.com';
 
-- Profiles
CREATE TABLE profiles (
  ProfileID INT          NOT NULL AUTO_INCREMENT,
  UserID    INT          NOT NULL,
  Name      VARCHAR(100) NOT NULL,
  Address   TEXT,

  CellPhone VARCHAR(16),

  PRIMARY KEY (ProfileID),
  UNIQUE KEY (UserID),
  FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE
);
 
INSERT INTO profiles VALUES
  (1, 1, 'John Doe',    '123 Main St',  '555-1234'),
  (2, 2, 'Admin User',  '456 Admin Ave', '555-5678');
 
-- Items
CREATE TABLE items (
  ItemID       INT            NOT NULL AUTO_INCREMENT,
  Name         VARCHAR(100)   NOT NULL,
  Description  TEXT,
  Availability TINYINT(1)     DEFAULT 1,
  Category     VARCHAR(50),
  Price        DECIMAL(10, 2) NOT NULL,
  Image        VARCHAR(255),
  PRIMARY KEY (ItemID)
);
 
INSERT INTO items VALUES
  (1, 'Margherita Pizza', 'Fresh mozzarella, tomatoes, basil',          1, 'Pizza',    12.99, 'margherita.jpg'),
  (2, 'Caesar Salad',     'Romaine, parmesan, croutons, caesar dressing', 1, 'Salads',   8.99, 'caesar.jpg'),
  (3, 'Chocolate Cake',   'Rich chocolate layer cake',                   1, 'Desserts',  5.99, 'chocolate_cake.jpg');
 
-- Orders
CREATE TABLE orders (
  OrderID    INT            NOT NULL AUTO_INCREMENT,
  UserID     INT            NOT NULL,
  OrderTime  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  TotalPrice DECIMAL(10, 2) NOT NULL,
  Status     ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
  PRIMARY KEY (OrderID),
  FOREIGN KEY (UserID) REFERENCES users(UserID)
);
 
INSERT INTO orders VALUES
  (1, 1, '2026-04-23 02:08:23', 0.00, 'Active');
 
-- Order Details
CREATE TABLE order_details (
  Order_DetailsID INT            NOT NULL AUTO_INCREMENT,
  OrderID         INT            NOT NULL,
  ItemID          INT            NOT NULL,
  Quantity        INT            NOT NULL,
  UnitPrice       DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (Order_DetailsID),
  FOREIGN KEY (OrderID) REFERENCES orders(OrderID) ON DELETE CASCADE,
  FOREIGN KEY (ItemID)  REFERENCES items(ItemID)
);