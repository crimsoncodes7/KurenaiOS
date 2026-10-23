/* Kurenai OS — data/content/code-t1-data.js
   Code · T1 · the datasets its SQL lessons run on (docs/code-plan.md §3.3,
   T1A). A listing, practice item, task or card names one by `db`; the SQL
   runner (js/labs/sql-run.js) loads it into a fresh in-memory database
   before each run, so every run starts from exactly this. Authored; held
   to native SQLite with every program by tools/sql_diff.mjs.

   cafe   one café: customers, products, orders and their items — small
          enough to read whole, with a NULL city, an order with no
          customer, a product never sold and low stock on purpose.       */
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
    ].join("\n")
  };
  if (typeof module === "object" && module.exports) module.exports = DATASETS;
  else { var K = root.KOS_CODE; if (K) K.DATASETS = Object.assign(K.DATASETS || {}, DATASETS); }
})(typeof window !== "undefined" ? window : this);
