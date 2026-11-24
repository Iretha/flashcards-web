# SQL Interview Questions

## Research and selection methodology

This catalog targets mainstream technical interviews for Java Developers and Senior Java Developers (including Java backend roles), rather than specialist DBMS, SQL, or DBA roles.

For each subject, we identify thematic areas, rank them by relevance to the target role, tag each question with all directly relevant topics, and assess the existing coverage. We then research each area, prioritizing documented real-world interviews and identifying relevant questions that address gaps or strengthen existing coverage.

We retain source links for new questions and distinguish actual interview evidence from interview-preparation materials and technical references. The latter may support candidate questions but do not establish that they were asked in real interviews. We avoid semantic duplicates across topics and decks, unnecessary specialist detail, and artificial questions generated merely to fill gaps. There is no fixed question-count target.

New questions are reviewed and approved before inclusion, assigned stable IDs, and tagged according to their origin. Topic coverage is reassessed after each update. A question may belong to multiple topics (separated by semicolons); it counts once in each relevant topic and only once in the unique question total. Priorities reflect relevance to the target role independently of current coverage; both priorities and coverage assessments may be refined as new evidence emerges.

## Interview likelihood (Вероятност)

Expert ordinal estimate of interview likelihood across mainstream Java Developer and Senior Java Developer roles, not a measured statistical probability or a difficulty score. 5 = typical/core interview question; 4 = highly relevant and likely; 3 = plausible but less common; 2 = uncommon or stack/project-specific; 1 = very unlikely outside academic, DBA or specialist interviews. Basic questions may score highly; technical depth alone does not increase likelihood. Product-specific questions are assessed across general Java roles, not only roles requiring that product. Ratings are independent of topic priority and do not establish interview evidence. All questions were reassessed against this rubric; no new interview-frequency research was conducted.

## Origin labels

- `ORIGINAL`: question from the initial list.
- `ORIGINAL_REVISED`: original question with an approved revision.
- `ADDED`: supplementary question, including replacements with a new knowledge target.

Question IDs are global and stable. New questions receive the next available ID (currently 664).


IDs are shared across `database-interview-questions.md`, `sql-interview-questions.md`, `nosql-interview-questions.md`, and `jdbc-interview-questions.md`; coordinate new allocations across all four files. Existing IDs are preserved.

## Evidence legend

- `Prep`: interview-preparation source (not proof of an actual interview); wording may be adapted.
- `Technical`: technical background only, not interview evidence.
- `Interview`: documented actual interview occurrence. `Interview report (adapted)` identifies a reported interview topic with adapted wording; the report is not independently verified.
- `—`: source not recorded or verified.

## SQL – Interview Questions

| ID | Question | Origin | Topics | Evidence | Вероятност |
| ---: | --- | --- | --- | --- | ---: |
| 5 | What is SQL? | ORIGINAL | SQL Fundamentals | — | 5 |
| 6 | What are the types of operators available in SQL? | ORIGINAL | SQL Fundamentals; Filtering & Query Conditions | — | 3 |
| 7 | What are the subsets of SQL? | ORIGINAL | SQL Fundamentals | — | 4 |
| 11 | What is a query? | ORIGINAL | SQL Fundamentals | — | 3 |
| 12 | What is a subquery? What types are there? | ORIGINAL | Subqueries | — | 5 |
| 13 | What is “SELECT” statement? | ORIGINAL | SQL Fundamentals | — | 3 |
| 14 | What is a CLAUSE? | ORIGINAL | SQL Fundamentals | — | 3 |
| 15 | What are UNION (ALL), MINUS and INTERSECT commands? | ORIGINAL | Set Operations | — | 4 |
| 16 | What is the difference between TRUNCATE, DELETE and DROP statements? | ORIGINAL | Data Definition (DDL); Data Manipulation (DML) | — | 5 |
| 17 | What is a view in SQL? | ORIGINAL | Views | — | 5 |
| 19 | What are aggregate and scalar functions? | ORIGINAL | Aggregation & Grouping; SQL Functions & Expressions | — | 4 |
| 24 | What is a Join in SQL? | ORIGINAL | Joins & Table Relationships | — | 5 |
| 25 | What is Inner Join in SQL? | ORIGINAL | Joins & Table Relationships | — | 5 |
| 26 | What is Right Join in SQL? | ORIGINAL | Joins & Table Relationships | — | 4 |
| 27 | What is Left Join in SQL? | ORIGINAL | Joins & Table Relationships | — | 5 |
| 28 | What is Full Join in SQL? | ORIGINAL | Joins & Table Relationships | — | 4 |
| 29 | What is Cross Join? | ORIGINAL | Joins & Table Relationships | — | 4 |
| 30 | What is self-join and what is the requirement of self-join? | ORIGINAL | Joins & Table Relationships | — | 4 |
| 31 | What is the usage of the DISTINCT keyword? | ORIGINAL | SQL Query Execution & Semantics | — | 4 |
| 41 | What is the need for group functions in SQL? | ORIGINAL | Aggregation & Grouping | — | 4 |
| 59 | What is the need of the MERGE statement? | ORIGINAL | Data Manipulation (DML) | — | 3 |
| 60 | Name the operator which is used in the query for pattern matching? | ORIGINAL | Filtering & Query Conditions | — | 4 |
| 409 | What is the difference between INNER JOIN and LEFT JOIN, and when should each be used? | ADDED | Joins & Table Relationships | — | 5 |
| 410 | What is the difference between INNER JOIN and OUTER JOIN? | ADDED | Joins & Table Relationships | — | 5 |
| 411 | What is the difference between filtering in the ON clause and the WHERE clause of a LEFT JOIN? | ADDED | Joins & Table Relationships; Filtering & Query Conditions; NULL Handling & Conditional Expressions | — | 4 |
| 412 | Why might a JOIN return more rows than expected, and how can this problem be resolved? | ADDED | Joins & Table Relationships; SQL Query Execution & Semantics | — | 4 |
| 413 | How do NULL values affect JOIN operations? | ADDED | Joins & Table Relationships; Filtering & Query Conditions; NULL Handling & Conditional Expressions | — | 4 |
| 414 | When should you use EXISTS instead of JOIN? | ADDED | Joins & Table Relationships; Subqueries; Filtering & Query Conditions | — | 4 |
| 415 | How can joining multiple one-to-many relationships lead to incorrect aggregate results? | ADDED | Joins & Table Relationships; Aggregation & Grouping | — | 4 |
| 416 | Write a SQL query to retrieve all customers who have never placed an order. | ADDED | Joins & Table Relationships; Practical SQL Query Problems | — | 4 |
| 417 | Write a SQL query to retrieve all customers and their number of orders, including customers with no orders. | ADDED | Joins & Table Relationships; Practical SQL Query Problems; Aggregation & Grouping | — | 4 |
| 418 | Write a SQL query to retrieve each employee together with their manager's name, including employees without a manager. | ADDED | Joins & Table Relationships; Practical SQL Query Problems | — | 4 |
| 419 | Write a SQL query to find employees who earn more than their managers. | ADDED | Joins & Table Relationships; Practical SQL Query Problems | — | 5 |
| 420 | Given two tables containing duplicate and NULL values in their join columns, determine the result of INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN. | ADDED | Joins & Table Relationships; Practical SQL Query Problems; NULL Handling & Conditional Expressions | — | 4 |
| 421 | What is the difference between LEFT JOIN and RIGHT JOIN? | ADDED | Joins & Table Relationships | — | 4 |
| 422 | Can you join tables without a foreign key relationship? | ADDED | Joins & Table Relationships | — | 4 |
| 423 | Can you join tables using multiple columns? | ADDED | Joins & Table Relationships | — | 4 |
| 424 | How do you join three or more tables in a SQL query? | ADDED | Joins & Table Relationships | — | 4 |
| 425 | How do you query a many-to-many relationship using a junction table? | ADDED | Joins & Table Relationships | — | 4 |
| 426 | What is the difference between an explicit JOIN and an implicit JOIN? | ADDED | Joins & Table Relationships | — | 3 |
| 427 | What is the difference between an equi-join and a non-equi-join? | ADDED | Joins & Table Relationships | — | 2 |
| 428 | What is a semi-join and an anti-join? | ADDED | Joins & Table Relationships; Subqueries | — | 2 |
| 429 | How can you emulate FULL OUTER JOIN in MySQL? | ADDED | Joins & Table Relationships; Set Operations | — | 3 |
| 430 | What is the purpose of the GROUP BY clause in SQL? | ADDED | Aggregation & Grouping | — | 5 |
| 431 | What is the difference between WHERE and HAVING? | ADDED | Aggregation & Grouping; Filtering & Query Conditions; SQL Query Execution & Semantics | — | 5 |
| 432 | What is the difference between COUNT(*), COUNT(column), and COUNT(DISTINCT column)? | ADDED | Aggregation & Grouping; NULL Handling & Conditional Expressions | — | 5 |
| 433 | What is the difference between GROUP BY and DISTINCT? | ADDED | Aggregation & Grouping; SQL Query Execution & Semantics | — | 4 |
| 434 | Can you select columns that are neither included in the GROUP BY clause nor used in an aggregate function? | ADDED | Aggregation & Grouping; SQL Query Execution & Semantics | — | 4 |
| 435 | Can you use HAVING without GROUP BY? | ADDED | Aggregation & Grouping; Filtering & Query Conditions; SQL Query Execution & Semantics | — | 3 |
| 436 | Can you group results by multiple columns in SQL? | ADDED | Aggregation & Grouping | — | 4 |
| 437 | How does GROUP BY handle NULL values? | ADDED | Aggregation & Grouping; NULL Handling & Conditional Expressions | — | 4 |
| 438 | What is conditional aggregation, and how can it be implemented using CASE? | ADDED | Aggregation & Grouping; NULL Handling & Conditional Expressions; SQL Functions & Expressions | — | 3 |
| 439 | Can aggregate functions be used in the WHERE clause? Why or why not? | ADDED | Aggregation & Grouping; Filtering & Query Conditions; SQL Query Execution & Semantics | — | 4 |
| 440 | Write a SQL query to find duplicate email addresses in a users table. | ADDED | Aggregation & Grouping; Practical SQL Query Problems | — | 5 |
| 441 | Write a SQL query to calculate the number of employees in each department. | ADDED | Aggregation & Grouping; Practical SQL Query Problems | — | 4 |
| 442 | Write a SQL query to find departments with more than five employees. | ADDED | Aggregation & Grouping; Practical SQL Query Problems; Filtering & Query Conditions | — | 4 |
| 443 | Write a SQL query to find the minimum, maximum, and average salary in each department. | ADDED | Aggregation & Grouping; Practical SQL Query Problems | — | 4 |
| 444 | Write a SQL query to find departments whose average salary exceeds a given threshold. | ADDED | Aggregation & Grouping; Practical SQL Query Problems; Filtering & Query Conditions | — | 4 |
| 445 | Write a SQL query to find the three customers with the highest total order value. | ADDED | Aggregation & Grouping; Practical SQL Query Problems; Sorting & Pagination | — | 4 |
| 446 | Write a SQL query to calculate the number of completed, pending, and cancelled orders for each customer. | ADDED | Aggregation & Grouping; Practical SQL Query Problems; NULL Handling & Conditional Expressions | — | 4 |
| 447 | Write a SQL query to find duplicate records based on a combination of multiple columns. | ADDED | Aggregation & Grouping; Practical SQL Query Problems | — | 4 |
| 448 | What is the difference between COUNT(*) and COUNT(1)? | ADDED | Aggregation & Grouping | — | 3 |
| 449 | What do aggregate functions return when no rows match a query? | ADDED | Aggregation & Grouping; NULL Handling & Conditional Expressions | — | 4 |
| 450 | What is the difference between GROUP BY and ORDER BY? | ADDED | Aggregation & Grouping; Sorting & Pagination | — | 4 |
| 451 | What is the difference between SUM(column) and SUM(DISTINCT column)? | ADDED | Aggregation & Grouping | — | 3 |
| 452 | How can you concatenate values from multiple rows into a single string? | ADDED | Aggregation & Grouping; SQL Functions & Expressions | — | 3 |
| 453 | How can you group records by day, month, or year? | ADDED | Aggregation & Grouping; SQL Functions & Expressions | — | 3 |
| 454 | How do aggregate functions differ from window functions? | ADDED | Aggregation & Grouping; Window Functions | — | 3 |
| 455 | What is the difference between GROUP BY and PARTITION BY? | ADDED | Aggregation & Grouping; Window Functions | — | 3 |
| 456 | What is the FILTER clause for aggregate functions? | ADDED | Aggregation & Grouping; Filtering & Query Conditions | — | 2 |
| 457 | What is the purpose of the WHERE clause in SQL? | ADDED | Filtering & Query Conditions | — | 4 |
| 458 | What is the difference between IN and EXISTS, and when should each be used? | ADDED | Filtering & Query Conditions; Subqueries | — | 5 |
| 459 | What is the difference between NOT IN and NOT EXISTS? | ADDED | Filtering & Query Conditions; Subqueries; NULL Handling & Conditional Expressions | — | 5 |
| 460 | What is the difference between BETWEEN and explicit range comparisons? | ADDED | Filtering & Query Conditions | — | 3 |
| 461 | How does the LIKE operator work, and what is the difference between the % and _ wildcards? | ADDED | Filtering & Query Conditions | — | 4 |
| 462 | What is the precedence of AND, OR, and NOT operators in SQL? | ADDED | Filtering & Query Conditions; SQL Query Execution & Semantics | — | 3 |
| 463 | How do you perform case-insensitive string comparisons in SQL? | ADDED | Filtering & Query Conditions | — | 4 |
| 464 | How does the position of a wildcard in a LIKE pattern affect index usage and query performance? | ADDED | Filtering & Query Conditions | — | 4 |
| 465 | How do you correctly filter records by a date or timestamp range? | ADDED | Filtering & Query Conditions | — | 4 |
| 466 | Write a SQL query to retrieve all orders created during the last 30 days. | ADDED | Filtering & Query Conditions; Practical SQL Query Problems | — | 4 |
| 467 | Write a SQL query to retrieve all records created during a specific calendar month, including records with timestamp values. | ADDED | Filtering & Query Conditions; Practical SQL Query Problems | — | 4 |
| 468 | Write a SQL query to retrieve employees who satisfy a combination of AND and OR conditions, ensuring the correct evaluation order. | ADDED | Filtering & Query Conditions; Practical SQL Query Problems; SQL Query Execution & Semantics | — | 4 |
| 469 | Write a SQL query to find customers who have placed at least one order, without returning duplicate customers. | ADDED | Filtering & Query Conditions; Practical SQL Query Problems; Subqueries | — | 4 |
| 470 | How do you escape special wildcard characters in a LIKE pattern? | ADDED | Filtering & Query Conditions | — | 2 |
| 471 | What is the difference between IN and a series of OR conditions? | ADDED | Filtering & Query Conditions | — | 3 |
| 472 | How do you implement optional search filters in SQL queries? | ADDED | Filtering & Query Conditions | — | 4 |
| 473 | What problems can arise when using very large IN lists? | ADDED | Filtering & Query Conditions | — | 3 |
| 474 | Does SQL guarantee short-circuit evaluation of AND and OR conditions? | ADDED | Filtering & Query Conditions; SQL Query Execution & Semantics | — | 2 |
| 475 | What is the difference between LIKE and ILIKE? | ADDED | Filtering & Query Conditions; SQL Functions & Expressions | — | 2 |
| 476 | What is the difference between the ANY (SOME) and ALL operators in SQL? | ADDED | Filtering & Query Conditions; Subqueries | — | 2 |
| 477 | How can regular expressions be used in SQL filtering? | ADDED | Filtering & Query Conditions; SQL Functions & Expressions | — | 2 |
| 478 | What is the difference between correlated and non-correlated subqueries? | ADDED | Subqueries | — | 5 |
| 479 | What is a scalar subquery, and when should it be used? | ADDED | Subqueries | — | 3 |
| 480 | What happens when a scalar subquery returns no rows or more than one row? | ADDED | Subqueries; NULL Handling & Conditional Expressions | — | 3 |
| 481 | In which SQL clauses can subqueries be used? | ADDED | Subqueries; SQL Query Execution & Semantics | — | 3 |
| 482 | What is a derived table in SQL? | ADDED | Subqueries | — | 3 |
| 483 | What is the difference between using a JOIN and a subquery to retrieve data? | ADDED | Subqueries; Joins & Table Relationships | — | 4 |
| 484 | Are correlated subqueries always slower than non-correlated subqueries or joins? | ADDED | Subqueries; SQL Query Execution & Semantics | — | 3 |
| 485 | How can subqueries be used in UPDATE and DELETE statements? | ADDED | Subqueries; Data Manipulation (DML) | — | 3 |
| 486 | Write a SQL query to find the second-highest distinct employee salary. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping; Window Functions; Sorting & Pagination | — | 5 |
| 487 | Write a SQL query to find the Nth-highest distinct employee salary. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping; Window Functions; Sorting & Pagination | — | 5 |
| 488 | Write a SQL query to find employees who earn more than the company's average salary. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping | — | 5 |
| 489 | Write a SQL query to find employees who earn more than the average salary in their own department. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping | — | 4 |
| 490 | Write a SQL query to retrieve the highest-paid employees in each department, including ties. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping; Window Functions | — | 4 |
| 491 | What is the difference between a single-row and a multi-row subquery? | ADDED | Subqueries | — | 3 |
| 492 | Can a subquery reference columns from the outer query? | ADDED | Subqueries | — | 3 |
| 493 | How do nested subqueries work in SQL? | ADDED | Subqueries | — | 3 |
| 494 | What problems can arise from using unqualified column names in subqueries? | ADDED | Subqueries; SQL Query Execution & Semantics | — | 2 |
| 495 | Can a subquery return multiple columns? | ADDED | Subqueries | — | 3 |
| 496 | Does a correlated subquery always execute once for every row of the outer query? | ADDED | Subqueries; SQL Query Execution & Semantics | — | 2 |
| 497 | How can you rewrite a correlated subquery using a JOIN? | ADDED | Subqueries; Joins & Table Relationships | — | 3 |
| 498 | What is an UPSERT operation, and how can it be implemented in SQL? | ADDED | Data Manipulation (DML) | — | 4 |
| 499 | Write a SQL query to delete duplicate user records based on their email address, keeping the record with the smallest ID. | ADDED | Data Manipulation (DML); Practical SQL Query Problems; Window Functions; Subqueries | [Previously reported interview (adapted; source not reverified)](https://medium.com/codex/travel-corporation-india-tci-java-backend-interview-experience-3-5-yoe-907f7b9c6b88) | 5 |
| 500 | What is the difference between hard delete and soft delete? | ADDED | Data Manipulation (DML) | — | 4 |
| 501 | How can you increment or decrement a column value atomically using SQL? | ADDED | Data Manipulation (DML) | — | 4 |
| 502 | What happens when an INSERT statement violates a UNIQUE constraint? | ADDED | Data Manipulation (DML) | — | 4 |
| 503 | What happens when a DELETE statement violates a foreign key constraint? | ADDED | Data Manipulation (DML) | — | 4 |
| 504 | What are the advantages and disadvantages of soft deletion? | ADDED | Data Manipulation (DML) | — | 4 |
| 505 | How can you insert multiple rows into a table using a single SQL statement? | ADDED | Data Manipulation (DML) | — | 4 |
| 506 | How can you insert data into a table using the result of a SELECT query? | ADDED | Data Manipulation (DML) | — | 4 |
| 507 | How would you efficiently delete or update a large number of records in a production database? | ADDED | Data Manipulation (DML) | — | 4 |
| 508 | How can you update records in one table based on data from another table? | ADDED | Data Manipulation (DML); Joins & Table Relationships; Subqueries | — | 4 |
| 509 | Write a SQL query to decrease product stock by a requested quantity only if sufficient stock is available. | ADDED | Data Manipulation (DML); Practical SQL Query Problems; Filtering & Query Conditions | — | 4 |
| 510 | Write a SQL query to insert a user if their email does not exist, or update their last login timestamp if it does. | ADDED | Data Manipulation (DML); Practical SQL Query Problems | — | 4 |
| 511 | What is the difference between inserting NULL and using a DEFAULT value? | ADDED | Data Manipulation (DML); NULL Handling & Conditional Expressions | — | 4 |
| 512 | Write a SQL query to delete duplicate records while keeping the most recently created record in each group. | ADDED | Data Manipulation (DML); Practical SQL Query Problems; Window Functions; Subqueries | — | 3 |
| 513 | What is the logical execution order of an SQL SELECT statement? | ADDED | SQL Query Execution & Semantics | — | 5 |
| 514 | Why can't you normally use a column alias defined in SELECT in the WHERE clause, but can use it in ORDER BY? | ADDED | SQL Query Execution & Semantics; Filtering & Query Conditions; Sorting & Pagination | — | 5 |
| 515 | What is the difference between the logical and physical execution order of an SQL query? | ADDED | SQL Query Execution & Semantics | — | 3 |
| 516 | Does an SQL query guarantee the order of returned rows without an ORDER BY clause? | ADDED | SQL Query Execution & Semantics; Sorting & Pagination | — | 4 |
| 517 | What is deterministic ordering, and why is it important when retrieving query results? | ADDED | SQL Query Execution & Semantics; Sorting & Pagination | — | 5 |
| 518 | Why can't window functions be used directly in the WHERE clause? | ADDED | SQL Query Execution & Semantics; Window Functions; Filtering & Query Conditions | — | 3 |
| 519 | How does DISTINCT work when multiple columns are selected? | ADDED | SQL Query Execution & Semantics | — | 4 |
| 520 | Will the following SQL query execute successfully? If not, explain why and correct it. `SELECT salary * 12 AS annual_salary FROM employees WHERE annual_salary > 60000;` | ADDED | SQL Query Execution & Semantics; Practical SQL Query Problems; Filtering & Query Conditions | — | 4 |
| 521 | Does the following query guarantee that the same records will be returned every time? Explain why or why not. `SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;` | ADDED | SQL Query Execution & Semantics; Practical SQL Query Problems; Sorting & Pagination | — | 3 |
| 522 | Does the following query guarantee 10 distinct customer IDs? Explain the logical processing order. `SELECT DISTINCT customer_id FROM orders LIMIT 10;` | ADDED | SQL Query Execution & Semantics; Practical SQL Query Problems; Sorting & Pagination | — | 3 |
| 523 | What is the difference between declarative and procedural programming, and why is SQL considered declarative? | ADDED | SQL Query Execution & Semantics; SQL Fundamentals | — | 3 |
| 524 | Write a SQL query to retrieve the most recent order for each customer. | ADDED | Practical SQL Query Problems; Window Functions; Subqueries; Sorting & Pagination | [Prep (previously cited; not reverified)](https://github.com/sudhir-tech/java-backend-interview-prep/blob/main/05-sql/15-sql-mock-interview-scenarios.md) | 4 |
| 525 | Write a SQL query to retrieve the top three highest-paid employees in each department. | ADDED | Practical SQL Query Problems; Window Functions; Subqueries; Sorting & Pagination | [Prep (previously cited; not reverified)](https://ankurm.com/sql-query-interview-questions-for-java-developers/) | 4 |
| 526 | Write a SQL query to calculate a running total of transactions ordered by date. | ADDED | Practical SQL Query Problems; Window Functions; Aggregation & Grouping | [Prep (previously cited; not reverified)](https://ankurm.com/sql-query-interview-questions-for-java-developers/) | 3 |
| 527 | Write a SQL query to retrieve an employee's entire management hierarchy. | ADDED | Practical SQL Query Problems; Common Table Expressions (CTEs); Joins & Table Relationships | [Prep (previously cited; not reverified)](https://ankurm.com/sql-query-interview-questions-for-java-developers/) | 3 |
| 528 | Write a SQL query to retrieve the previous transaction amount for each customer. | ADDED | Practical SQL Query Problems; Window Functions | [Prep (previously cited; not reverified)](https://ankurm.com/sql-query-interview-questions-for-java-developers/) | 3 |
| 529 | What is a Common Table Expression (CTE), and when should it be used? | ADDED | Common Table Expressions (CTEs) | — | 4 |
| 530 | What is the difference between a CTE and a subquery? | ADDED | Common Table Expressions (CTEs); Subqueries | — | 4 |
| 531 | What is a window function in SQL, and when should it be used? | ADDED | Window Functions | — | 4 |
| 532 | What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK()? | ADDED | Window Functions | — | 5 |
| 533 | What is the difference between UNION and UNION ALL, and which is generally faster? | ADDED | Set Operations | — | 5 |
| 534 | What is the difference between UNION and JOIN? | ADDED | Set Operations; Joins & Table Relationships | — | 4 |
| 535 | What requirements must SELECT statements satisfy when combined using UNION? | ADDED | Set Operations | — | 3 |
| 536 | What is the difference between EXCEPT and INTERSECT? | ADDED | Set Operations | — | 3 |
| 537 | How do you apply ORDER BY to the result of a UNION operation? | ADDED | Set Operations; Sorting & Pagination | — | 2 |
| 538 | How do set operators handle duplicate rows and NULL values? | ADDED | Set Operations; NULL Handling & Conditional Expressions; SQL Query Execution & Semantics | — | 3 |
| 539 | What is the difference between EXCEPT and MINUS? | ADDED | Set Operations | — | 2 |
| 540 | What is the precedence of SQL set operators? | ADDED | Set Operations; SQL Query Execution & Semantics | — | 2 |
| 541 | How can INTERSECT and EXCEPT be implemented using JOIN or EXISTS? | ADDED | Set Operations; Joins & Table Relationships; Subqueries | — | 2 |
| 542 | What is the difference between INTERSECT and INTERSECT ALL? | ADDED | Set Operations | — | 2 |
| 543 | What is the difference between EXCEPT and EXCEPT ALL? | ADDED | Set Operations | — | 2 |
| 544 | How does the database execute set operations internally? | ADDED | Set Operations; SQL Query Execution & Semantics | — | 1 |
| 545 | Write a SQL query to combine customer records from two tables without returning duplicates. | ADDED | Set Operations; Practical SQL Query Problems | — | 3 |
| 546 | Write a SQL query to find records that exist in both tables. | ADDED | Set Operations; Practical SQL Query Problems | — | 3 |
| 547 | Write a SQL query to find records that exist in one table but not in another. | ADDED | Set Operations; Practical SQL Query Problems | — | 3 |
| 548 | How do LIMIT and OFFSET work in SQL? | ADDED | Sorting & Pagination | — | 5 |
| 549 | Why does OFFSET-based pagination become slower for large offsets? | ADDED | Sorting & Pagination | — | 3 |
| 550 | How does keyset pagination work, and how can it be implemented in SQL? | ADDED | Sorting & Pagination | — | 4 |
| 551 | What problems can occur when records are inserted or deleted between paginated requests? | ADDED | Sorting & Pagination | — | 3 |
| 552 | How do you implement pagination when the sorting column contains duplicate values? | ADDED | Sorting & Pagination | — | 3 |
| 553 | How can database indexes improve sorting and pagination performance? | ADDED | Sorting & Pagination | — | 3 |
| 554 | How do you sort SQL query results by multiple columns with different sorting directions? | ADDED | Sorting & Pagination | — | 3 |
| 555 | How are NULL values handled by ORDER BY, and how can their position be controlled? | ADDED | Sorting & Pagination; NULL Handling & Conditional Expressions | — | 3 |
| 556 | How can you efficiently retrieve the total number of records for a paginated query? | ADDED | Sorting & Pagination | — | 3 |
| 557 | What is the difference between LIMIT, TOP, and FETCH FIRST? | ADDED | Sorting & Pagination | — | 2 |
| 558 | What is the difference between sorting data in the database and sorting it in the Java application? | ADDED | Sorting & Pagination | — | 4 |
| 559 | Write a SQL query to retrieve the third page of results, with 20 records per page, ordered by ID. | ADDED | Sorting & Pagination; Practical SQL Query Problems | — | 4 |
| 560 | Write a SQL query to implement keyset pagination using a unique ID. | ADDED | Sorting & Pagination; Practical SQL Query Problems | — | 3 |
| 561 | Write a SQL query to implement keyset pagination using created_at and ID as sorting columns. | ADDED | Sorting & Pagination; Practical SQL Query Problems | — | 3 |
| 562 | Write a SQL query to retrieve the ten most recent orders, ensuring deterministic ordering when multiple orders have the same timestamp. | ADDED | Sorting & Pagination; Practical SQL Query Problems | — | 3 |
| 563 | Write a SQL query to sort employees by department in ascending order and salary in descending order. | ADDED | Sorting & Pagination; Practical SQL Query Problems | — | 4 |
| 564 | Write a SQL query to sort orders according to a custom status order: PENDING, PROCESSING, COMPLETED, CANCELLED. | ADDED | Sorting & Pagination; Practical SQL Query Problems; NULL Handling & Conditional Expressions; SQL Functions & Expressions | — | 3 |
| 565 | What are the advantages and disadvantages of using COUNT(*) OVER() for pagination? | ADDED | Sorting & Pagination; Window Functions; Aggregation & Grouping | — | 2 |
| 566 | How can you implement backward pagination using keyset pagination? | ADDED | Sorting & Pagination | — | 2 |
| 567 | How does sorting by a calculated expression affect index usage? | ADDED | Sorting & Pagination; SQL Functions & Expressions | — | 2 |
| 568 | How can you implement case-insensitive sorting in SQL? | ADDED | Sorting & Pagination | — | 3 |
| 569 | What is the difference between IS NULL and = NULL in SQL? | ADDED | NULL Handling & Conditional Expressions; Filtering & Query Conditions | — | 5 |
| 570 | What is the CASE expression in SQL, and when should it be used? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | — | 4 |
| 571 | How does the COALESCE function work in SQL? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | — | 4 |
| 572 | What is the difference between COALESCE, NVL, IFNULL, and ISNULL? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | — | 3 |
| 573 | What happens when NULL is used in arithmetic expressions? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | — | 3 |
| 574 | What is the difference between a simple CASE expression and a searched CASE expression? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | — | 2 |
| 575 | What happens when no WHEN condition matches in a CASE expression without an ELSE clause? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | — | 2 |
| 576 | How can you compare two nullable columns and treat two NULL values as equal? | ADDED | NULL Handling & Conditional Expressions; Filtering & Query Conditions | — | 2 |
| 577 | How does SQL handle UNKNOWN results in WHERE conditions? | ADDED | NULL Handling & Conditional Expressions; Filtering & Query Conditions | — | 3 |
| 578 | How can NULLIF be used to prevent division-by-zero errors? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | — | 3 |
| 579 | Write a SQL query to replace NULL salary values with zero in the result set. | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions; Practical SQL Query Problems | — | 4 |
| 580 | Write a SQL query to classify employees into salary ranges using a CASE expression. | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions; Practical SQL Query Problems | — | 4 |
| 581 | Write a SQL query to return the first non-NULL value from multiple contact information columns. | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions; Practical SQL Query Problems | — | 3 |
| 582 | Write a SQL query to calculate a ratio without causing a division-by-zero error. | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions; Practical SQL Query Problems | — | 3 |
| 583 | Write a SQL query to find records where two nullable columns contain different values, treating two NULL values as equal. | ADDED | NULL Handling & Conditional Expressions; Filtering & Query Conditions; Practical SQL Query Problems | — | 2 |
| 584 | How does applying a function to an indexed column in a WHERE clause affect query performance? | ADDED | SQL Functions & Expressions; Filtering & Query Conditions | — | 5 |
| 585 | What are the most commonly used SQL string functions, and what are they used for? | ADDED | SQL Functions & Expressions | — | 3 |
| 586 | How can you perform date and time calculations in SQL? | ADDED | SQL Functions & Expressions | — | 3 |
| 587 | What is the difference between ROUND, FLOOR, CEIL, and TRUNCATE? | ADDED | SQL Functions & Expressions | — | 2 |
| 588 | What is the difference between LENGTH and CHAR_LENGTH? | ADDED | SQL Functions & Expressions | — | 2 |
| 589 | How do CONCAT and string concatenation operators handle NULL values? | ADDED | SQL Functions & Expressions; NULL Handling & Conditional Expressions | — | 2 |
| 590 | What is the difference between TRIM, LTRIM, and RTRIM? | ADDED | SQL Functions & Expressions | — | 2 |
| 591 | What is the difference between SUBSTRING and REPLACE? | ADDED | SQL Functions & Expressions | — | 2 |
| 592 | What is the difference between CURRENT_DATE, CURRENT_TIME, and CURRENT_TIMESTAMP? | ADDED | SQL Functions & Expressions | — | 3 |
| 593 | How can you extract individual components from a date or timestamp in SQL? | ADDED | SQL Functions & Expressions | — | 2 |
| 594 | How can you calculate the difference between two dates or timestamps in SQL? | ADDED | SQL Functions & Expressions | — | 2 |
| 595 | How can you extract and filter values from a JSON column using SQL? | ADDED | SQL Functions & Expressions; Filtering & Query Conditions | — | 3 |
| 596 | Write a SQL query to extract the domain name from an email address. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems | — | 2 |
| 597 | Write a SQL query to concatenate an employee's first and last names while handling NULL values. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems; NULL Handling & Conditional Expressions | — | 3 |
| 598 | Write a SQL query to find employees hired during the current calendar year. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems; Filtering & Query Conditions | — | 3 |
| 599 | Write a SQL query to calculate each employee's age from their date of birth. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems | — | 2 |
| 600 | Write a SQL query to calculate the number of days between an order date and its delivery date. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems | — | 3 |
| 601 | Rewrite a query that applies a date function to an indexed timestamp column so that it can efficiently use the index. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems; Filtering & Query Conditions | — | 3 |
| 602 | Write a SQL query to normalize email addresses by removing leading and trailing spaces and converting them to lowercase. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems | — | 3 |
| 603 | Write a SQL query to extract a specific property from a JSON column and filter records by its value. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems; Filtering & Query Conditions | — | 2 |
| 604 | What is the difference between DDL and DML statements? | ADDED | Data Definition (DDL); Data Manipulation (DML); SQL Fundamentals | — | 5 |
| 605 | Can DDL statements be rolled back? How does this behavior differ between PostgreSQL, MySQL, and Oracle? | ADDED | Data Definition (DDL) | — | 3 |
| 606 | What is an implicit commit, and which DDL operations can cause it? | ADDED | Data Definition (DDL) | — | 3 |
| 607 | How do you modify an existing table using ALTER TABLE? | ADDED | Data Definition (DDL) | — | 3 |
| 608 | How would you safely add a NOT NULL column to a large production table containing existing data? | ADDED | Data Definition (DDL) | — | 3 |
| 609 | How can database schema changes affect running applications? | ADDED | Data Definition (DDL) | — | 4 |
| 610 | How do you perform backward-compatible database schema changes? | ADDED | Data Definition (DDL) | — | 3 |
| 611 | How can database schema changes be performed with minimal or zero downtime? | ADDED | Data Definition (DDL) | — | 3 |
| 612 | What is the difference between defining a constraint when creating a table and adding it later? | ADDED | Data Definition (DDL) | — | 2 |
| 613 | What is the difference between CREATE TABLE AS SELECT and INSERT INTO SELECT? | ADDED | Data Definition (DDL); Data Manipulation (DML) | — | 2 |
| 614 | What is the purpose of IF EXISTS and IF NOT EXISTS in DDL statements? | ADDED | Data Definition (DDL) | — | 2 |
| 615 | What risks arise when changing the data type of an existing column? | ADDED | Data Definition (DDL) | — | 3 |
| 616 | What is the difference between identity columns, sequences, and auto-increment columns? | ADDED | Data Definition (DDL) | — | 4 |
| 617 | Can DDL operations lock a table and block concurrent queries? | ADDED | Data Definition (DDL) | — | 3 |
| 618 | What is the difference between DROP CASCADE and DROP RESTRICT? | ADDED | Data Definition (DDL) | — | 2 |
| 619 | Write a SQL statement to create a table with a primary key, a foreign key, a UNIQUE constraint, and a NOT NULL constraint. | ADDED | Data Definition (DDL); Practical SQL Query Problems | — | 3 |
| 620 | Write a SQL statement to add a new column with a default value to an existing table. | ADDED | Data Definition (DDL); Practical SQL Query Problems | — | 3 |
| 621 | Write a SQL statement to add a foreign key constraint to an existing table. | ADDED | Data Definition (DDL); Practical SQL Query Problems | — | 3 |
| 622 | Write a SQL statement to create a composite index on two columns. | ADDED | Data Definition (DDL); Practical SQL Query Problems | — | 3 |
| 623 | How would you safely rename a database column used by multiple running application instances? | ADDED | Data Definition (DDL); Practical SQL Query Problems | — | 3 |
| 624 | How would you introduce a UNIQUE constraint to a production table that already contains duplicate values? | ADDED | Data Definition (DDL); Practical SQL Query Problems | — | 3 |
| 625 | Write a SQL statement to create a new table from the result of a SELECT query. | ADDED | Data Definition (DDL); Practical SQL Query Problems | — | 2 |
| 626 | What are the advantages and disadvantages of using database views? | ADDED | Views | — | 4 |
| 627 | What is the difference between a view and a table? | ADDED | Views | — | 4 |
| 628 | Does a regular database view store data physically? | ADDED | Views | — | 3 |
| 629 | Can using a database view improve query performance? | ADDED | Views | — | 3 |
| 630 | What is the difference between a view and a Common Table Expression (CTE)? | ADDED | Views; Common Table Expressions (CTEs) | — | 3 |
| 631 | Can INSERT, UPDATE, and DELETE statements be executed against a view, and under what conditions? | ADDED | Views; Data Manipulation (DML) | — | 3 |
| 632 | What happens to a view when the structure of its underlying tables changes? | ADDED | Views; Data Definition (DDL) | — | 2 |
| 633 | Can a database view be created using multiple tables and joins? | ADDED | Views; Joins & Table Relationships | — | 3 |
| 634 | When should you use a materialized view instead of executing a complex query repeatedly? | ADDED | Views | — | 3 |
| 635 | Can a view guarantee the order of returned rows? | ADDED | Views; Sorting & Pagination; SQL Query Execution & Semantics | — | 2 |
| 636 | Write a SQL statement to create a view that returns employee information together with department names. | ADDED | Views; Practical SQL Query Problems; Data Definition (DDL); Joins & Table Relationships | — | 3 |
| 637 | Write a SQL statement to create a view that exposes customer information without sensitive personal data. | ADDED | Views; Practical SQL Query Problems; Data Definition (DDL) | — | 2 |
| 638 | Write a SQL statement to create a view that returns total sales for each customer. | ADDED | Views; Practical SQL Query Problems; Data Definition (DDL); Aggregation & Grouping | — | 3 |
| 639 | How would you optimize a reporting query that repeatedly performs expensive joins and aggregations using a materialized view? | ADDED | Views; Practical SQL Query Problems; Joins & Table Relationships; Aggregation & Grouping | — | 3 |
| 640 | What is the difference between standard SQL and database-specific SQL dialects? | ADDED | SQL Fundamentals | — | 3 |
| 641 | What is the difference between an SQL statement and an SQL query? | ADDED | SQL Fundamentals | — | 2 |
| 642 | What are table and column aliases in SQL, and why are they used? | ADDED | SQL Fundamentals | — | 4 |
| 643 | What is the difference between SQL and JPQL? | ADDED | SQL Fundamentals | — | 5 |
| 644 | Is SQL case-sensitive? | ADDED | SQL Fundamentals | — | 3 |
| 645 | What is the difference between single quotes and double quotes in SQL? | ADDED | SQL Fundamentals | — | 2 |
| 646 | What are reserved keywords in SQL, and how can they be used as identifiers? | ADDED | SQL Fundamentals | — | 2 |
| 647 | What is a recursive CTE, and how does it work? | ADDED | Advanced SQL Features; Common Table Expressions (CTEs) | — | 3 |
| 648 | What is SELECT FOR UPDATE, and when should it be used? | ADDED | Advanced SQL Features | — | 5 |
| 649 | What is the difference between FOR UPDATE, NOWAIT, and SKIP LOCKED? | ADDED | Advanced SQL Features | — | 3 |
| 650 | How can the RETURNING clause be used to retrieve data modified by INSERT, UPDATE, or DELETE statements? | ADDED | Advanced SQL Features; Data Manipulation (DML) | — | 3 |
| 651 | What is a LATERAL JOIN, and when should it be used? | ADDED | Advanced SQL Features; Joins & Table Relationships | — | 2 |
| 652 | What is the difference between PIVOT and UNPIVOT operations? | ADDED | Advanced SQL Features | — | 2 |
| 653 | What is a database sequence, and how can it be used in SQL statements? | ADDED | Advanced SQL Features | — | 3 |
| 654 | How can hierarchical data be queried using SQL? | ADDED | Advanced SQL Features; Common Table Expressions (CTEs) | — | 3 |
| 655 | How can SQL be used to implement an atomic job-claiming mechanism for multiple concurrent workers? | ADDED | Advanced SQL Features; Data Manipulation (DML); Practical SQL Query Problems | — | 3 |
| 656 | What is the difference between generated columns and regular columns? | ADDED | Advanced SQL Features; Data Definition (DDL) | — | 2 |
| 657 | What is the difference between virtual and stored generated columns? | ADDED | Advanced SQL Features; Data Definition (DDL) | — | 2 |
| 658 | Write a SQL query to retrieve all descendants of a category in a hierarchical category table using a recursive CTE. | ADDED | Advanced SQL Features; Common Table Expressions (CTEs); Practical SQL Query Problems | — | 3 |
| 659 | Write a SQL query to retrieve and lock the next available job from a database-backed job queue without blocking other workers. | ADDED | Advanced SQL Features; Practical SQL Query Problems | — | 3 |
| 660 | Write a SQL statement that updates a record and returns its updated values in a single database operation. | ADDED | Advanced SQL Features; Data Manipulation (DML); Practical SQL Query Problems | — | 3 |
| 661 | Write a SQL query to transform monthly sales records into columns representing individual months. | ADDED | Advanced SQL Features; Aggregation & Grouping; Practical SQL Query Problems | — | 2 |
| 662 | What are temporal tables, and how do they support historical queries? | ADDED | Advanced SQL Features | — | 2 |

### SQL Topic Priorities & Coverage

| Topic | Priority | Questions | Coverage |
| --- | --- | ---: | --- |
| Joins & Table Relationships | P1 | 38 | 🟢 Good |
| Aggregation & Grouping | P1 | 41 | 🟢 Good |
| Filtering & Query Conditions | P1 | 45 | 🟢 Good |
| Subqueries | P1 | 34 | 🟢 Good |
| Data Manipulation (DML) | P1 | 24 | 🟢 Good |
| SQL Query Execution & Semantics | P1 | 29 | 🟢 Good |
| Practical SQL Query Problems | P1 | 72 | 🟢 Good |
| Common Table Expressions (CTEs) | P2 | 7 | 🟡 Partial |
| Window Functions | P2 | 15 | 🟢 Good |
| Set Operations | P2 | 17 | 🟢 Good |
| Sorting & Pagination | P2 | 34 | 🟢 Good |
| NULL Handling & Conditional Expressions | P2 | 31 | 🟢 Good |
| SQL Functions & Expressions | P2 | 39 | 🟢 Good |
| Data Definition (DDL) | P3 | 29 | 🟢 Good |
| Views | P3 | 15 | 🟢 Good |
| SQL Fundamentals | P3 | 15 | 🟢 Good |
| Advanced SQL Features | P4 | 16 | 🟢 Good |
| **Unique questions** | | **276** | |

Topic counts overlap because questions may have multiple topics. Coverage refers to this SQL catalog only; related DBMS questions are considered during gap analysis to avoid duplicates.

**Priority legend**

- `P1` — Critical: core knowledge expected of a Senior Java Backend Developer.
- `P2` — High: important for backend design and development.
- `P3` — Medium: useful knowledge, typically requiring less depth.
- `P4` — Low: specialized or less commonly required SQL features.

Coverage labels: `🟢 Good`, `🟡 Partial`, `🟠 Weak`, `🔴 Missing`. Priorities and coverage are preliminary expert assessments, not verified interview-frequency findings.

**Evidence note (IDs 409–429):** Candidate wording was approved; source URLs from the preceding discussion were not available for verification, so evidence remains unrecorded.

**Evidence note (IDs 430–456):** Approved candidates; individual source URLs were not available for verification. Evidence remains unrecorded.

**Evidence note (IDs 457–477):** Approved candidates; source URLs from the preceding discussion were not available for verification. Evidence remains unrecorded. Some candidates intentionally extend related DBMS concepts.

**Evidence note (IDs 478–497):** Approved candidates; source URLs from the preceding discussion were not available for verification. Evidence remains unrecorded, including the reported interview for the second-highest salary question.

**Evidence note (IDs 498–512):** User approved all candidates rated 3–5/5 by expert judgment, including overlaps. Ratings are not measured interview frequencies. ID 499 has a previously reported interview link, not independently reverified; remaining evidence is unrecorded.

**Evidence note (IDs 513–523):** Approved candidates rated 3–5/5 by expert judgment; source URLs not verified or recorded. Practical tasks are adapted; SQL snippets are included inline.

**Evidence note (IDs 529–530):** Approved CTE candidates; source URLs not verified, evidence unrecorded.

**Evidence note (IDs 531–532):** Approved Window Functions candidates; source URLs not verified, evidence unrecorded.

**Evidence note (IDs 524–528):** Approved practical tasks; previously cited preparation links retained, not reverified. No confirmed actual interview occurrence.

**Evidence note (IDs 569–583):** Approved candidates rated 3–5/5 by expert judgment; individual interview sources not verified. Evidence remains unrecorded.

**Evidence note (IDs 584–603):** Approved candidates rated 3–5/5 by expert judgment; individual interview sources not verified. Evidence remains unrecorded. Function names and behavior may vary by SQL dialect.

**Evidence note (IDs 604–625):** Approved main and practical DDL candidates rated 3–5/5 by expert judgment; additional candidates excluded. Individual interview sources not verified. Evidence remains unrecorded. DDL behavior varies by database.

**Evidence note (IDs 626–639):** Approved candidates; individual interview sources were not verified. Evidence remains unrecorded. The question on view DML intentionally overlaps with the DBMS updatable views question.

**Evidence note (IDs 640–646):** Approved expert-selected candidates; individual interview evidence was not verified. JPQL comparison intentionally retained in SQL.

**Evidence note (IDs 647–662):** Approved candidates rated 3–5/5 by expert judgment, including temporal tables. Individual interview sources not verified; evidence remains unrecorded. Some questions intentionally overlap existing topics; syntax and support vary by database.
