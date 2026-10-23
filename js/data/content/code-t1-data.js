/* Kurenai OS — data/content/code-t1-data.js
   Code · T1 · the datasets its SQL lessons run on (docs/code-plan.md §3.3,
   T1A). A listing, practice item, task or card names one by `db`; the SQL
   runner (js/labs/sql-run.js) loads it into a fresh in-memory database
   before each run, so every run starts from exactly this. Authored; held
   to native SQLite with every program by tools/sql_diff.mjs.

   cafe   one café: customers, products, orders and their items — small
          enough to read whole, with a NULL city, an order with no
          customer, a product never sold and low stock on purpose.
   cafe2  the same tables with other rows, for hidden test cases.
   mug    The Case of the Missing Mug (T1.8's project).                  */
(function (root) {
  "use strict";
  var DATASETS = {
    cafe: [
      "CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, joined TEXT);",
      "CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, category TEXT NOT NULL, price REAL NOT NULL CHECK (price > 0), stock INTEGER NOT NULL DEFAULT 0);",
      "CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), placed TEXT NOT NULL);",
      "CREATE TABLE order_items (order_id INTEGER REFERENCES orders(id), product_id INTEGER REFERENCES products(id), qty INTEGER NOT NULL CHECK (qty > 0), PRIMARY KEY (order_id, product_id));",
      "INSERT INTO customers VALUES (1,'Ada','Leeds','2026-01-05'),(2,'Kai','York','2026-02-11'),(3,'Mei','Leeds','2026-03-02'),(4,'Sam',NULL,'2026-03-20'),(5,'Zoe','Hull','2026-04-01');",
      "INSERT INTO products VALUES (1,'Tea','drinks',1.5,40),(2,'Coffee','drinks',2.2,25),(3,'Juice','drinks',1.8,4),(4,'Brownie','bakery',2.5,12),(5,'Scone','bakery',1.9,3),(6,'Mug','gifts',8.0,2);",
      "INSERT INTO orders VALUES (1,1,'2026-09-01'),(2,1,'2026-09-03'),(3,2,'2026-09-03'),(4,3,'2026-09-10'),(5,NULL,'2026-09-12'),(6,2,'2026-09-15');",
      "INSERT INTO order_items VALUES (1,1,2),(1,4,1),(2,2,1),(3,1,1),(3,5,2),(3,6,1),(4,2,3),(5,3,1),(6,4,2),(6,2,2);"
    ].join("\n"),
    /* the same café's tables with other rows: hidden test cases run on it,
       so an answer that names values instead of asking for them fails */
    cafe2: [
      "CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, joined TEXT);",
      "CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, category TEXT NOT NULL, price REAL NOT NULL CHECK (price > 0), stock INTEGER NOT NULL DEFAULT 0);",
      "CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), placed TEXT NOT NULL);",
      "CREATE TABLE order_items (order_id INTEGER REFERENCES orders(id), product_id INTEGER REFERENCES products(id), qty INTEGER NOT NULL CHECK (qty > 0), PRIMARY KEY (order_id, product_id));",
      "INSERT INTO customers VALUES (1,'Bo','Leeds','2026-02-01'),(2,'Ivy',NULL,'2026-02-14'),(3,'Ray','Hull','2026-05-09'),(4,'Una','York','2026-06-30');",
      "INSERT INTO products VALUES (1,'Latte','drinks',2.6,30),(2,'Cocoa','drinks',2.4,1),(3,'Muffin','bakery',2.0,9),(4,'Flapjack','bakery',1.7,0),(5,'Tote','gifts',6.5,5),(6,'Tea','drinks',1.4,50),(7,'Cookie','bakery',1.2,2);",
      "INSERT INTO orders VALUES (1,3,'2026-09-02'),(2,3,'2026-09-02'),(3,1,'2026-09-05'),(4,NULL,'2026-09-06'),(5,4,'2026-09-09');",
      "INSERT INTO order_items VALUES (1,1,1),(1,3,2),(2,6,4),(3,5,1),(3,7,3),(4,2,1),(5,1,2),(5,3,1);"
    ].join("\n"),
    /* T1's project, The Case of the Missing Mug (T1.8): the café's
       Golden Mug, its staff, shifts, stock checks, badges, the door log and
       the visitors' book — read in five clues */
    mug: [
      "CREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL);",
      "CREATE TABLE shifts (staff_id INTEGER REFERENCES staff(id), day TEXT NOT NULL, start TEXT NOT NULL, finish TEXT NOT NULL);",
      "CREATE TABLE stock_checks (day TEXT NOT NULL, item TEXT NOT NULL, count INTEGER NOT NULL);",
      "CREATE TABLE badges (badge TEXT PRIMARY KEY, staff_id INTEGER REFERENCES staff(id), issued TEXT NOT NULL, lost_on TEXT);",
      "CREATE TABLE door_log (id INTEGER PRIMARY KEY, at TEXT NOT NULL, badge TEXT REFERENCES badges(badge), door TEXT NOT NULL);",
      "CREATE TABLE visitors (id INTEGER PRIMARY KEY, name TEXT NOT NULL, company TEXT, signed_in TEXT NOT NULL, signed_out TEXT);",
      "INSERT INTO staff VALUES (1,'Ada','barista'),(2,'Ben','manager'),(3,'Cleo','baker'),(4,'Dev','barista'),(5,'Eli','cleaner'),(6,'Fay','barista');",
      "INSERT INTO shifts VALUES (1,'2026-09-12','07:00','15:00'),(2,'2026-09-12','09:00','17:00'),(5,'2026-09-12','17:00','20:00'),(1,'2026-09-13','07:00','15:00'),(3,'2026-09-13','06:00','14:00'),(5,'2026-09-13','17:00','20:00'),(2,'2026-09-14','07:00','15:00'),(3,'2026-09-14','06:00','14:00'),(4,'2026-09-14','12:00','20:00'),(6,'2026-09-14','08:00','16:00'),(1,'2026-09-15','07:00','15:00'),(5,'2026-09-15','17:00','20:00');",
      "INSERT INTO stock_checks VALUES ('2026-09-12','Golden Mug',1),('2026-09-12','Tea bags',400),('2026-09-13','Golden Mug',1),('2026-09-13','Tea bags',310),('2026-09-14','Golden Mug',0),('2026-09-14','Tea bags',220),('2026-09-15','Golden Mug',0),('2026-09-15','Tea bags',600);",
      "INSERT INTO badges VALUES ('B1',1,'2026-01-04',NULL),('B2',2,'2026-01-04',NULL),('B3',3,'2026-01-04',NULL),('B4',4,'2026-03-01',NULL),('B5',5,'2026-03-01','2026-09-13 18:30'),('B6',6,'2026-05-20',NULL),('B7',NULL,'2026-01-04',NULL);",
      "INSERT INTO door_log VALUES (1,'2026-09-14 06:02','B3','back'),(2,'2026-09-14 06:58','B2','front'),(3,'2026-09-14 07:55','B6','front'),(4,'2026-09-14 09:12','B7','back'),(5,'2026-09-14 11:57','B4','front'),(6,'2026-09-14 14:03','B3','back'),(7,'2026-09-14 15:01','B2','front'),(8,'2026-09-14 16:02','B6','front'),(9,'2026-09-14 19:42','B4','front'),(10,'2026-09-14 21:17','B5','back'),(11,'2026-09-14 21:31','B5','back'),(12,'2026-09-13 17:01','B5','back');",
      "INSERT INTO visitors VALUES (1,'Ivo','Shine Windows','2026-09-12 10:00','2026-09-12 11:00'),(2,'Gus','Shine Windows','2026-09-13 17:45',NULL),(3,'Hana','Fresh Milk','2026-09-14 09:05','2026-09-14 09:40'),(4,'Pia','Shine Windows','2026-09-13 09:00','2026-09-13 12:30');"
    ].join("\n")
  };
  if (typeof module === "object" && module.exports) module.exports = DATASETS;
  else { var K = root.KOS_CODE; if (K) K.DATASETS = Object.assign(K.DATASETS || {}, DATASETS); }
})(typeof window !== "undefined" ? window : this);
