# JDBC Interview Questions

## Research and selection methodology

This catalog targets mainstream technical interviews for Java Developers and Senior Java Developers (including Java backend roles), rather than specialist DBMS, SQL, or DBA roles.

For each subject, we identify thematic areas, rank them by relevance to the target role, tag each question with all directly relevant topics, and assess the existing coverage. We then research each area, prioritizing documented real-world interviews and identifying relevant questions that address gaps or strengthen existing coverage.

We retain source links for new questions and distinguish actual interview evidence from interview-preparation materials and technical references. The latter may support candidate questions but do not establish that they were asked in real interviews. We avoid semantic duplicates across topics and decks, unnecessary specialist detail, and artificial questions generated merely to fill gaps. There is no fixed question-count target.

New questions are reviewed and approved before inclusion, assigned stable IDs, and tagged according to their origin. Topic coverage is reassessed after each update. A question may belong to multiple topics (separated by semicolons); it counts once in each relevant topic and only once in the unique question total. Priorities reflect relevance to the target role independently of current coverage; both priorities and coverage assessments may be refined as new evidence emerges.

## Interview likelihood (Вероятност)

Expert ordinal estimate of interview likelihood across mainstream Java Developer and Senior Java Developer roles, not a measured statistical probability or a difficulty score. 5 = typical/core interview question; 4 = highly relevant and likely; 3 = plausible but less common; 2 = uncommon or stack/project-specific; 1 = very unlikely outside academic, DBA or specialist interviews. Basic questions may score highly; technical depth alone does not increase likelihood. Product-specific questions are assessed across general Java roles, not only roles requiring that product. Ratings are independent of topic priority and do not establish interview evidence. All existing JDBC questions were assessed against this rubric; no new interview-frequency research was conducted.

## Origin labels

- `ORIGINAL`: question from the initial list.
- `ORIGINAL_REVISED`: original question with an approved revision.
- `ADDED`: supplementary question, including replacements with a new knowledge target.

Question IDs are local to this catalog and unique within it. Numbering starts at 1 and is consecutive. New questions receive the next available local ID (currently 193). IDs need not be unique across catalogs.

## Evidence legend

- `Prep`: interview-preparation source (not proof of an actual interview); wording may be adapted.
- `Technical`: technical background only, not interview evidence.
- `Interview`: documented actual interview occurrence. `Interview report (adapted)` identifies a reported interview topic with adapted wording; the report is not independently verified.
- `—`: source not recorded or verified.

## JDBC – Interview Questions

| ID | Question | Origin | Topics | Evidence | Вероятност |
| ---: | --- | --- | --- | --- | ---: |
| 1 | What is JDBC? | ORIGINAL | JDBC Fundamentals & Drivers | — | 5 |
| 2 | What is a JDBC Driver? | ORIGINAL | JDBC Fundamentals & Drivers | — | 4 |
| 3 | What are the steps to connect to a database using JDBC in Java? | ORIGINAL_REVISED | JDBC Fundamentals & Drivers; Connection Management & Pooling | — | 5 |
| 4 | What are the JDBC API components? | ORIGINAL | JDBC Fundamentals & Drivers | — | 4 |
| 5 | What is the role of the JDBC DriverManager class? | ORIGINAL | JDBC Fundamentals & Drivers; Connection Management & Pooling | — | 4 |
| 6 | What is the role of the Connection? | ORIGINAL | Connection Management & Pooling | — | 4 |
| 7 | What is the JDBC ResultSet? | ORIGINAL | ResultSet & Data Mapping | — | 5 |
| 8 | What is the JDBC ResultSetMetaData? | ORIGINAL | Metadata; ResultSet & Data Mapping | — | 3 |
| 9 | What is the JDBC DatabaseMetaData? | ORIGINAL | Metadata | — | 3 |
| 10 | What is RowSet? | ORIGINAL | RowSet | — | 2 |
| 11 | RowSet vs ResultSet | ORIGINAL | RowSet; ResultSet & Data Mapping | — | 2 |
| 12 | Name the types of sql statements and when to use each of them? | ORIGINAL | Statements & Query Execution | — | 5 |
| 13 | What are the differences between execute, executeQuery, and executeUpdate? | ORIGINAL | Statements & Query Execution | — | 5 |
| 14 | Which interface is responsible for transaction management in JDBC? | ORIGINAL | Transaction Management; Connection Management & Pooling | — | 4 |
| 15 | What is batch processing? | ORIGINAL | Batch Processing; Performance & Optimization | — | 5 |
| 16 | What are the advantages and disadvantages of batch processing? | ORIGINAL | Batch Processing; Performance & Optimization | — | 4 |
| 17 | What are JDBC Best Practices? | ORIGINAL | Resource Management & Exception Handling; Performance & Optimization; Security; Connection Management & Pooling | — | 4 |
| 18 | What is the difference between DriverManager and DataSource in JDBC? | ADDED | Connection Management & Pooling; JDBC Fundamentals & Drivers | — | 5 |
| 19 | What is Connection Pooling in Database? | ORIGINAL | Connection Management & Pooling; Performance & Optimization | — | 5 |
| 20 | What is the difference between java.util.Date and java.sql.Date? | ORIGINAL | JDBC Data Types; ResultSet & Data Mapping | — | 4 |
| 21 | What is benefit of using PreparedStatement in Java | ORIGINAL | Statements & Query Execution; Security; Performance & Optimization | — | 5 |
| 22 | What is the use of setAutoCommit(false) in JDBC? | ORIGINAL | Transaction Management | — | 5 |
| 23 | What things would you care about to improve the performance of Application if its identified that its DB communication that needs to be improved? | ORIGINAL | Performance & Optimization | — | 5 |
| 24 | How can you acquire and release database row locks using JDBC? | ADDED | Concurrency & Locking; Transaction Management | — | 3 |
| 25 | Is `Class.forName()` required to load a JDBC driver in modern Java applications? How does automatic driver discovery work? | ADDED | JDBC Fundamentals & Drivers | [Technical](https://docs.oracle.com/javase/8/docs/api/java/sql/DriverManager.html) | 5 |
| 26 | What are the four types of JDBC drivers, and which type is commonly used in modern Java applications? | ADDED | JDBC Fundamentals & Drivers | [Prep](https://www.geeksforgeeks.org/advance-java/jdbc-interview-questions/) | 4 |
| 27 | How does `DriverManager` select a JDBC driver when multiple drivers are available? | ADDED | JDBC Fundamentals & Drivers | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DriverManager.html) | 4 |
| 28 | What is the purpose of a JDBC connection URL, and how does its format vary between database vendors? | ADDED | JDBC Fundamentals & Drivers; Connection Management & Pooling | [Prep](https://www.tutorialspoint.com/jdbc/jdbc_interview_questions.htm) | 4 |
| 29 | How does JDBC provide database-independent access, and what are its portability limitations? | ADDED | JDBC Fundamentals & Drivers | [Prep](https://www.geeksforgeeks.org/advance-java/jdbc-interview-questions/) | 3 |
| 30 | How would you troubleshoot a `No suitable driver found` error when opening a JDBC connection? | ADDED | JDBC Fundamentals & Drivers; Resource Management & Exception Handling; Connection Management & Pooling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DriverManager.html) | 3 |
| 31 | What is the difference between the JDBC API and a JDBC driver implementation? | ADDED | JDBC Fundamentals & Drivers | [Prep](https://www.geeksforgeeks.org/advance-java/jdbc-interview-questions/) | 3 |
| 32 | How can class loaders affect JDBC driver discovery and availability in Java applications? | ADDED | JDBC Fundamentals & Drivers | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DriverManager.html) | 2 |
| 33 | How does a JDBC connection pool work, and why is it preferable to opening a new database connection for every request? | ADDED | Connection Management & Pooling; Performance & Optimization | [Technical](https://docs.oracle.com/en/database/oracle/oracle-database/26/jjdbc/statement-and-resultset-caching.html) | 5 |
| 34 | What happens when you call `close()` on a pooled JDBC connection? | ADDED | Connection Management & Pooling; Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/database/oracle/oracle-database/26/jjdbc/statement-and-resultset-caching.html) | 5 |
| 35 | What is a database connection leak, and how can you prevent and detect it? | ADDED | Connection Management & Pooling; Resource Management & Exception Handling | [Technical](https://github.com/brettwooldridge/HikariCP) | 4 |
| 36 | What happens when all connections in a connection pool are in use? | ADDED | Connection Management & Pooling; Resource Management & Exception Handling | [Technical](https://github.com/brettwooldridge/HikariCP) | 4 |
| 37 | How do you determine the appropriate connection pool size for a Java application? | ADDED | Connection Management & Pooling; Performance & Optimization | [Technical](https://github.com/brettwooldridge/HikariCP) | 4 |
| 38 | How would you troubleshoot connection pool exhaustion in a production Java application? | ADDED | Connection Management & Pooling; Resource Management & Exception Handling; Performance & Optimization | [Technical](https://github.com/brettwooldridge/HikariCP) | 4 |
| 39 | Can increasing the database connection pool size decrease application performance? Why? | ADDED | Connection Management & Pooling; Performance & Optimization | [Technical](https://github.com/brettwooldridge/HikariCP) | 4 |
| 40 | What are the most important HikariCP configuration parameters? | ADDED | Connection Management & Pooling; Performance & Optimization | [Technical](https://github.com/brettwooldridge/HikariCP) | 4 |
| 41 | What is the difference between connection acquisition timeout, database login timeout, socket timeout, and query timeout? | ADDED | Connection Management & Pooling; Resource Management & Exception Handling | [Technical (partial)](https://docs.oracle.com/en/database/oracle/oracle-database/26/jjdbc/JDBC-troubleshooting.html) | 3 |
| 42 | Is a JDBC Connection thread-safe? Should multiple threads share the same connection? | ADDED | Connection Management & Pooling; Concurrency & Locking | [Technical](https://docs.oracle.com/en/database/oracle/oracle-database/19/jjdbc/jdbc-developers-guide.pdf) | 3 |
| 43 | How does a connection pool validate database connections and handle broken or stale connections? | ADDED | Connection Management & Pooling; Resource Management & Exception Handling | [Technical](https://github.com/brettwooldridge/HikariCP) | 3 |
| 44 | What happens to connection state, such as auto-commit and transaction isolation, when a connection is returned to the pool? | ADDED | Connection Management & Pooling; Transaction Management | [Technical (partial)](https://github.com/brettwooldridge/HikariCP) | 3 |
| 45 | What connection pool metrics should you monitor in a production application? | ADDED | Connection Management & Pooling; Performance & Optimization | [Technical](https://github.com/brettwooldridge/HikariCP) | 3 |
| 46 | How should database connection pools be sized when an application runs across multiple instances? | ADDED | Connection Management & Pooling; Performance & Optimization | [Technical (partial)](https://github.com/brettwooldridge/HikariCP) | 3 |
| 47 | How do virtual threads affect database connection pooling in Java applications? | ADDED | Connection Management & Pooling; Performance & Optimization; Concurrency & Locking | — | 3 |
| 48 | Can acquiring multiple database connections within a single operation lead to connection pool deadlock? | ADDED | Connection Management & Pooling; Concurrency & Locking | [Technical](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing) | 2 |
| 49 | What is the difference between `DataSource`, `ConnectionPoolDataSource`, and `PooledConnection`? | ADDED | Connection Management & Pooling; JDBC Fundamentals & Drivers | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/javax/sql/package-summary.html) | 2 |
| 50 | What is the difference between fixed-size and dynamically sized connection pools? | ADDED | Connection Management & Pooling | [Technical](https://github.com/brettwooldridge/HikariCP) | 2 |
| 51 | How does `PreparedStatement` prevent SQL injection? | ADDED | Statements & Query Execution; Security | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | 5 |
| 52 | Can `PreparedStatement` be used to parameterize table names, column names, or SQL keywords? | ADDED | Statements & Query Execution; Security | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | 4 |
| 53 | How do you bind parameters to a `PreparedStatement` in JDBC? | ADDED | Statements & Query Execution; JDBC Data Types | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 4 |
| 54 | How do you execute a stored procedure using JDBC? | ADDED | Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/CallableStatement.html) | 4 |
| 55 | How do you retrieve database-generated primary keys after an INSERT using JDBC? | ADDED | Statements & Query Execution; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 4 |
| 56 | How can you reuse a `PreparedStatement` to execute the same SQL with different parameter values? | ADDED | Statements & Query Execution; Performance & Optimization | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 4 |
| 57 | Does `PreparedStatement` always result in server-side SQL precompilation and execution plan reuse? | ADDED | Statements & Query Execution; Performance & Optimization | [Technical](https://jdbc.postgresql.org/documentation/server-prepare/) | 4 |
| 58 | How do you configure a JDBC query timeout, and what happens when it expires? | ADDED | Statements & Query Execution; Performance & Optimization; Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 4 |
| 59 | How do you safely construct a dynamic SQL query with a variable number of parameters in an `IN` clause? | ADDED | Statements & Query Execution; Security | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 4 |
| 60 | How do you pass and retrieve IN, OUT, and INOUT parameters using `CallableStatement`? | ADDED | Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/CallableStatement.html) | 3 |
| 61 | How do you bind SQL NULL values using `PreparedStatement`? | ADDED | Statements & Query Execution; JDBC Data Types | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 3 |
| 62 | What does `executeUpdate()` return, and how can its return value be used to verify the outcome of an operation? | ADDED | Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 3 |
| 63 | What happens to an open `ResultSet` when its `Statement` is closed or executed again? | ADDED | Statements & Query Execution; Resource Management & Exception Handling; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 3 |
| 64 | What is prepared statement caching, and how does it differ from reusing a `PreparedStatement` object? | ADDED | Statements & Query Execution; Performance & Optimization | [Technical](https://jdbc.postgresql.org/documentation/server-prepare/) | 3 |
| 65 | How can you cancel a running JDBC statement, and what are the limitations? | ADDED | Statements & Query Execution; Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 3 |
| 66 | Is it safe to share a JDBC `PreparedStatement` between multiple threads? | ADDED | Statements & Query Execution; Concurrency & Locking | — | 3 |
| 67 | Does standard JDBC support named parameters in `PreparedStatement`? | ADDED | Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 2 |
| 68 | How do you execute multiple SQL statements within a single JDBC transaction? | ADDED | Transaction Management | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 5 |
| 69 | How do you handle exceptions and ensure that a JDBC transaction is rolled back correctly? | ADDED | Transaction Management; Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 5 |
| 70 | What is the default auto-commit mode in JDBC, and when is a statement automatically committed? | ADDED | Transaction Management; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 4 |
| 71 | How do you configure and retrieve the transaction isolation level using JDBC? | ADDED | Transaction Management; Concurrency & Locking | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 4 |
| 72 | How do you create a savepoint and roll back part of a transaction using JDBC? | ADDED | Transaction Management | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 4 |
| 73 | Can SQL statements executed through different JDBC connections participate in the same local transaction? | ADDED | Transaction Management; Connection Management & Pooling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 4 |
| 74 | What happens if a JDBC connection is closed before an active transaction is committed or rolled back? | ADDED | Transaction Management; Resource Management & Exception Handling; Connection Management & Pooling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 4 |
| 75 | What happens to an active transaction when `setAutoCommit(true)` is called? | ADDED | Transaction Management; Connection Management & Pooling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 4 |
| 76 | How do `commit()` and `rollback()` affect subsequent transactions when auto-commit remains disabled? | ADDED | Transaction Management | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 3 |
| 77 | Does a `SQLException` automatically roll back a JDBC transaction? | ADDED | Transaction Management; Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 3 |
| 78 | What does `Connection.setReadOnly(true)` do, and does it guarantee that write operations are prevented? | ADDED | Transaction Management; Connection Management & Pooling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 3 |
| 79 | What happens if the database connection is lost during `commit()`, and is it safe to retry the transaction? | ADDED | Transaction Management; Resource Management & Exception Handling; Connection Management & Pooling | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 3 |
| 80 | Can executing DDL statements inside a JDBC transaction cause an implicit commit? | ADDED | Transaction Management | [Technical (vendor-specific)](https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html) | 3 |
| 81 | How can you determine whether a JDBC driver supports a particular transaction isolation level or savepoints? | ADDED | Transaction Management; Metadata | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DatabaseMetaData.html) | 2 |
| 82 | What happens when the transaction isolation level is changed during an active JDBC transaction? | ADDED | Transaction Management; Concurrency & Locking | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 2 |
| 83 | What happens if `commit()` or `rollback()` is called while auto-commit is enabled? | ADDED | Transaction Management | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 2 |
| 84 | How do you iterate over a JDBC `ResultSet`, and what does `next()` return? | ADDED | ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSet.html) | 5 |
| 85 | How do you handle SQL NULL values when reading primitive types from a `ResultSet`? | ADDED | ResultSet & Data Mapping; JDBC Data Types | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSet.html) | 4 |
| 86 | What are the different JDBC ResultSet types, and how do they differ in cursor navigation and sensitivity to database changes? | ADDED | ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSet.html) | 4 |
| 87 | How do you map rows from a JDBC ResultSet to Java domain objects? | ADDED | ResultSet & Data Mapping | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSet.html) | 4 |
| 88 | How would you process a very large JDBC ResultSet without exhausting application memory? | ADDED | ResultSet & Data Mapping; Performance & Optimization; Resource Management & Exception Handling | [Technical](https://jdbc.postgresql.org/documentation/query/) | 4 |
| 89 | What is JDBC fetch size, and how does it affect performance and memory consumption? | ADDED | ResultSet & Data Mapping; Performance & Optimization | [Technical](https://jdbc.postgresql.org/documentation/query/) | 4 |
| 90 | What is the difference between `getObject()` and type-specific ResultSet getter methods? | ADDED | ResultSet & Data Mapping; JDBC Data Types | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSet.html) | 4 |
| 91 | What is the difference between accessing ResultSet columns by index and by column label? | ADDED | ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSet.html) | 3 |
| 92 | What is the difference between `setFetchSize()` and `setMaxRows()`? | ADDED | ResultSet & Data Mapping; Performance & Optimization; Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 3 |
| 93 | How do you navigate a scrollable ResultSet using methods such as `previous()`, `absolute()` and `relative()`? | ADDED | ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSet.html) | 3 |
| 94 | How do you retrieve Java 8 date and time types from a ResultSet using JDBC 4.2? | ADDED | ResultSet & Data Mapping; JDBC Data Types | [Technical](https://jdbc.postgresql.org/documentation/query/) | 3 |
| 95 | How do you efficiently retrieve large binary and text values (BLOBs and CLOBs) using JDBC? | ADDED | ResultSet & Data Mapping; Performance & Optimization; JDBC Data Types; Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSet.html) | 3 |
| 96 | Does JDBC fetch all query results into memory immediately, or can rows be retrieved incrementally? | ADDED | ResultSet & Data Mapping; Performance & Optimization | [Technical](https://jdbc.postgresql.org/documentation/query/) | 3 |
| 97 | What happens to a ResultSet when its database connection is closed or returned to the connection pool? | ADDED | ResultSet & Data Mapping; Resource Management & Exception Handling; Connection Management & Pooling | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 3 |
| 98 | How do you use try-with-resources to automatically close JDBC connections, statements, and result sets? | ADDED | Resource Management & Exception Handling; Connection Management & Pooling | [Technical](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) | 5 |
| 99 | In what order should JDBC resources be closed, and why does the order matter? | ADDED | Resource Management & Exception Handling; Connection Management & Pooling | [Technical](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) | 4 |
| 100 | What is `SQLException`, and what diagnostic information does it provide? | ADDED | Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/SQLException.html) | 4 |
| 101 | What is the difference between JDBC SQLState and vendor-specific error codes? | ADDED | Resource Management & Exception Handling | [Technical](https://docs.oracle.com/javase/tutorial/jdbc/basics/sqlexception.html) | 4 |
| 102 | How do you determine whether a JDBC operation can be safely retried after a database error? | ADDED | Resource Management & Exception Handling; Transaction Management | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/SQLRecoverableException.html) | 4 |
| 103 | What is the difference between `SQLTransientException`, `SQLNonTransientException`, and `SQLRecoverableException`? | ADDED | Resource Management & Exception Handling | [Technical](https://docs.oracle.com/javase/tutorial/jdbc/basics/sqlexception.html) | 3 |
| 104 | How does try-with-resources handle exceptions thrown both during JDBC query execution and resource cleanup? | ADDED | Resource Management & Exception Handling | [Technical](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) | 3 |
| 105 | What is the difference between `SQLException.getCause()` and `SQLException.getNextException()`? | ADDED | Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/SQLException.html) | 3 |
| 106 | How can you distinguish integrity constraint violations, SQL syntax errors, connection failures, and transaction rollback errors using JDBC exceptions? | ADDED | Resource Management & Exception Handling; Transaction Management | [Technical](https://docs.oracle.com/javase/tutorial/jdbc/basics/sqlexception.html) | 3 |
| 107 | How would you log and diagnose JDBC exceptions without exposing sensitive information? | ADDED | Resource Management & Exception Handling; Security | — | 3 |
| 108 | What recovery steps are required when a JDBC operation throws an `SQLRecoverableException`? | ADDED | Resource Management & Exception Handling; Connection Management & Pooling; Transaction Management | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/SQLRecoverableException.html) | 2 |
| 109 | What is `SQLWarning`, and how do you retrieve JDBC warnings? | ADDED | Resource Management & Exception Handling | [Technical](https://docs.oracle.com/javase/tutorial/jdbc/basics/sqlexception.html) | 2 |
| 110 | What happens when a JDBC resource is closed more than once? | ADDED | Resource Management & Exception Handling; Connection Management & Pooling; Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 2 |
| 111 | What is `Statement.closeOnCompletion()`, and when is it useful? | ADDED | Resource Management & Exception Handling; Statements & Query Execution; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 2 |
| 112 | What is the N+1 query problem, and how can it occur and be avoided when using plain JDBC? | ADDED | Performance & Optimization; Statements & Query Execution | [Technical](https://vladmihalcea.com/n-plus-1-query-problem/) | 5 |
| 113 | How can you reduce database round trips in a JDBC application? | ADDED | Performance & Optimization; Statements & Query Execution | [Technical (partial)](https://vladmihalcea.com/n-plus-1-query-problem/) | 4 |
| 114 | How does JDBC auto-commit mode affect the performance of bulk database operations? | ADDED | Performance & Optimization; Transaction Management; Batch Processing | [Technical (partial)](https://docs.oracle.com/javase/tutorial/jdbc/basics/transactions.html) | 4 |
| 115 | How would you determine whether a JDBC performance bottleneck is caused by connection acquisition, SQL execution, network latency, or result processing? | ADDED | Performance & Optimization; Connection Management & Pooling | [Technical (partial)](https://vladmihalcea.com/jdbc-profiling-visualvm/) | 4 |
| 116 | How can you monitor the number and execution time of JDBC queries without modifying every database access method? | ADDED | Performance & Optimization | [Technical](https://vladmihalcea.com/jdbc-profiling-visualvm/) | 3 |
| 117 | Why can executing many individually fast SQL queries be slower than executing a single more complex query? | ADDED | Performance & Optimization; Statements & Query Execution | [Technical (partial)](https://vladmihalcea.com/n-plus-1-query-problem/) | 3 |
| 118 | How does retrieving unnecessary rows or columns affect JDBC application performance? | ADDED | Performance & Optimization; ResultSet & Data Mapping | [Technical (partial)](https://jdbc.postgresql.org/documentation/query/) | 3 |
| 119 | How would you benchmark the performance of a JDBC application before and after an optimization? | ADDED | Performance & Optimization | — | 3 |
| 120 | Which JDBC driver-specific configuration options can improve database communication performance? | ADDED | Performance & Optimization; JDBC Fundamentals & Drivers | [Technical](https://jdbc.postgresql.org/documentation/use/) | 2 |
| 121 | How does network packet size affect JDBC data transfer performance? | ADDED | Performance & Optimization | — | 2 |

| 122 | How should database credentials be securely stored and supplied to a JDBC application? | ADDED | Security; Connection Management & Pooling | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html) | 4 |
| 123 | How do you apply the principle of least privilege to database accounts used by Java applications? | ADDED | Security | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html) | 4 |
| 124 | How do you establish a secure JDBC connection using TLS/SSL? | ADDED | Security; Connection Management & Pooling | [Technical](https://jdbc.postgresql.org/documentation/ssl/) | 4 |
| 125 | Can a Java application still be vulnerable to SQL injection when using PreparedStatement? | ADDED | Security; Statements & Query Execution | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | 4 |
| 126 | How do you safely construct dynamic SQL queries when table names, column names, or sorting directions depend on user input? | ADDED | Security; Statements & Query Execution | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | 4 |
| 127 | What is the difference between encrypting a JDBC connection and verifying the database server's identity? | ADDED | Security; Connection Management & Pooling | [Technical](https://jdbc.postgresql.org/documentation/ssl/) | 3 |
| 128 | Are stored procedures inherently safe against SQL injection when called through JDBC? | ADDED | Security; Statements & Query Execution | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | 3 |
| 129 | Why is escaping user input not a recommended substitute for parameterized SQL queries? | ADDED | Security; Statements & Query Execution | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) | 3 |
| 130 | How would you rotate database credentials without interrupting an application that uses JDBC connection pooling? | ADDED | Security; Connection Management & Pooling | [Technical (partial)](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html) | 3 |
| 131 | How would you troubleshoot certificate validation failures when establishing a secure JDBC connection? | ADDED | Security; Connection Management & Pooling; Resource Management & Exception Handling | [Technical](https://jdbc.postgresql.org/documentation/ssl/) | 3 |
| 132 | Why should database schema migrations and regular application operations use accounts with different database privileges? | ADDED | Security | [Technical (partial)](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html) | 3 |

| 133 | How do you perform batch inserts, updates, and deletes using JDBC `PreparedStatement`? | ADDED | Batch Processing; Performance & Optimization; Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 5 |
| 134 | What is the purpose of the JDBC `addBatch()`, `executeBatch()`, and `clearBatch()` methods? | ADDED | Batch Processing; Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 5 |
| 135 | What happens when one statement in a JDBC batch fails, and how do you handle `BatchUpdateException`? | ADDED | Batch Processing; Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/BatchUpdateException.html) | 4 |
| 136 | How do you determine the optimal batch size for JDBC bulk operations? | ADDED | Batch Processing; Performance & Optimization | — | 4 |
| 137 | Is a JDBC batch operation atomic, and how can you ensure that either all statements succeed or all changes are rolled back? | ADDED | Batch Processing; Transaction Management | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/BatchUpdateException.html) | 4 |
| 138 | What does `executeBatch()` return, and how do you interpret `SUCCESS_NO_INFO` and `EXECUTE_FAILED`? | ADDED | Batch Processing; Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 4 |
| 139 | What is the difference between JDBC batch inserts and a single multi-row INSERT statement? | ADDED | Batch Processing; Performance & Optimization; Statements & Query Execution | — | 4 |
| 140 | What is the difference between batch processing using `Statement` and `PreparedStatement`? | ADDED | Batch Processing; Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 3 |
| 141 | How do you process millions of records using JDBC batches without excessive memory consumption or long-running transactions? | ADDED | Batch Processing; Performance & Optimization; Transaction Management; Resource Management & Exception Handling | — | 3 |
| 142 | Can you retrieve database-generated primary keys after executing a JDBC batch insert? | ADDED | Batch Processing; ResultSet & Data Mapping | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 3 |
| 143 | How can JDBC driver-specific batch rewriting options, such as MySQL `rewriteBatchedStatements` and PostgreSQL `reWriteBatchedInserts`, improve performance? | ADDED | Batch Processing; Performance & Optimization; JDBC Fundamentals & Drivers | — | 3 |
| 144 | How can you safely retry failed JDBC batch operations without introducing duplicate records? | ADDED | Batch Processing; Transaction Management; Resource Management & Exception Handling | — | 3 |
| 145 | Can JDBC batch execution be used for SELECT statements that return a ResultSet? | ADDED | Batch Processing; Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 2 |
| 146 | How can you determine whether a JDBC driver supports batch updates? | ADDED | Batch Processing; Metadata | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DatabaseMetaData.html) | 2 |
| 147 | What is the difference between `executeBatch()` and `executeLargeBatch()`? | ADDED | Batch Processing; Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Statement.html) | 2 |
| 148 | How do you implement optimistic locking using plain JDBC and a version column? | ADDED | Concurrency & Locking; Transaction Management | — | 4 |
| 149 | How do you implement pessimistic locking using JDBC and `SELECT FOR UPDATE`? | ADDED | Concurrency & Locking; Transaction Management | [Technical](https://www.postgresql.org/docs/current/applevel-consistency.html) | 4 |
| 150 | How can you prevent lost updates when multiple Java application instances modify the same database record? | ADDED | Concurrency & Locking; Transaction Management | [Technical](https://www.postgresql.org/docs/current/transaction-iso.html) | 4 |
| 151 | How do you detect and handle database deadlocks in a JDBC application? | ADDED | Concurrency & Locking; Transaction Management; Resource Management & Exception Handling | [Technical](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html) | 4 |
| 152 | Why should independent concurrent JDBC transactions use separate connections? | ADDED | Concurrency & Locking; Transaction Management; Connection Management & Pooling | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html) | 4 |
| 153 | How do you handle serialization failures and safely retry a JDBC transaction? | ADDED | Concurrency & Locking; Transaction Management; Resource Management & Exception Handling | [Technical](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html) | 3 |
| 154 | How can the return value of JDBC `executeUpdate()` be used to detect optimistic locking conflicts? | ADDED | Concurrency & Locking; Statements & Query Execution | — | 3 |
| 155 | Why is retrying only the failed SQL statement sometimes incorrect after a database concurrency conflict? | ADDED | Concurrency & Locking; Transaction Management; Resource Management & Exception Handling | [Technical](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html) | 3 |
| 156 | Can Java synchronization mechanisms such as `synchronized` and `ReentrantLock` replace database locking in a distributed application? | ADDED | Concurrency & Locking | — | 3 |
| 157 | How do you configure and handle database lock timeouts in a JDBC application? | ADDED | Concurrency & Locking; Resource Management & Exception Handling | — | 3 |
| 158 | How would you write an integration test to verify concurrent updates and database locking using multiple JDBC connections? | ADDED | Concurrency & Locking; Transaction Management; Connection Management & Pooling | — | 3 |
| 159 | Is it safe to access the same JDBC ResultSet concurrently from multiple threads? | ADDED | Concurrency & Locking; ResultSet & Data Mapping | — | 2 |
| 160 | Can multiple JDBC statements execute concurrently on the same database connection? | ADDED | Concurrency & Locking; Connection Management & Pooling; Statements & Query Execution | — | 2 |
| 161 | What is the difference between JDBC query timeout and database lock timeout? | ADDED | Concurrency & Locking; Resource Management & Exception Handling; Statements & Query Execution | — | 2 |

| 162 | Why should you use `BigDecimal` instead of `double` when reading and writing monetary values using JDBC? | ADDED | JDBC Data Types; ResultSet & Data Mapping; Statements & Query Execution | [Technical](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/getstart/mapping.html) | 4 |
| 163 | How are common SQL data types mapped to Java data types in JDBC? | ADDED | JDBC Data Types; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/getstart/mapping.html) | 4 |
| 164 | How do you handle time zones correctly when storing and retrieving timestamps using JDBC? | ADDED | JDBC Data Types; ResultSet & Data Mapping | — | 4 |
| 165 | How do you bind `LocalDate`, `LocalDateTime`, and `OffsetDateTime` values to a PreparedStatement using JDBC 4.2? | ADDED | JDBC Data Types; Statements & Query Execution | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 4 |
| 166 | What is the difference between `java.sql.Date`, `java.sql.Time`, and `java.sql.Timestamp`? | ADDED | JDBC Data Types; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/getstart/mapping.html) | 3 |
| 167 | What is the difference between `java.sql.Types`, `JDBCType`, and `SQLType`? | ADDED | JDBC Data Types | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/JDBCType.html) | 3 |
| 168 | When should you explicitly specify the target SQL data type when using `PreparedStatement.setObject()`? | ADDED | JDBC Data Types; Statements & Query Execution | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 3 |
| 169 | How do you prevent numeric overflow, truncation, and precision loss when converting SQL values to Java types? | ADDED | JDBC Data Types; ResultSet & Data Mapping | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSet.html) | 3 |
| 170 | How do you store and retrieve UUID values using JDBC? | ADDED | JDBC Data Types; ResultSet & Data Mapping; Statements & Query Execution | — | 3 |
| 171 | How do you store and retrieve JSON data using JDBC, and how does support vary between database drivers and JDBC versions? | ADDED | JDBC Data Types; ResultSet & Data Mapping; Statements & Query Execution | — | 3 |
| 172 | How do you bind and retrieve SQL array values using JDBC? | ADDED | JDBC Data Types; ResultSet & Data Mapping; Statements & Query Execution | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 3 |
| 173 | How do you store and retrieve binary data using `setBytes()`, `getBytes()`, and binary streams, and when should you choose each approach? | ADDED | JDBC Data Types; ResultSet & Data Mapping; Statements & Query Execution; Performance & Optimization | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html) | 3 |
| 174 | How can differences in SQL-to-Java type mappings affect application portability between database systems? | ADDED | JDBC Data Types; ResultSet & Data Mapping; JDBC Fundamentals & Drivers | [Technical (partial)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/getstart/mapping.html) | 3 |
| 175 | How do you work with SQL structured types using JDBC `Struct` and `SQLData`? | ADDED | JDBC Data Types; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Struct.html); [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/SQLData.html) | 2 |
| 176 | What is the difference between JDBC `CLOB` and `NCLOB` data types? | ADDED | JDBC Data Types | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/JDBCType.html) | 2 |
| 177 | How do you release resources associated with JDBC Array, Blob, and Clob objects? | ADDED | JDBC Data Types; Resource Management & Exception Handling | — | 2 |

| 178 | What is the difference between `DatabaseMetaData`, `ResultSetMetaData`, and `ParameterMetaData` in JDBC? | ADDED | Metadata; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/package-summary.html) | 3 |
| 179 | How can you dynamically process a JDBC ResultSet without knowing its column names and types in advance? | ADDED | Metadata; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSetMetaData.html) | 3 |
| 180 | How can you retrieve database tables, schemas, and column definitions using JDBC? | ADDED | Metadata | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DatabaseMetaData.html) | 3 |
| 181 | What is `ParameterMetaData`, and how can it be used with PreparedStatement? | ADDED | Metadata; Statements & Query Execution | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ParameterMetaData.html) | 3 |
| 182 | What is the difference between `getColumnName()` and `getColumnLabel()` in `ResultSetMetaData`? | ADDED | Metadata; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSetMetaData.html) | 3 |
| 183 | How can you retrieve the database product, database version, JDBC driver version, and supported JDBC version at runtime? | ADDED | Metadata; JDBC Fundamentals & Drivers | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DatabaseMetaData.html) | 2 |
| 184 | How can you retrieve primary keys, foreign keys, and indexes using JDBC metadata? | ADDED | Metadata | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DatabaseMetaData.html) | 2 |
| 185 | How can you determine a ResultSet column's SQL type, Java type, precision, scale, and nullability? | ADDED | Metadata; ResultSet & Data Mapping; JDBC Data Types | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/ResultSetMetaData.html) | 2 |
| 186 | What is the difference between a catalog and a schema in JDBC metadata? | ADDED | Metadata | [Technical (partial)](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DatabaseMetaData.html) | 2 |
| 187 | How can JDBC metadata help build database-independent Java applications, and what are its limitations? | ADDED | Metadata; JDBC Fundamentals & Drivers | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/DatabaseMetaData.html) | 2 |
| 188 | What is the difference between connected and disconnected RowSet objects in JDBC? | ADDED | RowSet; Connection Management & Pooling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql.rowset/javax/sql/rowset/package-summary.html) | 2 |
| 189 | What are the five standard JDBC RowSet types, and when would you use each of them? | ADDED | RowSet; ResultSet & Data Mapping | [Technical](https://docs.oracle.com/javase/tutorial/jdbc/basics/rowset.html) | 2 |
| 190 | What is a `CachedRowSet`, and how can it be used after closing the database connection? | ADDED | RowSet; Connection Management & Pooling; ResultSet & Data Mapping; Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql.rowset/javax/sql/rowset/CachedRowSet.html) | 2 |
| 191 | How do you synchronize changes made to a disconnected CachedRowSet with the database? | ADDED | RowSet; Transaction Management; Concurrency & Locking; Resource Management & Exception Handling | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql.rowset/javax/sql/rowset/CachedRowSet.html) | 2 |
| 192 | What are the advantages and limitations of using CachedRowSet for large datasets? | ADDED | RowSet; Performance & Optimization | [Technical](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql.rowset/javax/sql/rowset/CachedRowSet.html) | 2 |

## Topic priority and coverage

JDBC Fundamentals & Drivers, Connection Management & Pooling, Statements & Query Execution, Transaction Management, ResultSet & Data Mapping, Resource Management & Exception Handling, Performance & Optimization, Security, Batch Processing, Concurrency & Locking, and JDBC Data Types, Metadata, and RowSet have been reassessed after the approved additions. All 13 topics have now been reviewed. Counts are recalculated from all question tags. Broad questions count toward directly relevant topics but do not establish comprehensive coverage.

| Topic | Priority | Questions | Coverage |
| --- | --- | ---: | --- |
| JDBC Fundamentals & Drivers | P1 | 20 | 🟢 Good |
| Connection Management & Pooling | P1 | 48 | 🟢 Good |
| Statements & Query Execution | P1 | 48 | 🟢 Good |
| Transaction Management | P1 | 36 | 🟢 Good |
| ResultSet & Data Mapping | P1 | 42 | 🟢 Good |
| Resource Management & Exception Handling | P1 | 44 | 🟢 Good |
| Performance & Optimization | P1 | 40 | 🟢 Good |
| Security | P2 | 17 | 🟢 Good |
| Batch Processing | P2 | 18 | 🟢 Good |
| Concurrency & Locking | P2 | 22 | 🟢 Good |
| JDBC Data Types | P2 | 24 | 🟢 Good |
| Metadata | P3 | 14 | 🟢 Good |
| RowSet | P4 | 7 | 🟢 Good |
| **Unique questions** | | **187** |

## Coverage gaps and review notes

- **JDBC Fundamentals & Drivers:** Core coverage now includes driver types, API versus implementation, automatic discovery, driver selection, JDBC URLs, portability, troubleshooting and class loader behavior. Two-tier versus three-tier architecture and a separate Service Provider mechanism question were not approved; these are not required for Good core coverage. Questions 2 and 31 overlap conceptually but retain distinct definition and API/implementation comparison targets; 25 and 32 distinguish normal discovery from class loader visibility issues.
- **Connection Management & Pooling:** Core coverage now includes pool lifecycle, sizing, exhaustion, leaks, timeouts, validation, state reset, metrics, thread safety and virtual threads. Additional low-likelihood coverage includes pool deadlock, advanced pool interfaces and fixed-size versus dynamically sized pools.
- **Statements & Query Execution:** Core coverage now includes parameter binding, SQL injection prevention and parameterization limits, stored procedures, generated keys, statement reuse, precompilation, timeouts, dynamic IN clauses, NULL binding, update counts, lifecycle, caching, cancellation, thread safety and named parameter limitations. Multiple results, parameter clearing and large update counts were not approved. Existing questions 13 and 21 retain their broader knowledge targets.
- **Transaction Management:** Core coverage now includes explicit transaction boundaries, commit/rollback, exception handling, auto-commit semantics, isolation configuration, savepoints, connection scope, read-only hints, uncertain commit outcomes and vendor-specific implicit DDL commits. Driver capability checks are included. Savepoint validity and releaseSavepoint were not approved.
- **ResultSet & Data Mapping:** Core coverage now includes iteration, cursor types and navigation, NULL handling, row mapping, getters, column access, fetch size, large results, JDBC 4.2 date/time types, LOB retrieval and connection lifecycle. Concurrency modes, updatable result sets, holdability and driver capability checks were not approved.
- **Resource Management & Exception Handling:** Core coverage now includes try-with-resources, closing order, SQLException diagnostics and hierarchy, SQLState, retry safety, suppressed and chained exceptions, secure logging, recovery, warnings, repeated closure and closeOnCompletion. Spring exception translation and batch exceptions are outside this thematic review.
- **Performance & Optimization:** Core coverage now includes pooling, statement reuse, fetch size, streaming, N+1 queries, round trips, auto-commit overhead, bottleneck diagnosis, query monitoring, result volume, benchmarking and driver settings. Network packet size is retained as a low-likelihood specialist question. Batch API details remain for Batch Processing.
- **Security:** Core coverage now includes injection prevention, safe dynamic SQL, stored procedures, credentials, least privilege, TLS and server identity, certificate troubleshooting, credential rotation and separate migration privileges. Read-only security and certificate-based authentication proposals were not approved.
- **Batch Processing:** Core coverage now includes batch API, batch sizing, partial failures, update counts, atomicity, generated keys, driver rewriting, retries, capability checks and large batches. Driver-specific behavior remains implementation-dependent.
- **Concurrency & Locking:** Core coverage includes optimistic and pessimistic locking, lost updates, deadlocks, independent transactions, serialization retries, update counts, distributed synchronization, lock timeouts, concurrent integration testing and JDBC object thread safety. Approved questions 149 and 160 retain substantial overlap with 24 and 42 respectively.
- **JDBC Data Types:** Core coverage includes standard mappings, numeric precision, time zones, JDBC 4.2 temporal binding, explicit SQL types, UUID, JSON, arrays, binary data and portability. Proposals 14 and 17 remain excluded; structured types, NCLOB and resource release were subsequently approved. Driver-specific behavior remains implementation-dependent.
- **Metadata:** Core coverage includes metadata interface comparison, dynamic result processing, schema discovery, parameter metadata, column labels and types, keys and indexes, version detection, catalogs and portability. Search pattern details were not approved.
- **RowSet:** Basic definition, ResultSet comparison, connected and disconnected types, five standard types, CachedRowSet lifecycle, synchronization and large-dataset limitations are covered. Proposals 6–9 were not approved; advanced API details remain low priority.

## Likelihood distribution

| Score | Questions |
| ---: | ---: |
| 5 | 22 |
| 4 | 63 |
| 3 | 72 |
| 2 | 35 |
| 1 | 0 |
| **Total** | **192** |

Eight approved questions were added for JDBC Fundamentals & Drivers (25–32). Source links and evidence classifications are retained from the approved proposals; no actual interview occurrences are confirmed for these additions. Existing evidence and origin labels are preserved. Potential cross-catalog overlaps (connection pooling, database performance, locking and SQL injection) require semantic review before adding questions in those areas. Other catalogs were not modified. Historical combined question count across catalogs after the fundamentals update: 671.

Fifteen approved questions were added for Connection Management & Pooling (33–47), excluding proposals 15, 17 and 18. Technical references are used where available; partial references are explicitly marked. Previously proposed interview-report references could not be reverified, so no interview occurrence is claimed for this batch. The virtual-thread question has no verified source. Historical combined question count across catalogs after this update: 686.

Three additional approved low-likelihood questions for Connection Management & Pooling (48–50) complete the previously proposed set. Technical references are retained; no actual interview occurrence is claimed. Historical combined question count across catalogs after this update: 689.

Seventeen approved questions were added for Statements & Query Execution (51–67), excluding proposals 17, 18 and 20. Technical references are retained or assigned to relevant API documentation; the dynamic IN clause reference is partial, and statement thread safety has no verified source. No actual interview occurrence is claimed. Source links were not reverified online during this update. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs after this update: 706.

Sixteen approved questions were added for Transaction Management (68–83), excluding proposal 17. Technical API references are assigned; the uncertain commit outcome reference is partial and implicit DDL commits are vendor-specific. DatabaseMetaData is used for driver capability checks. No actual interview occurrence is claimed. Sources were not reverified online during this update. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs after this update: 722.

Fourteen approved questions were added for ResultSet & Data Mapping (84–97), excluding proposals 15–18. Technical API and PostgreSQL JDBC references are used instead of unverified preparation-source links; row mapping and pooled connection lifecycle references are partial. Links were not reverified online during this update. No actual interview occurrence is claimed. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs after this update: 736 (based on previously verified other catalog counts).

Fourteen approved questions were added for Resource Management & Exception Handling (98–111). Technical references are used; retry safety has partial support and secure logging has no verified source. Links were not reverified online during this update. No actual interview occurrence is claimed. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs after this update: 750 (based on previously verified other catalog counts).

Ten approved questions were added for Performance & Optimization (112–121). Technical references are retained where identifiable; partial references are marked, and benchmarking and network packet size have no verified source. Links were not reverified online during this update. No actual interview occurrence is claimed. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs after this update: 760 (based on previously verified other catalog counts).

Eleven approved questions were added for Security (122–132), excluding proposals 12 and 13. OWASP and PostgreSQL JDBC technical references are retained; credential rotation and migration privileges have partial support. Sources were not reverified online. No actual interview occurrence is claimed. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs after this update: 771 (based on previously verified other catalog counts).

Fifteen approved questions were added for Batch Processing (133–147). Six questions retain unverified evidence (—); two have partial technical references. DatabaseMetaData is used for driver capability checks. Technical API links were not reverified online. No actual interview occurrence is claimed. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs: 786 (based on previously verified other catalog counts).

Fourteen approved questions were added for Concurrency & Locking (148–161). PostgreSQL technical references and a partial Connection API reference are retained; eight questions have no verified source, including the proposed integration-testing reference which could not be identified precisely. No online reverification or confirmed interview occurrence. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs: 800 (based on previously verified other catalog counts).

Thirteen approved questions were added for JDBC Data Types (162–174), excluding proposals 14–18. Technical API and mapping references are assigned where identifiable; five are partial and three questions have no verified source, including JSON because the proposed reference could not be identified precisely. Links were not reverified online. No actual interview occurrence is claimed. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs: 813 (based on previously verified other catalog counts).

Three additional approved JDBC Data Types questions (175–177), proposals 15, 16 and 18, were added after the initial approval. Proposals 14 and 17 remain excluded. Technical API references were assigned without online reverification; resource release retains unverified evidence. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs: 816 (based on previously verified other catalog counts).

Ten approved Metadata questions (178–187) were added, excluding proposal 11. Technical API references are assigned, with two partial references; no online reverification or confirmed interview occurrence. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs: 826 (based on previously verified other catalog counts).

Five approved RowSet questions (188–192) were added, excluding proposals 6–9. Technical references are assigned without online reverification; no actual interview occurrence is claimed. All 13 thematic areas have been reviewed. Cross-catalog semantic review remains incomplete. Historical combined question count across catalogs: 831 (based on previously verified other catalog counts).

See [catalog preparation guidelines](interview-question-catalog-guidelines.md).
