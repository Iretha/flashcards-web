# SQL Interview Questions

## Research and selection methodology

This catalog targets mainstream technical interviews for Java Developers and Senior Java Developers (including Java backend roles), rather than specialist DBMS, SQL, or DBA roles.

For each subject, we identify thematic areas, rank them by relevance to the target role, tag each question with all directly relevant topics, and assess the existing coverage. We then research each area, prioritizing documented real-world interviews and identifying relevant questions that address gaps or strengthen existing coverage.

We retain source links for new questions and distinguish actual interview evidence from interview-preparation materials and technical references. The latter may support candidate questions but do not establish that they were asked in real interviews. We avoid semantic duplicates across topics and decks, unnecessary specialist detail, and artificial questions generated merely to fill gaps. There is no fixed question-count target.

New questions are reviewed and approved before inclusion, assigned stable IDs, and tagged according to their origin. Topic coverage is reassessed after each update. A question may belong to multiple topics (separated by semicolons); it counts once in each relevant topic and only once in the unique question total. Priorities reflect relevance to the target role independently of current coverage; both priorities and coverage assessments may be refined as new evidence emerges.

## Interview likelihood

<!-- likelihood-scale: v5-1-highest; conversion: IMP-005/1 -->

Historical rating ranges in evidence notes below retain the old 5-highest rubric; current table values use the target scale. Editorial origin is retained; app creationMode remains UNKNOWN without reliable attestation. This catalog requires separately approved answers/task specifications before deck preparation.

Expert ordinal estimate of interview likelihood across mainstream Java Developer and Senior Java Developer roles, not a measured statistical probability or a difficulty score. 1 = Very High (typical/core interview question); 2 = High (highly relevant and likely); 3 = Medium (plausible but less common); 4 = Low (uncommon or stack/project-specific); 5 = Very Low (very unlikely outside academic, DBA or specialist interviews). Basic questions may score highly; technical depth alone does not increase likelihood. Product-specific questions are assessed across general Java roles, not only roles requiring that product. Ratings are independent of topic priority and do not establish interview evidence. All questions were reassessed against this rubric; no new interview-frequency research was conducted.

## Origin labels

- `ORIGINAL`: question from the initial list.
- `ORIGINAL_REVISED`: original question with an approved revision.
- `ADDED`: supplementary question, including replacements with a new knowledge target.

Question IDs are local to this catalog and unique within it. Numbering starts at 1 and is consecutive. New questions receive the next available local ID (currently 277). IDs need not be unique across catalogs.



## Evidence legend

- `Prep`: interview-preparation source (not proof of an actual interview); wording may be adapted.
- `Technical`: technical background only, not interview evidence.
- `Interview`: documented actual interview occurrence. `Interview report (adapted)` identifies a reported interview topic with adapted wording; the report is not independently verified.
- `—`: source not recorded or verified.

## SQL – Interview Questions

| ID | Question | Origin | Topics | Priority | Evidence | Likelihood |
| ---: | --- | --- | --- | --- | --- | ---: |
| 1 | What is SQL? | ORIGINAL | SQL Fundamentals | P3 | — | 1 |
| 2 | What are the types of operators available in SQL? | ORIGINAL | SQL Fundamentals; Filtering & Query Conditions | P1 | — | 3 |
| 3 | What are the subsets of SQL? | ORIGINAL | SQL Fundamentals | P3 | — | 2 |
| 4 | What is a query? | ORIGINAL | SQL Fundamentals | P3 | — | 3 |
| 5 | What is a subquery? What types are there? | ORIGINAL | Subqueries | P1 | — | 1 |
| 6 | What is “SELECT” statement? | ORIGINAL | SQL Fundamentals | P3 | — | 3 |
| 7 | What is a CLAUSE? | ORIGINAL | SQL Fundamentals | P3 | — | 3 |
| 8 | What are UNION (ALL), MINUS and INTERSECT commands? | ORIGINAL | Set Operations | P2 | — | 2 |
| 9 | What is the difference between TRUNCATE, DELETE and DROP statements? | ORIGINAL | Data Definition (DDL); Data Manipulation (DML) | P1 | — | 1 |
| 10 | What is a view in SQL? | ORIGINAL | Views | P3 | — | 1 |
| 11 | What are aggregate and scalar functions? | ORIGINAL | Aggregation & Grouping; SQL Functions & Expressions | P1 | — | 2 |
| 12 | What is a Join in SQL? | ORIGINAL | Joins & Table Relationships | P1 | — | 1 |
| 13 | What is Inner Join in SQL? | ORIGINAL | Joins & Table Relationships | P1 | — | 1 |
| 14 | What is Right Join in SQL? | ORIGINAL | Joins & Table Relationships | P1 | — | 2 |
| 15 | What is Left Join in SQL? | ORIGINAL | Joins & Table Relationships | P1 | — | 1 |
| 16 | What is Full Join in SQL? | ORIGINAL | Joins & Table Relationships | P1 | — | 2 |
| 17 | What is Cross Join? | ORIGINAL | Joins & Table Relationships | P1 | — | 2 |
| 18 | What is self-join and what is the requirement of self-join? | ORIGINAL | Joins & Table Relationships | P1 | — | 2 |
| 19 | What is the usage of the DISTINCT keyword? | ORIGINAL | SQL Query Execution & Semantics | P1 | — | 2 |
| 20 | What is the need for group functions in SQL? | ORIGINAL | Aggregation & Grouping | P1 | — | 2 |
| 21 | What is the need of the MERGE statement? | ORIGINAL | Data Manipulation (DML) | P1 | — | 3 |
| 22 | Name the operator which is used in the query for pattern matching? | ORIGINAL | Filtering & Query Conditions | P1 | — | 2 |
| 23 | What is the difference between INNER JOIN and LEFT JOIN, and when should each be used? | ADDED | Joins & Table Relationships | P1 | — | 1 |
| 24 | What is the difference between INNER JOIN and OUTER JOIN? | ADDED | Joins & Table Relationships | P1 | — | 1 |
| 25 | What is the difference between filtering in the ON clause and the WHERE clause of a LEFT JOIN? | ADDED | Joins & Table Relationships; Filtering & Query Conditions; NULL Handling & Conditional Expressions | P1 | — | 2 |
| 26 | Why might a JOIN return more rows than expected, and how can this problem be resolved? | ADDED | Joins & Table Relationships; SQL Query Execution & Semantics | P1 | — | 2 |
| 27 | How do NULL values affect JOIN operations? | ADDED | Joins & Table Relationships; Filtering & Query Conditions; NULL Handling & Conditional Expressions | P1 | — | 2 |
| 28 | When should you use EXISTS instead of JOIN? | ADDED | Joins & Table Relationships; Subqueries; Filtering & Query Conditions | P1 | — | 2 |
| 29 | How can joining multiple one-to-many relationships lead to incorrect aggregate results? | ADDED | Joins & Table Relationships; Aggregation & Grouping | P1 | — | 2 |
| 30 | Write a SQL query to retrieve all customers who have never placed an order. | ADDED | Joins & Table Relationships; Practical SQL Query Problems | P1 | — | 2 |
| 31 | Write a SQL query to retrieve all customers and their number of orders, including customers with no orders. | ADDED | Joins & Table Relationships; Practical SQL Query Problems; Aggregation & Grouping | P1 | — | 2 |
| 32 | Write a SQL query to retrieve each employee together with their manager's name, including employees without a manager. | ADDED | Joins & Table Relationships; Practical SQL Query Problems | P1 | — | 2 |
| 33 | Write a SQL query to find employees who earn more than their managers. | ADDED | Joins & Table Relationships; Practical SQL Query Problems | P1 | — | 1 |
| 34 | Given two tables containing duplicate and NULL values in their join columns, determine the result of INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN. | ADDED | Joins & Table Relationships; Practical SQL Query Problems; NULL Handling & Conditional Expressions | P1 | — | 2 |
| 35 | What is the difference between LEFT JOIN and RIGHT JOIN? | ADDED | Joins & Table Relationships | P1 | — | 2 |
| 36 | Can you join tables without a foreign key relationship? | ADDED | Joins & Table Relationships | P1 | — | 2 |
| 37 | Can you join tables using multiple columns? | ADDED | Joins & Table Relationships | P1 | — | 2 |
| 38 | How do you join three or more tables in a SQL query? | ADDED | Joins & Table Relationships | P1 | — | 2 |
| 39 | How do you query a many-to-many relationship using a junction table? | ADDED | Joins & Table Relationships | P1 | — | 2 |
| 40 | What is the difference between an explicit JOIN and an implicit JOIN? | ADDED | Joins & Table Relationships | P1 | — | 3 |
| 41 | What is the difference between an equi-join and a non-equi-join? | ADDED | Joins & Table Relationships | P1 | — | 4 |
| 42 | What is a semi-join and an anti-join? | ADDED | Joins & Table Relationships; Subqueries | P1 | — | 4 |
| 43 | How can you emulate FULL OUTER JOIN in MySQL? | ADDED | Joins & Table Relationships; Set Operations | P1 | — | 3 |
| 44 | What is the purpose of the GROUP BY clause in SQL? | ADDED | Aggregation & Grouping | P1 | — | 1 |
| 45 | What is the difference between WHERE and HAVING? | ADDED | Aggregation & Grouping; Filtering & Query Conditions; SQL Query Execution & Semantics | P1 | — | 1 |
| 46 | What is the difference between COUNT(*), COUNT(column), and COUNT(DISTINCT column)? | ADDED | Aggregation & Grouping; NULL Handling & Conditional Expressions | P1 | — | 1 |
| 47 | What is the difference between GROUP BY and DISTINCT? | ADDED | Aggregation & Grouping; SQL Query Execution & Semantics | P1 | — | 2 |
| 48 | Can you select columns that are neither included in the GROUP BY clause nor used in an aggregate function? | ADDED | Aggregation & Grouping; SQL Query Execution & Semantics | P1 | — | 2 |
| 49 | Can you use HAVING without GROUP BY? | ADDED | Aggregation & Grouping; Filtering & Query Conditions; SQL Query Execution & Semantics | P1 | — | 3 |
| 50 | Can you group results by multiple columns in SQL? | ADDED | Aggregation & Grouping | P1 | — | 2 |
| 51 | How does GROUP BY handle NULL values? | ADDED | Aggregation & Grouping; NULL Handling & Conditional Expressions | P1 | — | 2 |
| 52 | What is conditional aggregation, and how can it be implemented using CASE? | ADDED | Aggregation & Grouping; NULL Handling & Conditional Expressions; SQL Functions & Expressions | P1 | — | 3 |
| 53 | Can aggregate functions be used in the WHERE clause? Why or why not? | ADDED | Aggregation & Grouping; Filtering & Query Conditions; SQL Query Execution & Semantics | P1 | — | 2 |
| 54 | Write a SQL query to find duplicate email addresses in a users table. | ADDED | Aggregation & Grouping; Practical SQL Query Problems | P1 | — | 1 |
| 55 | Write a SQL query to calculate the number of employees in each department. | ADDED | Aggregation & Grouping; Practical SQL Query Problems | P1 | — | 2 |
| 56 | Write a SQL query to find departments with more than five employees. | ADDED | Aggregation & Grouping; Practical SQL Query Problems; Filtering & Query Conditions | P1 | — | 2 |
| 57 | Write a SQL query to find the minimum, maximum, and average salary in each department. | ADDED | Aggregation & Grouping; Practical SQL Query Problems | P1 | — | 2 |
| 58 | Write a SQL query to find departments whose average salary exceeds a given threshold. | ADDED | Aggregation & Grouping; Practical SQL Query Problems; Filtering & Query Conditions | P1 | — | 2 |
| 59 | Write a SQL query to find the three customers with the highest total order value. | ADDED | Aggregation & Grouping; Practical SQL Query Problems; Sorting & Pagination | P1 | — | 2 |
| 60 | Write a SQL query to calculate the number of completed, pending, and cancelled orders for each customer. | ADDED | Aggregation & Grouping; Practical SQL Query Problems; NULL Handling & Conditional Expressions | P1 | — | 2 |
| 61 | Write a SQL query to find duplicate records based on a combination of multiple columns. | ADDED | Aggregation & Grouping; Practical SQL Query Problems | P1 | — | 2 |
| 62 | What is the difference between COUNT(*) and COUNT(1)? | ADDED | Aggregation & Grouping | P1 | — | 3 |
| 63 | What do aggregate functions return when no rows match a query? | ADDED | Aggregation & Grouping; NULL Handling & Conditional Expressions | P1 | — | 2 |
| 64 | What is the difference between GROUP BY and ORDER BY? | ADDED | Aggregation & Grouping; Sorting & Pagination | P1 | — | 2 |
| 65 | What is the difference between SUM(column) and SUM(DISTINCT column)? | ADDED | Aggregation & Grouping | P1 | — | 3 |
| 66 | How can you concatenate values from multiple rows into a single string? | ADDED | Aggregation & Grouping; SQL Functions & Expressions | P1 | — | 3 |
| 67 | How can you group records by day, month, or year? | ADDED | Aggregation & Grouping; SQL Functions & Expressions | P1 | — | 3 |
| 68 | How do aggregate functions differ from window functions? | ADDED | Aggregation & Grouping; Window Functions | P1 | — | 3 |
| 69 | What is the difference between GROUP BY and PARTITION BY? | ADDED | Aggregation & Grouping; Window Functions | P1 | — | 3 |
| 70 | What is the FILTER clause for aggregate functions? | ADDED | Aggregation & Grouping; Filtering & Query Conditions | P1 | — | 4 |
| 71 | What is the purpose of the WHERE clause in SQL? | ADDED | Filtering & Query Conditions | P1 | — | 2 |
| 72 | What is the difference between IN and EXISTS, and when should each be used? | ADDED | Filtering & Query Conditions; Subqueries | P1 | — | 1 |
| 73 | What is the difference between NOT IN and NOT EXISTS? | ADDED | Filtering & Query Conditions; Subqueries; NULL Handling & Conditional Expressions | P1 | — | 1 |
| 74 | What is the difference between BETWEEN and explicit range comparisons? | ADDED | Filtering & Query Conditions | P1 | — | 3 |
| 75 | How does the LIKE operator work, and what is the difference between the % and _ wildcards? | ADDED | Filtering & Query Conditions | P1 | — | 2 |
| 76 | What is the precedence of AND, OR, and NOT operators in SQL? | ADDED | Filtering & Query Conditions; SQL Query Execution & Semantics | P1 | — | 3 |
| 77 | How do you perform case-insensitive string comparisons in SQL? | ADDED | Filtering & Query Conditions | P1 | — | 2 |
| 78 | How does the position of a wildcard in a LIKE pattern affect index usage and query performance? | ADDED | Filtering & Query Conditions | P1 | — | 2 |
| 79 | How do you correctly filter records by a date or timestamp range? | ADDED | Filtering & Query Conditions | P1 | — | 2 |
| 80 | Write a SQL query to retrieve all orders created during the last 30 days. | ADDED | Filtering & Query Conditions; Practical SQL Query Problems | P1 | — | 2 |
| 81 | Write a SQL query to retrieve all records created during a specific calendar month, including records with timestamp values. | ADDED | Filtering & Query Conditions; Practical SQL Query Problems | P1 | — | 2 |
| 82 | Write a SQL query to retrieve employees who satisfy a combination of AND and OR conditions, ensuring the correct evaluation order. | ADDED | Filtering & Query Conditions; Practical SQL Query Problems; SQL Query Execution & Semantics | P1 | — | 2 |
| 83 | Write a SQL query to find customers who have placed at least one order, without returning duplicate customers. | ADDED | Filtering & Query Conditions; Practical SQL Query Problems; Subqueries | P1 | — | 2 |
| 84 | How do you escape special wildcard characters in a LIKE pattern? | ADDED | Filtering & Query Conditions | P1 | — | 4 |
| 85 | What is the difference between IN and a series of OR conditions? | ADDED | Filtering & Query Conditions | P1 | — | 3 |
| 86 | How do you implement optional search filters in SQL queries? | ADDED | Filtering & Query Conditions | P1 | — | 2 |
| 87 | What problems can arise when using very large IN lists? | ADDED | Filtering & Query Conditions | P1 | — | 3 |
| 88 | Does SQL guarantee short-circuit evaluation of AND and OR conditions? | ADDED | Filtering & Query Conditions; SQL Query Execution & Semantics | P1 | — | 4 |
| 89 | What is the difference between LIKE and ILIKE? | ADDED | Filtering & Query Conditions; SQL Functions & Expressions | P1 | — | 4 |
| 90 | What is the difference between the ANY (SOME) and ALL operators in SQL? | ADDED | Filtering & Query Conditions; Subqueries | P1 | — | 4 |
| 91 | How can regular expressions be used in SQL filtering? | ADDED | Filtering & Query Conditions; SQL Functions & Expressions | P1 | — | 4 |
| 92 | What is the difference between correlated and non-correlated subqueries? | ADDED | Subqueries | P1 | — | 1 |
| 93 | What is a scalar subquery, and when should it be used? | ADDED | Subqueries | P1 | — | 3 |
| 94 | What happens when a scalar subquery returns no rows or more than one row? | ADDED | Subqueries; NULL Handling & Conditional Expressions | P1 | — | 3 |
| 95 | In which SQL clauses can subqueries be used? | ADDED | Subqueries; SQL Query Execution & Semantics | P1 | — | 3 |
| 96 | What is a derived table in SQL? | ADDED | Subqueries | P1 | — | 3 |
| 97 | What is the difference between using a JOIN and a subquery to retrieve data? | ADDED | Subqueries; Joins & Table Relationships | P1 | — | 2 |
| 98 | Are correlated subqueries always slower than non-correlated subqueries or joins? | ADDED | Subqueries; SQL Query Execution & Semantics | P1 | — | 3 |
| 99 | How can subqueries be used in UPDATE and DELETE statements? | ADDED | Subqueries; Data Manipulation (DML) | P1 | — | 3 |
| 100 | Write a SQL query to find the second-highest distinct employee salary. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping; Window Functions; Sorting & Pagination | P1 | — | 1 |
| 101 | Write a SQL query to find the Nth-highest distinct employee salary. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping; Window Functions; Sorting & Pagination | P1 | — | 1 |
| 102 | Write a SQL query to find employees who earn more than the company's average salary. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping | P1 | — | 1 |
| 103 | Write a SQL query to find employees who earn more than the average salary in their own department. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping | P1 | — | 2 |
| 104 | Write a SQL query to retrieve the highest-paid employees in each department, including ties. | ADDED | Subqueries; Practical SQL Query Problems; Aggregation & Grouping; Window Functions | P1 | — | 2 |
| 105 | What is the difference between a single-row and a multi-row subquery? | ADDED | Subqueries | P1 | — | 3 |
| 106 | Can a subquery reference columns from the outer query? | ADDED | Subqueries | P1 | — | 3 |
| 107 | How do nested subqueries work in SQL? | ADDED | Subqueries | P1 | — | 3 |
| 108 | What problems can arise from using unqualified column names in subqueries? | ADDED | Subqueries; SQL Query Execution & Semantics | P1 | — | 4 |
| 109 | Can a subquery return multiple columns? | ADDED | Subqueries | P1 | — | 3 |
| 110 | Does a correlated subquery always execute once for every row of the outer query? | ADDED | Subqueries; SQL Query Execution & Semantics | P1 | — | 4 |
| 111 | How can you rewrite a correlated subquery using a JOIN? | ADDED | Subqueries; Joins & Table Relationships | P1 | — | 3 |
| 112 | What is an UPSERT operation, and how can it be implemented in SQL? | ADDED | Data Manipulation (DML) | P1 | — | 2 |
| 113 | Write a SQL query to delete duplicate user records based on their email address, keeping the record with the smallest ID. | ADDED | Data Manipulation (DML); Practical SQL Query Problems; Window Functions; Subqueries | P1 | [Previously reported interview (adapted; source not reverified)](https://medium.com/codex/travel-corporation-india-tci-java-backend-interview-experience-3-5-yoe-907f7b9c6b88) | 1 |
| 114 | What is the difference between hard delete and soft delete? | ADDED | Data Manipulation (DML) | P1 | — | 2 |
| 115 | How can you increment or decrement a column value atomically using SQL? | ADDED | Data Manipulation (DML) | P1 | — | 2 |
| 116 | What happens when an INSERT statement violates a UNIQUE constraint? | ADDED | Data Manipulation (DML) | P1 | — | 2 |
| 117 | What happens when a DELETE statement violates a foreign key constraint? | ADDED | Data Manipulation (DML) | P1 | — | 2 |
| 118 | What are the advantages and disadvantages of soft deletion? | ADDED | Data Manipulation (DML) | P1 | — | 2 |
| 119 | How can you insert multiple rows into a table using a single SQL statement? | ADDED | Data Manipulation (DML) | P1 | — | 2 |
| 120 | How can you insert data into a table using the result of a SELECT query? | ADDED | Data Manipulation (DML) | P1 | — | 2 |
| 121 | How would you efficiently delete or update a large number of records in a production database? | ADDED | Data Manipulation (DML) | P1 | — | 2 |
| 122 | How can you update records in one table based on data from another table? | ADDED | Data Manipulation (DML); Joins & Table Relationships; Subqueries | P1 | — | 2 |
| 123 | Write a SQL query to decrease product stock by a requested quantity only if sufficient stock is available. | ADDED | Data Manipulation (DML); Practical SQL Query Problems; Filtering & Query Conditions | P1 | — | 2 |
| 124 | Write a SQL query to insert a user if their email does not exist, or update their last login timestamp if it does. | ADDED | Data Manipulation (DML); Practical SQL Query Problems | P1 | — | 2 |
| 125 | What is the difference between inserting NULL and using a DEFAULT value? | ADDED | Data Manipulation (DML); NULL Handling & Conditional Expressions | P1 | — | 2 |
| 126 | Write a SQL query to delete duplicate records while keeping the most recently created record in each group. | ADDED | Data Manipulation (DML); Practical SQL Query Problems; Window Functions; Subqueries | P1 | — | 3 |
| 127 | What is the logical execution order of an SQL SELECT statement? | ADDED | SQL Query Execution & Semantics | P1 | — | 1 |
| 128 | Why can't you normally use a column alias defined in SELECT in the WHERE clause, but can use it in ORDER BY? | ADDED | SQL Query Execution & Semantics; Filtering & Query Conditions; Sorting & Pagination | P1 | — | 1 |
| 129 | What is the difference between the logical and physical execution order of an SQL query? | ADDED | SQL Query Execution & Semantics | P1 | — | 3 |
| 130 | Does an SQL query guarantee the order of returned rows without an ORDER BY clause? | ADDED | SQL Query Execution & Semantics; Sorting & Pagination | P1 | — | 2 |
| 131 | What is deterministic ordering, and why is it important when retrieving query results? | ADDED | SQL Query Execution & Semantics; Sorting & Pagination | P1 | — | 1 |
| 132 | Why can't window functions be used directly in the WHERE clause? | ADDED | SQL Query Execution & Semantics; Window Functions; Filtering & Query Conditions | P1 | — | 3 |
| 133 | How does DISTINCT work when multiple columns are selected? | ADDED | SQL Query Execution & Semantics | P1 | — | 2 |
| 134 | Will the following SQL query execute successfully? If not, explain why and correct it. `SELECT salary * 12 AS annual_salary FROM employees WHERE annual_salary > 60000;` | ADDED | SQL Query Execution & Semantics; Practical SQL Query Problems; Filtering & Query Conditions | P1 | — | 2 |
| 135 | Does the following query guarantee that the same records will be returned every time? Explain why or why not. `SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;` | ADDED | SQL Query Execution & Semantics; Practical SQL Query Problems; Sorting & Pagination | P1 | — | 3 |
| 136 | Does the following query guarantee 10 distinct customer IDs? Explain the logical processing order. `SELECT DISTINCT customer_id FROM orders LIMIT 10;` | ADDED | SQL Query Execution & Semantics; Practical SQL Query Problems; Sorting & Pagination | P1 | — | 3 |
| 137 | What is the difference between declarative and procedural programming, and why is SQL considered declarative? | ADDED | SQL Query Execution & Semantics; SQL Fundamentals | P1 | — | 3 |
| 138 | Write a SQL query to retrieve the most recent order for each customer. | ADDED | Practical SQL Query Problems; Window Functions; Subqueries; Sorting & Pagination | P1 | [Prep (previously cited; not reverified)](https://github.com/sudhir-tech/java-backend-interview-prep/blob/main/05-sql/15-sql-mock-interview-scenarios.md) | 2 |
| 139 | Write a SQL query to retrieve the top three highest-paid employees in each department. | ADDED | Practical SQL Query Problems; Window Functions; Subqueries; Sorting & Pagination | P1 | [Prep (previously cited; not reverified)](https://ankurm.com/sql-query-interview-questions-for-java-developers/) | 2 |
| 140 | Write a SQL query to calculate a running total of transactions ordered by date. | ADDED | Practical SQL Query Problems; Window Functions; Aggregation & Grouping | P1 | [Prep (previously cited; not reverified)](https://ankurm.com/sql-query-interview-questions-for-java-developers/) | 3 |
| 141 | Write a SQL query to retrieve an employee's entire management hierarchy. | ADDED | Practical SQL Query Problems; Common Table Expressions (CTEs); Joins & Table Relationships | P1 | [Prep (previously cited; not reverified)](https://ankurm.com/sql-query-interview-questions-for-java-developers/) | 3 |
| 142 | Write a SQL query to retrieve the previous transaction amount for each customer. | ADDED | Practical SQL Query Problems; Window Functions | P1 | [Prep (previously cited; not reverified)](https://ankurm.com/sql-query-interview-questions-for-java-developers/) | 3 |
| 143 | What is a Common Table Expression (CTE), and when should it be used? | ADDED | Common Table Expressions (CTEs) | P2 | — | 2 |
| 144 | What is the difference between a CTE and a subquery? | ADDED | Common Table Expressions (CTEs); Subqueries | P1 | — | 2 |
| 145 | What is a window function in SQL, and when should it be used? | ADDED | Window Functions | P2 | — | 2 |
| 146 | What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK()? | ADDED | Window Functions | P2 | — | 1 |
| 147 | What is the difference between UNION and UNION ALL, and which is generally faster? | ADDED | Set Operations | P2 | — | 1 |
| 148 | What is the difference between UNION and JOIN? | ADDED | Set Operations; Joins & Table Relationships | P1 | — | 2 |
| 149 | What requirements must SELECT statements satisfy when combined using UNION? | ADDED | Set Operations | P2 | — | 3 |
| 150 | What is the difference between EXCEPT and INTERSECT? | ADDED | Set Operations | P2 | — | 3 |
| 151 | How do you apply ORDER BY to the result of a UNION operation? | ADDED | Set Operations; Sorting & Pagination | P2 | — | 4 |
| 152 | How do set operators handle duplicate rows and NULL values? | ADDED | Set Operations; NULL Handling & Conditional Expressions; SQL Query Execution & Semantics | P1 | — | 3 |
| 153 | What is the difference between EXCEPT and MINUS? | ADDED | Set Operations | P2 | — | 4 |
| 154 | What is the precedence of SQL set operators? | ADDED | Set Operations; SQL Query Execution & Semantics | P1 | — | 4 |
| 155 | How can INTERSECT and EXCEPT be implemented using JOIN or EXISTS? | ADDED | Set Operations; Joins & Table Relationships; Subqueries | P1 | — | 4 |
| 156 | What is the difference between INTERSECT and INTERSECT ALL? | ADDED | Set Operations | P2 | — | 4 |
| 157 | What is the difference between EXCEPT and EXCEPT ALL? | ADDED | Set Operations | P2 | — | 4 |
| 158 | How does the database execute set operations internally? | ADDED | Set Operations; SQL Query Execution & Semantics | P1 | — | 5 |
| 159 | Write a SQL query to combine customer records from two tables without returning duplicates. | ADDED | Set Operations; Practical SQL Query Problems | P1 | — | 3 |
| 160 | Write a SQL query to find records that exist in both tables. | ADDED | Set Operations; Practical SQL Query Problems | P1 | — | 3 |
| 161 | Write a SQL query to find records that exist in one table but not in another. | ADDED | Set Operations; Practical SQL Query Problems | P1 | — | 3 |
| 162 | How do LIMIT and OFFSET work in SQL? | ADDED | Sorting & Pagination | P2 | — | 1 |
| 163 | Why does OFFSET-based pagination become slower for large offsets? | ADDED | Sorting & Pagination | P2 | — | 3 |
| 164 | How does keyset pagination work, and how can it be implemented in SQL? | ADDED | Sorting & Pagination | P2 | — | 2 |
| 165 | What problems can occur when records are inserted or deleted between paginated requests? | ADDED | Sorting & Pagination | P2 | — | 3 |
| 166 | How do you implement pagination when the sorting column contains duplicate values? | ADDED | Sorting & Pagination | P2 | — | 3 |
| 167 | How can database indexes improve sorting and pagination performance? | ADDED | Sorting & Pagination | P2 | — | 3 |
| 168 | How do you sort SQL query results by multiple columns with different sorting directions? | ADDED | Sorting & Pagination | P2 | — | 3 |
| 169 | How are NULL values handled by ORDER BY, and how can their position be controlled? | ADDED | Sorting & Pagination; NULL Handling & Conditional Expressions | P2 | — | 3 |
| 170 | How can you efficiently retrieve the total number of records for a paginated query? | ADDED | Sorting & Pagination | P2 | — | 3 |
| 171 | What is the difference between LIMIT, TOP, and FETCH FIRST? | ADDED | Sorting & Pagination | P2 | — | 4 |
| 172 | What is the difference between sorting data in the database and sorting it in the Java application? | ADDED | Sorting & Pagination | P2 | — | 2 |
| 173 | Write a SQL query to retrieve the third page of results, with 20 records per page, ordered by ID. | ADDED | Sorting & Pagination; Practical SQL Query Problems | P1 | — | 2 |
| 174 | Write a SQL query to implement keyset pagination using a unique ID. | ADDED | Sorting & Pagination; Practical SQL Query Problems | P1 | — | 3 |
| 175 | Write a SQL query to implement keyset pagination using created_at and ID as sorting columns. | ADDED | Sorting & Pagination; Practical SQL Query Problems | P1 | — | 3 |
| 176 | Write a SQL query to retrieve the ten most recent orders, ensuring deterministic ordering when multiple orders have the same timestamp. | ADDED | Sorting & Pagination; Practical SQL Query Problems | P1 | — | 3 |
| 177 | Write a SQL query to sort employees by department in ascending order and salary in descending order. | ADDED | Sorting & Pagination; Practical SQL Query Problems | P1 | — | 2 |
| 178 | Write a SQL query to sort orders according to a custom status order: PENDING, PROCESSING, COMPLETED, CANCELLED. | ADDED | Sorting & Pagination; Practical SQL Query Problems; NULL Handling & Conditional Expressions; SQL Functions & Expressions | P1 | — | 3 |
| 179 | What are the advantages and disadvantages of using COUNT(*) OVER() for pagination? | ADDED | Sorting & Pagination; Window Functions; Aggregation & Grouping | P1 | — | 4 |
| 180 | How can you implement backward pagination using keyset pagination? | ADDED | Sorting & Pagination | P2 | — | 4 |
| 181 | How does sorting by a calculated expression affect index usage? | ADDED | Sorting & Pagination; SQL Functions & Expressions | P2 | — | 4 |
| 182 | How can you implement case-insensitive sorting in SQL? | ADDED | Sorting & Pagination | P2 | — | 3 |
| 183 | What is the difference between IS NULL and = NULL in SQL? | ADDED | NULL Handling & Conditional Expressions; Filtering & Query Conditions | P1 | — | 1 |
| 184 | What is the CASE expression in SQL, and when should it be used? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | P2 | — | 2 |
| 185 | How does the COALESCE function work in SQL? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | P2 | — | 2 |
| 186 | What is the difference between COALESCE, NVL, IFNULL, and ISNULL? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | P2 | — | 3 |
| 187 | What happens when NULL is used in arithmetic expressions? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | P2 | — | 3 |
| 188 | What is the difference between a simple CASE expression and a searched CASE expression? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | P2 | — | 4 |
| 189 | What happens when no WHEN condition matches in a CASE expression without an ELSE clause? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | P2 | — | 4 |
| 190 | How can you compare two nullable columns and treat two NULL values as equal? | ADDED | NULL Handling & Conditional Expressions; Filtering & Query Conditions | P1 | — | 4 |
| 191 | How does SQL handle UNKNOWN results in WHERE conditions? | ADDED | NULL Handling & Conditional Expressions; Filtering & Query Conditions | P1 | — | 3 |
| 192 | How can NULLIF be used to prevent division-by-zero errors? | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions | P2 | — | 3 |
| 193 | Write a SQL query to replace NULL salary values with zero in the result set. | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions; Practical SQL Query Problems | P1 | — | 2 |
| 194 | Write a SQL query to classify employees into salary ranges using a CASE expression. | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions; Practical SQL Query Problems | P1 | — | 2 |
| 195 | Write a SQL query to return the first non-NULL value from multiple contact information columns. | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions; Practical SQL Query Problems | P1 | — | 3 |
| 196 | Write a SQL query to calculate a ratio without causing a division-by-zero error. | ADDED | NULL Handling & Conditional Expressions; SQL Functions & Expressions; Practical SQL Query Problems | P1 | — | 3 |
| 197 | Write a SQL query to find records where two nullable columns contain different values, treating two NULL values as equal. | ADDED | NULL Handling & Conditional Expressions; Filtering & Query Conditions; Practical SQL Query Problems | P1 | — | 4 |
| 198 | How does applying a function to an indexed column in a WHERE clause affect query performance? | ADDED | SQL Functions & Expressions; Filtering & Query Conditions | P1 | — | 1 |
| 199 | What are the most commonly used SQL string functions, and what are they used for? | ADDED | SQL Functions & Expressions | P2 | — | 3 |
| 200 | How can you perform date and time calculations in SQL? | ADDED | SQL Functions & Expressions | P2 | — | 3 |
| 201 | What is the difference between ROUND, FLOOR, CEIL, and TRUNCATE? | ADDED | SQL Functions & Expressions | P2 | — | 4 |
| 202 | What is the difference between LENGTH and CHAR_LENGTH? | ADDED | SQL Functions & Expressions | P2 | — | 4 |
| 203 | How do CONCAT and string concatenation operators handle NULL values? | ADDED | SQL Functions & Expressions; NULL Handling & Conditional Expressions | P2 | — | 4 |
| 204 | What is the difference between TRIM, LTRIM, and RTRIM? | ADDED | SQL Functions & Expressions | P2 | — | 4 |
| 205 | What is the difference between SUBSTRING and REPLACE? | ADDED | SQL Functions & Expressions | P2 | — | 4 |
| 206 | What is the difference between CURRENT_DATE, CURRENT_TIME, and CURRENT_TIMESTAMP? | ADDED | SQL Functions & Expressions | P2 | — | 3 |
| 207 | How can you extract individual components from a date or timestamp in SQL? | ADDED | SQL Functions & Expressions | P2 | — | 4 |
| 208 | How can you calculate the difference between two dates or timestamps in SQL? | ADDED | SQL Functions & Expressions | P2 | — | 4 |
| 209 | How can you extract and filter values from a JSON column using SQL? | ADDED | SQL Functions & Expressions; Filtering & Query Conditions | P1 | — | 3 |
| 210 | Write a SQL query to extract the domain name from an email address. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems | P1 | — | 4 |
| 211 | Write a SQL query to concatenate an employee's first and last names while handling NULL values. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems; NULL Handling & Conditional Expressions | P1 | — | 3 |
| 212 | Write a SQL query to find employees hired during the current calendar year. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems; Filtering & Query Conditions | P1 | — | 3 |
| 213 | Write a SQL query to calculate each employee's age from their date of birth. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems | P1 | — | 4 |
| 214 | Write a SQL query to calculate the number of days between an order date and its delivery date. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems | P1 | — | 3 |
| 215 | Rewrite a query that applies a date function to an indexed timestamp column so that it can efficiently use the index. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems; Filtering & Query Conditions | P1 | — | 3 |
| 216 | Write a SQL query to normalize email addresses by removing leading and trailing spaces and converting them to lowercase. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems | P1 | — | 3 |
| 217 | Write a SQL query to extract a specific property from a JSON column and filter records by its value. | ADDED | SQL Functions & Expressions; Practical SQL Query Problems; Filtering & Query Conditions | P1 | — | 4 |
| 218 | What is the difference between DDL and DML statements? | ADDED | Data Definition (DDL); Data Manipulation (DML); SQL Fundamentals | P1 | — | 1 |
| 219 | Can DDL statements be rolled back? How does this behavior differ between PostgreSQL, MySQL, and Oracle? | ADDED | Data Definition (DDL) | P3 | — | 3 |
| 220 | What is an implicit commit, and which DDL operations can cause it? | ADDED | Data Definition (DDL) | P3 | — | 3 |
| 221 | How do you modify an existing table using ALTER TABLE? | ADDED | Data Definition (DDL) | P3 | — | 3 |
| 222 | How would you safely add a NOT NULL column to a large production table containing existing data? | ADDED | Data Definition (DDL) | P3 | — | 3 |
| 223 | How can database schema changes affect running applications? | ADDED | Data Definition (DDL) | P3 | — | 2 |
| 224 | How do you perform backward-compatible database schema changes? | ADDED | Data Definition (DDL) | P3 | — | 3 |
| 225 | How can database schema changes be performed with minimal or zero downtime? | ADDED | Data Definition (DDL) | P3 | — | 3 |
| 226 | What is the difference between defining a constraint when creating a table and adding it later? | ADDED | Data Definition (DDL) | P3 | — | 4 |
| 227 | What is the difference between CREATE TABLE AS SELECT and INSERT INTO SELECT? | ADDED | Data Definition (DDL); Data Manipulation (DML) | P1 | — | 4 |
| 228 | What is the purpose of IF EXISTS and IF NOT EXISTS in DDL statements? | ADDED | Data Definition (DDL) | P3 | — | 4 |
| 229 | What risks arise when changing the data type of an existing column? | ADDED | Data Definition (DDL) | P3 | — | 3 |
| 230 | What is the difference between identity columns, sequences, and auto-increment columns? | ADDED | Data Definition (DDL) | P3 | — | 2 |
| 231 | Can DDL operations lock a table and block concurrent queries? | ADDED | Data Definition (DDL) | P3 | — | 3 |
| 232 | What is the difference between DROP CASCADE and DROP RESTRICT? | ADDED | Data Definition (DDL) | P3 | — | 4 |
| 233 | Write a SQL statement to create a table with a primary key, a foreign key, a UNIQUE constraint, and a NOT NULL constraint. | ADDED | Data Definition (DDL); Practical SQL Query Problems | P1 | — | 3 |
| 234 | Write a SQL statement to add a new column with a default value to an existing table. | ADDED | Data Definition (DDL); Practical SQL Query Problems | P1 | — | 3 |
| 235 | Write a SQL statement to add a foreign key constraint to an existing table. | ADDED | Data Definition (DDL); Practical SQL Query Problems | P1 | — | 3 |
| 236 | Write a SQL statement to create a composite index on two columns. | ADDED | Data Definition (DDL); Practical SQL Query Problems | P1 | — | 3 |
| 237 | How would you safely rename a database column used by multiple running application instances? | ADDED | Data Definition (DDL); Practical SQL Query Problems | P1 | — | 3 |
| 238 | How would you introduce a UNIQUE constraint to a production table that already contains duplicate values? | ADDED | Data Definition (DDL); Practical SQL Query Problems | P1 | — | 3 |
| 239 | Write a SQL statement to create a new table from the result of a SELECT query. | ADDED | Data Definition (DDL); Practical SQL Query Problems | P1 | — | 4 |
| 240 | What are the advantages and disadvantages of using database views? | ADDED | Views | P3 | — | 2 |
| 241 | What is the difference between a view and a table? | ADDED | Views | P3 | — | 2 |
| 242 | Does a regular database view store data physically? | ADDED | Views | P3 | — | 3 |
| 243 | Can using a database view improve query performance? | ADDED | Views | P3 | — | 3 |
| 244 | What is the difference between a view and a Common Table Expression (CTE)? | ADDED | Views; Common Table Expressions (CTEs) | P2 | — | 3 |
| 245 | Can INSERT, UPDATE, and DELETE statements be executed against a view, and under what conditions? | ADDED | Views; Data Manipulation (DML) | P1 | — | 3 |
| 246 | What happens to a view when the structure of its underlying tables changes? | ADDED | Views; Data Definition (DDL) | P3 | — | 4 |
| 247 | Can a database view be created using multiple tables and joins? | ADDED | Views; Joins & Table Relationships | P1 | — | 3 |
| 248 | When should you use a materialized view instead of executing a complex query repeatedly? | ADDED | Views | P3 | — | 3 |
| 249 | Can a view guarantee the order of returned rows? | ADDED | Views; Sorting & Pagination; SQL Query Execution & Semantics | P1 | — | 4 |
| 250 | Write a SQL statement to create a view that returns employee information together with department names. | ADDED | Views; Practical SQL Query Problems; Data Definition (DDL); Joins & Table Relationships | P1 | — | 3 |
| 251 | Write a SQL statement to create a view that exposes customer information without sensitive personal data. | ADDED | Views; Practical SQL Query Problems; Data Definition (DDL) | P1 | — | 4 |
| 252 | Write a SQL statement to create a view that returns total sales for each customer. | ADDED | Views; Practical SQL Query Problems; Data Definition (DDL); Aggregation & Grouping | P1 | — | 3 |
| 253 | How would you optimize a reporting query that repeatedly performs expensive joins and aggregations using a materialized view? | ADDED | Views; Practical SQL Query Problems; Joins & Table Relationships; Aggregation & Grouping | P1 | — | 3 |
| 254 | What is the difference between standard SQL and database-specific SQL dialects? | ADDED | SQL Fundamentals | P3 | — | 3 |
| 255 | What is the difference between an SQL statement and an SQL query? | ADDED | SQL Fundamentals | P3 | — | 4 |
| 256 | What are table and column aliases in SQL, and why are they used? | ADDED | SQL Fundamentals | P3 | — | 2 |
| 257 | What is the difference between SQL and JPQL? | ADDED | SQL Fundamentals | P3 | — | 1 |
| 258 | Is SQL case-sensitive? | ADDED | SQL Fundamentals | P3 | — | 3 |
| 259 | What is the difference between single quotes and double quotes in SQL? | ADDED | SQL Fundamentals | P3 | — | 4 |
| 260 | What are reserved keywords in SQL, and how can they be used as identifiers? | ADDED | SQL Fundamentals | P3 | — | 4 |
| 261 | What is a recursive CTE, and how does it work? | ADDED | Advanced SQL Features; Common Table Expressions (CTEs) | P2 | — | 3 |
| 262 | What is SELECT FOR UPDATE, and when should it be used? | ADDED | Advanced SQL Features | P4 | — | 1 |
| 263 | What is the difference between FOR UPDATE, NOWAIT, and SKIP LOCKED? | ADDED | Advanced SQL Features | P4 | — | 3 |
| 264 | How can the RETURNING clause be used to retrieve data modified by INSERT, UPDATE, or DELETE statements? | ADDED | Advanced SQL Features; Data Manipulation (DML) | P1 | — | 3 |
| 265 | What is a LATERAL JOIN, and when should it be used? | ADDED | Advanced SQL Features; Joins & Table Relationships | P1 | — | 4 |
| 266 | What is the difference between PIVOT and UNPIVOT operations? | ADDED | Advanced SQL Features | P4 | — | 4 |
| 267 | What is a database sequence, and how can it be used in SQL statements? | ADDED | Advanced SQL Features | P4 | — | 3 |
| 268 | How can hierarchical data be queried using SQL? | ADDED | Advanced SQL Features; Common Table Expressions (CTEs) | P2 | — | 3 |
| 269 | How can SQL be used to implement an atomic job-claiming mechanism for multiple concurrent workers? | ADDED | Advanced SQL Features; Data Manipulation (DML); Practical SQL Query Problems | P1 | — | 3 |
| 270 | What is the difference between generated columns and regular columns? | ADDED | Advanced SQL Features; Data Definition (DDL) | P3 | — | 4 |
| 271 | What is the difference between virtual and stored generated columns? | ADDED | Advanced SQL Features; Data Definition (DDL) | P3 | — | 4 |
| 272 | Write a SQL query to retrieve all descendants of a category in a hierarchical category table using a recursive CTE. | ADDED | Advanced SQL Features; Common Table Expressions (CTEs); Practical SQL Query Problems | P1 | — | 3 |
| 273 | Write a SQL query to retrieve and lock the next available job from a database-backed job queue without blocking other workers. | ADDED | Advanced SQL Features; Practical SQL Query Problems | P1 | — | 3 |
| 274 | Write a SQL statement that updates a record and returns its updated values in a single database operation. | ADDED | Advanced SQL Features; Data Manipulation (DML); Practical SQL Query Problems | P1 | — | 3 |
| 275 | Write a SQL query to transform monthly sales records into columns representing individual months. | ADDED | Advanced SQL Features; Aggregation & Grouping; Practical SQL Query Problems | P1 | — | 4 |
| 276 | What are temporal tables, and how do they support historical queries? | ADDED | Advanced SQL Features | P4 | — | 4 |

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

**Evidence note (IDs 23–429):** Candidate wording was approved; source URLs from the preceding discussion were not available for verification, so evidence remains unrecorded.

**Evidence note (IDs 44–456):** Approved candidates; individual source URLs were not available for verification. Evidence remains unrecorded.

**Evidence note (IDs 71–477):** Approved candidates; source URLs from the preceding discussion were not available for verification. Evidence remains unrecorded. Some candidates intentionally extend related DBMS concepts.

**Evidence note (IDs 92–497):** Approved candidates; source URLs from the preceding discussion were not available for verification. Evidence remains unrecorded, including the reported interview for the second-highest salary question.

**Evidence note (IDs 112–512):** User approved all candidates rated 3–5/5 by expert judgment, including overlaps. Ratings are not measured interview frequencies. ID 113 has a previously reported interview link, not independently reverified; remaining evidence is unrecorded.

**Evidence note (IDs 127–523):** Approved candidates rated 3–5/5 by expert judgment; source URLs not verified or recorded. Practical tasks are adapted; SQL snippets are included inline.

**Evidence note (IDs 143–530):** Approved CTE candidates; source URLs not verified, evidence unrecorded.

**Evidence note (IDs 145–532):** Approved Window Functions candidates; source URLs not verified, evidence unrecorded.

**Evidence note (IDs 138–528):** Approved practical tasks; previously cited preparation links retained, not reverified. No confirmed actual interview occurrence.

**Evidence note (IDs 183–583):** Approved candidates rated 3–5/5 by expert judgment; individual interview sources not verified. Evidence remains unrecorded.

**Evidence note (IDs 198–603):** Approved candidates rated 3–5/5 by expert judgment; individual interview sources not verified. Evidence remains unrecorded. Function names and behavior may vary by SQL dialect.

**Evidence note (IDs 218–625):** Approved main and practical DDL candidates rated 3–5/5 by expert judgment; additional candidates excluded. Individual interview sources not verified. Evidence remains unrecorded. DDL behavior varies by database.

**Evidence note (IDs 240–639):** Approved candidates; individual interview sources were not verified. Evidence remains unrecorded. The question on view DML intentionally overlaps with the DBMS updatable views question.

**Evidence note (IDs 254–646):** Approved expert-selected candidates; individual interview evidence was not verified. JPQL comparison intentionally retained in SQL.

**Evidence note (IDs 261–662):** Approved candidates rated 3–5/5 by expert judgment, including temporal tables. Individual interview sources not verified; evidence remains unrecorded. Some questions intentionally overlap existing topics; syntax and support vary by database.
