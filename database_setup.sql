DROP DATABASE IF EXISTS foodmenuapp;
CREATE DATABASE foodmenuapp;
USE foodmenuapp;
 
-- Users
CREATE TABLE Users (
  UserID    INT          NOT NULL AUTO_INCREMENT,
  Email     VARCHAR(100) NOT NULL,
  Password  VARCHAR(255) NOT NULL,
  IsAdmin   TINYINT(1)   DEFAULT 0,
  PRIMARY KEY (UserID),
  UNIQUE KEY (Email)
);
 

-- Profiles
CREATE TABLE Profiles (
  ProfileID INT          NOT NULL AUTO_INCREMENT,
  UserID    INT          NOT NULL,
  Name      VARCHAR(100) NOT NULL,
  Address   TEXT,
  CellPhone VARCHAR(16),
  PRIMARY KEY (ProfileID),
  UNIQUE KEY (UserID),
  FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE
);
 
 
-- Items
CREATE TABLE Items (
  ItemID       INT            NOT NULL AUTO_INCREMENT,
  Name         VARCHAR(100)   NOT NULL,
  Description  TEXT,
  Availability TINYINT(1)     DEFAULT 1,
  Category     VARCHAR(50),
  Price        DECIMAL(10, 2) NOT NULL,
  Image        VARCHAR(255),
  PRIMARY KEY (ItemID)
);
 
INSERT INTO Items (Name, Description, Availability, Category, Price, Image) VALUES
  ('Margherita Pizza', 'Fresh mozzarella, tomatoes, basil',           1, 'Pizza',    12.99, 'margherita.jpg'),
  ('Caesar Salad',     'Romaine, parmesan, croutons, caesar dressing', 1, 'Salads',    8.99, 'caesar.jpg'),
  ('Chocolate Cake',   'Rich chocolate layer cake',                    1, 'Desserts',  5.99, 'chocolate_cake.jpg');

 
-- Orders
CREATE TABLE Orders (
  OrderID    INT            NOT NULL AUTO_INCREMENT,
  UserID     INT            NOT NULL,
  OrderTime  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  TotalPrice DECIMAL(10, 2) NOT NULL,
  Status     ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
  PRIMARY KEY (OrderID),
  FOREIGN KEY (UserID) REFERENCES users(UserID)
);
 
 
-- Order Details
CREATE TABLE Order_details (
  Order_DetailsID INT            NOT NULL AUTO_INCREMENT,
  OrderID         INT            NOT NULL,
  ItemID          INT            NOT NULL,
  Quantity        INT            NOT NULL,
  UnitPrice       DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (Order_DetailsID),
  FOREIGN KEY (OrderID) REFERENCES orders(OrderID) ON DELETE CASCADE,
  FOREIGN KEY (ItemID)  REFERENCES items(ItemID)
);


