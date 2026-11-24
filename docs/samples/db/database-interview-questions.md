# DBMS Interview Questions

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

## DBMS – Interview Questions

| ID | Question | Origin | Topics | Evidence | Вероятност |
| ---: | --- | --- | --- | --- | ---: |
| 1 | What is a Database? | ORIGINAL | Database Fundamentals | — | 4 |
| 2 | What is DBMS? What are the most popular types of DBMS? | ORIGINAL | Database Fundamentals | — | 4 |
| 3 | What is RDBMS? | ORIGINAL | Database Fundamentals | — | 4 |
| 8 | What is Normalization in a Database? | ORIGINAL | Database Design; Relational Model & Data Integrity | — | 5 |
| 9 | What are SQL tables? | ORIGINAL | Relational Model & Data Integrity | — | 3 |
| 10 | What is a relationship and what types are they? | ORIGINAL | Relational Model & Data Integrity; Database Design | — | 4 |
| 18 | What is an Index in SQL? | ORIGINAL | Indexing | — | 5 |
| 20 | What is a Clustered Index in SQL? | ORIGINAL | Indexing | — | 3 |
| 21 | What is the Non-Clustered Index in SQL? | ORIGINAL | Indexing | — | 3 |
| 22 | What is a primary key? | ORIGINAL | Relational Model & Data Integrity; Database Design | — | 5 |
| 23 | What is a foreign key? | ORIGINAL | Relational Model & Data Integrity; Database Design | — | 5 |
| 32 | What is a constraint? | ORIGINAL | Relational Model & Data Integrity; Database Design | — | 5 |
| 33 | What is a "TRIGGER" in SQL? | ORIGINAL | Database Programmability | — | 3 |
| 34 | What is a transaction? | ORIGINAL | Transactions | — | 5 |
| 35 | What is ACID? | ORIGINAL | Transactions | — | 5 |
| 36 | What is Atomicity? (ACID) | ORIGINAL | Transactions | — | 4 |
| 37 | What is Consistency? (ACID) | ORIGINAL | Transactions; Relational Model & Data Integrity | — | 4 |
| 38 | What is Isolation? (ACID) | ORIGINAL | Transactions; Transaction Isolation | — | 4 |
| 39 | What is Durability? (ACID) | ORIGINAL | Transactions; Storage & Recovery | — | 4 |
| 40 | What is collation? | ORIGINAL | Data Types & Collation | — | 3 |
| 42 | What is CRUD? | ORIGINAL | Database Fundamentals | — | 5 |
| 61 | What is transaction isolation? | ORIGINAL | Transaction Isolation; Transactions | — | 5 |
| 62 | What are the standard transaction isolation levels, and how do they differ? | ORIGINAL_REVISED | Transaction Isolation; Transactions | — | 5 |
| 63 | What is phantom read and which isolation level prevents it? | ORIGINAL | Transaction Isolation | — | 5 |
| 64 | What is “dirty read” in JDBC? Which isolation level prevents “dirty read”? | ORIGINAL | Transaction Isolation | — | 5 |
| 65 | What is “non-repeatable” read and which isolation level prevents it? | ORIGINAL | Transaction Isolation | — | 5 |
| 66 | What is a 2-phase commit? | ORIGINAL | Distributed Databases; Transactions | — | 4 |
| 67 | What are the different types of locks in relational databases? | ORIGINAL_REVISED | Concurrency Control & Locking | — | 5 |
| 74 | What is database deadlock? How can we avoid them? | ORIGINAL | Concurrency Control & Locking; Transactions | — | 5 |
| 76 | BLOB vs CLOB | ORIGINAL | Data Types & Collation | — | 3 |
| 77 | What is the difference between optimistic and pessimistic locking? | ADDED | Concurrency Control & Locking; Transaction Isolation | — | 5 |
| 79 | What is the difference between COMMIT and ROLLBACK? | ADDED | Transactions | [Prep](https://github.com/dhanush106/INTERVIEW-PREP/blob/main/TCS_Prime_DBMS_Interview_Handbook.md) | 5 |
| 80 | What happens if one operation within a transaction fails? | ADDED | Transactions | [Prep](https://interview-prep.coderboi.com/sql/transactions/transactions) | 4 |
| 81 | Why should database transactions be kept short? | ADDED | Transactions; Concurrency Control & Locking; Query Optimization & Performance | [Prep](https://github.com/ajayduraisamy/java-complete-roadmap/blob/main/19-JDBC/Transactions.md) | 4 |
| 82 | What is a savepoint in a database transaction? | ADDED | Transactions | [Prep](https://github.com/ajayduraisamy/java-complete-roadmap/blob/main/19-JDBC/Transactions.md) | 2 |
| 83 | What is a lost update, and how can it be prevented? | ADDED | Transaction Isolation; Concurrency Control & Locking | [Prep](https://www.systemdesign.academy/dbms-interview-questions) | 5 |
| 84 | How do you choose the appropriate transaction isolation level? | ADDED | Transaction Isolation; Concurrency Control & Locking | [Prep](https://testlabapp.com/interview-questions/system-design/databases) | 4 |
| 85 | What are the default transaction isolation levels in MySQL, PostgreSQL and Oracle? | ADDED | Transaction Isolation | [Prep](https://www.techinterviewprep.io/roles/backend-engineer/qa) | 3 |
| 86 | What is a dirty write, and how can it be prevented? | ADDED | Transaction Isolation; Concurrency Control & Locking | [Technical](https://inf.mit.bme.hu/sites/default/files/publications/ldbc-acid-tpctc2020.pdf) — interview occurrence unverified | 3 |
| 87 | What is MVCC (Multi-Version Concurrency Control), and how does it work? | ADDED | Concurrency Control & Locking; Transaction Isolation | [Prep](https://coddy.tech/interview-questions/dbms/concurrency) | 4 |
| 88 | What is the difference between shared and exclusive locks? | ADDED | Concurrency Control & Locking | [Prep](https://www.interviewsvector.com/sql) | 4 |
| 89 | What is the difference between row-level and table-level locking? | ADDED | Concurrency Control & Locking | [Prep](https://www.interviewsvector.com/sql) | 4 |
| 90 | How does optimistic locking work using a version column? | ADDED | Concurrency Control & Locking; Transaction Isolation | [Prep](https://elevateprep.vercel.app/senior-java-interview/part-1a) | 4 |
| 91 | What is the difference between blocking and a deadlock? | ADDED | Concurrency Control & Locking | [Prep](https://www.interviewsvector.com/sql) | 4 |
| 92 | How do you decide which columns to index? | ADDED | Indexing; Query Optimization & Performance | [Interview report (adapted)](https://prachub.com/interview-questions/binary-tree-completeness-check-then-b-tree-indexes-and-why-not-index-every-column) | 5 |
| 93 | What are the advantages and disadvantages of database indexes? | ADDED | Indexing; Query Optimization & Performance | [Interview report (adapted)](https://prachub.com/interview-questions/binary-tree-completeness-check-then-b-tree-indexes-and-why-not-index-every-column); [Prep](https://www.autocoder.live/guides/dbms-indexing-interview-questions) | 5 |
| 94 | What is a composite index, and why does the order of its columns matter? | ADDED | Indexing; Query Optimization & Performance | [Prep](https://www.autocoder.live/guides/dbms-indexing-interview-questions) | 5 |
| 95 | What is the difference between a composite index and multiple single-column indexes? | ADDED | Indexing; Query Optimization & Performance | [Prep (related concept; adapted)](https://testlabapp.com/interview-questions/system-design/databases) | 4 |
| 96 | Why might a database not use an existing index? | ADDED | Indexing; Query Optimization & Performance | [Prep](https://renekin.com/blog/database-indexing-interview-questions) | 5 |
| 97 | How are database indexes implemented internally, and how do they work? | ADDED | Indexing | [Interview report (B-tree; adapted)](https://prachub.com/interview-questions/binary-tree-completeness-check-then-b-tree-indexes-and-why-not-index-every-column); [Prep](https://www.autocoder.live/guides/dbms-indexing-interview-questions) | 4 |
| 98 | What is a covering index? | ADDED | Indexing; Query Optimization & Performance | [Prep](https://renekin.com/blog/database-indexing-interview-questions) | 3 |
| 99 | When can database indexes negatively affect performance, and when is it better not to create an index? | ADDED | Indexing; Query Optimization & Performance | [Interview report (adapted)](https://prachub.com/interview-questions/binary-tree-completeness-check-then-b-tree-indexes-and-why-not-index-every-column); [Prep](https://app.gettarmac.com/interview-questions/databases-sql-indexes-interview-questions) | 4 |
| 100 | How would you identify and optimize a slow SQL query in production? | ADDED | Query Optimization & Performance | [Interview report (adapted)](https://rathod-ajay.medium.com/the-goldman-sachs-senior-java-backend-developer-interview-questions-b01d33467da7); [Interview report (adapted)](https://smileupdates.in/cgi-java-interview-experience-2-8-years-technical-hr/) | 5 |
| 101 | What is a query execution plan, and how do you use it to optimize SQL queries? | ADDED | Query Optimization & Performance | [Prep](https://learnbackend.com/interview-prep/databases/) | 5 |
| 102 | What is the difference between EXPLAIN and EXPLAIN ANALYZE? | ADDED | Query Optimization & Performance | [Prep](https://learnbackend.com/interview-prep/databases/) | 3 |
| 103 | What is the difference between a full table scan and an index scan? When is each preferable? | ADDED | Query Optimization & Performance; Indexing | [Prep](https://viacheslavchernyshov.github.io/java-interview-questions-and-answers/questions/01-databases-sql-postgresql/21-how-to-optimize-slow-queries/) | 4 |
| 104 | What are database statistics, and how do they affect query execution plans? | ADDED | Query Optimization & Performance | [Prep](https://learnbackend.com/interview-prep/databases/) | 3 |
| 105 | How can you improve the performance of SQL queries involving multiple joins? | ADDED | Query Optimization & Performance | [Interview report (adapted)](https://blog.stackademic.com/atlassians-java-backend-interview-was-brutal-because-the-problems-were-real-6263ec4debde) | 4 |
| 106 | What is the difference between offset-based and cursor-based pagination, and how do they affect performance? | ADDED | Query Optimization & Performance | [Interview report (adapted)](https://blog.stackademic.com/atlassians-java-backend-interview-was-brutal-because-the-problems-were-real-6263ec4debde) | 4 |
| 107 | Why should you avoid SELECT * in production queries? | ADDED | Query Optimization & Performance | [Interview report (adapted)](https://rathod-ajay.medium.com/the-goldman-sachs-senior-java-backend-developer-interview-questions-b01d33467da7) | 4 |
| 108 | What is the N+1 query problem, and how can it be solved? | ADDED | Query Optimization & Performance | [Prep](https://viacheslavchernyshov.github.io/java-interview-questions-and-answers/questions/01-databases-sql-postgresql/21-how-to-optimize-slow-queries/) | 5 |
| 109 | What is a sargable SQL predicate? | ADDED | Query Optimization & Performance; Indexing | [Prep](https://medium.com/codetodeploy/sql-interview-questions-for-java-backend-developers-30-queries-interviewers-actually-ask-90164d852aed) | 3 |
| 110 | What are the first, second, and third normal forms (1NF, 2NF, 3NF)? | ADDED | Database Design | [Prep](https://federicosella.com/en/learn/interviews/sql-database-interview-questions/) | 5 |
| 111 | What is denormalization, and when should it be used? | ADDED | Database Design; Query Optimization & Performance | [Prep](https://crackedjava.com/track/java-backend/module/postgresql/topic/normalization-schema-design) | 4 |
| 112 | What are insertion, update, and deletion anomalies, and how does normalization prevent them? | ADDED | Database Design; Relational Model & Data Integrity | [Prep](https://www.codebegun.com/interview/sql/normalization) | 3 |
| 113 | What is the difference between natural and surrogate keys, and when should each be used? | ADDED | Database Design; Relational Model & Data Integrity | [Prep](https://crackedjava.com/track/java-backend/module/postgresql/topic/normalization-schema-design) | 4 |
| 114 | What is a composite primary key, and when should it be used? | ADDED | Database Design; Relational Model & Data Integrity | [Interview report (adapted)](https://medium.com/@anil-singh/i-recently-appeared-for-java-backend-developer-interviews-34527c1bc906); [Prep](https://clapassist.com/tools/interview-questions/dbms/) | 4 |
| 115 | How do you model a many-to-many relationship in a relational database? | ADDED | Database Design; Relational Model & Data Integrity | [Interview report (adapted)](https://prachub.com/interview-questions/many-to-many-schema-design-with-a-join-table-composite-primary-key-and-queries) | 5 |
| 116 | What are the advantages and disadvantages of using UUIDs versus auto-incrementing IDs as primary keys? | ADDED | Database Design; Relational Model & Data Integrity | [Prep](https://crackedjava.com/track/java-backend/module/postgresql/topic/normalization-schema-design) | 4 |
| 117 | What is Boyce-Codd Normal Form (BCNF), and how does it differ from 3NF? | ADDED | Database Design; Relational Model & Data Integrity | [Technical (not interview evidence; user-approved)](https://en.wikipedia.org/wiki/Boyce%E2%80%93Codd_normal_form) | 2 |
| 118 | What is Fourth Normal Form (4NF)? | ADDED | Database Design; Relational Model & Data Integrity | [Technical (not interview evidence; user-approved)](https://en.wikipedia.org/wiki/Fourth_normal_form) | 1 |
| 119 | What is Fifth Normal Form (5NF)? | ADDED | Database Design; Relational Model & Data Integrity | [Technical (not interview evidence; user-approved)](https://en.wikipedia.org/wiki/Fifth_normal_form) | 1 |
| 120 | What is Sixth Normal Form (6NF)? | ADDED | Database Design; Relational Model & Data Integrity | [Technical (not interview evidence; user-approved)](https://en.wikipedia.org/wiki/Sixth_normal_form) | 1 |
| 121 | What is the difference between a primary key and a unique key? | ADDED | Relational Model & Data Integrity; Database Design | [Prep](https://www.codebegun.com/interview/sql/constraints); [Prep](https://www.techprep.app/blog/sql-interview-questions) | 5 |
| 122 | What are candidate keys, superkeys, and alternate keys? | ADDED | Relational Model & Data Integrity; Database Design | [Prep](https://lunarai.in/database/sql/keys-constraints/) | 3 |
| 123 | What is referential integrity, and how is it enforced? | ADDED | Relational Model & Data Integrity; Database Design | [Prep](https://www.codebegun.com/interview/sql/constraints) | 4 |
| 124 | What are the different types of database constraints? | ADDED | Relational Model & Data Integrity; Database Design | [Prep](https://crackr.dev/interview-guides/java-interview-questions/databases) | 4 |
| 125 | What is the difference between ON DELETE CASCADE, SET NULL, RESTRICT, and NO ACTION? | ADDED | Relational Model & Data Integrity; Database Design | [Prep](https://testlabapp.com/interview-questions/web-and-mobile-development/sql) | 4 |
| 126 | Can a foreign key contain NULL values or reference a non-primary key? | ADDED | Relational Model & Data Integrity; Database Design | [Prep](https://interviewstacks.com/stacks/sql-databases/data-modeling-and-normalization) | 3 |
| 127 | Can a UNIQUE constraint allow NULL values? | ADDED | Relational Model & Data Integrity | [Prep](https://www.techprep.app/blog/sql-interview-questions) | 3 |
| 128 | Why should data integrity be enforced at the database level rather than relying solely on application-level validation? | ADDED | Relational Model & Data Integrity; Database Design | [Prep](https://www.codebegun.com/interview/sql/constraints) | 4 |
| 129 | What is the difference between a UNIQUE constraint and a unique index? | ADDED | Relational Model & Data Integrity; Indexing | [Technical (not interview evidence; user-approved)](https://www.postgresql.org/docs/current/indexes-unique.html) | 3 |
| 130 | What is database replication, and how does it work? | ADDED | Database Architecture; Distributed Databases | [Technical](https://www.postgresql.org/docs/current/warm-standby.html) | 4 |
| 131 | What is the difference between synchronous and asynchronous replication? | ADDED | Database Architecture; Distributed Databases | [Prep (adapted)](https://medium.com/javarevisited/database-system-design-interview-questions-and-answers-for-senior-engineers-e57a101e348e) | 3 |
| 132 | What is database partitioning, and what are its benefits? | ADDED | Database Architecture; Query Optimization & Performance | [Technical](https://www.postgresql.org/docs/current/ddl-partitioning.html) | 4 |
| 133 | What is database sharding, and when should it be used? | ADDED | Database Architecture; Distributed Databases | [Technical](https://www.mongodb.com/docs/manual/sharding/) | 4 |
| 134 | What is the difference between partitioning and sharding? | ADDED | Database Architecture; Distributed Databases | [Interview report (adapted; previously identified)](https://www.reddit.com/r/deloitteusi/comments/1v9lg25/deloitte_java_software_engineer_ii_interview/) | 4 |
| 135 | What is the difference between horizontal and vertical database scaling? | ADDED | Database Architecture; Distributed Databases | [Prep (adapted)](https://fonzi.ai/blog/backend-interview-questions) | 4 |
| 136 | How would you scale a relational database as traffic and data volume increase? | ADDED | Database Architecture; Query Optimization & Performance | [Interview report (adapted; previously identified)](https://www.reddit.com/r/deloitteusi/comments/1v9lg25/deloitte_java_software_engineer_ii_interview/) | 4 |
| 137 | What are read replicas, and when should they be used? | ADDED | Database Architecture; Query Optimization & Performance; Distributed Databases | [Technical](https://www.postgresql.org/docs/current/warm-standby.html) | 4 |
| 138 | What is replication lag, and how can it affect application behavior? | ADDED | Database Architecture; Distributed Databases | [Technical](https://www.postgresql.org/docs/current/warm-standby.html) | 4 |
| 139 | What is database failover, and how does it support high availability? | ADDED | Database Architecture; Distributed Databases | [Technical](https://www.postgresql.org/docs/current/warm-standby.html) | 3 |
| 140 | What is the difference between range, hash, and list partitioning? | ADDED | Database Architecture | [Technical](https://www.postgresql.org/docs/current/ddl-partitioning.html) | 2 |
| 141 | What is the difference between horizontal and vertical partitioning? | ADDED | Database Architecture | [Technical](https://learn.microsoft.com/en-us/azure/architecture/best-practices/data-partitioning) | 2 |
| 142 | What is partition pruning, and how does it improve query performance? | ADDED | Database Architecture; Query Optimization & Performance | [Technical](https://www.postgresql.org/docs/current/ddl-partitioning.html) | 2 |
| 143 | How do you choose an appropriate shard key? | ADDED | Database Architecture; Distributed Databases | [Technical](https://www.mongodb.com/docs/manual/core/sharding-shard-key/) | 2 |
| 144 | What is consistent hashing, and how does it work? | ADDED | Database Architecture; Distributed Databases | [Technical](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) | 3 |
| 145 | What is the difference between OLTP and OLAP? | ADDED | Database Architecture; Database Fundamentals | [Technical](https://www.ibm.com/think/topics/olap) | 3 |
| 146 | What are the challenges of cross-shard joins, and how can they be addressed? | ADDED | Database Architecture; Distributed Databases; Query Optimization & Performance | [Technical](https://docs.citusdata.com/en/stable/develop/reference_sql.html) | 2 |
| 150 | How do you maintain data consistency across multiple databases in a microservices architecture? | ADDED | Distributed Databases; Transactions | [Technical](https://microservices.io/patterns/data/saga.html) | 4 |
| 151 | What is the Saga pattern, and how does it handle distributed transactions? | ADDED | Distributed Databases; Transactions | [Technical](https://microservices.io/patterns/data/saga.html) | 4 |
| 152 | What is the difference between the Saga pattern and two-phase commit (2PC)? | ADDED | Distributed Databases; Transactions | [Technical](https://microservices.io/patterns/data/saga.html) | 4 |
| 153 | What is the Transactional Outbox pattern, and what problem does it solve? | ADDED | Distributed Databases; Transactions | [Technical](https://microservices.io/patterns/data/transactional-outbox.html) | 4 |
| 154 | What is idempotency, and why is it important in distributed transactions? | ADDED | Distributed Databases; Transactions | [Technical](https://microservices.io/patterns/communication-style/idempotent-consumer.html) | 4 |
| 155 | What is the difference between a compensating transaction and a traditional transaction rollback? | ADDED | Distributed Databases; Transactions | [Technical](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction) | 4 |
| 156 | What is the difference between Saga orchestration and choreography? | ADDED | Distributed Databases; Transactions | [Technical](https://microservices.io/patterns/data/saga.html) | 4 |
| 157 | What are distributed locks, and what challenges arise when using them? | ADDED | Distributed Databases; Concurrency Control & Locking | [Technical](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) | 3 |
| 158 | What is the split-brain problem in distributed databases, and how can it be prevented? | ADDED | Distributed Databases; Database Architecture | [Technical](https://www.postgresql.org/docs/current/warm-standby-failover.html) | 2 |
| 163 | What is the difference between structured, semi-structured, and unstructured data? | ADDED | Database Fundamentals | [Technical (unverified)](https://www.ibm.com/think/topics/structured-vs-unstructured-data); [Previously proposed source (unverified)](https://medium.com/javarevisited/globallogic-senior-java-developer-interview-experience-for-ericsson-client-45-minutes-of-deep-ec1887d67eb4) | 2 |
| 166 | What is the difference between DBMS and RDBMS? | ADDED | Database Fundamentals | — | 4 |
| 171 | What is the difference between in-memory and disk-based databases? | ADDED | Database Fundamentals; Database Architecture | [Technical (unverified)](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) | 3 |
| 172 | What is the difference between row-oriented and column-oriented databases? | ADDED | Database Fundamentals; Database Architecture; Query Optimization & Performance | [Technical (unverified)](https://clickhouse.com/docs/intro) | 2 |
| 175 | What is the difference between embedded and client-server databases? | ADDED | Database Fundamentals; Database Architecture | [Technical (unverified)](https://www.sqlite.org/whentouse.html) | 2 |
| 178 | What is the difference between an operational database and a data warehouse? | ADDED | Database Fundamentals | [Technical (unverified)](https://aws.amazon.com/data-warehouse/) | 2 |
| 179 | What is the difference between a data warehouse and a data lake? | ADDED | Database Fundamentals | [Technical (unverified)](https://aws.amazon.com/big-data/datalakes-and-analytics/what-is-a-data-lake/) | 2 |
| 180 | What is the difference between a database schema and a database instance? | ADDED | Database Fundamentals | — | 2 |
| 181 | What is the difference between logical and physical data independence? | ADDED | Database Fundamentals; Database Architecture | — | 1 |
| 182 | What is SQL injection, and how can it be prevented? | ADDED | Database Security | [Interview report (adapted)](https://readmedium.com/barclays-java-spring-boot-micro-service-interview-question-with-answer-2024-031e36f44c7b) (not reverified) | 5 |
| 183 | How do parameterized queries prevent SQL injection, and what are their limitations? | ADDED | Database Security | [Prep](https://elevateprep.vercel.app/senior-java-interview/part-12) (not reverified) | 5 |
| 184 | Can SQL injection occur when using JPA or Hibernate? | ADDED | Database Security | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) (not reverified) | 4 |
| 185 | What is the difference between authentication and authorization at the database level? | ADDED | Database Security | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 3 |
| 186 | What are database roles and privileges, and how do they work? | ADDED | Database Security | [Prep](https://interview-prep.coderboi.com/sql/security/permissions) (not reverified) | 3 |
| 187 | What is the principle of least privilege, and how does it apply to databases? | ADDED | Database Security | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 4 |
| 188 | How do you securely manage database credentials in an application? | ADDED | Database Security | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 4 |
| 189 | What is the difference between database encryption at rest and encryption in transit? | ADDED | Database Security | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 3 |
| 190 | What is row-level security (RLS), and when should it be used? | ADDED | Database Security; Database Design | [Prep](https://prachub.com/resources/postgresql-row-level-security-interview-questions-policies-roles-and-tenant-isolation) (not reverified) | 2 |
| 191 | What is database auditing, and what activities should be audited? | ADDED | Database Security | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 2 |
| 192 | How would you secure a production database used by a backend application? | ADDED | Database Security; Database Architecture | [Prep](https://data.noblerworks.com/resources/interview-prep/dba-interview/) (not reverified) | 4 |
| 193 | What is data masking, and when should it be used? | ADDED | Database Security | — | 2 |
| 194 | What is the difference between data anonymization and pseudonymization? | ADDED | Database Security | — | 2 |
| 195 | What is the difference between hashing and encryption? | ADDED | Database Security | — | 4 |
| 196 | What is column-level encryption, and when should it be used? | ADDED | Database Security | — | 2 |
| 197 | What is Transparent Data Encryption (TDE), and how does it work? | ADDED | Database Security | — | 1 |
| 198 | What is Role-Based Access Control (RBAC), and how does it apply to databases? | ADDED | Database Security | — | 2 |
| 199 | What are the GRANT and REVOKE statements in SQL? | ADDED | Database Security | [Technical](https://www.postgresql.org/docs/current/sql-grant.html) (not reverified) | 2 |
| 200 | How can database views be used to enforce data access restrictions? | ADDED | Database Security | — | 2 |
| 201 | What is column-level security, and how does it work? | ADDED | Database Security | — | 2 |
| 202 | How can tenant data isolation be enforced in a multi-tenant database? | ADDED | Database Security; Database Architecture; Database Design | — | 3 |
| 204 | What is database credential rotation, and how can it be implemented safely? | ADDED | Database Security | — | 2 |
| 205 | Why should database backups be encrypted, and how can they be protected? | ADDED | Database Security; Storage & Recovery | — | 2 |
| 206 | What is database network isolation, and why is it important? | ADDED | Database Security | — | 2 |
| 207 | What are the security risks of dynamic SQL, and how can they be mitigated? | ADDED | Database Security | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) (not reverified) | 3 |
| 208 | What are the security risks of stored procedures, and how can they be mitigated? | ADDED | Database Security; Database Programmability | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) (not reverified) | 2 |
| 209 | What is a stored procedure, and when should it be used? | ADDED | Database Programmability | [Prep](https://meetassist.io/interview-questions/sql/database-programming) (not reverified) | 4 |
| 210 | What is a user-defined database function? | ADDED | Database Programmability | [Technical](https://docs.oracle.com/en/database/oracle/oracle-database/18/jjdev/java-developers-guide.pdf) (not reverified) | 3 |
| 211 | What is the difference between a stored procedure and a database function? | ADDED | Database Programmability | [Prep](https://learnfrenzy.com/technical-interview/database-management/dbms-concepts-and-design/views-procedures-triggers-sql-security) (not reverified) | 4 |
| 212 | What are the advantages and disadvantages of using stored procedures? | ADDED | Database Programmability | [Prep](https://meetassist.io/interview-questions/sql/database-programming) (not reverified) | 4 |
| 213 | When should business logic be implemented in the database rather than in the application? | ADDED | Database Programmability; Database Architecture | [Interview report (adapted)](https://nextraise.ai/interview-questions/mastercard/hibernate-spring-boot-sql-procedures-vs-java-triggers-buv8yn) (not reverified) | 4 |
| 214 | What are the advantages and disadvantages of database triggers? | ADDED | Database Programmability | [Prep](https://learnfrenzy.com/technical-interview/database-management/dbms-concepts-and-design/views-procedures-triggers-sql-security) (not reverified) | 4 |
| 215 | What is the difference between a database view and a materialized view? | ADDED | Database Programmability; Query Optimization & Performance | [Prep](https://goodspace.ai/interview-questions/dbms) (not reverified) | 4 |
| 216 | What is a database cursor, and when should it be used or avoided? | ADDED | Database Programmability; Query Optimization & Performance | [Prep](https://learnfrenzy.com/technical-interview/database-management/dbms-concepts-and-design/views-procedures-triggers-sql-security) (not reverified) | 3 |
| 217 | What is the difference between a database trigger and a constraint? | ADDED | Database Programmability; Relational Model & Data Integrity | [Prep](https://learnfrenzy.com/technical-interview/database-management/dbms-concepts-and-design/views-procedures-triggers-sql-security) (not reverified) | 2 |
| 218 | What is the difference between IN, OUT, and INOUT parameters in stored procedures? | ADDED | Database Programmability | [Prep](https://olibr.com/blog/interview-questions-on-sql-and-pl-sql) (not reverified) | 2 |
| 219 | What is the difference between static and dynamic SQL? | ADDED | Database Programmability | — | 3 |
| 220 | What is the difference between BEFORE, AFTER, and INSTEAD OF triggers? | ADDED | Database Programmability | — | 2 |
| 221 | What is the difference between row-level and statement-level triggers? | ADDED | Database Programmability | — | 2 |
| 222 | How is the execution order of multiple database triggers determined? | ADDED | Database Programmability | — | 1 |
| 223 | What are recursive and cascading triggers, and what problems can they cause? | ADDED | Database Programmability | — | 2 |
| 224 | How do database triggers behave within a transaction, including during a rollback? | ADDED | Database Programmability; Transactions | — | 3 |
| 225 | What is the difference between explicit and implicit cursors? | ADDED | Database Programmability | — | 2 |
| 226 | What is the difference between cursor-based and set-based processing? | ADDED | Database Programmability; Query Optimization & Performance | — | 3 |
| 227 | What is the difference between updatable and read-only views? | ADDED | Database Programmability | — | 3 |
| 228 | How can materialized views be refreshed, and what are the trade-offs of different refresh strategies? | ADDED | Database Programmability; Query Optimization & Performance | — | 3 |
| 229 | What are temporary tables, and when should they be used? | ADDED | Database Programmability | — | 3 |
| 230 | What is the difference between temporary tables and Common Table Expressions (CTEs)? | ADDED | Database Programmability; Query Optimization & Performance | — | 3 |
| 231 | How are transactions managed within stored procedures? | ADDED | Database Programmability; Transactions | — | 2 |
| 232 | How are errors and exceptions handled in stored procedures? | ADDED | Database Programmability | — | 2 |
| 233 | What is the difference between scalar and table-valued functions? | ADDED | Database Programmability | — | 2 |
| 234 | What is the difference between deterministic and non-deterministic database functions? | ADDED | Database Programmability; Indexing; Query Optimization & Performance | — | 2 |
| 235 | What is the difference between SQL and PL/SQL? | ADDED | Database Programmability | — | 2 |
| 236 | What is PL/pgSQL, and when is it used in PostgreSQL? | ADDED | Database Programmability | — | 2 |
| 237 | What are PL/SQL packages in Oracle, and what are their benefits? | ADDED | Database Programmability | — | 1 |
| 238 | How does execution plan caching work for stored procedures? | ADDED | Database Programmability; Query Optimization & Performance | — | 1 |
| 239 | How can user-defined functions affect query performance? | ADDED | Database Programmability; Query Optimization & Performance | — | 2 |
| 240 | How do you test stored procedures and database triggers? | ADDED | Database Programmability | — | 2 |
| 241 | How do you version and deploy database code using migration tools such as Flyway and Liquibase? | ADDED | Database Programmability | — | 4 |
| 242 | What is the difference between CHAR, VARCHAR, and TEXT? | ADDED | Data Types & Collation | [Prep](https://zorosec.github.io/data-interview-bank/sql.html) (not reverified) | 4 |
| 243 | What is the difference between DECIMAL, NUMERIC, FLOAT, and DOUBLE? | ADDED | Data Types & Collation | [Prep](https://datadank.com/sql/sql-interview-questions/) (not reverified) | 4 |
| 244 | Why should monetary values generally be stored using DECIMAL rather than FLOAT or DOUBLE? | ADDED | Data Types & Collation | [Prep](https://datadank.com/sql/sql-interview-questions/) (not reverified) | 5 |
| 245 | What are precision and scale in numeric data types? | ADDED | Data Types & Collation | [Prep](https://testlabapp.com/interview-questions/web-and-mobile-development/sql) (not reverified) | 3 |
| 246 | What is the difference between SMALLINT, INT, and BIGINT? | ADDED | Data Types & Collation | [Prep](https://interview-prep.coderboi.com/sql/schema/data-types) (not reverified) | 3 |
| 247 | What is the difference between DATE, TIME, DATETIME, and TIMESTAMP? | ADDED | Data Types & Collation | [Prep](https://sqlism.com/interview/fundamentals) (not reverified) | 4 |
| 248 | What is the difference between TIMESTAMP WITH TIME ZONE and TIMESTAMP WITHOUT TIME ZONE? | ADDED | Data Types & Collation | [Prep](https://testlabapp.com/interview-questions/web-and-mobile-development/sql) (not reverified) | 4 |
| 249 | How should dates, timestamps, and time zones be handled in a database-backed application? | ADDED | Data Types & Collation | [Prep](https://zorosec.github.io/data-interview-bank/sql.html) (not reverified) | 5 |
| 250 | What does NULL represent in SQL, and how does three-valued logic work? | ADDED | Data Types & Collation | [Prep](https://zorosec.github.io/data-interview-bank/sql.html) (not reverified) | 4 |
| 251 | What is the difference between implicit and explicit data type conversion? | ADDED | Data Types & Collation | [Technical](https://learn.microsoft.com/en-us/sql/t-sql/functions/cast-and-convert-transact-sql) (not reverified) | 3 |
| 252 | How can implicit type conversions affect query performance and index usage? | ADDED | Data Types & Collation; Indexing; Query Optimization & Performance | [Prep](https://zorosec.github.io/data-interview-bank/sql.html) (not reverified) | 4 |
| 253 | How does choosing the appropriate data type affect storage, performance, and data integrity? | ADDED | Data Types & Collation; Database Design; Query Optimization & Performance; Relational Model & Data Integrity | [Prep](https://interview-prep.coderboi.com/sql/schema/data-types) (not reverified) | 4 |
| 254 | What is the difference between a character set, character encoding, and collation? | ADDED | Data Types & Collation | — | 3 |
| 255 | What is the difference between case-sensitive and case-insensitive collations? | ADDED | Data Types & Collation | — | 3 |
| 256 | When should JSON data types be used in a relational database? | ADDED | Data Types & Collation; Database Design | [Prep](https://testlabapp.com/interview-questions/web-and-mobile-development/sql) (not reverified) | 3 |
| 257 | What is the difference between JSON and JSONB in PostgreSQL? | ADDED | Data Types & Collation | [Prep](https://github.com/apoorv2009/interview-vault/blob/main/SQL%26Postgres/comprehensive_interview_prep.md) (not reverified) | 3 |
| 258 | What is the difference between NULL, zero, and an empty string? | ADDED | Data Types & Collation | — | 4 |
| 259 | How do SQL aggregate functions handle NULL values? | ADDED | Data Types & Collation | — | 4 |
| 260 | How do NULL values affect IN and NOT IN predicates? | ADDED | Data Types & Collation | — | 4 |
| 261 | What is the difference between NULL and DEFAULT when inserting data? | ADDED | Data Types & Collation | — | 3 |
| 262 | What is the difference between COALESCE and NULLIF? | ADDED | Data Types & Collation | — | 4 |
| 263 | What are CAST and CONVERT, and how do they differ across database systems? | ADDED | Data Types & Collation | — | 3 |
| 264 | What are numeric overflow and underflow, and how can they affect database operations? | ADDED | Data Types & Collation | — | 2 |
| 265 | How does integer division work in SQL, and what pitfalls should be avoided? | ADDED | Data Types & Collation | — | 2 |
| 266 | What is the difference between numeric rounding and truncation? | ADDED | Data Types & Collation | — | 2 |
| 267 | What is the difference between signed and unsigned integer types? | ADDED | Data Types & Collation | — | 2 |
| 268 | How is the BOOLEAN data type supported across different database systems? | ADDED | Data Types & Collation | — | 2 |
| 269 | How do CHAR padding and trailing spaces affect storage and comparisons? | ADDED | Data Types & Collation | — | 2 |
| 270 | What is the difference between CHAR and NCHAR, and between VARCHAR and NVARCHAR? | ADDED | Data Types & Collation | — | 2 |
| 271 | What is the difference between UTF-8 and UTF-16? | ADDED | Data Types & Collation | — | 2 |
| 272 | What is the difference between utf8 and utf8mb4 in MySQL? | ADDED | Data Types & Collation | — | 2 |
| 273 | What is the difference between accent-sensitive and accent-insensitive collations? | ADDED | Data Types & Collation | — | 1 |
| 274 | What is the difference between binary and linguistic collations? | ADDED | Data Types & Collation | — | 1 |
| 275 | How can collation affect index usage and query performance? | ADDED | Data Types & Collation; Indexing; Query Optimization & Performance | — | 2 |
| 276 | What is the difference between BINARY and VARBINARY? | ADDED | Data Types & Collation | — | 2 |
| 277 | What is the difference between CLOB and NCLOB? | ADDED | Data Types & Collation | — | 3 |
| 278 | What are the trade-offs of storing files in a database versus object storage? | ADDED | Data Types & Collation; Database Architecture | — | 4 |
| 279 | What are the advantages of streaming large objects instead of loading them entirely into memory? | ADDED | Data Types & Collation; Query Optimization & Performance | — | 4 |
| 280 | When should you use an ENUM, a CHECK constraint, or a lookup table? | ADDED | Data Types & Collation; Database Design; Relational Model & Data Integrity | — | 3 |
| 281 | What are the trade-offs of storing UUIDs using a native UUID type versus a string representation? | ADDED | Data Types & Collation; Database Design; Indexing | — | 3 |
| 282 | When should you use JSON columns instead of normalized relational tables? | ADDED | Data Types & Collation; Database Design | — | 3 |
| 283 | How can JSON data be indexed in relational databases? | ADDED | Data Types & Collation; Indexing; Query Optimization & Performance | — | 2 |
| 284 | What are XML data types, and when should they be used? | ADDED | Data Types & Collation | — | 2 |
| 285 | What are array data types in relational databases, and when should they be used? | ADDED | Data Types & Collation | — | 2 |
| 286 | What are spatial and geographical data types, and when should they be used? | ADDED | Data Types & Collation | — | 2 |
| 287 | What is the INTERVAL data type, and how is it used? | ADDED | Data Types & Collation | — | 2 |
| 288 | How can daylight saving time affect timestamp storage and date-time calculations? | ADDED | Data Types & Collation | — | 4 |
| 289 | What are user-defined data types and domains in relational databases? | ADDED | Data Types & Collation; Relational Model & Data Integrity | — | 2 |
| 290 | What are the trade-offs of using database-specific data types instead of standard SQL data types? | ADDED | Data Types & Collation | — | 2 |
| 291 | What happens if the database connection is lost during a transaction commit? How can the application handle an uncertain transaction outcome? | ADDED | Storage & Recovery; Transactions; Distributed Databases | — | 4 |
| 292 | How does a database ensure transaction durability? | ADDED | Storage & Recovery; Transactions | [Prep](https://sql.harshpreet.com/learn/deep-dives/internals-interview) (not reverified) | 3 |
| 293 | What is Write-Ahead Logging (WAL), and how does it work? | ADDED | Storage & Recovery; Transactions | [Prep](https://codeanddebug.in/blog/dbms-interview-questions/) (not reverified) | 3 |
| 294 | What is the difference between undo and redo logs? | ADDED | Storage & Recovery; Transactions | [Prep](https://testlabapp.com/interview-questions/cs-fundamentals/dbms) (not reverified) | 2 |
| 295 | How does a database recover after an unexpected crash? | ADDED | Storage & Recovery | [Prep](https://sql.harshpreet.com/learn/deep-dives/internals-interview) (not reverified) | 2 |
| 296 | What is the difference between synchronous and asynchronous commit? | ADDED | Storage & Recovery; Transactions; Query Optimization & Performance | — | 2 |
| 297 | Why is database replication not a replacement for backups? | ADDED | Storage & Recovery; Distributed Databases; Database Architecture | [Prep](https://learnbackend.com/interview-prep/databases/) (not reverified) | 3 |
| 298 | What is Point-in-Time Recovery (PITR), and how does it work? | ADDED | Storage & Recovery | [Prep](https://testlabapp.com/interview-questions/system-design/databases) (not reverified) | 2 |
| 299 | What is the difference between RPO and RTO? | ADDED | Storage & Recovery | [Prep](https://learnbackend.com/interview-prep/databases/) (not reverified) | 2 |
| 300 | What is the difference between InnoDB and MyISAM in MySQL? | ADDED | Storage & Recovery; Database Architecture | — | 3 |
| 301 | What is a database buffer pool, and how does it improve performance? | ADDED | Storage & Recovery; Query Optimization & Performance | — | 2 |
| 302 | What is the difference between B-tree-based and LSM-tree-based storage engines? | ADDED | Storage & Recovery; Indexing; Database Architecture | — | 2 |
| 303 | What are VACUUM and autovacuum in PostgreSQL, and why are they necessary? | ADDED | Storage & Recovery; Query Optimization & Performance | — | 2 |
| 304 | What is the difference between MySQL redo logs, undo logs, and binary logs? | ADDED | Storage & Recovery; Transactions | — | 2 |
| 305 | What is the difference between index rebuilding and index reorganization, and when should each be used? | ADDED | Storage & Recovery; Indexing; Query Optimization & Performance | — | 1 |
| 306 | What is the difference between hot and cold database backups? | ADDED | Storage & Recovery | — | 1 |
| 307 | What is the difference between database failover and failback? | ADDED | Storage & Recovery; Database Architecture; Distributed Databases | — | 2 |
| 308 | How do you estimate and plan database storage capacity for a growing application? | ADDED | Storage & Recovery; Database Architecture | — | 2 |

### DBMS Topic Priorities & Coverage

| Topic | Priority | Questions | Coverage |
| --- | --- | ---: | --- |
| Transactions | P1 | 29 | 🟢 Good |
| Transaction Isolation | P1 | 13 | 🟢 Good |
| Concurrency Control & Locking | P1 | 13 | 🟢 Good |
| Indexing | P1 | 21 | 🟢 Good |
| Query Optimization & Performance | P1 | 42 | 🟢 Good |
| Database Design | P2 | 30 | 🟢 Good |
| Relational Model & Data Integrity | P2 | 29 | 🟢 Good |
| Database Architecture | P2 | 31 | 🟢 Good |
| Distributed Databases | P2 | 24 | 🟢 Good |
| Database Fundamentals | P3 | 14 | 🟢 Good |
| Database Security | P3 | 26 | 🟢 Good |
| Database Programmability | P3 | 35 | 🟢 Good |
| Data Types & Collation | P3 | 51 | 🟢 Good |
| Storage & Recovery | P4 | 20 | 🟢 Good |
| **Unique questions** | | **243** | |

Topic counts overlap because questions may have multiple topics. NoSQL-tagged questions are now in `nosql-interview-questions.md`; counts here exclude them. Coverage labels are retained from the previous assessment and have not been reassessed after the split. The unique question total is not the sum of topic counts.

**Priority legend**

- `P1` — Critical: core knowledge expected of a Senior Java Backend Developer.
- `P2` — High: important for backend design and development.
- `P3` — Medium: useful knowledge, typically requiring less depth.
- `P4` — Low: more specialized knowledge, often associated with DBA roles.

Coverage labels: `🟢 Good`, `🟡 Partial`, `🟠 Weak`, `🔴 Missing`. Priorities and coverage are preliminary expert assessments, not verified interview-frequency findings.

### Storage & Recovery — answer scope notes

| Question ID | Concepts to cover in the answer |
| ---: | --- |
| 292, 293, 296 | fsync and durability guarantees |
| 293, 294 | Transaction logs |
| 293, 295 | Checkpoints |
| 293, 301 | Dirty pages |
| 301 | Database pages and blocks |
| 300, 302 | Storage engines |
| 302 | Sequential vs random disk I/O |
| 296 | Group commit |
| 303 | Database bloat; VACUUM FULL |
| 298 | PostgreSQL WAL archiving; accidental DELETE or DROP recovery |
| 297, 299 | Disaster recovery vs high availability |
