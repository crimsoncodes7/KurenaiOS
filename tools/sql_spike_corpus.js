/* tools/sql_spike_corpus.js — Spike S's corpus (docs/code-plan.md §12.1):
   the SQL that T1's Databases part will teach, run by tools/sql_diff.mjs
   under the app's SQLite (sql.js) and native SQLite (Python's sqlite3).
   One café — the T1 lessons' own dataset (js/data/content/code-t1-data.js).                                       */
"use strict";
const CAFE = require("../js/data/content/code-t1-data.js").cafe;
const P = [
  // reading
  "SELECT * FROM products;",
  "SELECT name, price FROM products WHERE category = 'drinks' ORDER BY price DESC;",
  "SELECT name FROM products WHERE price BETWEEN 1.8 AND 2.5 ORDER BY name;",
  "SELECT name FROM customers WHERE name LIKE '%a%' ORDER BY name;",
  "SELECT DISTINCT city FROM customers ORDER BY city;",
  "SELECT name, city FROM customers WHERE city IS NULL;\nSELECT count(*), count(city) FROM customers;",
  "SELECT name FROM products ORDER BY price LIMIT 2 OFFSET 1;",
  "SELECT name, price * 1.2 AS with_vat, round(price * 1.2, 2) AS rounded FROM products ORDER BY id;",
  "SELECT 7 / 2, 7 / 2.0, 7 % 3, CAST(7 AS REAL) / 2, CAST('12' AS INTEGER) + 1;",
  "SELECT typeof(1), typeof(1.0), typeof('1'), typeof(NULL), typeof(x'00');",
  "SELECT upper(name), lower(category), length(name), substr(name, 1, 3), replace(name, 'e', '3'), name || '!' FROM products ORDER BY id LIMIT 3;",
  "SELECT printf('%-8s|%6.2f', name, price) FROM products ORDER BY id;",
  "SELECT name, CASE WHEN stock = 0 THEN 'out' WHEN stock <= 3 THEN 'low' ELSE 'ok' END AS level FROM products ORDER BY id;",
  "SELECT date('2026-10-01', '+7 days'), strftime('%Y-%m', '2026-10-23'), julianday('2026-10-23') - julianday('2026-10-01');",
  "SELECT NULL = NULL, NULL IS NULL, coalesce(NULL, 'x'), ifnull(city, '—') FROM customers WHERE id = 4;",
  // aggregates
  "SELECT count(*), sum(stock), min(price), max(price), avg(price) FROM products;",
  "SELECT category, count(*) AS n, round(avg(price), 2) AS avg_price FROM products GROUP BY category ORDER BY category;",
  "SELECT category, sum(stock) AS stock FROM products GROUP BY category HAVING sum(stock) > 10 ORDER BY stock DESC;",
  "SELECT city, count(*) FROM customers GROUP BY city ORDER BY count(*) DESC, city;",
  "SELECT group_concat(name, ', ' ORDER BY name) FROM products WHERE category = 'drinks';",
  // joins
  "SELECT o.id, c.name, o.placed FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id;",
  "SELECT o.id, c.name FROM orders o LEFT JOIN customers c ON c.id = o.customer_id ORDER BY o.id;",
  "SELECT c.name, count(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id ORDER BY orders DESC, c.name;",
  "SELECT o.id, round(sum(p.price * i.qty), 2) AS total FROM orders o JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id GROUP BY o.id ORDER BY total DESC;",
  "SELECT p.name, sum(i.qty) AS sold FROM products p LEFT JOIN order_items i ON i.product_id = p.id GROUP BY p.id ORDER BY sold DESC, p.name;",
  "SELECT a.name, b.name FROM customers a JOIN customers b ON a.city = b.city AND a.id < b.id;",
  "SELECT c.name, p.name FROM customers c CROSS JOIN products p WHERE c.id = 1 AND p.category = 'gifts';",
  // subqueries and sets
  "SELECT name FROM products WHERE price > (SELECT avg(price) FROM products) ORDER BY name;",
  "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE placed >= '2026-09-10') ORDER BY name;",
  "SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY name;",
  "SELECT name, (SELECT count(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c ORDER BY id;",
  "SELECT city FROM customers WHERE city IS NOT NULL UNION SELECT 'Hull' ORDER BY 1;\nSELECT product_id FROM order_items INTERSECT SELECT id FROM products WHERE category = 'bakery';\nSELECT id FROM products EXCEPT SELECT product_id FROM order_items;",
  "WITH totals AS (SELECT order_id, sum(qty) AS items FROM order_items GROUP BY order_id) SELECT order_id, items FROM totals WHERE items >= 3 ORDER BY order_id;",
  "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x * 2 FROM n WHERE x < 100) SELECT group_concat(x, ' ') FROM n;",
  // windows
  "SELECT name, category, price, rank() OVER (PARTITION BY category ORDER BY price DESC) AS r FROM products ORDER BY category, r;",
  "SELECT id, placed, row_number() OVER (ORDER BY placed, id) AS n, count(*) OVER (PARTITION BY placed) AS same_day FROM orders ORDER BY id;",
  "SELECT order_id, qty, sum(qty) OVER (ORDER BY order_id, product_id) AS running FROM order_items ORDER BY order_id, product_id;",
  // changing data
  "INSERT INTO products (name, category, price) VALUES ('Flapjack', 'bakery', 2.1);\nSELECT id, name, stock FROM products WHERE name = 'Flapjack';",
  "UPDATE products SET price = round(price * 1.1, 2) WHERE category = 'drinks';\nSELECT name, price FROM products WHERE category = 'drinks' ORDER BY id;",
  "DELETE FROM order_items WHERE qty = 1;\nSELECT count(*) FROM order_items;",
  "INSERT INTO products (name, category, price) VALUES ('Tea', 'drinks', 1.6);",
  "INSERT INTO products (name, category, price) VALUES ('Air', 'gifts', 0);",
  "INSERT INTO products (id, name, category, price, stock) VALUES (1, 'Tea', 'drinks', 1.6, 50) ON CONFLICT(id) DO UPDATE SET price = excluded.price, stock = stock + 10;\nSELECT * FROM products WHERE id = 1;",
  "UPDATE products SET stock = stock - 1 WHERE id = 6 RETURNING name, stock;",
  "PRAGMA foreign_keys = ON;\nINSERT INTO orders VALUES (7, 99, '2026-09-20');",
  // transactions
  "BEGIN;\nUPDATE products SET stock = 0;\nSELECT sum(stock) FROM products;\nROLLBACK;\nSELECT sum(stock) FROM products;",
  "BEGIN;\nINSERT INTO customers (name) VALUES ('Lin');\nSAVEPOINT s1;\nDELETE FROM customers WHERE name = 'Lin';\nROLLBACK TO s1;\nCOMMIT;\nSELECT name FROM customers ORDER BY id DESC LIMIT 1;",
  "BEGIN;\nINSERT INTO order_items VALUES (1, 2, 0);\nCOMMIT;",
  // design
  "CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL UNIQUE) STRICT;\nINSERT INTO tags (label) VALUES ('vegan'), ('hot');\nINSERT INTO tags (label) VALUES (3);\nSELECT * FROM tags;",
  "CREATE VIEW drinks AS SELECT name, price FROM products WHERE category = 'drinks';\nSELECT * FROM drinks ORDER BY price;",
  "CREATE INDEX idx_orders_customer ON orders(customer_id);\nSELECT name FROM sqlite_schema WHERE type = 'index' AND tbl_name = 'orders';",
  "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 2;",
  "SELECT json_extract('{\"a\": {\"b\": [1, 2, 3]}}', '$.a.b[1]'), json_array(1, 'two', NULL), json_object('k', 2.5);",
  // mistakes
  "SELECT name FROM product;",
  "SELECT name FORM products;",
  "SELECT name, count(*) FROM products;",
  "SELECT nme FROM products;",
  "SELECT 1; SELECT 2 -- a comment\n;\n/* only a comment */"
];
module.exports = { CAFE, programs: P.map((src, i) => ({ where: "spike " + (i + 1), seed: CAFE, src })) };
