# DBMS Interview Answers — Senior Java Developer

Source: `database-interview-questions.md` in branch `feature/card-classification-study-filters`.

Concise interview-ready answers. Database-specific semantics should be checked against the target engine and version.

### 1. What is a Database?

**Answer:** A database is an organized collection of data that can be stored, retrieved, and updated efficiently.

### 2. What is DBMS? What are the most popular types of DBMS?

**Answer:** A DBMS is software for managing databases, including access, queries, concurrency, and recovery. Common models include relational, document, key-value, graph, and wide-column.

### 3. What is RDBMS?

**Answer:** An RDBMS manages data in relations (tables), typically using SQL, keys, and integrity constraints.

### 4. What is Normalization in a Database?

**Answer:** Normalization organizes relational data to reduce redundancy and modification anomalies, using normal forms based on dependencies.

### 5. What are SQL tables?

**Answer:** A SQL table represents rows of data with named, typed columns and optional constraints; row order is not guaranteed.

### 6. What is a relationship and what types are they?

**Answer:** Relationships associate entities: one-to-one, one-to-many, and many-to-many. Foreign keys and junction tables commonly implement them.

### 7. What is an Index in SQL?

**Answer:** An index is an auxiliary data structure that speeds selected lookups, joins, and ordering, at a cost to storage and writes.

### 8. What is a Clustered Index in SQL?

**Answer:** A clustered index determines how table data is organized with respect to an index key; exact physical behavior differs by DBMS. SQL Server and InnoDB implement it differently.

### 9. What is the Non-Clustered Index in SQL?

**Answer:** A nonclustered index is a separate lookup structure holding keys and row locators or references; it does not determine the base table's organization.

### 10. What is a primary key?

**Answer:** A primary key uniquely identifies a row and cannot contain NULL; a table has at most one primary-key constraint.

### 11. What is a foreign key?

**Answer:** A foreign key enforces references to eligible unique key values in another or the same table, subject to configured actions and DBMS rules.

### 12. What is a constraint?

**Answer:** A constraint is a database-enforced rule, such as PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, or NOT NULL.

### 13. What is a "TRIGGER" in SQL?

**Answer:** A trigger executes database-defined logic on specified events, often INSERT, UPDATE, or DELETE; timing and scope are DBMS-specific.

### 14. What is a transaction?

**Answer:** A transaction groups operations into one logical unit with commit or rollback, subject to the database's transaction guarantees.

### 15. What is ACID?

**Answer:** ACID stands for Atomicity, Consistency, Isolation, and Durability; it describes key transaction guarantees, not a promise that every application invariant is automatically correct.

### 16. What is Atomicity? (ACID)

**Answer:** Atomicity means a transaction's changes take effect together or are rolled back together.

### 17. What is Consistency? (ACID)

**Answer:** Consistency means a transaction preserves defined database invariants when started from a valid state; applications must still implement business rules.

### 18. What is Isolation? (ACID)

**Answer:** Isolation controls how concurrent transactions observe and interfere with one another; guarantees depend on isolation level and implementation.

### 19. What is Durability? (ACID)

**Answer:** Durability means successfully committed changes survive failures within the database's configured durability guarantees.

### 20. What is collation?

**Answer:** Collation defines text comparison and sorting rules, including case, accent, and locale behavior.

### 21. What is CRUD?

**Answer:** CRUD means Create, Read, Update, Delete; common SQL counterparts are INSERT, SELECT, UPDATE, DELETE.

### 22. What is transaction isolation?

**Answer:** Transaction isolation defines visibility and concurrency guarantees between transactions, balancing anomalies, contention, and throughput.

### 23. What are the standard transaction isolation levels, and how do they differ?

**Answer:** SQL defines READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, and SERIALIZABLE. Higher levels rule out more standard anomalies; exact behavior, including snapshot semantics, varies by DBMS.

### 24. What is phantom read and which isolation level prevents it?

**Answer:** A phantom is a changed set of rows matching a predicate between reads. Standard SERIALIZABLE prevents phantoms; some implementations prevent them at lower named levels.

### 25. What is “dirty read” in JDBC? Which isolation level prevents “dirty read”?

**Answer:** A dirty read observes another transaction's uncommitted changes. READ COMMITTED and stronger standard isolation levels prevent it; JDBC exposes isolation constants but does not define engine behavior.

### 26. What is “non-repeatable” read and which isolation level prevents it?

**Answer:** A non-repeatable read returns changed values for the same row within one transaction. Standard REPEATABLE READ and SERIALIZABLE prevent it.

### 27. What is a 2-phase commit?

**Answer:** Two-phase commit coordinates participants through prepare and commit/abort phases to achieve atomic distributed commit; it can block and adds coordination overhead.

### 28. What are the different types of locks in relational databases?

**Answer:** Locks include shared/read and exclusive/write, plus intent, row, page, table, predicate, or range locks depending on the DBMS.

### 29. What is database deadlock? How can we avoid them?

**Answer:** A deadlock is a cycle of transactions waiting on each other's locks. Reduce it with consistent lock order, short transactions, appropriate indexes, and retry after victim rollback.

### 30. BLOB vs CLOB

**Answer:** BLOB stores binary large objects; CLOB stores character large objects. Encoding, limits, and streaming APIs vary by database.

### 31. What is the difference between optimistic and pessimistic locking?

**Answer:** Optimistic locking checks for conflicts at update time, often with a version field; pessimistic locking acquires locks before conflicting work. Choose based on contention and workload.

### 32. What is the difference between COMMIT and ROLLBACK?

**Answer:** COMMIT makes a transaction's changes permanent under its durability guarantees; ROLLBACK discards uncommitted changes, subject to transactional scope.

### 33. What happens if one operation within a transaction fails?

**Answer:** Failure behavior depends on the DBMS, statement, and error. A statement may roll back alone or mark the whole transaction failed; explicitly handle rollback and retries.

### 34. Why should database transactions be kept short?

**Answer:** Short transactions hold resources and locks for less time, reducing contention, deadlocks, log pressure, and connection occupancy.

### 35. What is a savepoint in a database transaction?

**Answer:** A savepoint marks a position inside a transaction to which changes can be partially rolled back without necessarily aborting the entire transaction.

### 36. What is a lost update, and how can it be prevented?

**Answer:** A lost update occurs when concurrent writes overwrite one another. Prevent it with row locks, version checks, atomic updates, or suitable isolation with retry.

### 37. How do you choose the appropriate transaction isolation level?

**Answer:** Choose the weakest isolation that still preserves required invariants; evaluate read/write anomalies, contention, engine semantics, and retry requirements.

### 38. What are the default transaction isolation levels in MySQL, PostgreSQL and Oracle?

**Answer:** MySQL InnoDB defaults to REPEATABLE READ; PostgreSQL and Oracle generally default to READ COMMITTED. Configuration and session overrides can change this.

### 39. What is a dirty write, and how can it be prevented?

**Answer:** A dirty write overwrites another transaction's uncommitted write. Database write locks or equivalent concurrency controls prevent it in mainstream transactional engines.

### 40. What is MVCC (Multi-Version Concurrency Control), and how does it work?

**Answer:** MVCC retains multiple row versions so readers can see consistent snapshots without blocking many writers; version visibility and cleanup vary by engine.

### 41. What is the difference between shared and exclusive locks?

**Answer:** Shared locks allow compatible readers but usually block conflicting writers; exclusive locks protect modifications and conflict with other incompatible locks.

### 42. What is the difference between row-level and table-level locking?

**Answer:** Row locks provide finer-grained concurrency but more lock-management overhead; table locks affect more rows and can increase contention.

### 43. How does optimistic locking work using a version column?

**Answer:** An optimistic update checks a version in its WHERE clause and increments it atomically; zero updated rows indicates a conflict. JPA supports this with @Version.

### 44. What is the difference between blocking and a deadlock?

**Answer:** Blocking is waiting for a held resource and may resolve normally; deadlock is a cyclic wait requiring detection, prevention, or victim selection.

### 45. How do you decide which columns to index?

**Answer:** Index columns used selectively in filters, joins, and ordering; inspect actual plans, cardinality, write cost, and composite-key order.

### 46. What are the advantages and disadvantages of database indexes?

**Answer:** Indexes accelerate reads but consume space, slow writes, and require maintenance; usefulness depends on query patterns and selectivity.

### 47. What is a composite index, and why does the order of its columns matter?

**Answer:** A composite index indexes multiple columns in a defined order. Leading-column predicates and ordering often determine usability, though optimizers have exceptions.

### 48. What is the difference between a composite index and multiple single-column indexes?

**Answer:** A composite index can support combined predicates and ordering directly; separate indexes offer flexibility but combining them may be less efficient.

### 49. Why might a database not use an existing index?

**Answer:** An optimizer may prefer a scan because of low selectivity, small tables, stale statistics, casts/functions, or cost estimates.

### 50. How are database indexes implemented internally, and how do they work?

**Answer:** Common indexes use balanced B/B+ trees for ordered lookup; hash, bitmap, inverted, and other structures serve different workloads.

### 51. What is a covering index?

**Answer:** A covering index supplies all columns needed by a query, potentially avoiding base-table lookups; visibility checks and engine behavior can still require them.

### 52. When can database indexes negatively affect performance, and when is it better not to create an index?

**Answer:** Excessive indexes slow INSERT/UPDATE/DELETE and use memory/storage; avoid indexes with little query benefit or high maintenance cost.

### 53. How would you identify and optimize a slow SQL query in production?

**Answer:** Measure latency and query frequency, capture SQL and parameters safely, inspect actual execution plans, statistics, indexes, joins, and waits, then benchmark a targeted change.

### 54. What is a query execution plan, and how do you use it to optimize SQL queries?

**Answer:** An execution plan describes access paths, joins, sorting, and estimated costs; compare estimates with actual row counts and timing where available.

### 55. What is the difference between EXPLAIN and EXPLAIN ANALYZE?

**Answer:** EXPLAIN shows a planned execution strategy; EXPLAIN ANALYZE generally executes and measures the query, so use caution with writes and expensive operations.

### 56. What is the difference between a full table scan and an index scan? When is each preferable?

**Answer:** A full scan reads the table broadly and can win for small tables or large result sets; an index scan helps selective access but may require random row fetches.

### 57. What are database statistics, and how do they affect query execution plans?

**Answer:** Statistics describe row counts and value distributions used by the optimizer; stale estimates can produce inefficient plans.

### 58. How can you improve the performance of SQL queries involving multiple joins?

**Answer:** Filter early where beneficial, index join/filter keys, avoid unnecessary joins and rows, inspect join order and algorithms, and verify with actual plans.

### 59. What is the difference between offset-based and cursor-based pagination, and how do they affect performance?

**Answer:** OFFSET pagination skips earlier rows and becomes expensive or unstable on changing data. Keyset/cursor pagination uses a stable ordered key and scales better for sequential navigation.

### 60. Why should you avoid SELECT * in production queries?

**Answer:** SELECT * transfers unnecessary data, couples clients to schema changes, and may prevent index-only access; explicitly select needed columns.

### 61. What is the N+1 query problem, and how can it be solved?

**Answer:** N+1 means one query loads parents and N more load related data. Use fetch joins, entity graphs, batching, or projections while avoiding oversized joins.

### 62. What is a sargable SQL predicate?

**Answer:** A sargable predicate lets an index efficiently narrow candidates, e.g. a range on a column rather than a function applied to that column.

### 63. What are the first, second, and third normal forms (1NF, 2NF, 3NF)?

**Answer:** 1NF requires atomic values in the relational sense; 2NF removes non-key attributes dependent on only part of a candidate key; 3NF removes problematic transitive dependencies (formally, each FD has a superkey determinant or prime dependent attribute).

### 64. What is denormalization, and when should it be used?

**Answer:** Denormalization deliberately duplicates or precomputes data to speed reads, trading storage and simpler queries for update complexity and consistency risk.

### 65. What are insertion, update, and deletion anomalies, and how does normalization prevent them?

**Answer:** Insertion anomalies require unrelated data, update anomalies create inconsistencies across duplicates, and deletion anomalies remove unintended facts; normalization separates dependencies.

### 66. What is the difference between natural and surrogate keys, and when should each be used?

**Answer:** A natural key has business meaning; a surrogate key is an artificial identifier. Prefer stable keys and enforce natural uniqueness separately when necessary.

### 67. What is a composite primary key, and when should it be used?

**Answer:** A composite primary key uses multiple columns for row identity, useful for junction tables or naturally combined identifiers; it can complicate references and ORM mappings.

### 68. How do you model a many-to-many relationship in a relational database?

**Answer:** Create a junction table with foreign keys to both entities, often a composite primary key or a separate key plus a unique pair constraint.

### 69. What are the advantages and disadvantages of using UUIDs versus auto-incrementing IDs as primary keys?

**Answer:** UUIDs support decentralized ID generation but can cost more storage/index locality; sequential numeric IDs are compact and efficient but require coordination and may expose sequence information.

### 70. What is Boyce-Codd Normal Form (BCNF), and how does it differ from 3NF?

**Answer:** BCNF requires every nontrivial functional dependency's determinant to be a superkey; 3NF allows certain dependencies where the dependent attribute is prime.

### 71. What is Fourth Normal Form (4NF)?

**Answer:** 4NF requires that every nontrivial multivalued dependency have a superkey determinant, preventing independent multi-valued facts from causing redundancy.

### 72. What is Fifth Normal Form (5NF)?

**Answer:** 5NF removes nontrivial join dependencies not implied by candidate keys, avoiding redundancy that requires decomposition into three or more projections.

### 73. What is Sixth Normal Form (6NF)?

**Answer:** 6NF permits no nontrivial join dependencies; it is mainly useful in specialized temporal or highly decomposed models.

### 74. What is the difference between a primary key and a unique key?

**Answer:** A primary key is one designated unique, non-null identifier; UNIQUE enforces other candidate uniqueness, with NULL handling dependent on the DBMS.

### 75. What are candidate keys, superkeys, and alternate keys?

**Answer:** A superkey uniquely identifies rows; a candidate key is a minimal superkey; alternate keys are candidate keys not chosen as primary.

### 76. What is referential integrity, and how is it enforced?

**Answer:** Referential integrity requires foreign-key values to match permitted referenced keys or be NULL when allowed; foreign-key constraints enforce it.

### 77. What are the different types of database constraints?

**Answer:** Typical constraints include PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, and sometimes DEFAULT (a default is not an integrity constraint in all systems).

### 78. What is the difference between ON DELETE CASCADE, SET NULL, RESTRICT, and NO ACTION?

**Answer:** CASCADE deletes dependents; SET NULL clears references; RESTRICT rejects referenced deletion immediately; NO ACTION rejects if the constraint is violated at check time, which may be deferred.

### 79. Can a foreign key contain NULL values or reference a non-primary key?

**Answer:** Foreign keys may contain NULL if nullable; referenced columns may be eligible UNIQUE keys, not necessarily primary keys. Exact uniqueness and NULL rules vary.

### 80. Can a UNIQUE constraint allow NULL values?

**Answer:** Yes, often multiple NULLs are allowed because NULL is not equal to NULL, but SQL Server and configurable NULLS NOT DISTINCT behavior differ.

### 81. Why should data integrity be enforced at the database level rather than relying solely on application-level validation?

**Answer:** Database constraints protect integrity across applications, concurrent writers, imports, and bugs; application validation remains useful for friendly error messages.

### 82. What is the difference between a UNIQUE constraint and a unique index?

**Answer:** A UNIQUE constraint declares a logical integrity rule, often implemented by a unique index; a unique index is a physical/access structure that can also enforce uniqueness, with vendor-specific differences.

### 83. What is database replication, and how does it work?

**Answer:** Replication copies changes from a source to replicas using logs, streaming, or other mechanisms; topology and consistency depend on implementation.

### 84. What is the difference between synchronous and asynchronous replication?

**Answer:** Synchronous replication waits for specified replica acknowledgments, improving acknowledged-data safety at a latency cost; asynchronous replication can lag and lose recent writes on failover.

### 85. What is database partitioning, and what are its benefits?

**Answer:** Partitioning divides a logical table into smaller pieces, potentially improving pruning, retention, and maintenance; it does not automatically speed every query.

### 86. What is database sharding, and when should it be used?

**Answer:** Sharding distributes data across independently managed database nodes to scale capacity or throughput, adding routing, rebalancing, and cross-shard complexity.

### 87. What is the difference between partitioning and sharding?

**Answer:** Partitioning divides data logically and may stay on one server; sharding typically distributes partitions across servers. Terminology overlaps.

### 88. What is the difference between horizontal and vertical database scaling?

**Answer:** Vertical scaling adds resources to one node; horizontal scaling adds nodes, requiring distribution, replication, or partitioning strategies.

### 89. How would you scale a relational database as traffic and data volume increase?

**Answer:** First measure and optimize queries, indexes, pooling, caching, and schema; then consider stronger hardware, read replicas, partitioning, and sharding if bottlenecks justify them.

### 90. What are read replicas, and when should they be used?

**Answer:** Read replicas serve read traffic and improve availability/scalability, but asynchronous lag makes them unsuitable for reads requiring immediate consistency.

### 91. What is replication lag, and how can it affect application behavior?

**Answer:** Replication lag is the delay before a replica reflects primary changes; it can cause stale reads, missing recent writes, and inconsistent user experiences.

### 92. What is database failover, and how does it support high availability?

**Answer:** Failover promotes or switches to a healthy database instance after failure, reducing downtime; it requires correct fencing, routing, and recovery procedures.

### 93. What is the difference between range, hash, and list partitioning?

**Answer:** Range partitions split ordered intervals; hash partitions use a hash of the key; list partitions map explicit values or groups.

### 94. What is the difference between horizontal and vertical partitioning?

**Answer:** Horizontal partitioning divides rows; vertical partitioning divides columns into separate structures, usually linked by keys.

### 95. What is partition pruning, and how does it improve query performance?

**Answer:** Partition pruning excludes partitions that cannot match predicates, reducing I/O when filters align with partition keys.

### 96. How do you choose an appropriate shard key?

**Answer:** Choose a stable, sufficiently high-cardinality shard key with even distribution and query locality; avoid hotspots and expensive cross-shard operations.

### 97. What is consistent hashing, and how does it work?

**Answer:** Consistent hashing places keys and nodes on a logical ring, limiting key remapping when nodes change; virtual nodes improve balance.

### 98. What is the difference between OLTP and OLAP?

**Answer:** OLTP supports many short concurrent operational transactions; OLAP supports analytical scans and aggregations over large datasets.

### 99. What are the challenges of cross-shard joins, and how can they be addressed?

**Answer:** Cross-shard joins require network transfers and coordination. Co-locate related data, choose good shard keys, denormalize selectively, or use specialized distributed query engines.

### 100. How do you maintain data consistency across multiple databases in a microservices architecture?

**Answer:** Use local transactions plus Saga/outbox/event-driven coordination, idempotent handlers, and reconciliation; strong cross-database atomicity needs explicit distributed transaction support.

### 101. What is the Saga pattern, and how does it handle distributed transactions?

**Answer:** A Saga is a sequence of local transactions with compensating actions on failure; compensation is business-level recovery, not an atomic rollback.

### 102. What is the difference between the Saga pattern and two-phase commit (2PC)?

**Answer:** 2PC aims for atomic commit across participants but can block; Sagas accept intermediate states and use compensations for eventual business consistency.

### 103. What is the Transactional Outbox pattern, and what problem does it solve?

**Answer:** Transactional Outbox writes business state and an outgoing event in one local transaction; a relay publishes it, avoiding the dual-write gap but requiring deduplication.

### 104. What is idempotency, and why is it important in distributed transactions?

**Answer:** Idempotency means repeating an operation has the same intended effect as once; it protects retries and at-least-once message delivery from duplicate side effects.

### 105. What is the difference between a compensating transaction and a traditional transaction rollback?

**Answer:** A rollback undoes uncommitted work atomically; compensation is a new business action that counteracts an already committed step and may not restore the exact prior state.

### 106. What is the difference between Saga orchestration and choreography?

**Answer:** Orchestration uses a central coordinator to direct Saga steps; choreography uses events and autonomous participants, trading centralized visibility for looser coupling.

### 107. What are distributed locks, and what challenges arise when using them?

**Answer:** Distributed locks coordinate access across nodes but face expiry, pauses, partitions, and stale owners; fencing tokens and carefully defined failure semantics are important.

### 108. What is the split-brain problem in distributed databases, and how can it be prevented?

**Answer:** Split brain occurs when multiple nodes believe they are primary and accept conflicting writes; use quorum/consensus, fencing, and controlled promotion.

### 109. What is the difference between structured, semi-structured, and unstructured data?

**Answer:** Structured data has a defined schema; semi-structured data carries flexible structure such as JSON; unstructured data lacks a fixed tabular schema, such as images.

### 110. What is the difference between DBMS and RDBMS?

**Answer:** DBMS is the broad class of database management software; RDBMS specifically implements the relational model.

### 111. What is the difference between in-memory and disk-based databases?

**Answer:** In-memory systems keep working data primarily in RAM for speed; disk-based systems rely on durable storage and caches. Either may support persistence.

### 112. What is the difference between row-oriented and column-oriented databases?

**Answer:** Row stores group fields by record and suit OLTP; column stores group values by column and suit scans/aggregations, with workload-dependent trade-offs.

### 113. What is the difference between embedded and client-server databases?

**Answer:** Embedded databases run within an application process, such as SQLite; client-server databases serve requests over a process or network boundary.

### 114. What is the difference between an operational database and a data warehouse?

**Answer:** Operational databases handle day-to-day transactions; data warehouses consolidate historical or analytical data for reporting and complex queries.

### 115. What is the difference between a data warehouse and a data lake?

**Answer:** A warehouse stores curated, modeled analytical data; a data lake holds raw or varied-format data, often in object storage, requiring governance.

### 116. What is the difference between a database schema and a database instance?

**Answer:** A schema describes database structures and constraints; a database instance is the actual data/state at a point in time (or, in vendor terminology, a running server instance).

### 117. What is the difference between logical and physical data independence?

**Answer:** Logical data independence permits conceptual schema changes without rewriting external views; physical independence permits storage changes without altering logical schema.

### 118. What is SQL injection, and how can it be prevented?

**Answer:** SQL injection occurs when untrusted input changes SQL structure. Use parameter binding, allowlisted identifiers, least privilege, and safe dynamic query construction.

### 119. How do parameterized queries prevent SQL injection, and what are their limitations?

**Answer:** Bound parameters separate values from SQL syntax, but cannot parameterize identifiers or arbitrary SQL fragments; validate/allowlist dynamic structure.

### 120. Can SQL injection occur when using JPA or Hibernate?

**Answer:** Yes. Concatenating user input into native SQL, JPQL/HQL, or dynamic query fragments can cause injection; use bound parameters and validated identifiers.

### 121. What is the difference between authentication and authorization at the database level?

**Answer:** Authentication establishes database identity; authorization determines which objects and operations that identity may access.

### 122. What are database roles and privileges, and how do they work?

**Answer:** Roles group permissions; privileges authorize actions such as SELECT or UPDATE. Grant only the rights needed for each application identity.

### 123. What is the principle of least privilege, and how does it apply to databases?

**Answer:** Least privilege means each service/account has only required permissions, scoped by object and operation, reducing compromise impact.

### 124. How do you securely manage database credentials in an application?

**Answer:** Use a secrets manager or managed identity, TLS, restricted access, rotation, and no credentials in source control or logs.

### 125. What is the difference between database encryption at rest and encryption in transit?

**Answer:** Encryption at rest protects stored files/media; encryption in transit protects traffic between clients and servers. Both require sound key management.

### 126. What is row-level security (RLS), and when should it be used?

**Answer:** RLS applies row-specific access policies inside the database, useful for multi-tenant isolation and defense in depth; beware privileged bypass and policy testing.

### 127. What is database auditing, and what activities should be audited?

**Answer:** Auditing records security-relevant events such as login failures, privilege changes, schema changes, and sensitive access, with retention and tamper protection.

### 128. How would you secure a production database used by a backend application?

**Answer:** Restrict network access, enforce TLS and least privilege, manage secrets, patch software, audit activity, encrypt backups, test recovery, and monitor anomalies.

### 129. What is data masking, and when should it be used?

**Answer:** Masking obscures sensitive fields in displays or nonproduction copies; reversible or partial masking is not equivalent to anonymization.

### 130. What is the difference between data anonymization and pseudonymization?

**Answer:** Anonymization irreversibly prevents identification under a realistic threat model; pseudonymization replaces identifiers but remains potentially reversible/linkable personal data.

### 131. What is the difference between hashing and encryption?

**Answer:** Hashing is one-way digest computation; encryption is reversible with a key. Passwords need salted, slow password hashing, not ordinary fast hashes.

### 132. What is column-level encryption, and when should it be used?

**Answer:** Column-level encryption encrypts selected sensitive fields; it limits exposure but complicates indexing, searching, and key management.

### 133. What is Transparent Data Encryption (TDE), and how does it work?

**Answer:** TDE encrypts database files transparently on disk, protecting stolen media/backups; it does not protect against authorized SQL access.

### 134. What is Role-Based Access Control (RBAC), and how does it apply to databases?

**Answer:** RBAC assigns privileges to roles and roles to users/services, simplifying consistent access management.

### 135. What are the GRANT and REVOKE statements in SQL?

**Answer:** GRANT assigns privileges; REVOKE removes them, subject to ownership, inherited roles, and vendor-specific semantics.

### 136. How can database views be used to enforce data access restrictions?

**Answer:** Views can expose only selected rows/columns and limit direct table access; effectiveness depends on invoker/definer rights and DBMS security rules.

### 137. What is column-level security, and how does it work?

**Answer:** Column-level security restricts access to particular fields through column privileges, views, masking, or policies.

### 138. How can tenant data isolation be enforced in a multi-tenant database?

**Answer:** Enforce tenant IDs with scoped queries and constraints, RLS or separate schemas/databases, and test cross-tenant access under least privilege.

### 139. What is database credential rotation, and how can it be implemented safely?

**Answer:** Rotate credentials by introducing new valid credentials, updating clients/pools, verifying connections, then revoking old credentials without downtime.

### 140. Why should database backups be encrypted, and how can they be protected?

**Answer:** Backups contain sensitive data; encrypt them, restrict access, isolate storage, protect keys, verify integrity, and regularly test restoration.

### 141. What is database network isolation, and why is it important?

**Answer:** Network isolation limits which systems can reach the database using private networks, firewalls, and security groups, reducing attack surface.

### 142. What are the security risks of dynamic SQL, and how can they be mitigated?

**Answer:** Dynamic SQL can inject attacker-controlled syntax or abuse elevated privileges; bind values, allowlist identifiers, and minimize execution rights.

### 143. What are the security risks of stored procedures, and how can they be mitigated?

**Answer:** Stored procedures can expose privileged operations or unsafe dynamic SQL; use controlled execution rights, parameterization, and code review.

### 144. What is a stored procedure, and when should it be used?

**Answer:** A stored procedure is database-resident executable logic, useful for set-based operations, controlled data APIs, or reducing round trips.

### 145. What is a user-defined database function?

**Answer:** A user-defined function computes a value or table result from inputs within DBMS-specific restrictions and SQL integration.

### 146. What is the difference between a stored procedure and a database function?

**Answer:** Functions typically return values and can appear in expressions; procedures are invoked as operations and may use output parameters. Exact transaction and return rules vary.

### 147. What are the advantages and disadvantages of using stored procedures?

**Answer:** Procedures reduce round trips and centralize data operations, but increase DBMS coupling, testing/deployment complexity, and hidden business logic.

### 148. When should business logic be implemented in the database rather than in the application?

**Answer:** Prefer the database for integrity rules and efficient set-based data operations; keep most domain workflows in application code for portability and maintainability.

### 149. What are the advantages and disadvantages of database triggers?

**Answer:** Triggers centralize automatic enforcement/auditing but create hidden side effects, ordering complexity, performance costs, and difficult debugging.

### 150. What is the difference between a database view and a materialized view?

**Answer:** A view stores a query definition evaluated on access; a materialized view stores query results and needs refresh, trading freshness for faster reads.

### 151. What is a database cursor, and when should it be used or avoided?

**Answer:** A cursor iterates query results row by row; use it for unavoidable procedural work, but prefer set-based SQL for bulk operations.

### 152. What is the difference between a database trigger and a constraint?

**Answer:** Constraints declaratively enforce invariants; triggers execute procedural logic and may have more complex, less transparent behavior.

### 153. What is the difference between IN, OUT, and INOUT parameters in stored procedures?

**Answer:** IN supplies input; OUT returns output; INOUT does both. Availability and syntax differ by database.

### 154. What is the difference between static and dynamic SQL?

**Answer:** Static SQL is fixed at definition/compile time; dynamic SQL is assembled/executed at runtime and needs safe parameterization.

### 155. What is the difference between BEFORE, AFTER, and INSTEAD OF triggers?

**Answer:** BEFORE runs before an event, AFTER after it, and INSTEAD OF replaces the event action, commonly for views; support varies.

### 156. What is the difference between row-level and statement-level triggers?

**Answer:** Row triggers run per affected row; statement triggers run once per statement, even if many rows are affected (or sometimes zero).

### 157. How is the execution order of multiple database triggers determined?

**Answer:** Trigger ordering depends on the DBMS, event/timing, creation order, and explicit ordering features; do not assume a portable sequence.

### 158. What are recursive and cascading triggers, and what problems can they cause?

**Answer:** Recursive triggers cause further invocations of themselves; cascading triggers activate other triggers. Both risk loops, deep nesting, and unexpected writes.

### 159. How do database triggers behave within a transaction, including during a rollback?

**Answer:** Transactional trigger effects generally commit or roll back with the triggering statement/transaction; autonomous transactions or external side effects are exceptions.

### 160. What is the difference between explicit and implicit cursors?

**Answer:** Explicit cursors are declared and controlled by code; implicit cursors are managed automatically for SQL operations or query loops, depending on language.

### 161. What is the difference between cursor-based and set-based processing?

**Answer:** Cursor processing handles rows individually and often adds overhead; set-based processing lets the optimizer operate on whole sets.

### 162. What is the difference between updatable and read-only views?

**Answer:** Some simple views support INSERT/UPDATE/DELETE, while joins, aggregates, and expressions can make views read-only; rules vary by DBMS.

### 163. How can materialized views be refreshed, and what are the trade-offs of different refresh strategies?

**Answer:** Materialized views can refresh fully, incrementally, on demand, or on schedule, trading freshness and write cost against query speed.

### 164. What are temporary tables, and when should they be used?

**Answer:** Temporary tables hold session- or transaction-scoped intermediate data; lifetime, visibility, and indexing depend on the DBMS.

### 165. What is the difference between temporary tables and Common Table Expressions (CTEs)?

**Answer:** Temporary tables materialize data and may have indexes/statistics; CTEs name query expressions and may be inlined or materialized by the optimizer.

### 166. How are transactions managed within stored procedures?

**Answer:** Stored procedures may participate in caller transactions or manage transactions where permitted; commit/rollback rules differ by engine.

### 167. How are errors and exceptions handled in stored procedures?

**Answer:** Procedural SQL languages support handlers, exception blocks, and error propagation; ensure failed work is rolled back to the intended boundary.

### 168. What is the difference between scalar and table-valued functions?

**Answer:** Scalar functions return one value; table-valued functions return a relation usable in a query's FROM clause where supported.

### 169. What is the difference between deterministic and non-deterministic database functions?

**Answer:** Deterministic functions return the same result for the same inputs under defined conditions; nondeterministic ones may depend on time, randomness, or database state.

### 170. What is the difference between SQL and PL/SQL?

**Answer:** SQL is the declarative query language; PL/SQL is Oracle's procedural extension adding variables, control flow, and exception handling.

### 171. What is PL/pgSQL, and when is it used in PostgreSQL?

**Answer:** PL/pgSQL is PostgreSQL's procedural language for functions, procedures, and triggers, adding control flow and exception handling to SQL.

### 172. What are PL/SQL packages in Oracle, and what are their benefits?

**Answer:** Oracle packages group related procedures, functions, types, and state behind a specification/body, improving modularity and encapsulation.

### 173. How does execution plan caching work for stored procedures?

**Answer:** Databases may cache compiled or parameterized plans for procedure statements; reuse and parameter sensitivity vary by engine and statement.

### 174. How can user-defined functions affect query performance?

**Answer:** UDFs can introduce per-row execution overhead, limit optimization/inlining, or prevent parallelism depending on language and DBMS.

### 175. How do you test stored procedures and database triggers?

**Answer:** Test routines with controlled fixtures, success/error cases, rollback behavior, concurrency, permissions, and integration tests against the target engine.

### 176. How do you version and deploy database code using migration tools such as Flyway and Liquibase?

**Answer:** Use versioned, reviewed migrations in Flyway or Liquibase, test against realistic databases, deploy compatibly, and avoid editing already-applied migrations.

### 177. What is the difference between CHAR, VARCHAR, and TEXT?

**Answer:** CHAR is fixed-length and often padded; VARCHAR is variable-length with a limit; TEXT is a large/variable string type with vendor-specific behavior.

### 178. What is the difference between DECIMAL, NUMERIC, FLOAT, and DOUBLE?

**Answer:** DECIMAL/NUMERIC represent exact fixed-point numbers; FLOAT/DOUBLE are approximate binary floating-point types with rounding error.

### 179. Why should monetary values generally be stored using DECIMAL rather than FLOAT or DOUBLE?

**Answer:** DECIMAL stores decimal amounts exactly within declared precision, avoiding binary floating-point surprises in financial arithmetic.

### 180. What are precision and scale in numeric data types?

**Answer:** Precision is total significant digits; scale is digits after the decimal point for typical DECIMAL(p,s) declarations.

### 181. What is the difference between SMALLINT, INT, and BIGINT?

**Answer:** SMALLINT, INT, and BIGINT represent increasing integer ranges and storage widths; exact sizes and signedness vary by DBMS.

### 182. What is the difference between DATE, TIME, DATETIME, and TIMESTAMP?

**Answer:** DATE stores a calendar date; TIME a time of day; DATETIME/TIMESTAMP store date-time values with differing timezone and storage semantics across vendors.

### 183. What is the difference between TIMESTAMP WITH TIME ZONE and TIMESTAMP WITHOUT TIME ZONE?

**Answer:** WITHOUT TIME ZONE stores a local date-time without offset context; WITH TIME ZONE has DBMS-specific normalization/offset semantics, not necessarily a retained named timezone.

### 184. How should dates, timestamps, and time zones be handled in a database-backed application?

**Answer:** Store instants consistently (often UTC), preserve timezone IDs for user scheduling, use Java java.time types, and explicitly handle DST and driver mappings.

### 185. What does NULL represent in SQL, and how does three-valued logic work?

**Answer:** NULL means missing/unknown/inapplicable information, not zero or empty text. Comparisons with NULL yield UNKNOWN; WHERE keeps only TRUE.

### 186. What is the difference between implicit and explicit data type conversion?

**Answer:** Implicit conversion is DBMS-selected coercion; explicit conversion uses CAST or equivalent, making intent clearer.

### 187. How can implicit type conversions affect query performance and index usage?

**Answer:** Converting an indexed column during comparison can make predicates non-sargable; align parameter and column types and inspect plans.

### 188. How does choosing the appropriate data type affect storage, performance, and data integrity?

**Answer:** Appropriate types enforce ranges/semantics, minimize storage, and improve indexing and query efficiency; wrong types risk truncation or conversion.

### 189. What is the difference between a character set, character encoding, and collation?

**Answer:** A character set defines supported characters, an encoding maps characters to bytes, and a collation defines comparison/sort rules.

### 190. What is the difference between case-sensitive and case-insensitive collations?

**Answer:** Case-sensitive collations distinguish letter case; case-insensitive collations may treat variants as equivalent, affecting equality, sorting, and uniqueness.

### 191. When should JSON data types be used in a relational database?

**Answer:** Use JSON for flexible, sparse, or nested attributes when relational constraints and joins are not central; avoid using it to bypass sound schema design.

### 192. What is the difference between JSON and JSONB in PostgreSQL?

**Answer:** PostgreSQL JSON stores input text and preserves formatting/key order; JSONB stores parsed binary representation, supports indexing and faster processing, but normalizes representation.

### 193. What is the difference between NULL, zero, and an empty string?

**Answer:** NULL means absent/unknown, zero is a numeric value, and empty string is a zero-length text value; Oracle commonly treats empty strings as NULL.

### 194. How do SQL aggregate functions handle NULL values?

**Answer:** Most aggregates ignore NULL inputs (COUNT(*) counts rows; COUNT(column) counts non-NULL). All-NULL sets usually yield NULL except COUNT.

### 195. How do NULL values affect IN and NOT IN predicates?

**Answer:** IN with NULL follows three-valued logic; NOT IN can yield UNKNOWN when its set contains NULL. Prefer NOT EXISTS for nullable anti-joins.

### 196. What is the difference between NULL and DEFAULT when inserting data?

**Answer:** Explicit NULL inserts NULL if permitted; DEFAULT requests the column default. Omitting a column often uses its default; behavior varies.

### 197. What is the difference between COALESCE and NULLIF?

**Answer:** COALESCE returns the first non-NULL expression; NULLIF(a,b) returns NULL when a equals b, otherwise a.

### 198. What are CAST and CONVERT, and how do they differ across database systems?

**Answer:** CAST is standard SQL type conversion; CONVERT is vendor-specific and may differ in argument order, supported formats, and semantics.

### 199. What are numeric overflow and underflow, and how can they affect database operations?

**Answer:** Overflow exceeds a type's maximum magnitude; underflow produces a value too small to represent accurately. Engines may error, round, or clamp depending on operation and mode.

### 200. How does integer division work in SQL, and what pitfalls should be avoided?

**Answer:** Integer division can truncate fractional parts in some DBMS/operators; cast operands to an exact decimal type when fractional results are required.

### 201. What is the difference between numeric rounding and truncation?

**Answer:** Rounding chooses a nearby representable value according to a rule; truncation discards digits beyond a chosen precision without rounding.

### 202. What is the difference between signed and unsigned integer types?

**Answer:** Signed integers represent negative and positive values; unsigned types represent nonnegative values with a larger positive range for the same width, where supported.

### 203. How is the BOOLEAN data type supported across different database systems?

**Answer:** PostgreSQL has BOOLEAN; MySQL commonly aliases BOOLEAN to TINYINT(1); Oracle support depends on version and SQL versus PL/SQL context.

### 204. How do CHAR padding and trailing spaces affect storage and comparisons?

**Answer:** CHAR may pad stored values with spaces; comparison/trimming semantics differ by DBMS and collation, so test trailing-space-sensitive behavior.

### 205. What is the difference between CHAR and NCHAR, and between VARCHAR and NVARCHAR?

**Answer:** NCHAR/NVARCHAR are national-character types in systems such as SQL Server/Oracle; Unicode support of CHAR/VARCHAR depends on DBMS and encoding.

### 206. What is the difference between UTF-8 and UTF-16?

**Answer:** UTF-8 encodes Unicode with 1–4 bytes per code point; UTF-16 uses one or two 16-bit code units. Neither length equals user-perceived characters.

### 207. What is the difference between utf8 and utf8mb4 in MySQL?

**Answer:** MySQL's historical utf8/utf8mb3 supports at most three-byte UTF-8 sequences; utf8mb4 supports full Unicode including supplementary characters.

### 208. What is the difference between accent-sensitive and accent-insensitive collations?

**Answer:** Accent-sensitive collations distinguish accented letters; accent-insensitive collations can treat them as equivalent for comparison and uniqueness.

### 209. What is the difference between binary and linguistic collations?

**Answer:** Binary collations compare encoded values or code units; linguistic collations apply language-aware equivalence and ordering rules.

### 210. How can collation affect index usage and query performance?

**Answer:** Collation changes comparison selectivity, index ordering, and whether expressions match indexed collation; mismatches can require conversions or scans.

### 211. What is the difference between BINARY and VARBINARY?

**Answer:** BINARY is fixed-length binary data, often padded; VARBINARY is variable-length binary data, with engine-specific limits.

### 212. What is the difference between CLOB and NCLOB?

**Answer:** CLOB stores large character data; NCLOB stores national-character-set large data in systems that distinguish them.

### 213. What are the trade-offs of storing files in a database versus object storage?

**Answer:** Database BLOBs simplify transactional consistency but increase backup, storage, and I/O pressure; object storage scales file delivery, with metadata/consistency coordination.

### 214. What are the advantages of streaming large objects instead of loading them entirely into memory?

**Answer:** Streaming reads/writes large values in chunks, avoiding full memory allocation and reducing peak heap pressure; manage stream and transaction lifetimes.

### 215. When should you use an ENUM, a CHECK constraint, or a lookup table?

**Answer:** ENUM suits small stable sets where supported; CHECK enforces local allowed values; lookup tables support changing values and associated metadata.

### 216. What are the trade-offs of storing UUIDs using a native UUID type versus a string representation?

**Answer:** Native UUID types are compact and type-safe where supported; text UUIDs are portable but larger and may incur parsing/index overhead.

### 217. When should you use JSON columns instead of normalized relational tables?

**Answer:** Use JSON for evolving nested attributes with limited relational querying; use normalized tables for relationships, constraints, and frequent joins.

### 218. How can JSON data be indexed in relational databases?

**Answer:** Index JSON paths using expression/generated-column indexes or native JSON indexes such as PostgreSQL GIN; select strategy based on queried operators.

### 219. What are XML data types, and when should they be used?

**Answer:** XML types store structured XML and may support validation/XPath/XQuery; use them for XML-centric integration or documents, not by default.

### 220. What are array data types in relational databases, and when should they be used?

**Answer:** Array columns store multiple same-type elements in engines such as PostgreSQL; useful for bounded simple attributes but complicate relational constraints.

### 221. What are spatial and geographical data types, and when should they be used?

**Answer:** Spatial/geographic types represent geometry or earth coordinates and enable indexed distance/intersection queries, often via spatial extensions.

### 222. What is the INTERVAL data type, and how is it used?

**Answer:** INTERVAL represents a duration or calendar interval; month-based intervals and fixed elapsed durations behave differently around calendars/DST.

### 223. How can daylight saving time affect timestamp storage and date-time calculations?

**Answer:** DST creates nonexistent or repeated local times; store instants for events and timezone IDs for schedules, and resolve overlaps/gaps explicitly.

### 224. What are user-defined data types and domains in relational databases?

**Answer:** User-defined types/domains encapsulate reusable value structures or constraints, improving consistency but increasing DBMS-specific coupling.

### 225. What are the trade-offs of using database-specific data types instead of standard SQL data types?

**Answer:** Vendor-specific types can improve correctness and performance but reduce portability across drivers, migrations, and databases.

### 226. What happens if the database connection is lost during a transaction commit? How can the application handle an uncertain transaction outcome?

**Answer:** A lost connection during COMMIT leaves an uncertain outcome: commit may have succeeded. Do not blindly retry non-idempotent work; reconcile using transaction IDs, idempotency keys, or business state.

### 227. How does a database ensure transaction durability?

**Answer:** Databases typically write recovery information to durable storage before acknowledging commit, subject to flush settings, hardware, and replication guarantees.

### 228. What is Write-Ahead Logging (WAL), and how does it work?

**Answer:** WAL records intended changes before corresponding data pages are flushed, enabling redo after crashes and supporting replication/recovery.

### 229. What is the difference between undo and redo logs?

**Answer:** Undo records allow rollback or older row visibility; redo records reapply committed changes after crashes. Exact log structures vary by engine.

### 230. How does a database recover after an unexpected crash?

**Answer:** Recovery uses checkpoints and transaction logs to redo durable changes and undo incomplete work, restoring a consistent state according to engine guarantees.

### 231. What is the difference between synchronous and asynchronous commit?

**Answer:** Synchronous commit waits for configured durability acknowledgments; asynchronous commit returns earlier with a window of possible committed-data loss on crash.

### 232. Why is database replication not a replacement for backups?

**Answer:** Replication copies errors and accidental deletions too; independent, versioned backups enable recovery from corruption, operator mistakes, and ransomware.

### 233. What is Point-in-Time Recovery (PITR), and how does it work?

**Answer:** PITR restores a base backup and replays archived transaction logs to a chosen recovery point, subject to available log retention.

### 234. What is the difference between RPO and RTO?

**Answer:** RPO is the maximum acceptable data-loss window; RTO is the maximum acceptable time to restore service.

### 235. What is the difference between InnoDB and MyISAM in MySQL?

**Answer:** InnoDB supports transactions, row locking, crash recovery, and foreign keys; MyISAM lacks transactional guarantees and is generally unsuitable for modern transactional workloads.

### 236. What is a database buffer pool, and how does it improve performance?

**Answer:** A buffer pool caches database pages in memory, reducing disk I/O and improving throughput; sizing and eviction policies are engine-specific.

### 237. What is the difference between B-tree-based and LSM-tree-based storage engines?

**Answer:** B-tree engines optimize ordered lookups and updates in place; LSM-tree engines buffer writes and compact sorted runs, favoring write throughput with read/compaction trade-offs.

### 238. What are VACUUM and autovacuum in PostgreSQL, and why are they necessary?

**Answer:** PostgreSQL VACUUM reclaims dead tuple space for reuse and maintains visibility metadata; autovacuum automates it and helps prevent transaction ID wraparound.

### 239. What is the difference between MySQL redo logs, undo logs, and binary logs?

**Answer:** MySQL InnoDB redo logs support crash recovery, undo logs support rollback/MVCC, and binary logs record changes for replication/PITR.

### 240. What is the difference between index rebuilding and index reorganization, and when should each be used?

**Answer:** Rebuilding recreates an index; reorganization defragments/reorders it where supported. Use measured fragmentation and workload evidence; maintenance terminology varies by DBMS.

### 241. What is the difference between hot and cold database backups?

**Answer:** Hot backups occur while the database serves traffic using consistency mechanisms; cold backups occur while it is stopped or quiesced, simplifying consistency but requiring downtime.

### 242. What is the difference between database failover and failback?

**Answer:** Failover switches service to a standby after failure; failback returns service to a preferred or restored primary after stabilization.

### 243. How do you estimate and plan database storage capacity for a growing application?

**Answer:** Forecast data growth, indexes, WAL/logs, replicas, backups, retention, and peak workloads; monitor actual rates and leave capacity headroom.
