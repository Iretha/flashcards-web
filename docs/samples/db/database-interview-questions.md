# DBMS Interview Questions

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

Question IDs are local to this catalog and unique within it. Numbering starts at 1 and is consecutive. New questions receive the next available local ID (currently 244). IDs need not be unique across catalogs.



## Evidence legend

- `Prep`: interview-preparation source (not proof of an actual interview); wording may be adapted.
- `Technical`: technical background only, not interview evidence.
- `Interview`: documented actual interview occurrence. `Interview report (adapted)` identifies a reported interview topic with adapted wording; the report is not independently verified.
- `—`: source not recorded or verified.

## DBMS – Interview Questions

| ID | Question | Origin | Topics | Priority | Evidence | Likelihood |
| ---: | --- | --- | --- | --- | --- | ---: |
| 1 | What is a Database? | ORIGINAL | Database Fundamentals | P3 | — | 2 |
| 2 | What is DBMS? What are the most popular types of DBMS? | ORIGINAL | Database Fundamentals | P3 | — | 2 |
| 3 | What is RDBMS? | ORIGINAL | Database Fundamentals | P3 | — | 2 |
| 4 | What is Normalization in a Database? | ORIGINAL | Database Design; Relational Model & Data Integrity | P2 | — | 1 |
| 5 | What are SQL tables? | ORIGINAL | Relational Model & Data Integrity | P2 | — | 3 |
| 6 | What is a relationship and what types are they? | ORIGINAL | Relational Model & Data Integrity; Database Design | P2 | — | 2 |
| 7 | What is an Index in SQL? | ORIGINAL | Indexing | P1 | — | 1 |
| 8 | What is a Clustered Index in SQL? | ORIGINAL | Indexing | P1 | — | 3 |
| 9 | What is the Non-Clustered Index in SQL? | ORIGINAL | Indexing | P1 | — | 3 |
| 10 | What is a primary key? | ORIGINAL | Relational Model & Data Integrity; Database Design | P2 | — | 1 |
| 11 | What is a foreign key? | ORIGINAL | Relational Model & Data Integrity; Database Design | P2 | — | 1 |
| 12 | What is a constraint? | ORIGINAL | Relational Model & Data Integrity; Database Design | P2 | — | 1 |
| 13 | What is a "TRIGGER" in SQL? | ORIGINAL | Database Programmability | P3 | — | 3 |
| 14 | What is a transaction? | ORIGINAL | Transactions | P1 | — | 1 |
| 15 | What is ACID? | ORIGINAL | Transactions | P1 | — | 1 |
| 16 | What is Atomicity? (ACID) | ORIGINAL | Transactions | P1 | — | 2 |
| 17 | What is Consistency? (ACID) | ORIGINAL | Transactions; Relational Model & Data Integrity | P1 | — | 2 |
| 18 | What is Isolation? (ACID) | ORIGINAL | Transactions; Transaction Isolation | P1 | — | 2 |
| 19 | What is Durability? (ACID) | ORIGINAL | Transactions; Storage & Recovery | P1 | — | 2 |
| 20 | What is collation? | ORIGINAL | Data Types & Collation | P3 | — | 3 |
| 21 | What is CRUD? | ORIGINAL | Database Fundamentals | P3 | — | 1 |
| 22 | What is transaction isolation? | ORIGINAL | Transaction Isolation; Transactions | P1 | — | 1 |
| 23 | What are the standard transaction isolation levels, and how do they differ? | ORIGINAL_REVISED | Transaction Isolation; Transactions | P1 | — | 1 |
| 24 | What is phantom read and which isolation level prevents it? | ORIGINAL | Transaction Isolation | P1 | — | 1 |
| 25 | What is “dirty read” in JDBC? Which isolation level prevents “dirty read”? | ORIGINAL | Transaction Isolation | P1 | — | 1 |
| 26 | What is “non-repeatable” read and which isolation level prevents it? | ORIGINAL | Transaction Isolation | P1 | — | 1 |
| 27 | What is a 2-phase commit? | ORIGINAL | Distributed Databases; Transactions | P1 | — | 2 |
| 28 | What are the different types of locks in relational databases? | ORIGINAL_REVISED | Concurrency Control & Locking | P1 | — | 1 |
| 29 | What is database deadlock? How can we avoid them? | ORIGINAL | Concurrency Control & Locking; Transactions | P1 | — | 1 |
| 30 | BLOB vs CLOB | ORIGINAL | Data Types & Collation | P3 | — | 3 |
| 31 | What is the difference between optimistic and pessimistic locking? | ADDED | Concurrency Control & Locking; Transaction Isolation | P1 | — | 1 |
| 32 | What is the difference between COMMIT and ROLLBACK? | ADDED | Transactions | P1 | [Prep](https://github.com/dhanush106/INTERVIEW-PREP/blob/main/TCS_Prime_DBMS_Interview_Handbook.md) | 1 |
| 33 | What happens if one operation within a transaction fails? | ADDED | Transactions | P1 | [Prep](https://interview-prep.coderboi.com/sql/transactions/transactions) | 2 |
| 34 | Why should database transactions be kept short? | ADDED | Transactions; Concurrency Control & Locking; Query Optimization & Performance | P1 | [Prep](https://github.com/ajayduraisamy/java-complete-roadmap/blob/main/19-JDBC/Transactions.md) | 2 |
| 35 | What is a savepoint in a database transaction? | ADDED | Transactions | P1 | [Prep](https://github.com/ajayduraisamy/java-complete-roadmap/blob/main/19-JDBC/Transactions.md) | 4 |
| 36 | What is a lost update, and how can it be prevented? | ADDED | Transaction Isolation; Concurrency Control & Locking | P1 | [Prep](https://www.systemdesign.academy/dbms-interview-questions) | 1 |
| 37 | How do you choose the appropriate transaction isolation level? | ADDED | Transaction Isolation; Concurrency Control & Locking | P1 | [Prep](https://testlabapp.com/interview-questions/system-design/databases) | 2 |
| 38 | What are the default transaction isolation levels in MySQL, PostgreSQL and Oracle? | ADDED | Transaction Isolation | P1 | [Prep](https://www.techinterviewprep.io/roles/backend-engineer/qa) | 3 |
| 39 | What is a dirty write, and how can it be prevented? | ADDED | Transaction Isolation; Concurrency Control & Locking | P1 | [Technical](https://inf.mit.bme.hu/sites/default/files/publications/ldbc-acid-tpctc2020.pdf) — interview occurrence unverified | 3 |
| 40 | What is MVCC (Multi-Version Concurrency Control), and how does it work? | ADDED | Concurrency Control & Locking; Transaction Isolation | P1 | [Prep](https://coddy.tech/interview-questions/dbms/concurrency) | 2 |
| 41 | What is the difference between shared and exclusive locks? | ADDED | Concurrency Control & Locking | P1 | [Prep](https://www.interviewsvector.com/sql) | 2 |
| 42 | What is the difference between row-level and table-level locking? | ADDED | Concurrency Control & Locking | P1 | [Prep](https://www.interviewsvector.com/sql) | 2 |
| 43 | How does optimistic locking work using a version column? | ADDED | Concurrency Control & Locking; Transaction Isolation | P1 | [Prep](https://elevateprep.vercel.app/senior-java-interview/part-1a) | 2 |
| 44 | What is the difference between blocking and a deadlock? | ADDED | Concurrency Control & Locking | P1 | [Prep](https://www.interviewsvector.com/sql) | 2 |
| 45 | How do you decide which columns to index? | ADDED | Indexing; Query Optimization & Performance | P1 | [Interview report (adapted)](https://prachub.com/interview-questions/binary-tree-completeness-check-then-b-tree-indexes-and-why-not-index-every-column) | 1 |
| 46 | What are the advantages and disadvantages of database indexes? | ADDED | Indexing; Query Optimization & Performance | P1 | [Interview report (adapted)](https://prachub.com/interview-questions/binary-tree-completeness-check-then-b-tree-indexes-and-why-not-index-every-column); [Prep](https://www.autocoder.live/guides/dbms-indexing-interview-questions) | 1 |
| 47 | What is a composite index, and why does the order of its columns matter? | ADDED | Indexing; Query Optimization & Performance | P1 | [Prep](https://www.autocoder.live/guides/dbms-indexing-interview-questions) | 1 |
| 48 | What is the difference between a composite index and multiple single-column indexes? | ADDED | Indexing; Query Optimization & Performance | P1 | [Prep (related concept; adapted)](https://testlabapp.com/interview-questions/system-design/databases) | 2 |
| 49 | Why might a database not use an existing index? | ADDED | Indexing; Query Optimization & Performance | P1 | [Prep](https://renekin.com/blog/database-indexing-interview-questions) | 1 |
| 50 | How are database indexes implemented internally, and how do they work? | ADDED | Indexing | P1 | [Interview report (B-tree; adapted)](https://prachub.com/interview-questions/binary-tree-completeness-check-then-b-tree-indexes-and-why-not-index-every-column); [Prep](https://www.autocoder.live/guides/dbms-indexing-interview-questions) | 2 |
| 51 | What is a covering index? | ADDED | Indexing; Query Optimization & Performance | P1 | [Prep](https://renekin.com/blog/database-indexing-interview-questions) | 3 |
| 52 | When can database indexes negatively affect performance, and when is it better not to create an index? | ADDED | Indexing; Query Optimization & Performance | P1 | [Interview report (adapted)](https://prachub.com/interview-questions/binary-tree-completeness-check-then-b-tree-indexes-and-why-not-index-every-column); [Prep](https://app.gettarmac.com/interview-questions/databases-sql-indexes-interview-questions) | 2 |
| 53 | How would you identify and optimize a slow SQL query in production? | ADDED | Query Optimization & Performance | P1 | [Interview report (adapted)](https://rathod-ajay.medium.com/the-goldman-sachs-senior-java-backend-developer-interview-questions-b01d33467da7); [Interview report (adapted)](https://smileupdates.in/cgi-java-interview-experience-2-8-years-technical-hr/) | 1 |
| 54 | What is a query execution plan, and how do you use it to optimize SQL queries? | ADDED | Query Optimization & Performance | P1 | [Prep](https://learnbackend.com/interview-prep/databases/) | 1 |
| 55 | What is the difference between EXPLAIN and EXPLAIN ANALYZE? | ADDED | Query Optimization & Performance | P1 | [Prep](https://learnbackend.com/interview-prep/databases/) | 3 |
| 56 | What is the difference between a full table scan and an index scan? When is each preferable? | ADDED | Query Optimization & Performance; Indexing | P1 | [Prep](https://viacheslavchernyshov.github.io/java-interview-questions-and-answers/questions/01-databases-sql-postgresql/21-how-to-optimize-slow-queries/) | 2 |
| 57 | What are database statistics, and how do they affect query execution plans? | ADDED | Query Optimization & Performance | P1 | [Prep](https://learnbackend.com/interview-prep/databases/) | 3 |
| 58 | How can you improve the performance of SQL queries involving multiple joins? | ADDED | Query Optimization & Performance | P1 | [Interview report (adapted)](https://blog.stackademic.com/atlassians-java-backend-interview-was-brutal-because-the-problems-were-real-6263ec4debde) | 2 |
| 59 | What is the difference between offset-based and cursor-based pagination, and how do they affect performance? | ADDED | Query Optimization & Performance | P1 | [Interview report (adapted)](https://blog.stackademic.com/atlassians-java-backend-interview-was-brutal-because-the-problems-were-real-6263ec4debde) | 2 |
| 60 | Why should you avoid SELECT * in production queries? | ADDED | Query Optimization & Performance | P1 | [Interview report (adapted)](https://rathod-ajay.medium.com/the-goldman-sachs-senior-java-backend-developer-interview-questions-b01d33467da7) | 2 |
| 61 | What is the N+1 query problem, and how can it be solved? | ADDED | Query Optimization & Performance | P1 | [Prep](https://viacheslavchernyshov.github.io/java-interview-questions-and-answers/questions/01-databases-sql-postgresql/21-how-to-optimize-slow-queries/) | 1 |
| 62 | What is a sargable SQL predicate? | ADDED | Query Optimization & Performance; Indexing | P1 | [Prep](https://medium.com/codetodeploy/sql-interview-questions-for-java-backend-developers-30-queries-interviewers-actually-ask-90164d852aed) | 3 |
| 63 | What are the first, second, and third normal forms (1NF, 2NF, 3NF)? | ADDED | Database Design | P2 | [Prep](https://federicosella.com/en/learn/interviews/sql-database-interview-questions/) | 1 |
| 64 | What is denormalization, and when should it be used? | ADDED | Database Design; Query Optimization & Performance | P1 | [Prep](https://crackedjava.com/track/java-backend/module/postgresql/topic/normalization-schema-design) | 2 |
| 65 | What are insertion, update, and deletion anomalies, and how does normalization prevent them? | ADDED | Database Design; Relational Model & Data Integrity | P2 | [Prep](https://www.codebegun.com/interview/sql/normalization) | 3 |
| 66 | What is the difference between natural and surrogate keys, and when should each be used? | ADDED | Database Design; Relational Model & Data Integrity | P2 | [Prep](https://crackedjava.com/track/java-backend/module/postgresql/topic/normalization-schema-design) | 2 |
| 67 | What is a composite primary key, and when should it be used? | ADDED | Database Design; Relational Model & Data Integrity | P2 | [Interview report (adapted)](https://medium.com/@anil-singh/i-recently-appeared-for-java-backend-developer-interviews-34527c1bc906); [Prep](https://clapassist.com/tools/interview-questions/dbms/) | 2 |
| 68 | How do you model a many-to-many relationship in a relational database? | ADDED | Database Design; Relational Model & Data Integrity | P2 | [Interview report (adapted)](https://prachub.com/interview-questions/many-to-many-schema-design-with-a-join-table-composite-primary-key-and-queries) | 1 |
| 69 | What are the advantages and disadvantages of using UUIDs versus auto-incrementing IDs as primary keys? | ADDED | Database Design; Relational Model & Data Integrity | P2 | [Prep](https://crackedjava.com/track/java-backend/module/postgresql/topic/normalization-schema-design) | 2 |
| 70 | What is Boyce-Codd Normal Form (BCNF), and how does it differ from 3NF? | ADDED | Database Design; Relational Model & Data Integrity | P2 | [Technical (not interview evidence; user-approved)](https://en.wikipedia.org/wiki/Boyce%E2%80%93Codd_normal_form) | 4 |
| 71 | What is Fourth Normal Form (4NF)? | ADDED | Database Design; Relational Model & Data Integrity | P2 | [Technical (not interview evidence; user-approved)](https://en.wikipedia.org/wiki/Fourth_normal_form) | 5 |
| 72 | What is Fifth Normal Form (5NF)? | ADDED | Database Design; Relational Model & Data Integrity | P2 | [Technical (not interview evidence; user-approved)](https://en.wikipedia.org/wiki/Fifth_normal_form) | 5 |
| 73 | What is Sixth Normal Form (6NF)? | ADDED | Database Design; Relational Model & Data Integrity | P2 | [Technical (not interview evidence; user-approved)](https://en.wikipedia.org/wiki/Sixth_normal_form) | 5 |
| 74 | What is the difference between a primary key and a unique key? | ADDED | Relational Model & Data Integrity; Database Design | P2 | [Prep](https://www.codebegun.com/interview/sql/constraints); [Prep](https://www.techprep.app/blog/sql-interview-questions) | 1 |
| 75 | What are candidate keys, superkeys, and alternate keys? | ADDED | Relational Model & Data Integrity; Database Design | P2 | [Prep](https://lunarai.in/database/sql/keys-constraints/) | 3 |
| 76 | What is referential integrity, and how is it enforced? | ADDED | Relational Model & Data Integrity; Database Design | P2 | [Prep](https://www.codebegun.com/interview/sql/constraints) | 2 |
| 77 | What are the different types of database constraints? | ADDED | Relational Model & Data Integrity; Database Design | P2 | [Prep](https://crackr.dev/interview-guides/java-interview-questions/databases) | 2 |
| 78 | What is the difference between ON DELETE CASCADE, SET NULL, RESTRICT, and NO ACTION? | ADDED | Relational Model & Data Integrity; Database Design | P2 | [Prep](https://testlabapp.com/interview-questions/web-and-mobile-development/sql) | 2 |
| 79 | Can a foreign key contain NULL values or reference a non-primary key? | ADDED | Relational Model & Data Integrity; Database Design | P2 | [Prep](https://interviewstacks.com/stacks/sql-databases/data-modeling-and-normalization) | 3 |
| 80 | Can a UNIQUE constraint allow NULL values? | ADDED | Relational Model & Data Integrity | P2 | [Prep](https://www.techprep.app/blog/sql-interview-questions) | 3 |
| 81 | Why should data integrity be enforced at the database level rather than relying solely on application-level validation? | ADDED | Relational Model & Data Integrity; Database Design | P2 | [Prep](https://www.codebegun.com/interview/sql/constraints) | 2 |
| 82 | What is the difference between a UNIQUE constraint and a unique index? | ADDED | Relational Model & Data Integrity; Indexing | P1 | [Technical (not interview evidence; user-approved)](https://www.postgresql.org/docs/current/indexes-unique.html) | 3 |
| 83 | What is database replication, and how does it work? | ADDED | Database Architecture; Distributed Databases | P2 | [Technical](https://www.postgresql.org/docs/current/warm-standby.html) | 2 |
| 84 | What is the difference between synchronous and asynchronous replication? | ADDED | Database Architecture; Distributed Databases | P2 | [Prep (adapted)](https://medium.com/javarevisited/database-system-design-interview-questions-and-answers-for-senior-engineers-e57a101e348e) | 3 |
| 85 | What is database partitioning, and what are its benefits? | ADDED | Database Architecture; Query Optimization & Performance | P1 | [Technical](https://www.postgresql.org/docs/current/ddl-partitioning.html) | 2 |
| 86 | What is database sharding, and when should it be used? | ADDED | Database Architecture; Distributed Databases | P2 | [Technical](https://www.mongodb.com/docs/manual/sharding/) | 2 |
| 87 | What is the difference between partitioning and sharding? | ADDED | Database Architecture; Distributed Databases | P2 | [Interview report (adapted; previously identified)](https://www.reddit.com/r/deloitteusi/comments/1v9lg25/deloitte_java_software_engineer_ii_interview/) | 2 |
| 88 | What is the difference between horizontal and vertical database scaling? | ADDED | Database Architecture; Distributed Databases | P2 | [Prep (adapted)](https://fonzi.ai/blog/backend-interview-questions) | 2 |
| 89 | How would you scale a relational database as traffic and data volume increase? | ADDED | Database Architecture; Query Optimization & Performance | P1 | [Interview report (adapted; previously identified)](https://www.reddit.com/r/deloitteusi/comments/1v9lg25/deloitte_java_software_engineer_ii_interview/) | 2 |
| 90 | What are read replicas, and when should they be used? | ADDED | Database Architecture; Query Optimization & Performance; Distributed Databases | P1 | [Technical](https://www.postgresql.org/docs/current/warm-standby.html) | 2 |
| 91 | What is replication lag, and how can it affect application behavior? | ADDED | Database Architecture; Distributed Databases | P2 | [Technical](https://www.postgresql.org/docs/current/warm-standby.html) | 2 |
| 92 | What is database failover, and how does it support high availability? | ADDED | Database Architecture; Distributed Databases | P2 | [Technical](https://www.postgresql.org/docs/current/warm-standby.html) | 3 |
| 93 | What is the difference between range, hash, and list partitioning? | ADDED | Database Architecture | P2 | [Technical](https://www.postgresql.org/docs/current/ddl-partitioning.html) | 4 |
| 94 | What is the difference between horizontal and vertical partitioning? | ADDED | Database Architecture | P2 | [Technical](https://learn.microsoft.com/en-us/azure/architecture/best-practices/data-partitioning) | 4 |
| 95 | What is partition pruning, and how does it improve query performance? | ADDED | Database Architecture; Query Optimization & Performance | P1 | [Technical](https://www.postgresql.org/docs/current/ddl-partitioning.html) | 4 |
| 96 | How do you choose an appropriate shard key? | ADDED | Database Architecture; Distributed Databases | P2 | [Technical](https://www.mongodb.com/docs/manual/core/sharding-shard-key/) | 4 |
| 97 | What is consistent hashing, and how does it work? | ADDED | Database Architecture; Distributed Databases | P2 | [Technical](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) | 3 |
| 98 | What is the difference between OLTP and OLAP? | ADDED | Database Architecture; Database Fundamentals | P2 | [Technical](https://www.ibm.com/think/topics/olap) | 3 |
| 99 | What are the challenges of cross-shard joins, and how can they be addressed? | ADDED | Database Architecture; Distributed Databases; Query Optimization & Performance | P1 | [Technical](https://docs.citusdata.com/en/stable/develop/reference_sql.html) | 4 |
| 100 | How do you maintain data consistency across multiple databases in a microservices architecture? | ADDED | Distributed Databases; Transactions | P1 | [Technical](https://microservices.io/patterns/data/saga.html) | 2 |
| 101 | What is the Saga pattern, and how does it handle distributed transactions? | ADDED | Distributed Databases; Transactions | P1 | [Technical](https://microservices.io/patterns/data/saga.html) | 2 |
| 102 | What is the difference between the Saga pattern and two-phase commit (2PC)? | ADDED | Distributed Databases; Transactions | P1 | [Technical](https://microservices.io/patterns/data/saga.html) | 2 |
| 103 | What is the Transactional Outbox pattern, and what problem does it solve? | ADDED | Distributed Databases; Transactions | P1 | [Technical](https://microservices.io/patterns/data/transactional-outbox.html) | 2 |
| 104 | What is idempotency, and why is it important in distributed transactions? | ADDED | Distributed Databases; Transactions | P1 | [Technical](https://microservices.io/patterns/communication-style/idempotent-consumer.html) | 2 |
| 105 | What is the difference between a compensating transaction and a traditional transaction rollback? | ADDED | Distributed Databases; Transactions | P1 | [Technical](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction) | 2 |
| 106 | What is the difference between Saga orchestration and choreography? | ADDED | Distributed Databases; Transactions | P1 | [Technical](https://microservices.io/patterns/data/saga.html) | 2 |
| 107 | What are distributed locks, and what challenges arise when using them? | ADDED | Distributed Databases; Concurrency Control & Locking | P1 | [Technical](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) | 3 |
| 108 | What is the split-brain problem in distributed databases, and how can it be prevented? | ADDED | Distributed Databases; Database Architecture | P2 | [Technical](https://www.postgresql.org/docs/current/warm-standby-failover.html) | 4 |
| 109 | What is the difference between structured, semi-structured, and unstructured data? | ADDED | Database Fundamentals | P3 | [Technical (unverified)](https://www.ibm.com/think/topics/structured-vs-unstructured-data); [Previously proposed source (unverified)](https://medium.com/javarevisited/globallogic-senior-java-developer-interview-experience-for-ericsson-client-45-minutes-of-deep-ec1887d67eb4) | 4 |
| 110 | What is the difference between DBMS and RDBMS? | ADDED | Database Fundamentals | P3 | — | 2 |
| 111 | What is the difference between in-memory and disk-based databases? | ADDED | Database Fundamentals; Database Architecture | P2 | [Technical (unverified)](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) | 3 |
| 112 | What is the difference between row-oriented and column-oriented databases? | ADDED | Database Fundamentals; Database Architecture; Query Optimization & Performance | P1 | [Technical (unverified)](https://clickhouse.com/docs/intro) | 4 |
| 113 | What is the difference between embedded and client-server databases? | ADDED | Database Fundamentals; Database Architecture | P2 | [Technical (unverified)](https://www.sqlite.org/whentouse.html) | 4 |
| 114 | What is the difference between an operational database and a data warehouse? | ADDED | Database Fundamentals | P3 | [Technical (unverified)](https://aws.amazon.com/data-warehouse/) | 4 |
| 115 | What is the difference between a data warehouse and a data lake? | ADDED | Database Fundamentals | P3 | [Technical (unverified)](https://aws.amazon.com/big-data/datalakes-and-analytics/what-is-a-data-lake/) | 4 |
| 116 | What is the difference between a database schema and a database instance? | ADDED | Database Fundamentals | P3 | — | 4 |
| 117 | What is the difference between logical and physical data independence? | ADDED | Database Fundamentals; Database Architecture | P2 | — | 5 |
| 118 | What is SQL injection, and how can it be prevented? | ADDED | Database Security | P3 | [Interview report (adapted)](https://readmedium.com/barclays-java-spring-boot-micro-service-interview-question-with-answer-2024-031e36f44c7b) (not reverified) | 1 |
| 119 | How do parameterized queries prevent SQL injection, and what are their limitations? | ADDED | Database Security | P3 | [Prep](https://elevateprep.vercel.app/senior-java-interview/part-12) (not reverified) | 1 |
| 120 | Can SQL injection occur when using JPA or Hibernate? | ADDED | Database Security | P3 | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) (not reverified) | 2 |
| 121 | What is the difference between authentication and authorization at the database level? | ADDED | Database Security | P3 | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 3 |
| 122 | What are database roles and privileges, and how do they work? | ADDED | Database Security | P3 | [Prep](https://interview-prep.coderboi.com/sql/security/permissions) (not reverified) | 3 |
| 123 | What is the principle of least privilege, and how does it apply to databases? | ADDED | Database Security | P3 | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 2 |
| 124 | How do you securely manage database credentials in an application? | ADDED | Database Security | P3 | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 2 |
| 125 | What is the difference between database encryption at rest and encryption in transit? | ADDED | Database Security | P3 | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 3 |
| 126 | What is row-level security (RLS), and when should it be used? | ADDED | Database Security; Database Design | P2 | [Prep](https://prachub.com/resources/postgresql-row-level-security-interview-questions-policies-roles-and-tenant-isolation) (not reverified) | 4 |
| 127 | What is database auditing, and what activities should be audited? | ADDED | Database Security | P3 | [Prep](https://interviewstacks.com/stacks/sql-databases/security-and-database-best-practices) (not reverified) | 4 |
| 128 | How would you secure a production database used by a backend application? | ADDED | Database Security; Database Architecture | P2 | [Prep](https://data.noblerworks.com/resources/interview-prep/dba-interview/) (not reverified) | 2 |
| 129 | What is data masking, and when should it be used? | ADDED | Database Security | P3 | — | 4 |
| 130 | What is the difference between data anonymization and pseudonymization? | ADDED | Database Security | P3 | — | 4 |
| 131 | What is the difference between hashing and encryption? | ADDED | Database Security | P3 | — | 2 |
| 132 | What is column-level encryption, and when should it be used? | ADDED | Database Security | P3 | — | 4 |
| 133 | What is Transparent Data Encryption (TDE), and how does it work? | ADDED | Database Security | P3 | — | 5 |
| 134 | What is Role-Based Access Control (RBAC), and how does it apply to databases? | ADDED | Database Security | P3 | — | 4 |
| 135 | What are the GRANT and REVOKE statements in SQL? | ADDED | Database Security | P3 | [Technical](https://www.postgresql.org/docs/current/sql-grant.html) (not reverified) | 4 |
| 136 | How can database views be used to enforce data access restrictions? | ADDED | Database Security | P3 | — | 4 |
| 137 | What is column-level security, and how does it work? | ADDED | Database Security | P3 | — | 4 |
| 138 | How can tenant data isolation be enforced in a multi-tenant database? | ADDED | Database Security; Database Architecture; Database Design | P2 | — | 3 |
| 139 | What is database credential rotation, and how can it be implemented safely? | ADDED | Database Security | P3 | — | 4 |
| 140 | Why should database backups be encrypted, and how can they be protected? | ADDED | Database Security; Storage & Recovery | P3 | — | 4 |
| 141 | What is database network isolation, and why is it important? | ADDED | Database Security | P3 | — | 4 |
| 142 | What are the security risks of dynamic SQL, and how can they be mitigated? | ADDED | Database Security | P3 | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) (not reverified) | 3 |
| 143 | What are the security risks of stored procedures, and how can they be mitigated? | ADDED | Database Security; Database Programmability | P3 | [Technical](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) (not reverified) | 4 |
| 144 | What is a stored procedure, and when should it be used? | ADDED | Database Programmability | P3 | [Prep](https://meetassist.io/interview-questions/sql/database-programming) (not reverified) | 2 |
| 145 | What is a user-defined database function? | ADDED | Database Programmability | P3 | [Technical](https://docs.oracle.com/en/database/oracle/oracle-database/18/jjdev/java-developers-guide.pdf) (not reverified) | 3 |
| 146 | What is the difference between a stored procedure and a database function? | ADDED | Database Programmability | P3 | [Prep](https://learnfrenzy.com/technical-interview/database-management/dbms-concepts-and-design/views-procedures-triggers-sql-security) (not reverified) | 2 |
| 147 | What are the advantages and disadvantages of using stored procedures? | ADDED | Database Programmability | P3 | [Prep](https://meetassist.io/interview-questions/sql/database-programming) (not reverified) | 2 |
| 148 | When should business logic be implemented in the database rather than in the application? | ADDED | Database Programmability; Database Architecture | P2 | [Interview report (adapted)](https://nextraise.ai/interview-questions/mastercard/hibernate-spring-boot-sql-procedures-vs-java-triggers-buv8yn) (not reverified) | 2 |
| 149 | What are the advantages and disadvantages of database triggers? | ADDED | Database Programmability | P3 | [Prep](https://learnfrenzy.com/technical-interview/database-management/dbms-concepts-and-design/views-procedures-triggers-sql-security) (not reverified) | 2 |
| 150 | What is the difference between a database view and a materialized view? | ADDED | Database Programmability; Query Optimization & Performance | P1 | [Prep](https://goodspace.ai/interview-questions/dbms) (not reverified) | 2 |
| 151 | What is a database cursor, and when should it be used or avoided? | ADDED | Database Programmability; Query Optimization & Performance | P1 | [Prep](https://learnfrenzy.com/technical-interview/database-management/dbms-concepts-and-design/views-procedures-triggers-sql-security) (not reverified) | 3 |
| 152 | What is the difference between a database trigger and a constraint? | ADDED | Database Programmability; Relational Model & Data Integrity | P2 | [Prep](https://learnfrenzy.com/technical-interview/database-management/dbms-concepts-and-design/views-procedures-triggers-sql-security) (not reverified) | 4 |
| 153 | What is the difference between IN, OUT, and INOUT parameters in stored procedures? | ADDED | Database Programmability | P3 | [Prep](https://olibr.com/blog/interview-questions-on-sql-and-pl-sql) (not reverified) | 4 |
| 154 | What is the difference between static and dynamic SQL? | ADDED | Database Programmability | P3 | — | 3 |
| 155 | What is the difference between BEFORE, AFTER, and INSTEAD OF triggers? | ADDED | Database Programmability | P3 | — | 4 |
| 156 | What is the difference between row-level and statement-level triggers? | ADDED | Database Programmability | P3 | — | 4 |
| 157 | How is the execution order of multiple database triggers determined? | ADDED | Database Programmability | P3 | — | 5 |
| 158 | What are recursive and cascading triggers, and what problems can they cause? | ADDED | Database Programmability | P3 | — | 4 |
| 159 | How do database triggers behave within a transaction, including during a rollback? | ADDED | Database Programmability; Transactions | P1 | — | 3 |
| 160 | What is the difference between explicit and implicit cursors? | ADDED | Database Programmability | P3 | — | 4 |
| 161 | What is the difference between cursor-based and set-based processing? | ADDED | Database Programmability; Query Optimization & Performance | P1 | — | 3 |
| 162 | What is the difference between updatable and read-only views? | ADDED | Database Programmability | P3 | — | 3 |
| 163 | How can materialized views be refreshed, and what are the trade-offs of different refresh strategies? | ADDED | Database Programmability; Query Optimization & Performance | P1 | — | 3 |
| 164 | What are temporary tables, and when should they be used? | ADDED | Database Programmability | P3 | — | 3 |
| 165 | What is the difference between temporary tables and Common Table Expressions (CTEs)? | ADDED | Database Programmability; Query Optimization & Performance | P1 | — | 3 |
| 166 | How are transactions managed within stored procedures? | ADDED | Database Programmability; Transactions | P1 | — | 4 |
| 167 | How are errors and exceptions handled in stored procedures? | ADDED | Database Programmability | P3 | — | 4 |
| 168 | What is the difference between scalar and table-valued functions? | ADDED | Database Programmability | P3 | — | 4 |
| 169 | What is the difference between deterministic and non-deterministic database functions? | ADDED | Database Programmability; Indexing; Query Optimization & Performance | P1 | — | 4 |
| 170 | What is the difference between SQL and PL/SQL? | ADDED | Database Programmability | P3 | — | 4 |
| 171 | What is PL/pgSQL, and when is it used in PostgreSQL? | ADDED | Database Programmability | P3 | — | 4 |
| 172 | What are PL/SQL packages in Oracle, and what are their benefits? | ADDED | Database Programmability | P3 | — | 5 |
| 173 | How does execution plan caching work for stored procedures? | ADDED | Database Programmability; Query Optimization & Performance | P1 | — | 5 |
| 174 | How can user-defined functions affect query performance? | ADDED | Database Programmability; Query Optimization & Performance | P1 | — | 4 |
| 175 | How do you test stored procedures and database triggers? | ADDED | Database Programmability | P3 | — | 4 |
| 176 | How do you version and deploy database code using migration tools such as Flyway and Liquibase? | ADDED | Database Programmability | P3 | — | 2 |
| 177 | What is the difference between CHAR, VARCHAR, and TEXT? | ADDED | Data Types & Collation | P3 | [Prep](https://zorosec.github.io/data-interview-bank/sql.html) (not reverified) | 2 |
| 178 | What is the difference between DECIMAL, NUMERIC, FLOAT, and DOUBLE? | ADDED | Data Types & Collation | P3 | [Prep](https://datadank.com/sql/sql-interview-questions/) (not reverified) | 2 |
| 179 | Why should monetary values generally be stored using DECIMAL rather than FLOAT or DOUBLE? | ADDED | Data Types & Collation | P3 | [Prep](https://datadank.com/sql/sql-interview-questions/) (not reverified) | 1 |
| 180 | What are precision and scale in numeric data types? | ADDED | Data Types & Collation | P3 | [Prep](https://testlabapp.com/interview-questions/web-and-mobile-development/sql) (not reverified) | 3 |
| 181 | What is the difference between SMALLINT, INT, and BIGINT? | ADDED | Data Types & Collation | P3 | [Prep](https://interview-prep.coderboi.com/sql/schema/data-types) (not reverified) | 3 |
| 182 | What is the difference between DATE, TIME, DATETIME, and TIMESTAMP? | ADDED | Data Types & Collation | P3 | [Prep](https://sqlism.com/interview/fundamentals) (not reverified) | 2 |
| 183 | What is the difference between TIMESTAMP WITH TIME ZONE and TIMESTAMP WITHOUT TIME ZONE? | ADDED | Data Types & Collation | P3 | [Prep](https://testlabapp.com/interview-questions/web-and-mobile-development/sql) (not reverified) | 2 |
| 184 | How should dates, timestamps, and time zones be handled in a database-backed application? | ADDED | Data Types & Collation | P3 | [Prep](https://zorosec.github.io/data-interview-bank/sql.html) (not reverified) | 1 |
| 185 | What does NULL represent in SQL, and how does three-valued logic work? | ADDED | Data Types & Collation | P3 | [Prep](https://zorosec.github.io/data-interview-bank/sql.html) (not reverified) | 2 |
| 186 | What is the difference between implicit and explicit data type conversion? | ADDED | Data Types & Collation | P3 | [Technical](https://learn.microsoft.com/en-us/sql/t-sql/functions/cast-and-convert-transact-sql) (not reverified) | 3 |
| 187 | How can implicit type conversions affect query performance and index usage? | ADDED | Data Types & Collation; Indexing; Query Optimization & Performance | P1 | [Prep](https://zorosec.github.io/data-interview-bank/sql.html) (not reverified) | 2 |
| 188 | How does choosing the appropriate data type affect storage, performance, and data integrity? | ADDED | Data Types & Collation; Database Design; Query Optimization & Performance; Relational Model & Data Integrity | P1 | [Prep](https://interview-prep.coderboi.com/sql/schema/data-types) (not reverified) | 2 |
| 189 | What is the difference between a character set, character encoding, and collation? | ADDED | Data Types & Collation | P3 | — | 3 |
| 190 | What is the difference between case-sensitive and case-insensitive collations? | ADDED | Data Types & Collation | P3 | — | 3 |
| 191 | When should JSON data types be used in a relational database? | ADDED | Data Types & Collation; Database Design | P2 | [Prep](https://testlabapp.com/interview-questions/web-and-mobile-development/sql) (not reverified) | 3 |
| 192 | What is the difference between JSON and JSONB in PostgreSQL? | ADDED | Data Types & Collation | P3 | [Prep](https://github.com/apoorv2009/interview-vault/blob/main/SQL%26Postgres/comprehensive_interview_prep.md) (not reverified) | 3 |
| 193 | What is the difference between NULL, zero, and an empty string? | ADDED | Data Types & Collation | P3 | — | 2 |
| 194 | How do SQL aggregate functions handle NULL values? | ADDED | Data Types & Collation | P3 | — | 2 |
| 195 | How do NULL values affect IN and NOT IN predicates? | ADDED | Data Types & Collation | P3 | — | 2 |
| 196 | What is the difference between NULL and DEFAULT when inserting data? | ADDED | Data Types & Collation | P3 | — | 3 |
| 197 | What is the difference between COALESCE and NULLIF? | ADDED | Data Types & Collation | P3 | — | 2 |
| 198 | What are CAST and CONVERT, and how do they differ across database systems? | ADDED | Data Types & Collation | P3 | — | 3 |
| 199 | What are numeric overflow and underflow, and how can they affect database operations? | ADDED | Data Types & Collation | P3 | — | 4 |
| 200 | How does integer division work in SQL, and what pitfalls should be avoided? | ADDED | Data Types & Collation | P3 | — | 4 |
| 201 | What is the difference between numeric rounding and truncation? | ADDED | Data Types & Collation | P3 | — | 4 |
| 202 | What is the difference between signed and unsigned integer types? | ADDED | Data Types & Collation | P3 | — | 4 |
| 203 | How is the BOOLEAN data type supported across different database systems? | ADDED | Data Types & Collation | P3 | — | 4 |
| 204 | How do CHAR padding and trailing spaces affect storage and comparisons? | ADDED | Data Types & Collation | P3 | — | 4 |
| 205 | What is the difference between CHAR and NCHAR, and between VARCHAR and NVARCHAR? | ADDED | Data Types & Collation | P3 | — | 4 |
| 206 | What is the difference between UTF-8 and UTF-16? | ADDED | Data Types & Collation | P3 | — | 4 |
| 207 | What is the difference between utf8 and utf8mb4 in MySQL? | ADDED | Data Types & Collation | P3 | — | 4 |
| 208 | What is the difference between accent-sensitive and accent-insensitive collations? | ADDED | Data Types & Collation | P3 | — | 5 |
| 209 | What is the difference between binary and linguistic collations? | ADDED | Data Types & Collation | P3 | — | 5 |
| 210 | How can collation affect index usage and query performance? | ADDED | Data Types & Collation; Indexing; Query Optimization & Performance | P1 | — | 4 |
| 211 | What is the difference between BINARY and VARBINARY? | ADDED | Data Types & Collation | P3 | — | 4 |
| 212 | What is the difference between CLOB and NCLOB? | ADDED | Data Types & Collation | P3 | — | 3 |
| 213 | What are the trade-offs of storing files in a database versus object storage? | ADDED | Data Types & Collation; Database Architecture | P2 | — | 2 |
| 214 | What are the advantages of streaming large objects instead of loading them entirely into memory? | ADDED | Data Types & Collation; Query Optimization & Performance | P1 | — | 2 |
| 215 | When should you use an ENUM, a CHECK constraint, or a lookup table? | ADDED | Data Types & Collation; Database Design; Relational Model & Data Integrity | P2 | — | 3 |
| 216 | What are the trade-offs of storing UUIDs using a native UUID type versus a string representation? | ADDED | Data Types & Collation; Database Design; Indexing | P1 | — | 3 |
| 217 | When should you use JSON columns instead of normalized relational tables? | ADDED | Data Types & Collation; Database Design | P2 | — | 3 |
| 218 | How can JSON data be indexed in relational databases? | ADDED | Data Types & Collation; Indexing; Query Optimization & Performance | P1 | — | 4 |
| 219 | What are XML data types, and when should they be used? | ADDED | Data Types & Collation | P3 | — | 4 |
| 220 | What are array data types in relational databases, and when should they be used? | ADDED | Data Types & Collation | P3 | — | 4 |
| 221 | What are spatial and geographical data types, and when should they be used? | ADDED | Data Types & Collation | P3 | — | 4 |
| 222 | What is the INTERVAL data type, and how is it used? | ADDED | Data Types & Collation | P3 | — | 4 |
| 223 | How can daylight saving time affect timestamp storage and date-time calculations? | ADDED | Data Types & Collation | P3 | — | 2 |
| 224 | What are user-defined data types and domains in relational databases? | ADDED | Data Types & Collation; Relational Model & Data Integrity | P2 | — | 4 |
| 225 | What are the trade-offs of using database-specific data types instead of standard SQL data types? | ADDED | Data Types & Collation | P3 | — | 4 |
| 226 | What happens if the database connection is lost during a transaction commit? How can the application handle an uncertain transaction outcome? | ADDED | Storage & Recovery; Transactions; Distributed Databases | P1 | — | 2 |
| 227 | How does a database ensure transaction durability? | ADDED | Storage & Recovery; Transactions | P1 | [Prep](https://sql.harshpreet.com/learn/deep-dives/internals-interview) (not reverified) | 3 |
| 228 | What is Write-Ahead Logging (WAL), and how does it work? | ADDED | Storage & Recovery; Transactions | P1 | [Prep](https://codeanddebug.in/blog/dbms-interview-questions/) (not reverified) | 3 |
| 229 | What is the difference between undo and redo logs? | ADDED | Storage & Recovery; Transactions | P1 | [Prep](https://testlabapp.com/interview-questions/cs-fundamentals/dbms) (not reverified) | 4 |
| 230 | How does a database recover after an unexpected crash? | ADDED | Storage & Recovery | P4 | [Prep](https://sql.harshpreet.com/learn/deep-dives/internals-interview) (not reverified) | 4 |
| 231 | What is the difference between synchronous and asynchronous commit? | ADDED | Storage & Recovery; Transactions; Query Optimization & Performance | P1 | — | 4 |
| 232 | Why is database replication not a replacement for backups? | ADDED | Storage & Recovery; Distributed Databases; Database Architecture | P2 | [Prep](https://learnbackend.com/interview-prep/databases/) (not reverified) | 3 |
| 233 | What is Point-in-Time Recovery (PITR), and how does it work? | ADDED | Storage & Recovery | P4 | [Prep](https://testlabapp.com/interview-questions/system-design/databases) (not reverified) | 4 |
| 234 | What is the difference between RPO and RTO? | ADDED | Storage & Recovery | P4 | [Prep](https://learnbackend.com/interview-prep/databases/) (not reverified) | 4 |
| 235 | What is the difference between InnoDB and MyISAM in MySQL? | ADDED | Storage & Recovery; Database Architecture | P2 | — | 3 |
| 236 | What is a database buffer pool, and how does it improve performance? | ADDED | Storage & Recovery; Query Optimization & Performance | P1 | — | 4 |
| 237 | What is the difference between B-tree-based and LSM-tree-based storage engines? | ADDED | Storage & Recovery; Indexing; Database Architecture | P1 | — | 4 |
| 238 | What are VACUUM and autovacuum in PostgreSQL, and why are they necessary? | ADDED | Storage & Recovery; Query Optimization & Performance | P1 | — | 4 |
| 239 | What is the difference between MySQL redo logs, undo logs, and binary logs? | ADDED | Storage & Recovery; Transactions | P1 | — | 4 |
| 240 | What is the difference between index rebuilding and index reorganization, and when should each be used? | ADDED | Storage & Recovery; Indexing; Query Optimization & Performance | P1 | — | 5 |
| 241 | What is the difference between hot and cold database backups? | ADDED | Storage & Recovery | P4 | — | 5 |
| 242 | What is the difference between database failover and failback? | ADDED | Storage & Recovery; Database Architecture; Distributed Databases | P2 | — | 4 |
| 243 | How do you estimate and plan database storage capacity for a growing application? | ADDED | Storage & Recovery; Database Architecture | P2 | — | 4 |

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
| 227, 228, 231 | fsync and durability guarantees |
| 228, 229 | Transaction logs |
| 228, 230 | Checkpoints |
| 228, 236 | Dirty pages |
| 236 | Database pages and blocks |
| 235, 237 | Storage engines |
| 237 | Sequential vs random disk I/O |
| 231 | Group commit |
| 238 | Database bloat; VACUUM FULL |
| 233 | PostgreSQL WAL archiving; accidental DELETE or DROP recovery |
| 232, 234 | Disaster recovery vs high availability |
