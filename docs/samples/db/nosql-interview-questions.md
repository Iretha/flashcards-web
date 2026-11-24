# NoSQL Interview Questions

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


IDs are shared across `database-interview-questions.md`, `nosql-interview-questions.md`, and `jdbc-interview-questions.md`; coordinate new allocations across all three files. Existing IDs are preserved.

## Evidence legend

- `Prep`: interview-preparation source (not proof of an actual interview); wording may be adapted.
- `Technical`: technical background only, not interview evidence.
- `Interview`: documented actual interview occurrence. `Interview report (adapted)` identifies a reported interview topic with adapted wording; the report is not independently verified.
- `—`: source not recorded or verified.

## NoSQL – Interview Questions

| ID | Question | Origin | Topics | Evidence | Вероятност |
| ---: | --- | --- | --- | --- | ---: |
| 4 | What is NoSQL Database? | ORIGINAL | Database Fundamentals; NoSQL Databases | — | 4 |
| 147 | What is the CAP theorem, and what are its implications for distributed databases? | ADDED | Distributed Databases; Database Architecture; NoSQL Databases | [Technical](https://www.ibm.com/think/topics/cap-theorem) | 5 |
| 148 | What is the difference between strong consistency and eventual consistency? | ADDED | Distributed Databases; Database Architecture; NoSQL Databases | [Technical](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html) | 4 |
| 149 | What is the difference between CP and AP systems? Can you provide examples? | ADDED | Distributed Databases; Database Architecture; NoSQL Databases | [Technical](https://www.ibm.com/think/topics/cap-theorem) | 3 |
| 159 | What is the difference between relational (SQL) and non-relational (NoSQL) databases? | ADDED | Database Fundamentals; Database Architecture; NoSQL Databases | [Technical (unverified)](https://aws.amazon.com/nosql/); [Previously proposed source (unverified)](https://medium.com/javarevisited/globallogic-senior-java-developer-interview-experience-for-ericsson-client-45-minutes-of-deep-ec1887d67eb4) | 5 |
| 160 | How do you choose between a relational and a NoSQL database for a new application? | ADDED | Database Fundamentals; Database Architecture; NoSQL Databases | [Technical (unverified)](https://aws.amazon.com/nosql/); [Previously proposed source (unverified)](https://www.geeksforgeeks.org/interview-experiences/mongodb-interview-experience-for-backend-developer/) | 4 |
| 161 | What are the main types of NoSQL databases, and what are their typical use cases? | ADDED | Database Fundamentals; NoSQL Databases | [Technical (unverified)](https://aws.amazon.com/nosql/); [Previously proposed source (unverified)](https://learnfrenzy.com/technical-interview/database-management/sql-and-database-internals/nosql-and-mongodb) | 4 |
| 162 | What is the difference between ACID and BASE? | ADDED | Database Fundamentals; Transactions; Distributed Databases; NoSQL Databases | [Technical (unverified)](https://www.ibm.com/think/topics/acid-transactions); [Previously proposed source (unverified)](https://www.linkedin.com/posts/meghna-jaswani-864703104_code-quality-security-static-analysis-activity-7459668705283710976-uDQe) | 3 |
| 164 | Do NoSQL databases support ACID transactions? | ADDED | Database Fundamentals; Transactions; NoSQL Databases | [Technical (unverified)](https://www.mongodb.com/docs/manual/core/transactions/); [Previously proposed source (unverified)](https://learnfrenzy.com/technical-interview/database-management/sql-and-database-internals/nosql-and-mongodb) | 3 |
| 165 | What is the difference between a fixed schema and a flexible schema? | ADDED | Database Fundamentals; Database Design; NoSQL Databases | [Technical (unverified)](https://www.mongodb.com/docs/manual/data-modeling/); [Previously proposed source (unverified)](https://gettarmac.com/interview-questions/databases-sql-sql-vs-nosql-interview-questions) | 3 |
| 167 | What is a document database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | [Technical (unverified)](https://aws.amazon.com/nosql/) | 3 |
| 168 | What is a key-value database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | [Technical (unverified)](https://aws.amazon.com/nosql/) | 3 |
| 169 | What is a graph database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | [Technical (unverified)](https://aws.amazon.com/nosql/) | 3 |
| 170 | What is a wide-column database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | [Technical (unverified)](https://aws.amazon.com/nosql/) | 2 |
| 173 | What is a time-series database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | [Technical (unverified)](https://aws.amazon.com/timestream/) | 2 |
| 174 | What is a vector database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | [Technical (unverified)](https://www.ibm.com/think/topics/vector-database) | 2 |
| 176 | What is a NewSQL database, and how does it differ from traditional relational and NoSQL databases? | ADDED | Database Fundamentals; Database Architecture; Distributed Databases; NoSQL Databases | — | 2 |
| 177 | What is polyglot persistence, and when should it be used? | ADDED | Database Fundamentals; Database Architecture; NoSQL Databases | [Technical (unverified)](https://martinfowler.com/bliki/PolyglotPersistence.html) | 2 |
| 203 | What is NoSQL injection, and how can it be prevented? | ADDED | Database Security; NoSQL Databases | — | 3 |
| 309 | How does data modeling in NoSQL differ from relational database modeling? | ADDED | NoSQL Databases; Database Design | — | 3 |
| 310 | What is access-pattern-driven data modeling in NoSQL? | ADDED | NoSQL Databases; Database Design | — | 3 |
| 311 | How do you model relationships in NoSQL databases without relying on joins? | ADDED | NoSQL Databases; Database Design | — | 3 |
| 312 | What are the advantages and disadvantages of data duplication in NoSQL databases? | ADDED | NoSQL Databases; Database Design | — | 3 |
| 313 | What are quorum reads and writes, and how do they affect consistency and availability? | ADDED | NoSQL Databases; Distributed Databases | — | 2 |
| 314 | What is a hot partition, and how can it be prevented? | ADDED | NoSQL Databases; Distributed Databases; Query Optimization & Performance | — | 2 |
| 315 | How do conditional writes help prevent concurrent update conflicts in NoSQL databases? | ADDED | NoSQL Databases; Concurrency Control & Locking | — | 2 |
| 316 | How do you manage schema evolution in a schemaless database? | ADDED | NoSQL Databases; Database Design | — | 3 |
| 317 | How do secondary indexes work in NoSQL databases, and what are their trade-offs? | ADDED | NoSQL Databases; Indexing; Query Optimization & Performance | — | 2 |
| 318 | How do transactions in NoSQL databases differ from transactions in relational databases? | ADDED | NoSQL Databases; Transactions | — | 2 |
| 319 | How does MongoDB store and organize data using documents and collections? | ADDED | NoSQL Databases | — | 3 |
| 320 | What is the difference between BSON and JSON? | ADDED | NoSQL Databases; Data Types & Collation | — | 2 |
| 321 | What are the advantages and disadvantages of MongoDB compared to relational databases? | ADDED | NoSQL Databases; Database Architecture | — | 3 |
| 322 | When should you embed documents versus reference them in MongoDB? | ADDED | NoSQL Databases; Database Design | — | 3 |
| 323 | How do you model one-to-many and many-to-many relationships in MongoDB? | ADDED | NoSQL Databases; Database Design | — | 3 |
| 324 | What is ObjectId in MongoDB, and how does it work? | ADDED | NoSQL Databases; Data Types & Collation | — | 2 |
| 325 | What is the MongoDB aggregation pipeline, and how does it work? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 326 | What is the difference between find() and aggregate() in MongoDB? | ADDED | NoSQL Databases | — | 2 |
| 327 | What types of indexes does MongoDB support, and when should each be used? | ADDED | NoSQL Databases; Indexing; Query Optimization & Performance | — | 2 |
| 328 | What is the Equality, Sort, Range (ESR) rule for MongoDB compound indexes? | ADDED | NoSQL Databases; Indexing; Query Optimization & Performance | — | 1 |
| 329 | How do you identify and optimize slow MongoDB queries? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 330 | What is the difference between single-document atomicity and multi-document transactions in MongoDB? | ADDED | NoSQL Databases; Transactions; Transaction Isolation | — | 3 |
| 331 | How do replica sets work in MongoDB? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | — | 2 |
| 332 | How does sharding work in MongoDB? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | — | 2 |
| 333 | What are MongoDB Change Streams, and when should they be used? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 334 | What are TTL indexes in MongoDB? | ADDED | NoSQL Databases; Indexing | — | 2 |
| 335 | What are read concern and write concern in MongoDB? | ADDED | NoSQL Databases; Distributed Databases; Transaction Isolation | — | 2 |
| 336 | What are the limitations and risks of using large documents and unbounded arrays in MongoDB? | ADDED | NoSQL Databases; Database Design; Query Optimization & Performance | — | 2 |
| 337 | What is Redis, and what are its common use cases? | ADDED | NoSQL Databases; Database Architecture | — | 4 |
| 338 | Why is Redis so fast? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 4 |
| 339 | What data structures does Redis support, and when should each be used? | ADDED | NoSQL Databases; Data Types & Collation | — | 3 |
| 340 | What is the difference between Redis and local in-memory caching? | ADDED | NoSQL Databases; Query Optimization & Performance; Database Architecture | — | 4 |
| 341 | What is the difference between Redis and Memcached? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 342 | What are cache hits and cache misses? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 4 |
| 343 | What is the difference between cache-aside, read-through, write-through, and write-behind caching? | ADDED | NoSQL Databases; Query Optimization & Performance; Database Architecture | — | 5 |
| 344 | What is TTL in Redis, and how do you choose an appropriate expiration time? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 4 |
| 345 | What is the difference between cache expiration and cache eviction? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 4 |
| 346 | What eviction policies does Redis support, including LRU and LFU? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 3 |
| 347 | How do you keep a Redis cache consistent with the underlying database? | ADDED | NoSQL Databases; Distributed Databases; Query Optimization & Performance | — | 4 |
| 348 | What is cache stampede, and how can it be prevented? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 3 |
| 349 | What is cache penetration, and how can it be prevented? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 350 | What is cache avalanche, and how can it be prevented? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 351 | What is the difference between RDB and AOF persistence in Redis? | ADDED | NoSQL Databases; Storage & Recovery | — | 2 |
| 352 | How does Redis support atomic operations and transactions? | ADDED | NoSQL Databases; Concurrency Control & Locking; Transactions | — | 3 |
| 353 | What is Redis pipelining, and how does it differ from a transaction? | ADDED | NoSQL Databases; Transactions; Query Optimization & Performance | — | 2 |
| 354 | What is the difference between Redis Pub/Sub and Redis Streams? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 355 | What is the difference between Redis Sentinel and Redis Cluster? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | — | 2 |
| 356 | How do you implement a distributed lock using Redis, and what are its limitations? | ADDED | NoSQL Databases; Distributed Databases; Concurrency Control & Locking | — | 3 |
| 357 | How can Redis be used to implement rate limiting? | ADDED | NoSQL Databases; Database Architecture | — | 3 |
| 358 | How should an application behave when Redis becomes unavailable? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | — | 4 |
| 359 | What is the hot key problem in Redis, and how can it be mitigated? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 3 |
| 360 | How can Redis be used to implement idempotency? | ADDED | NoSQL Databases; Distributed Databases | — | 2 |
| 361 | What is Apache Cassandra, and when should it be used or avoided? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 362 | What is the difference between Cassandra and MongoDB? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 363 | How does Cassandra's primary-key structure work, and what is the difference between partition and clustering keys? | ADDED | NoSQL Databases; Database Design | — | 2 |
| 364 | How does Cassandra's tunable consistency work? | ADDED | NoSQL Databases; Distributed Databases; Transaction Isolation | — | 2 |
| 365 | What are the advantages of Cassandra's masterless architecture? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | — | 2 |
| 366 | Why is ALLOW FILTERING generally discouraged in Cassandra? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 367 | What are lightweight transactions (LWT) in Cassandra? | ADDED | NoSQL Databases; Concurrency Control & Locking; Transactions | — | 2 |
| 368 | What are tombstones in Cassandra, and how do they affect performance? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 369 | How do Cassandra's commit log, memtables, SSTables, and compaction work together? | ADDED | NoSQL Databases; Storage & Recovery | — | 1 |
| 370 | What is Amazon DynamoDB, and when should it be used? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 371 | What is the difference between a partition key and a sort key in DynamoDB? | ADDED | NoSQL Databases; Database Design | — | 2 |
| 372 | What is the difference between Global Secondary Indexes (GSI) and Local Secondary Indexes (LSI)? | ADDED | NoSQL Databases; Indexing | — | 2 |
| 373 | What is the difference between Query and Scan operations in DynamoDB? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 374 | What is the difference between strongly consistent and eventually consistent reads in DynamoDB? | ADDED | NoSQL Databases; Distributed Databases; Transaction Isolation | — | 2 |
| 375 | What is single-table design in DynamoDB, and what are its trade-offs? | ADDED | NoSQL Databases; Database Design | — | 2 |
| 376 | What are DynamoDB Streams, and when should they be used? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 377 | How does DynamoDB support transactions? | ADDED | NoSQL Databases; Transactions | — | 2 |
| 378 | What is Elasticsearch, and when should it be used instead of a relational database's search capabilities? | ADDED | NoSQL Databases; Database Architecture | — | 3 |
| 379 | What is an inverted index, and how does it support full-text search? | ADDED | NoSQL Databases; Indexing | — | 2 |
| 380 | What are analyzers and tokenizers in Elasticsearch? | ADDED | NoSQL Databases | — | 2 |
| 381 | What are mappings in Elasticsearch? | ADDED | NoSQL Databases; Database Design | — | 2 |
| 382 | What is the difference between text and keyword fields in Elasticsearch? | ADDED | NoSQL Databases; Data Types & Collation | — | 2 |
| 383 | What is the difference between the match and term queries in Elasticsearch? | ADDED | NoSQL Databases | — | 2 |
| 384 | What is the difference between query context and filter context? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 385 | What does near-real-time search mean in Elasticsearch? | ADDED | NoSQL Databases | — | 2 |
| 386 | How does Elasticsearch rank search results using BM25? | ADDED | NoSQL Databases | — | 1 |
| 387 | How do primary shards and replica shards work in Elasticsearch? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | — | 2 |
| 388 | How can you efficiently paginate large Elasticsearch result sets? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 389 | How can you reindex Elasticsearch data without application downtime? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 390 | How do you keep Elasticsearch synchronized with a primary database? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | — | 3 |
| 391 | What are vector embeddings, and how are they stored in a vector database? | ADDED | NoSQL Databases; Data Types & Collation | — | 2 |
| 392 | What is the difference between semantic search and keyword search? | ADDED | NoSQL Databases | — | 2 |
| 393 | What is the difference between cosine similarity, Euclidean distance, and dot product? | ADDED | NoSQL Databases | — | 2 |
| 394 | What is the difference between exact and approximate nearest neighbor search (ANN)? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 395 | What is HNSW, and how does it work? | ADDED | NoSQL Databases; Indexing; Query Optimization & Performance | — | 1 |
| 396 | How does metadata filtering work in vector databases? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 397 | What is hybrid search, and how does it combine keyword and vector search? | ADDED | NoSQL Databases | — | 2 |
| 398 | How do you choose between pgvector, a dedicated vector database, and a search engine with vector search capabilities? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 399 | What are the trade-offs between recall, latency, and memory consumption in vector search? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 400 | What happens to stored embeddings when the embedding model changes? | ADDED | NoSQL Databases | — | 2 |
| 401 | What role does a vector database play in a Retrieval-Augmented Generation (RAG) system? | ADDED | NoSQL Databases; Database Architecture | — | 2 |
| 402 | How do nodes, relationships, labels, and properties work in Neo4j? | ADDED | NoSQL Databases; Database Design | — | 2 |
| 403 | What is the difference between graph traversal and relational joins? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 404 | What is Cypher, and how does it differ from SQL? | ADDED | NoSQL Databases | — | 2 |
| 405 | How are indexes and constraints used in Neo4j? | ADDED | NoSQL Databases; Indexing; Relational Model & Data Integrity | — | 2 |
| 406 | How does data modeling in time-series databases differ from relational data modeling? | ADDED | NoSQL Databases; Database Design | — | 2 |
| 407 | What are retention policies in time-series databases? | ADDED | NoSQL Databases; Storage & Recovery | — | 2 |
| 408 | What is downsampling in time-series databases, and why is it used? | ADDED | NoSQL Databases; Query Optimization & Performance | — | 2 |
| 663 | Do NoSQL databases use SQL? What query languages and APIs are used by different NoSQL databases? | ADDED | NoSQL Databases | — | 4 |

**Unique questions: 120.** All questions tagged `NoSQL Databases` were moved from the database catalog, including cross-topic questions.

**Priority legend**

- `P1` — Critical: core knowledge expected of a Senior Java Backend Developer.
- `P2` — High: important for backend design and development.
- `P3` — Medium: useful knowledge, typically requiring less depth.
- `P4` — Low: more specialized knowledge, often associated with DBA roles.

Coverage labels: `🟢 Good`, `🟡 Partial`, `🟠 Weak`, `🔴 Missing`. Priorities and coverage are preliminary expert assessments, not verified interview-frequency findings.

### NoSQL Databases — subtopic coverage

| Subtopic | Priority | New question IDs | New questions | Coverage |
| --- | --- | --- | ---: | --- |
| General NoSQL Concepts & Data Modeling | P2 | 309–318, 663 | 11 | 🟢 Good |
| MongoDB | P2 | 319–336 | 18 | 🟢 Good |
| Redis & Caching | P2 | 337–360 | 24 | 🟢 Good |
| Cassandra | P3 | 361–369 | 9 | 🟢 Good |
| DynamoDB | P3 | 370–377 | 8 | 🟢 Good |
| Elasticsearch | P3 | 378–390 | 13 | 🟢 Good |
| Vector databases | P3 | 391–401 | 11 | 🟢 Good |
| Graph databases & Neo4j | P4 | 402–405 | 4 | 🟢 Good |
| Time-series databases | P4 | 406–408 | 3 | 🟢 Good |

Coverage is an expert assessment of question scope, not verified interview frequency. The 19 previously tagged questions are included in this deck. Evidence for IDs 309–408 is pending: prior citation references did not provide recoverable source URLs in the current context. Product-specific questions are retained as approved, including search engines and vector databases.

**Answer scope (ID 663):** No universal NoSQL query language; MongoDB MQL, Cassandra CQL, Redis commands, Neo4j Cypher, Elasticsearch Query DSL and ES\|QL, DynamoDB API and PartiQL, Couchbase SQL++. User-approved question; interview evidence unrecorded.

