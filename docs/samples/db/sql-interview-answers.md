# SQL Interview Answers — Senior Java Developer

Source: `sql-interview-questions.md` on branch `feature/card-classification-study-filters`.

Concise interview-ready answers in English. SQL examples use their indicated dialect; otherwise broadly portable syntax is preferred. Bind application parameters through prepared statements. Verify database-specific behavior and schema assumptions.

### 1. What is SQL?

**Answer:** SQL is a declarative language for querying and managing relational data; SQL dialects differ across vendors.

### 2. What are the types of operators available in SQL?

**Answer:** Operators include arithmetic, comparison, logical, set membership, pattern matching, and NULL predicates.

### 3. What are the subsets of SQL?

**Answer:** Conventional categories are DDL, DML, DQL, DCL, and TCL; these are classifications rather than separate languages.

### 4. What is a query?

**Answer:** A query requests or transforms data, typically using SELECT.

### 5. What is a subquery? What types are there?

**Answer:** A subquery nests a query within another statement; types include scalar, table-valued, correlated, and uncorrelated.

### 6. What is “SELECT” statement?

**Answer:** SELECT retrieves projected expressions from rows, with optional joins, filtering, grouping, ordering, and limits.

### 7. What is a CLAUSE?

**Answer:** A clause is a part of SQL syntax, such as WHERE, GROUP BY, HAVING, ORDER BY, or JOIN ON.

### 8. What are UNION (ALL), MINUS and INTERSECT commands?

**Answer:** UNION removes duplicate combined rows, UNION ALL retains them, INTERSECT keeps common rows, and EXCEPT/MINUS subtracts rows.

### 9. What is the difference between TRUNCATE, DELETE and DROP statements?

**Answer:** DELETE removes selected rows; TRUNCATE removes all rows with vendor-specific logging and transaction behavior; DROP removes an object definition.

### 10. What is a view in SQL?

**Answer:** A view is a stored SELECT definition providing a virtual table; ordinary views do not persist query results.

### 11. What are aggregate and scalar functions?

**Answer:** Aggregates summarize row sets (SUM, COUNT); scalar functions calculate values for individual rows (LOWER, ABS).

### 12. What is a Join in SQL?

**Answer:** JOIN combines rows from tables according to a predicate; one-to-many matches may multiply output rows.

### 13. What is Inner Join in SQL?

**Answer:** INNER JOIN returns pairs satisfying the join condition, omitting unmatched rows.

### 14. What is Right Join in SQL?

**Answer:** RIGHT JOIN preserves every right-side row, substituting NULL for unmatched left-side fields.

### 15. What is Left Join in SQL?

**Answer:** LEFT JOIN preserves every left-side row, substituting NULL for unmatched right-side fields.

### 16. What is Full Join in SQL?

**Answer:** FULL OUTER JOIN preserves unmatched rows from both sides and matching joined rows; MySQL lacks native support.

### 17. What is Cross Join?

**Answer:** CROSS JOIN computes the Cartesian product, pairing every left row with every right row.

### 18. What is self-join and what is the requirement of self-join?

**Answer:** Self-join means joining a table to itself using separate aliases, for example employee and manager.

### 19. What is the usage of the DISTINCT keyword?

**Answer:** DISTINCT removes duplicate entire result rows, not duplicates of each column independently.

### 20. What is the need for group functions in SQL?

**Answer:** Aggregate functions with GROUP BY compute per-group counts, totals, averages, minima, and maxima.

### 21. What is the need of the MERGE statement?

**Answer:** MERGE combines conditional INSERT/UPDATE and sometimes DELETE operations based on source-target matching; concurrency semantics vary.

### 22. Name the operator which is used in the query for pattern matching?

**Answer:** LIKE supports pattern matching: % means any sequence, _ means a single character; use ESCAPE for literal wildcards.

### 23. What is the difference between INNER JOIN and LEFT JOIN, and when should each be used?

**Answer:** INNER JOIN returns only matches; LEFT JOIN additionally preserves unmatched rows from the left input.

### 24. What is the difference between INNER JOIN and OUTER JOIN?

**Answer:** INNER JOIN excludes unmatched rows; LEFT, RIGHT, and FULL OUTER JOIN preserve selected unmatched sides.

### 25. What is the difference between filtering in the ON clause and the WHERE clause of a LEFT JOIN?

**Answer:** ON restricts which right rows match before LEFT JOIN null extension; WHERE filters the final rows and may remove unmatched left rows.

### 26. Why might a JOIN return more rows than expected, and how can this problem be resolved?

**Answer:** Duplicate join keys, omitted predicates, and multiple one-to-many joins multiply results. Fix relationships or aggregate before joining; do not blindly use DISTINCT.

### 27. How do NULL values affect JOIN operations?

**Answer:** Ordinary equality does not match NULL with NULL; use NULL-safe equality, e.g. IS NOT DISTINCT FROM, where available.

### 28. When should you use EXISTS instead of JOIN?

**Answer:** EXISTS is ideal for checking at least one match without multiplying left rows; optimizers commonly implement semi-joins.

### 29. How can joining multiple one-to-many relationships lead to incorrect aggregate results?

**Answer:** Independent one-to-many joins form multiplicative combinations, inflating counts and sums; preaggregate child relations separately.

### 30. Write a SQL query to retrieve all customers who have never placed an order.

**Answer:** `SELECT c.* FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id);`

### 31. Write a SQL query to retrieve all customers and their number of orders, including customers with no orders.

**Answer:** `SELECT c.id,COUNT(o.id) AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id;`

### 32. Write a SQL query to retrieve each employee together with their manager's name, including employees without a manager.

**Answer:** `SELECT e.name,m.name AS manager_name FROM employees e LEFT JOIN employees m ON e.manager_id=m.id;`

### 33. Write a SQL query to find employees who earn more than their managers.

**Answer:** `SELECT e.* FROM employees e JOIN employees m ON e.manager_id=m.id WHERE e.salary>m.salary;`

### 34. Given two tables containing duplicate and NULL values in their join columns, determine the result of INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN.

**Answer:** No exact rows can be determined without table data. Non-NULL equal keys match multiplicatively; NULLs do not equality-match; LEFT/RIGHT/FULL retain unmatched rows on their respective sides.

### 35. What is the difference between LEFT JOIN and RIGHT JOIN?

**Answer:** LEFT JOIN preserves left rows and RIGHT JOIN preserves right rows. Swapping the inputs often makes equivalent queries.

### 36. Can you join tables without a foreign key relationship?

**Answer:** Yes: a JOIN condition may compare any compatible expressions; foreign keys are not required for SQL joins.

### 37. Can you join tables using multiple columns?

**Answer:** Yes: `JOIN b ON a.tenant_id=b.tenant_id AND a.order_id=b.order_id`; specify all relevant key columns.

### 38. How do you join three or more tables in a SQL query?

**Answer:** Chain explicit JOIN clauses: `FROM orders o JOIN customers c ON c.id=o.customer_id JOIN items i ON i.order_id=o.id`.

### 39. How do you query a many-to-many relationship using a junction table?

**Answer:** `SELECT s.* FROM students s JOIN enrollments e ON e.student_id=s.id JOIN courses c ON c.id=e.course_id WHERE c.id=:course_id;`

### 40. What is the difference between an explicit JOIN and an implicit JOIN?

**Answer:** Explicit JOIN expresses relationships in ON; implicit comma joins express them in WHERE and risk accidentally creating Cartesian products.

### 41. What is the difference between an equi-join and a non-equi-join?

**Answer:** Equi-join uses equality; non-equi join uses other predicates, such as ranges or inequalities.

### 42. What is a semi-join and an anti-join?

**Answer:** A semi-join returns left rows having matches (EXISTS); an anti-join returns left rows without matches (NOT EXISTS).

### 43. How can you emulate FULL OUTER JOIN in MySQL?

**Answer:** MySQL: `SELECT a.*,b.* FROM a LEFT JOIN b ON a.id=b.id UNION ALL SELECT a.*,b.* FROM b LEFT JOIN a ON a.id=b.id WHERE a.id IS NULL;` Use a nonnullable key.

### 44. What is the purpose of the GROUP BY clause in SQL?

**Answer:** GROUP BY groups matching expressions so aggregate functions produce one result per group.

### 45. What is the difference between WHERE and HAVING?

**Answer:** WHERE filters rows before grouping; HAVING filters aggregate groups after GROUP BY.

### 46. What is the difference between COUNT(*), COUNT(column), and COUNT(DISTINCT column)?

**Answer:** COUNT(*) counts rows; COUNT(col) counts non-NULL values; COUNT(DISTINCT col) counts distinct non-NULL values.

### 47. What is the difference between GROUP BY and DISTINCT?

**Answer:** GROUP BY groups rows for calculations; DISTINCT removes repeated result tuples, without requiring aggregation.

### 48. Can you select columns that are neither included in the GROUP BY clause nor used in an aggregate function?

**Answer:** Generally not unless selected fields are grouped, aggregated, or functionally dependent on grouping keys under supported rules.

### 49. Can you use HAVING without GROUP BY?

**Answer:** Yes. HAVING without GROUP BY can filter the single implicit aggregate group; dialect restrictions apply.

### 50. Can you group results by multiple columns in SQL?

**Answer:** Yes: `GROUP BY department_id,job_title` groups by each distinct combination.

### 51. How does GROUP BY handle NULL values?

**Answer:** All NULL values in a GROUP BY expression belong to one group.

### 52. What is conditional aggregation, and how can it be implemented using CASE?

**Answer:** Conditional aggregation uses e.g. `SUM(CASE WHEN status='PAID' THEN 1 ELSE 0 END)`.

### 53. Can aggregate functions be used in the WHERE clause? Why or why not?

**Answer:** No; WHERE logically precedes aggregation. Use HAVING or a subquery for aggregate filters.

### 54. Write a SQL query to find duplicate email addresses in a users table.

**Answer:** `SELECT email,COUNT(*) AS n FROM users GROUP BY email HAVING COUNT(*)>1;` Decide case/NULL normalization first.

### 55. Write a SQL query to calculate the number of employees in each department.

**Answer:** `SELECT department_id,COUNT(*) FROM employees GROUP BY department_id;`

### 56. Write a SQL query to find departments with more than five employees.

**Answer:** `SELECT department_id FROM employees GROUP BY department_id HAVING COUNT(*)>5;`

### 57. Write a SQL query to find the minimum, maximum, and average salary in each department.

**Answer:** `SELECT department_id,MIN(salary),MAX(salary),AVG(salary) FROM employees GROUP BY department_id;`

### 58. Write a SQL query to find departments whose average salary exceeds a given threshold.

**Answer:** `SELECT department_id FROM employees GROUP BY department_id HAVING AVG(salary)>:threshold;`

### 59. Write a SQL query to find the three customers with the highest total order value.

**Answer:** `SELECT customer_id,SUM(amount) total FROM orders GROUP BY customer_id ORDER BY total DESC,customer_id LIMIT 3;` PostgreSQL/MySQL syntax.

### 60. Write a SQL query to calculate the number of completed, pending, and cancelled orders for each customer.

**Answer:** `SELECT customer_id,SUM(CASE WHEN status='COMPLETED' THEN 1 ELSE 0 END) completed,SUM(CASE WHEN status='PENDING' THEN 1 ELSE 0 END) pending,SUM(CASE WHEN status='CANCELLED' THEN 1 ELSE 0 END) cancelled FROM orders GROUP BY customer_id;`

### 61. Write a SQL query to find duplicate records based on a combination of multiple columns.

**Answer:** `SELECT col1,col2,COUNT(*) FROM records GROUP BY col1,col2 HAVING COUNT(*)>1;`

### 62. What is the difference between COUNT(*) and COUNT(1)?

**Answer:** Both count all rows. Modern optimizers typically treat COUNT(1) like COUNT(*); prefer COUNT(*) for clarity.

### 63. What do aggregate functions return when no rows match a query?

**Answer:** COUNT(*) returns zero; SUM, AVG, MIN, and MAX generally return NULL for empty input. Grouped queries with no groups return no rows.

### 64. What is the difference between GROUP BY and ORDER BY?

**Answer:** GROUP BY defines aggregation groups; ORDER BY sorts result rows, which remain unordered without explicit ordering.

### 65. What is the difference between SUM(column) and SUM(DISTINCT column)?

**Answer:** SUM(col) sums all non-NULL values; SUM(DISTINCT col) sums distinct non-NULL values once each.

### 66. How can you concatenate values from multiple rows into a single string?

**Answer:** Use PostgreSQL STRING_AGG, MySQL GROUP_CONCAT, or Oracle LISTAGG; specify ordering when important.

### 67. How can you group records by day, month, or year?

**Answer:** Group by a date-truncation expression such as PostgreSQL `date_trunc('month',created_at)` or dialect-specific equivalents.

### 68. How do aggregate functions differ from window functions?

**Answer:** Aggregate functions collapse groups into rows; window functions calculate across partitions without collapsing input rows.

### 69. What is the difference between GROUP BY and PARTITION BY?

**Answer:** GROUP BY produces one row per grouping key; PARTITION BY defines windows while preserving all rows.

### 70. What is the FILTER clause for aggregate functions?

**Answer:** FILTER (WHERE ...) restricts input for one aggregate, e.g. `COUNT(*) FILTER (WHERE status='PAID')`; PostgreSQL supports it.

### 71. What is the purpose of the WHERE clause in SQL?

**Answer:** WHERE includes rows whose predicate is TRUE; FALSE and UNKNOWN are excluded.

### 72. What is the difference between IN and EXISTS, and when should each be used?

**Answer:** IN tests membership; EXISTS tests existence of subquery rows. EXISTS often communicates correlated relationship tests better.

### 73. What is the difference between NOT IN and NOT EXISTS?

**Answer:** NOT IN with NULL in the candidate set can yield UNKNOWN; NOT EXISTS avoids that trap for anti-joins.

### 74. What is the difference between BETWEEN and explicit range comparisons?

**Answer:** BETWEEN is inclusive; timestamp intervals usually benefit from `>=start AND <end` half-open boundaries.

### 75. How does the LIKE operator work, and what is the difference between the % and _ wildcards?

**Answer:** LIKE `%` matches zero or more characters and `_` matches exactly one character; collation affects case sensitivity.

### 76. What is the precedence of AND, OR, and NOT operators in SQL?

**Answer:** NOT binds before AND, which binds before OR. Use parentheses for intended precedence.

### 77. How do you perform case-insensitive string comparisons in SQL?

**Answer:** Use case-insensitive collations, PostgreSQL ILIKE, or LOWER(column)=LOWER(:value), potentially with an expression index.

### 78. How does the position of a wildcard in a LIKE pattern affect index usage and query performance?

**Answer:** Leading `%` often prevents a normal B-tree prefix index lookup; `prefix%` can sometimes be indexed.

### 79. How do you correctly filter records by a date or timestamp range?

**Answer:** Use half-open timestamp intervals `created_at>=:start AND created_at<:end` and clarify timezone interpretation.

### 80. Write a SQL query to retrieve all orders created during the last 30 days.

**Answer:** PostgreSQL: `SELECT * FROM orders WHERE created_at>=CURRENT_TIMESTAMP-INTERVAL '30 days';`

### 81. Write a SQL query to retrieve all records created during a specific calendar month, including records with timestamp values.

**Answer:** PostgreSQL: `SELECT * FROM events WHERE created_at>=TIMESTAMP '2026-11-01 00:00:00' AND created_at<TIMESTAMP '2026-12-01 00:00:00';`

### 82. Write a SQL query to retrieve employees who satisfy a combination of AND and OR conditions, ensuring the correct evaluation order.

**Answer:** `SELECT * FROM employees WHERE department_id=10 AND (status='ACTIVE' OR status='ON_LEAVE');`

### 83. Write a SQL query to find customers who have placed at least one order, without returning duplicate customers.

**Answer:** `SELECT c.* FROM customers c WHERE EXISTS(SELECT 1 FROM orders o WHERE o.customer_id=c.id);`

### 84. How do you escape special wildcard characters in a LIKE pattern?

**Answer:** Use ESCAPE, e.g. PostgreSQL `LIKE '%!%%' ESCAPE '!'` to match a literal percent sign.

### 85. What is the difference between IN and a series of OR conditions?

**Answer:** For non-NULL constants, `x IN(1,2)` is logically equivalent to `x=1 OR x=2`; NULL produces three-valued-logic nuances.

### 86. How do you implement optional search filters in SQL queries?

**Answer:** Construct SQL with only requested predicates and bind values; `(:p IS NULL OR col=:p)` is convenient but may impact index plans.

### 87. What problems can arise when using very large IN lists?

**Answer:** Large IN lists increase parsing, network size, parameter-limit risks, and plan cost; use joins to temporary tables or array parameters where supported.

### 88. Does SQL guarantee short-circuit evaluation of AND and OR conditions?

**Answer:** No. The optimizer may reorder or evaluate predicates irrespective of textual order; don't depend on short-circuiting.

### 89. What is the difference between LIKE and ILIKE?

**Answer:** ILIKE is PostgreSQL-specific case-insensitive LIKE; ordinary LIKE sensitivity depends on database and collation.

### 90. What is the difference between the ANY (SOME) and ALL operators in SQL?

**Answer:** `x op ANY` holds when any comparison is TRUE; `x op ALL` requires all to be TRUE, with important NULL and empty-set behavior.

### 91. How can regular expressions be used in SQL filtering?

**Answer:** Use vendor regex functions/operators, e.g. PostgreSQL `col ~ 'pattern'`, MySQL REGEXP_LIKE; indexing varies.

### 92. What is the difference between correlated and non-correlated subqueries?

**Answer:** Correlated subqueries reference the enclosing query; uncorrelated subqueries do not depend on outer values.

### 93. What is a scalar subquery, and when should it be used?

**Answer:** A scalar subquery returns at most one row and one column, used as an expression.

### 94. What happens when a scalar subquery returns no rows or more than one row?

**Answer:** A scalar subquery returning zero rows yields NULL; more than one row raises an error.

### 95. In which SQL clauses can subqueries be used?

**Answer:** Subqueries occur in SELECT, FROM, WHERE, HAVING, and DML predicates/assignments where supported.

### 96. What is a derived table in SQL?

**Answer:** A derived table is a SELECT subquery in FROM, typically with an alias.

### 97. What is the difference between using a JOIN and a subquery to retrieve data?

**Answer:** Joins combine relations; subqueries express intermediate results, existence, and scalar computations. Performance depends on optimization.

### 98. Are correlated subqueries always slower than non-correlated subqueries or joins?

**Answer:** No. Optimizers can decorrelate subqueries into efficient joins or cache results; inspect actual execution plans.

### 99. How can subqueries be used in UPDATE and DELETE statements?

**Answer:** `UPDATE employees SET salary=salary*1.1 WHERE department_id IN (SELECT id FROM departments WHERE active=TRUE);` Similar predicates work in DELETE.

### 100. Write a SQL query to find the second-highest distinct employee salary.

**Answer:** `SELECT MAX(salary) FROM employees WHERE salary<(SELECT MAX(salary) FROM employees);` Returns NULL without two distinct salaries.

### 101. Write a SQL query to find the Nth-highest distinct employee salary.

**Answer:** `WITH r AS (SELECT DISTINCT salary,DENSE_RANK() OVER(ORDER BY salary DESC) rank FROM employees WHERE salary IS NOT NULL) SELECT salary FROM r WHERE rank=:n;`

### 102. Write a SQL query to find employees who earn more than the company's average salary.

**Answer:** `SELECT * FROM employees WHERE salary>(SELECT AVG(salary) FROM employees);`

### 103. Write a SQL query to find employees who earn more than the average salary in their own department.

**Answer:** `SELECT e.* FROM employees e WHERE e.salary>(SELECT AVG(e2.salary) FROM employees e2 WHERE e2.department_id=e.department_id);`

### 104. Write a SQL query to retrieve the highest-paid employees in each department, including ties.

**Answer:** `WITH r AS(SELECT e.*,DENSE_RANK() OVER(PARTITION BY department_id ORDER BY salary DESC) rank FROM employees e) SELECT * FROM r WHERE rank=1;`

### 105. What is the difference between a single-row and a multi-row subquery?

**Answer:** A scalar comparison needs at most one subquery row; multi-row results require IN, EXISTS, ANY/ALL, or a table-valued context.

### 106. Can a subquery reference columns from the outer query?

**Answer:** Yes. An inner subquery can use column values from its enclosing query scope.

### 107. How do nested subqueries work in SQL?

**Answer:** Subqueries can nest recursively, accessing inner or outer scopes. Optimizers may rewrite them for execution.

### 108. What problems can arise from using unqualified column names in subqueries?

**Answer:** An unqualified column can silently resolve in the inner or outer scope, changing correlation; qualify all ambiguous names.

### 109. Can a subquery return multiple columns?

**Answer:** Yes, for row-value comparisons or FROM subqueries; a scalar subquery must return only one column.

### 110. Does a correlated subquery always execute once for every row of the outer query?

**Answer:** No. Correlated SQL can be decorrelated, cached, or executed through joins by the optimizer.

### 111. How can you rewrite a correlated subquery using a JOIN?

**Answer:** Rewrite an EXISTS as JOIN to unique matching keys, or a correlated aggregate as a grouped derived table joined to outer rows; mind duplicates.

### 112. What is an UPSERT operation, and how can it be implemented in SQL?

**Answer:** UPSERT inserts or updates on conflict. PostgreSQL ON CONFLICT, MySQL ON DUPLICATE KEY UPDATE, and MERGE differ in syntax and concurrency.

### 113. Write a SQL query to delete duplicate user records based on their email address, keeping the record with the smallest ID.

**Answer:** PostgreSQL: `WITH r AS(SELECT id,ROW_NUMBER() OVER(PARTITION BY email ORDER BY id) rn FROM users) DELETE FROM users u USING r WHERE u.id=r.id AND r.rn>1;`

### 114. What is the difference between hard delete and soft delete?

**Answer:** Hard delete removes records; soft delete marks them inactive, trading recovery/audit benefits for filtering and integrity complexity.

### 115. How can you increment or decrement a column value atomically using SQL?

**Answer:** `UPDATE counters SET value=value+1 WHERE id=:id;` A single database update is atomic.

### 116. What happens when an INSERT statement violates a UNIQUE constraint?

**Answer:** A UNIQUE violation normally fails the statement unless a conflict-handling clause is specified; transaction state varies by DBMS.

### 117. What happens when a DELETE statement violates a foreign key constraint?

**Answer:** Depending on ON DELETE rules, a referenced delete may fail, cascade, or set foreign keys NULL.

### 118. What are the advantages and disadvantages of soft deletion?

**Answer:** Soft deletion supports recovery/history but increases query complexity, index/storage costs, and uniqueness/retention challenges.

### 119. How can you insert multiple rows into a table using a single SQL statement?

**Answer:** `INSERT INTO users(id,name) VALUES(1,'A'),(2,'B');`

### 120. How can you insert data into a table using the result of a SELECT query?

**Answer:** `INSERT INTO archived_orders(id,total) SELECT id,total FROM orders WHERE status='CLOSED';`

### 121. How would you efficiently delete or update a large number of records in a production database?

**Answer:** Update/delete in indexed, resumable batches with short transactions, monitoring locks, WAL/log growth, and replication lag.

### 122. How can you update records in one table based on data from another table?

**Answer:** PostgreSQL: `UPDATE orders o SET status=c.status FROM customers c WHERE c.id=o.customer_id;`

### 123. Write a SQL query to decrease product stock by a requested quantity only if sufficient stock is available.

**Answer:** `UPDATE products SET stock=stock-:qty WHERE id=:id AND stock>=:qty AND :qty>0;` One affected row indicates success.

### 124. Write a SQL query to insert a user if their email does not exist, or update their last login timestamp if it does.

**Answer:** PostgreSQL: `INSERT INTO users(email,last_login) VALUES(:email,CURRENT_TIMESTAMP) ON CONFLICT(email) DO UPDATE SET last_login=EXCLUDED.last_login;`

### 125. What is the difference between inserting NULL and using a DEFAULT value?

**Answer:** NULL stores missing data where permitted; DEFAULT requests the defined default. Omitted columns often use their defaults.

### 126. Write a SQL query to delete duplicate records while keeping the most recently created record in each group.

**Answer:** PostgreSQL: `WITH r AS(SELECT id,ROW_NUMBER() OVER(PARTITION BY email ORDER BY created_at DESC,id DESC) rn FROM users) DELETE FROM users u USING r WHERE u.id=r.id AND r.rn>1;`

### 127. What is the logical execution order of an SQL SELECT statement?

**Answer:** Conceptually: FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, OFFSET/FETCH/LIMIT; the optimizer may execute differently.

### 128. Why can't you normally use a column alias defined in SELECT in the WHERE clause, but can use it in ORDER BY?

**Answer:** WHERE is logically evaluated before SELECT aliases exist; ORDER BY is later and can normally reference aliases.

### 129. What is the difference between the logical and physical execution order of an SQL query?

**Answer:** Logical processing defines semantics; physical plans may reorder operations while preserving valid query results.

### 130. Does an SQL query guarantee the order of returned rows without an ORDER BY clause?

**Answer:** No. SQL does not guarantee row order without ORDER BY.

### 131. What is deterministic ordering, and why is it important when retrieving query results?

**Answer:** Add a unique tie-breaker to ORDER BY so ties have an explicit order, crucial for pagination.

### 132. Why can't window functions be used directly in the WHERE clause?

**Answer:** Window functions are logically computed after WHERE; filter them in an outer query/CTE or dialect-specific QUALIFY.

### 133. How does DISTINCT work when multiple columns are selected?

**Answer:** DISTINCT deduplicates the entire selected tuple, not individual column values.

### 134. Will the following SQL query execute successfully? If not, explain why and correct it. `SELECT salary * 12 AS annual_salary FROM employees WHERE annual_salary > 60000;`

**Answer:** No. WHERE cannot use a SELECT alias. Write `WHERE salary*12>60000` or an outer query.

### 135. Does the following query guarantee that the same records will be returned every time? Explain why or why not. `SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;`

**Answer:** No. created_at ties are ambiguous and concurrent changes can affect the page. Add `id DESC` as a tie-breaker.

### 136. Does the following query guarantee 10 distinct customer IDs? Explain the logical processing order. `SELECT DISTINCT customer_id FROM orders LIMIT 10;`

**Answer:** Not necessarily: if at least ten distinct customer IDs exist, ten distinct IDs are returned, otherwise fewer. Without ORDER BY the chosen ten are nondeterministic.

### 137. What is the difference between declarative and procedural programming, and why is SQL considered declarative?

**Answer:** Declarative SQL specifies the desired result, not the steps; the database optimizer chooses execution strategies.

### 138. Write a SQL query to retrieve the most recent order for each customer.

**Answer:** `WITH r AS(SELECT o.*,ROW_NUMBER() OVER(PARTITION BY customer_id ORDER BY created_at DESC,id DESC) rn FROM orders o) SELECT * FROM r WHERE rn=1;`

### 139. Write a SQL query to retrieve the top three highest-paid employees in each department.

**Answer:** `WITH r AS(SELECT e.*,ROW_NUMBER() OVER(PARTITION BY department_id ORDER BY salary DESC,id) rn FROM employees e) SELECT * FROM r WHERE rn<=3;`

### 140. Write a SQL query to calculate a running total of transactions ordered by date.

**Answer:** `SELECT id,transaction_date,amount,SUM(amount) OVER(ORDER BY transaction_date,id ROWS UNBOUNDED PRECEDING) running_total FROM transactions;`

### 141. Write a SQL query to retrieve an employee's entire management hierarchy.

**Answer:** `WITH RECURSIVE chain AS(SELECT id,manager_id,name FROM employees WHERE id=:employee_id UNION ALL SELECT m.id,m.manager_id,m.name FROM employees m JOIN chain c ON m.id=c.manager_id) SELECT * FROM chain;` Guard cycles.

### 142. Write a SQL query to retrieve the previous transaction amount for each customer.

**Answer:** `SELECT customer_id,transaction_date,amount,LAG(amount) OVER(PARTITION BY customer_id ORDER BY transaction_date,id) previous_amount FROM transactions;`

### 143. What is a Common Table Expression (CTE), and when should it be used?

**Answer:** A CTE is a named query defined by WITH, useful for structure, reuse, and recursion; materialization depends on optimizer rules.

### 144. What is the difference between a CTE and a subquery?

**Answer:** A CTE is a named, statement-scoped query; a subquery is nested inline. Neither is automatically faster.

### 145. What is a window function in SQL, and when should it be used?

**Answer:** A window function computes values over a partition of result rows without collapsing them, e.g. ROW_NUMBER and SUM OVER.

### 146. What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK()?

**Answer:** ROW_NUMBER assigns unique row positions; RANK repeats rank for ties and leaves gaps; DENSE_RANK repeats rank without gaps.

### 147. What is the difference between UNION and UNION ALL, and which is generally faster?

**Answer:** UNION removes duplicate rows; UNION ALL preserves them and generally saves deduplication work.

### 148. What is the difference between UNION and JOIN?

**Answer:** UNION stacks compatible row sets; JOIN combines columns based on matching rows.

### 149. What requirements must SELECT statements satisfy when combined using UNION?

**Answer:** UNION branches must have equal column counts and compatible corresponding types; output names usually derive from the first branch.

### 150. What is the difference between EXCEPT and INTERSECT?

**Answer:** INTERSECT returns common rows; EXCEPT returns left-hand rows not found on the right.

### 151. How do you apply ORDER BY to the result of a UNION operation?

**Answer:** Use a final ORDER BY after the entire UNION, possibly wrapping the expression in an outer query.

### 152. How do set operators handle duplicate rows and NULL values?

**Answer:** Without ALL, set operators remove duplicates, treating NULL values as equal for set comparison.

### 153. What is the difference between EXCEPT and MINUS?

**Answer:** EXCEPT is standard SQL; Oracle historically uses MINUS for equivalent set difference.

### 154. What is the precedence of SQL set operators?

**Answer:** Operator precedence differs by SQL dialect/version; parenthesize mixed set expressions explicitly.

### 155. How can INTERSECT and EXCEPT be implemented using JOIN or EXISTS?

**Answer:** Use EXISTS/NOT EXISTS or semi/anti-joins for equivalent membership logic, including NULL-safe comparisons and DISTINCT if needed.

### 156. What is the difference between INTERSECT and INTERSECT ALL?

**Answer:** INTERSECT deduplicates common rows; INTERSECT ALL retains duplicates up to the minimum occurrence count in each input.

### 157. What is the difference between EXCEPT and EXCEPT ALL?

**Answer:** EXCEPT deduplicates; EXCEPT ALL subtracts multiplicities and retains excess left-side occurrences.

### 158. How does the database execute set operations internally?

**Answer:** Engines implement sets with hash tables, sorts, or merge-like operations according to costs and input ordering.

### 159. Write a SQL query to combine customer records from two tables without returning duplicates.

**Answer:** `SELECT id,name FROM customers_a UNION SELECT id,name FROM customers_b;`

### 160. Write a SQL query to find records that exist in both tables.

**Answer:** `SELECT id FROM a INTERSECT SELECT id FROM b;` In a dialect supporting INTERSECT.

### 161. Write a SQL query to find records that exist in one table but not in another.

**Answer:** `SELECT id FROM a EXCEPT SELECT id FROM b;` Or use NOT EXISTS if supported syntax differs.

### 162. How do LIMIT and OFFSET work in SQL?

**Answer:** LIMIT caps the returned rows; OFFSET skips preceding rows. Always use ORDER BY for stable pages.

### 163. Why does OFFSET-based pagination become slower for large offsets?

**Answer:** OFFSET requires processing/skipping many preceding rows, so deep pages can become slow and unstable.

### 164. How does keyset pagination work, and how can it be implemented in SQL?

**Answer:** Keyset pagination uses the last cursor key in a WHERE inequality and indexed ORDER BY, e.g. `WHERE id>:last_id ORDER BY id LIMIT 20`.

### 165. What problems can occur when records are inserted or deleted between paginated requests?

**Answer:** Offset pages can skip/duplicate records as rows move; keyset navigation reduces this but does not provide a snapshot automatically.

### 166. How do you implement pagination when the sorting column contains duplicate values?

**Answer:** Order by the nonunique column plus a unique key, and compare both components in the cursor predicate.

### 167. How can database indexes improve sorting and pagination performance?

**Answer:** Indexes aligned with filter and sort fields can avoid costly sorting and locate pages efficiently.

### 168. How do you sort SQL query results by multiple columns with different sorting directions?

**Answer:** `ORDER BY department ASC,salary DESC,id ASC` uses different directions per field and a tie-breaker.

### 169. How are NULL values handled by ORDER BY, and how can their position be controlled?

**Answer:** NULL sort positions depend on DBMS; use NULLS FIRST/LAST or CASE expressions for explicit placement.

### 170. How can you efficiently retrieve the total number of records for a paginated query?

**Answer:** Run a separate filtered COUNT(*) when exact totals are necessary; use estimated/cached totals or omit for massive result sets.

### 171. What is the difference between LIMIT, TOP, and FETCH FIRST?

**Answer:** LIMIT, TOP, and FETCH FIRST are dialect-specific ways to cap rows; syntax and offset support differ.

### 172. What is the difference between sorting data in the database and sorting it in the Java application?

**Answer:** Database sorting leverages indexes and avoids transferring unnecessary rows; Java sorting is fine for small already-fetched datasets.

### 173. Write a SQL query to retrieve the third page of results, with 20 records per page, ordered by ID.

**Answer:** `SELECT * FROM items ORDER BY id LIMIT 20 OFFSET 40;` PostgreSQL/MySQL.

### 174. Write a SQL query to implement keyset pagination using a unique ID.

**Answer:** `SELECT * FROM items WHERE id>:last_id ORDER BY id LIMIT 20;`

### 175. Write a SQL query to implement keyset pagination using created_at and ID as sorting columns.

**Answer:** `SELECT * FROM orders WHERE created_at<:last_time OR(created_at=:last_time AND id<:last_id) ORDER BY created_at DESC,id DESC LIMIT 20;`

### 176. Write a SQL query to retrieve the ten most recent orders, ensuring deterministic ordering when multiple orders have the same timestamp.

**Answer:** `SELECT * FROM orders ORDER BY created_at DESC,id DESC LIMIT 10;`

### 177. Write a SQL query to sort employees by department in ascending order and salary in descending order.

**Answer:** `SELECT * FROM employees ORDER BY department_id ASC,salary DESC,id ASC;`

### 178. Write a SQL query to sort orders according to a custom status order: PENDING, PROCESSING, COMPLETED, CANCELLED.

**Answer:** `SELECT * FROM orders ORDER BY CASE status WHEN 'PENDING' THEN 1 WHEN 'PROCESSING' THEN 2 WHEN 'COMPLETED' THEN 3 WHEN 'CANCELLED' THEN 4 ELSE 5 END,id;`

### 179. What are the advantages and disadvantages of using COUNT(*) OVER() for pagination?

**Answer:** COUNT(*) OVER() supplies a total with page rows, but can require processing the entire result and returns no total if the page is empty.

### 180. How can you implement backward pagination using keyset pagination?

**Answer:** For previous pages, reverse the keyset predicate and SQL ordering, retrieve N rows, then reverse them for display.

### 181. How does sorting by a calculated expression affect index usage?

**Answer:** ORDER BY expressions can prevent a plain index from providing sort order; use expression indexes if supported.

### 182. How can you implement case-insensitive sorting in SQL?

**Answer:** Use an appropriate case-insensitive collation or `ORDER BY LOWER(name),id`, with a matching expression index if needed.

### 183. What is the difference between IS NULL and = NULL in SQL?

**Answer:** IS NULL checks NULL values; = NULL yields UNKNOWN under standard SQL semantics.

### 184. What is the CASE expression in SQL, and when should it be used?

**Answer:** CASE chooses a value based on conditions, useful for classification, conditional aggregates, and custom sorts.

### 185. How does the COALESCE function work in SQL?

**Answer:** COALESCE returns the first non-NULL argument, otherwise NULL.

### 186. What is the difference between COALESCE, NVL, IFNULL, and ISNULL?

**Answer:** COALESCE is portable SQL; NVL, IFNULL, and ISNULL are vendor-specific and differ in types and argument rules.

### 187. What happens when NULL is used in arithmetic expressions?

**Answer:** NULL arithmetic generally yields NULL; aggregates have different NULL handling.

### 188. What is the difference between a simple CASE expression and a searched CASE expression?

**Answer:** Simple CASE compares a single expression against values; searched CASE evaluates full boolean predicates.

### 189. What happens when no WHEN condition matches in a CASE expression without an ELSE clause?

**Answer:** CASE without matching WHEN or ELSE produces NULL.

### 190. How can you compare two nullable columns and treat two NULL values as equal?

**Answer:** Use `a IS NOT DISTINCT FROM b` where supported, or `(a=b OR(a IS NULL AND b IS NULL))`.

### 191. How does SQL handle UNKNOWN results in WHERE conditions?

**Answer:** WHERE includes only TRUE; FALSE and UNKNOWN both exclude rows.

### 192. How can NULLIF be used to prevent division-by-zero errors?

**Answer:** `numerator/NULLIF(denominator,0)` returns NULL for zero denominator instead of division error.

### 193. Write a SQL query to replace NULL salary values with zero in the result set.

**Answer:** `SELECT id,COALESCE(salary,0) salary FROM employees;`

### 194. Write a SQL query to classify employees into salary ranges using a CASE expression.

**Answer:** `SELECT id,CASE WHEN salary IS NULL THEN 'UNKNOWN' WHEN salary<30000 THEN 'LOW' WHEN salary<70000 THEN 'MID' ELSE 'HIGH' END band FROM employees;`

### 195. Write a SQL query to return the first non-NULL value from multiple contact information columns.

**Answer:** `SELECT id,COALESCE(email,phone,backup_email) contact FROM customers;`

### 196. Write a SQL query to calculate a ratio without causing a division-by-zero error.

**Answer:** `SELECT numerator/NULLIF(denominator,0) AS ratio FROM metrics;` Cast to DECIMAL if integer division truncates.

### 197. Write a SQL query to find records where two nullable columns contain different values, treating two NULL values as equal.

**Answer:** `SELECT * FROM records WHERE a IS DISTINCT FROM b;` PostgreSQL and other supporting dialects.

### 198. How does applying a function to an indexed column in a WHERE clause affect query performance?

**Answer:** Functions on indexed columns often make predicates non-sargable; use range conditions or suitable expression indexes.

### 199. What are the most commonly used SQL string functions, and what are they used for?

**Answer:** LOWER/UPPER change case, TRIM removes edge spaces, SUBSTRING extracts text, LENGTH counts units, REPLACE substitutes text.

### 200. How can you perform date and time calculations in SQL?

**Answer:** Use date intervals, date arithmetic, or EXTRACT; be clear whether computing elapsed or calendar time and about timezones.

### 201. What is the difference between ROUND, FLOOR, CEIL, and TRUNCATE?

**Answer:** ROUND rounds, FLOOR moves toward negative infinity, CEIL toward positive infinity, and TRUNCATE discards decimal digits.

### 202. What is the difference between LENGTH and CHAR_LENGTH?

**Answer:** Depending on DBMS, LENGTH counts bytes or characters; CHAR_LENGTH counts characters (not user-perceived grapheme clusters).

### 203. How do CONCAT and string concatenation operators handle NULL values?

**Answer:** CONCAT and || may treat NULL differently by DBMS; COALESCE explicitly defines NULL handling.

### 204. What is the difference between TRIM, LTRIM, and RTRIM?

**Answer:** TRIM strips both ends by default; LTRIM strips left, RTRIM strips right; supported arguments vary.

### 205. What is the difference between SUBSTRING and REPLACE?

**Answer:** SUBSTRING extracts a section by position; REPLACE substitutes matching substrings.

### 206. What is the difference between CURRENT_DATE, CURRENT_TIME, and CURRENT_TIMESTAMP?

**Answer:** CURRENT_DATE is today's date; CURRENT_TIME the time; CURRENT_TIMESTAMP date and time, with session/timezone semantics varying.

### 207. How can you extract individual components from a date or timestamp in SQL?

**Answer:** Use EXTRACT(YEAR FROM col), EXTRACT(MONTH FROM col), etc., or vendor date-part functions.

### 208. How can you calculate the difference between two dates or timestamps in SQL?

**Answer:** PostgreSQL timestamp subtraction yields an interval; DATEDIFF/TIMESTAMPDIFF variants return specified units in other dialects.

### 209. How can you extract and filter values from a JSON column using SQL?

**Answer:** PostgreSQL: `WHERE payload->>'status'='PAID'`; other databases use JSON_VALUE, JSON_EXTRACT, and appropriate indexes.

### 210. Write a SQL query to extract the domain name from an email address.

**Answer:** PostgreSQL: `SELECT split_part(email,'@',2) domain FROM users;` Check email validity separately.

### 211. Write a SQL query to concatenate an employee's first and last names while handling NULL values.

**Answer:** `SELECT TRIM(CONCAT(COALESCE(first_name,''),' ',COALESCE(last_name,''))) full_name FROM employees;`

### 212. Write a SQL query to find employees hired during the current calendar year.

**Answer:** PostgreSQL: `SELECT * FROM employees WHERE hired_at>=date_trunc('year',CURRENT_DATE) AND hired_at<date_trunc('year',CURRENT_DATE)+INTERVAL '1 year';`

### 213. Write a SQL query to calculate each employee's age from their date of birth.

**Answer:** PostgreSQL: `SELECT id,EXTRACT(YEAR FROM age(CURRENT_DATE,birth_date)) age_years FROM employees;`

### 214. Write a SQL query to calculate the number of days between an order date and its delivery date.

**Answer:** PostgreSQL DATE types: `SELECT id,delivered_on-ordered_on AS days FROM orders;` Timestamp differences require explicit units.

### 215. Rewrite a query that applies a date function to an indexed timestamp column so that it can efficiently use the index.

**Answer:** Replace `DATE(created_at)='2026-11-26'` with `created_at>=TIMESTAMP '2026-11-26 00:00:00' AND created_at<TIMESTAMP '2026-11-27 00:00:00'`.

### 216. Write a SQL query to normalize email addresses by removing leading and trailing spaces and converting them to lowercase.

**Answer:** `SELECT id,LOWER(TRIM(email)) normalized_email FROM users;` Beware that universal case folding can alter some valid local parts.

### 217. Write a SQL query to extract a specific property from a JSON column and filter records by its value.

**Answer:** PostgreSQL: `SELECT * FROM orders WHERE payload->>'status'='PAID';`

### 218. What is the difference between DDL and DML statements?

**Answer:** DDL defines schema (CREATE/ALTER/DROP); DML changes rows (INSERT/UPDATE/DELETE/MERGE). SELECT is often classified as DQL.

### 219. Can DDL statements be rolled back? How does this behavior differ between PostgreSQL, MySQL, and Oracle?

**Answer:** PostgreSQL can roll back most DDL; MySQL and Oracle implicitly commit around many DDL statements, with exceptions.

### 220. What is an implicit commit, and which DDL operations can cause it?

**Answer:** Implicit commit ends a transaction automatically; CREATE, ALTER, DROP, or TRUNCATE frequently trigger it in MySQL/Oracle.

### 221. How do you modify an existing table using ALTER TABLE?

**Answer:** `ALTER TABLE users ADD COLUMN nickname VARCHAR(100);`

### 222. How would you safely add a NOT NULL column to a large production table containing existing data?

**Answer:** Add a nullable column, backfill in batches, deploy compatible code, validate existing rows, then enforce NOT NULL and remove compatibility code.

### 223. How can database schema changes affect running applications?

**Answer:** Schema renames, constraints, types, and drops can break old SQL, ORM mappings, or concurrent app versions.

### 224. How do you perform backward-compatible database schema changes?

**Answer:** Use expand-and-contract migrations with additive schema changes, mixed-version compatibility, backfills, and deferred removal.

### 225. How can database schema changes be performed with minimal or zero downtime?

**Answer:** Use online/concurrent DDL where available, bounded backfills, careful locking, and phased deployments; some operations still need downtime.

### 226. What is the difference between defining a constraint when creating a table and adding it later?

**Answer:** CREATE-time constraints apply from the beginning; adding later validates existing data and may require blocking scans/locks.

### 227. What is the difference between CREATE TABLE AS SELECT and INSERT INTO SELECT?

**Answer:** CTAS creates a new populated table, often without inherited indexes/constraints; INSERT INTO SELECT adds rows to an existing table.

### 228. What is the purpose of IF EXISTS and IF NOT EXISTS in DDL statements?

**Answer:** IF EXISTS and IF NOT EXISTS suppress some missing/existing-object errors but don't validate that an existing schema is correct.

### 229. What risks arise when changing the data type of an existing column?

**Answer:** Type changes may truncate data, rewrite large tables, acquire locks, invalidate indexes, and break application conversions.

### 230. What is the difference between identity columns, sequences, and auto-increment columns?

**Answer:** Identity/auto-increment generates column values implicitly; sequences are independent generators that can serve multiple tables.

### 231. Can DDL operations lock a table and block concurrent queries?

**Answer:** Yes. DDL can take locks that block reads or writes; lock strength and online options depend on the operation and DBMS.

### 232. What is the difference between DROP CASCADE and DROP RESTRICT?

**Answer:** DROP CASCADE removes dependent objects; DROP RESTRICT rejects operations with dependencies.

### 233. Write a SQL statement to create a table with a primary key, a foreign key, a UNIQUE constraint, and a NOT NULL constraint.

**Answer:** `CREATE TABLE orders(id BIGINT PRIMARY KEY,customer_id BIGINT NOT NULL REFERENCES customers(id),external_ref VARCHAR(100) UNIQUE);`

### 234. Write a SQL statement to add a new column with a default value to an existing table.

**Answer:** `ALTER TABLE orders ADD COLUMN status VARCHAR(20) DEFAULT 'PENDING';`

### 235. Write a SQL statement to add a foreign key constraint to an existing table.

**Answer:** `ALTER TABLE orders ADD CONSTRAINT fk_customer FOREIGN KEY(customer_id) REFERENCES customers(id);`

### 236. Write a SQL statement to create a composite index on two columns.

**Answer:** `CREATE INDEX idx_orders_customer_created ON orders(customer_id,created_at);`

### 237. How would you safely rename a database column used by multiple running application instances?

**Answer:** Add a new column, dual-write/backfill, deploy tolerant readers, switch traffic, and drop/rename old column after all old versions disappear.

### 238. How would you introduce a UNIQUE constraint to a production table that already contains duplicate values?

**Answer:** Clean existing duplicates, prevent new ones, then create and validate a unique constraint/index using safe production DDL.

### 239. Write a SQL statement to create a new table from the result of a SELECT query.

**Answer:** `CREATE TABLE archived_orders AS SELECT * FROM orders WHERE status='ARCHIVED';`

### 240. What are the advantages and disadvantages of using database views?

**Answer:** Views centralize queries and restrict selected data but can hide expensive logic, create dependencies, and limit updatability.

### 241. What is the difference between a view and a table?

**Answer:** Tables persist records; ordinary views persist SELECT definitions and derive records when queried.

### 242. Does a regular database view store data physically?

**Answer:** Ordinary views do not store their own result rows; materialized views do.

### 243. Can using a database view improve query performance?

**Answer:** Ordinary views do not inherently accelerate queries; materialized views can cache work, and optimizers may inline views.

### 244. What is the difference between a view and a Common Table Expression (CTE)?

**Answer:** Views are persistent reusable schema objects; CTEs exist only within one SQL statement.

### 245. Can INSERT, UPDATE, and DELETE statements be executed against a view, and under what conditions?

**Answer:** Simple views may be updatable; joins/aggregation often prevent direct DML unless vendor rules or triggers allow it.

### 246. What happens to a view when the structure of its underlying tables changes?

**Answer:** Underlying schema changes may invalidate a view or change its behavior depending on dependencies and DBMS implementation.

### 247. Can a database view be created using multiple tables and joins?

**Answer:** Yes. A view can join multiple tables, though joined views are not always updatable.

### 248. When should you use a materialized view instead of executing a complex query repeatedly?

**Answer:** Use materialized views for expensive reused reports where refresh lag and storage overhead are acceptable.

### 249. Can a view guarantee the order of returned rows?

**Answer:** No; an outer ORDER BY is needed for guaranteed result ordering.

### 250. Write a SQL statement to create a view that returns employee information together with department names.

**Answer:** `CREATE VIEW employee_departments AS SELECT e.id,e.name,d.name department_name FROM employees e LEFT JOIN departments d ON d.id=e.department_id;`

### 251. Write a SQL statement to create a view that exposes customer information without sensitive personal data.

**Answer:** `CREATE VIEW customer_public AS SELECT id,display_name,city FROM customers;` Restrict underlying table permissions.

### 252. Write a SQL statement to create a view that returns total sales for each customer.

**Answer:** `CREATE VIEW customer_sales AS SELECT customer_id,SUM(amount) total_sales FROM orders GROUP BY customer_id;`

### 253. How would you optimize a reporting query that repeatedly performs expensive joins and aggregations using a materialized view?

**Answer:** Create a materialized view from expensive joins/aggregates, index common filters where supported, and choose a refresh policy matching acceptable staleness.

### 254. What is the difference between standard SQL and database-specific SQL dialects?

**Answer:** Standard SQL specifies common syntax and semantics; dialects differ in extensions, types, functions, DDL, and pagination.

### 255. What is the difference between an SQL statement and an SQL query?

**Answer:** An SQL statement is any command; an SQL query usually retrieves or computes rows, commonly via SELECT.

### 256. What are table and column aliases in SQL, and why are they used?

**Answer:** Aliases name output expressions and input tables, improving clarity: `employees e`, `salary*12 AS annual_salary`.

### 257. What is the difference between SQL and JPQL?

**Answer:** SQL addresses relational tables and columns; JPQL addresses JPA entities and attributes and is translated to SQL.

### 258. Is SQL case-sensitive?

**Answer:** SQL keywords are generally case-insensitive; identifier case and string comparison depend on dialect and collation.

### 259. What is the difference between single quotes and double quotes in SQL?

**Answer:** Single quotes delimit strings; double quotes delimit identifiers under standard SQL, with vendor-specific exceptions.

### 260. What are reserved keywords in SQL, and how can they be used as identifiers?

**Answer:** Reserved words have syntactic significance; avoid them as identifiers or use dialect-specific quoted identifiers.

### 261. What is a recursive CTE, and how does it work?

**Answer:** Recursive CTEs combine anchor rows with recursively derived rows until no new rows appear; handle cycles and recursion limits.

### 262. What is SELECT FOR UPDATE, and when should it be used?

**Answer:** SELECT FOR UPDATE locks selected rows for modification within a transaction; availability and lock details depend on DBMS.

### 263. What is the difference between FOR UPDATE, NOWAIT, and SKIP LOCKED?

**Answer:** FOR UPDATE typically waits for locks, NOWAIT fails immediately, SKIP LOCKED skips locked rows; support is vendor-specific.

### 264. How can the RETURNING clause be used to retrieve data modified by INSERT, UPDATE, or DELETE statements?

**Answer:** PostgreSQL: `UPDATE products SET stock=stock-1 WHERE id=:id RETURNING id,stock;`

### 265. What is a LATERAL JOIN, and when should it be used?

**Answer:** LATERAL lets a FROM subquery reference earlier FROM tables; useful for correlated top-N lookups. SQL Server uses APPLY.

### 266. What is the difference between PIVOT and UNPIVOT operations?

**Answer:** PIVOT turns row categories into columns; UNPIVOT turns columns into rows; CASE aggregation emulates PIVOT portably.

### 267. What is a database sequence, and how can it be used in SQL statements?

**Answer:** Sequences generate independent numbers, often for IDs; values generally are not rolled back, so gaps are normal.

### 268. How can hierarchical data be queried using SQL?

**Answer:** Hierarchies can be queried via recursive CTEs, closure tables, or materialized paths, each with different update/read trade-offs.

### 269. How can SQL be used to implement an atomic job-claiming mechanism for multiple concurrent workers?

**Answer:** Atomically claim jobs with transactional row locking and state update; PostgreSQL SKIP LOCKED is useful for competing workers.

### 270. What is the difference between generated columns and regular columns?

**Answer:** Generated columns derive from expressions instead of being directly assigned; regular columns are explicitly stored values.

### 271. What is the difference between virtual and stored generated columns?

**Answer:** Virtual generated columns compute on read; stored generated columns persist results, trading write/storage overhead for reads.

### 272. Write a SQL query to retrieve all descendants of a category in a hierarchical category table using a recursive CTE.

**Answer:** PostgreSQL: `WITH RECURSIVE d AS(SELECT id,parent_id FROM categories WHERE id=:root UNION ALL SELECT c.id,c.parent_id FROM categories c JOIN d ON c.parent_id=d.id) SELECT * FROM d WHERE id<>:root;` Protect against cycles.

### 273. Write a SQL query to retrieve and lock the next available job from a database-backed job queue without blocking other workers.

**Answer:** PostgreSQL, in a transaction: `SELECT id FROM jobs WHERE status='READY' ORDER BY priority DESC,id FOR UPDATE SKIP LOCKED LIMIT 1;` Then UPDATE status and COMMIT to claim durably.

### 274. Write a SQL statement that updates a record and returns its updated values in a single database operation.

**Answer:** PostgreSQL: `UPDATE products SET stock=stock-:qty WHERE id=:id RETURNING id,stock;`

### 275. Write a SQL query to transform monthly sales records into columns representing individual months.

**Answer:** `SELECT year,SUM(CASE WHEN month=1 THEN amount ELSE 0 END) jan,SUM(CASE WHEN month=2 THEN amount ELSE 0 END) feb,SUM(CASE WHEN month=3 THEN amount ELSE 0 END) mar FROM monthly_sales GROUP BY year;`

### 276. What are temporal tables, and how do they support historical queries?

**Answer:** Temporal tables maintain row versions with validity periods and support as-of/history queries; syntax and support vary by DBMS.
