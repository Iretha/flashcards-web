# NoSQL Interview Questions

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

Question IDs are local to this catalog and unique within it. Numbering starts at 1 and is consecutive. New questions receive the next available local ID (currently 121). IDs need not be unique across catalogs.



## Evidence legend

- `Prep`: interview-preparation source (not proof of an actual interview); wording may be adapted.
- `Technical`: technical background only, not interview evidence.
- `Interview`: documented actual interview occurrence. `Interview report (adapted)` identifies a reported interview topic with adapted wording; the report is not independently verified.
- `—`: source not recorded or verified.

## NoSQL – Interview Questions

| ID | Question | Origin | Topics | Priority | Evidence | Likelihood |
| ---: | --- | --- | --- | --- | --- | ---: |
| 1 | What is NoSQL Database? | ORIGINAL | Database Fundamentals; NoSQL Databases | P2 | — | 2 |
| 2 | What is the CAP theorem, and what are its implications for distributed databases? | ADDED | Distributed Databases; Database Architecture; NoSQL Databases | P2 | [Technical](https://www.ibm.com/think/topics/cap-theorem) | 1 |
| 3 | What is the difference between strong consistency and eventual consistency? | ADDED | Distributed Databases; Database Architecture; NoSQL Databases | P2 | [Technical](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html) | 2 |
| 4 | What is the difference between CP and AP systems? Can you provide examples? | ADDED | Distributed Databases; Database Architecture; NoSQL Databases | P2 | [Technical](https://www.ibm.com/think/topics/cap-theorem) | 3 |
| 5 | What is the difference between relational (SQL) and non-relational (NoSQL) databases? | ADDED | Database Fundamentals; Database Architecture; NoSQL Databases | P2 | [Technical (unverified)](https://aws.amazon.com/nosql/); [Previously proposed source (unverified)](https://medium.com/javarevisited/globallogic-senior-java-developer-interview-experience-for-ericsson-client-45-minutes-of-deep-ec1887d67eb4) | 1 |
| 6 | How do you choose between a relational and a NoSQL database for a new application? | ADDED | Database Fundamentals; Database Architecture; NoSQL Databases | P2 | [Technical (unverified)](https://aws.amazon.com/nosql/); [Previously proposed source (unverified)](https://www.geeksforgeeks.org/interview-experiences/mongodb-interview-experience-for-backend-developer/) | 2 |
| 7 | What are the main types of NoSQL databases, and what are their typical use cases? | ADDED | Database Fundamentals; NoSQL Databases | P2 | [Technical (unverified)](https://aws.amazon.com/nosql/); [Previously proposed source (unverified)](https://learnfrenzy.com/technical-interview/database-management/sql-and-database-internals/nosql-and-mongodb) | 2 |
| 8 | What is the difference between ACID and BASE? | ADDED | Database Fundamentals; Transactions; Distributed Databases; NoSQL Databases | P1 | [Technical (unverified)](https://www.ibm.com/think/topics/acid-transactions); [Previously proposed source (unverified)](https://www.linkedin.com/posts/meghna-jaswani-864703104_code-quality-security-static-analysis-activity-7459668705283710976-uDQe) | 3 |
| 9 | Do NoSQL databases support ACID transactions? | ADDED | Database Fundamentals; Transactions; NoSQL Databases | P1 | [Technical (unverified)](https://www.mongodb.com/docs/manual/core/transactions/); [Previously proposed source (unverified)](https://learnfrenzy.com/technical-interview/database-management/sql-and-database-internals/nosql-and-mongodb) | 3 |
| 10 | What is the difference between a fixed schema and a flexible schema? | ADDED | Database Fundamentals; Database Design; NoSQL Databases | P2 | [Technical (unverified)](https://www.mongodb.com/docs/manual/data-modeling/); [Previously proposed source (unverified)](https://gettarmac.com/interview-questions/databases-sql-sql-vs-nosql-interview-questions) | 3 |
| 11 | What is a document database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | P2 | [Technical (unverified)](https://aws.amazon.com/nosql/) | 3 |
| 12 | What is a key-value database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | P2 | [Technical (unverified)](https://aws.amazon.com/nosql/) | 3 |
| 13 | What is a graph database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | P2 | [Technical (unverified)](https://aws.amazon.com/nosql/) | 3 |
| 14 | What is a wide-column database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | P2 | [Technical (unverified)](https://aws.amazon.com/nosql/) | 4 |
| 15 | What is a time-series database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | P2 | [Technical (unverified)](https://aws.amazon.com/timestream/) | 4 |
| 16 | What is a vector database, and when should it be used? | ADDED | Database Fundamentals; NoSQL Databases | P2 | [Technical (unverified)](https://www.ibm.com/think/topics/vector-database) | 4 |
| 17 | What is a NewSQL database, and how does it differ from traditional relational and NoSQL databases? | ADDED | Database Fundamentals; Database Architecture; Distributed Databases; NoSQL Databases | P2 | — | 4 |
| 18 | What is polyglot persistence, and when should it be used? | ADDED | Database Fundamentals; Database Architecture; NoSQL Databases | P2 | [Technical (unverified)](https://martinfowler.com/bliki/PolyglotPersistence.html) | 4 |
| 19 | What is NoSQL injection, and how can it be prevented? | ADDED | Database Security; NoSQL Databases | P2 | — | 3 |
| 20 | How does data modeling in NoSQL differ from relational database modeling? | ADDED | NoSQL Databases; Database Design | P2 | — | 3 |
| 21 | What is access-pattern-driven data modeling in NoSQL? | ADDED | NoSQL Databases; Database Design | P2 | — | 3 |
| 22 | How do you model relationships in NoSQL databases without relying on joins? | ADDED | NoSQL Databases; Database Design | P2 | — | 3 |
| 23 | What are the advantages and disadvantages of data duplication in NoSQL databases? | ADDED | NoSQL Databases; Database Design | P2 | — | 3 |
| 24 | What are quorum reads and writes, and how do they affect consistency and availability? | ADDED | NoSQL Databases; Distributed Databases | P2 | — | 4 |
| 25 | What is a hot partition, and how can it be prevented? | ADDED | NoSQL Databases; Distributed Databases; Query Optimization & Performance | P1 | — | 4 |
| 26 | How do conditional writes help prevent concurrent update conflicts in NoSQL databases? | ADDED | NoSQL Databases; Concurrency Control & Locking | P1 | — | 4 |
| 27 | How do you manage schema evolution in a schemaless database? | ADDED | NoSQL Databases; Database Design | P2 | — | 3 |
| 28 | How do secondary indexes work in NoSQL databases, and what are their trade-offs? | ADDED | NoSQL Databases; Indexing; Query Optimization & Performance | P1 | — | 4 |
| 29 | How do transactions in NoSQL databases differ from transactions in relational databases? | ADDED | NoSQL Databases; Transactions | P1 | — | 4 |
| 30 | How does MongoDB store and organize data using documents and collections? | ADDED | NoSQL Databases | P2 | — | 3 |
| 31 | What is the difference between BSON and JSON? | ADDED | NoSQL Databases; Data Types & Collation | P2 | — | 4 |
| 32 | What are the advantages and disadvantages of MongoDB compared to relational databases? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 3 |
| 33 | When should you embed documents versus reference them in MongoDB? | ADDED | NoSQL Databases; Database Design | P2 | — | 3 |
| 34 | How do you model one-to-many and many-to-many relationships in MongoDB? | ADDED | NoSQL Databases; Database Design | P2 | — | 3 |
| 35 | What is ObjectId in MongoDB, and how does it work? | ADDED | NoSQL Databases; Data Types & Collation | P2 | — | 4 |
| 36 | What is the MongoDB aggregation pipeline, and how does it work? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 37 | What is the difference between find() and aggregate() in MongoDB? | ADDED | NoSQL Databases | P2 | — | 4 |
| 38 | What types of indexes does MongoDB support, and when should each be used? | ADDED | NoSQL Databases; Indexing; Query Optimization & Performance | P1 | — | 4 |
| 39 | What is the Equality, Sort, Range (ESR) rule for MongoDB compound indexes? | ADDED | NoSQL Databases; Indexing; Query Optimization & Performance | P1 | — | 5 |
| 40 | How do you identify and optimize slow MongoDB queries? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 41 | What is the difference between single-document atomicity and multi-document transactions in MongoDB? | ADDED | NoSQL Databases; Transactions; Transaction Isolation | P1 | — | 3 |
| 42 | How do replica sets work in MongoDB? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | P2 | — | 4 |
| 43 | How does sharding work in MongoDB? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | P2 | — | 4 |
| 44 | What are MongoDB Change Streams, and when should they be used? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 45 | What are TTL indexes in MongoDB? | ADDED | NoSQL Databases; Indexing | P1 | — | 4 |
| 46 | What are read concern and write concern in MongoDB? | ADDED | NoSQL Databases; Distributed Databases; Transaction Isolation | P1 | — | 4 |
| 47 | What are the limitations and risks of using large documents and unbounded arrays in MongoDB? | ADDED | NoSQL Databases; Database Design; Query Optimization & Performance | P1 | — | 4 |
| 48 | What is Redis, and what are its common use cases? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 2 |
| 49 | Why is Redis so fast? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 2 |
| 50 | What data structures does Redis support, and when should each be used? | ADDED | NoSQL Databases; Data Types & Collation | P2 | — | 3 |
| 51 | What is the difference between Redis and local in-memory caching? | ADDED | NoSQL Databases; Query Optimization & Performance; Database Architecture | P1 | — | 2 |
| 52 | What is the difference between Redis and Memcached? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 53 | What are cache hits and cache misses? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 2 |
| 54 | What is the difference between cache-aside, read-through, write-through, and write-behind caching? | ADDED | NoSQL Databases; Query Optimization & Performance; Database Architecture | P1 | — | 1 |
| 55 | What is TTL in Redis, and how do you choose an appropriate expiration time? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 2 |
| 56 | What is the difference between cache expiration and cache eviction? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 2 |
| 57 | What eviction policies does Redis support, including LRU and LFU? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 3 |
| 58 | How do you keep a Redis cache consistent with the underlying database? | ADDED | NoSQL Databases; Distributed Databases; Query Optimization & Performance | P1 | — | 2 |
| 59 | What is cache stampede, and how can it be prevented? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 3 |
| 60 | What is cache penetration, and how can it be prevented? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 61 | What is cache avalanche, and how can it be prevented? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 62 | What is the difference between RDB and AOF persistence in Redis? | ADDED | NoSQL Databases; Storage & Recovery | P2 | — | 4 |
| 63 | How does Redis support atomic operations and transactions? | ADDED | NoSQL Databases; Concurrency Control & Locking; Transactions | P1 | — | 3 |
| 64 | What is Redis pipelining, and how does it differ from a transaction? | ADDED | NoSQL Databases; Transactions; Query Optimization & Performance | P1 | — | 4 |
| 65 | What is the difference between Redis Pub/Sub and Redis Streams? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 66 | What is the difference between Redis Sentinel and Redis Cluster? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | P2 | — | 4 |
| 67 | How do you implement a distributed lock using Redis, and what are its limitations? | ADDED | NoSQL Databases; Distributed Databases; Concurrency Control & Locking | P1 | — | 3 |
| 68 | How can Redis be used to implement rate limiting? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 3 |
| 69 | How should an application behave when Redis becomes unavailable? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | P2 | — | 2 |
| 70 | What is the hot key problem in Redis, and how can it be mitigated? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 3 |
| 71 | How can Redis be used to implement idempotency? | ADDED | NoSQL Databases; Distributed Databases | P2 | — | 4 |
| 72 | What is Apache Cassandra, and when should it be used or avoided? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 73 | What is the difference between Cassandra and MongoDB? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 74 | How does Cassandra's primary-key structure work, and what is the difference between partition and clustering keys? | ADDED | NoSQL Databases; Database Design | P2 | — | 4 |
| 75 | How does Cassandra's tunable consistency work? | ADDED | NoSQL Databases; Distributed Databases; Transaction Isolation | P1 | — | 4 |
| 76 | What are the advantages of Cassandra's masterless architecture? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | P2 | — | 4 |
| 77 | Why is ALLOW FILTERING generally discouraged in Cassandra? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 78 | What are lightweight transactions (LWT) in Cassandra? | ADDED | NoSQL Databases; Concurrency Control & Locking; Transactions | P1 | — | 4 |
| 79 | What are tombstones in Cassandra, and how do they affect performance? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 80 | How do Cassandra's commit log, memtables, SSTables, and compaction work together? | ADDED | NoSQL Databases; Storage & Recovery | P2 | — | 5 |
| 81 | What is Amazon DynamoDB, and when should it be used? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 82 | What is the difference between a partition key and a sort key in DynamoDB? | ADDED | NoSQL Databases; Database Design | P2 | — | 4 |
| 83 | What is the difference between Global Secondary Indexes (GSI) and Local Secondary Indexes (LSI)? | ADDED | NoSQL Databases; Indexing | P1 | — | 4 |
| 84 | What is the difference between Query and Scan operations in DynamoDB? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 85 | What is the difference between strongly consistent and eventually consistent reads in DynamoDB? | ADDED | NoSQL Databases; Distributed Databases; Transaction Isolation | P1 | — | 4 |
| 86 | What is single-table design in DynamoDB, and what are its trade-offs? | ADDED | NoSQL Databases; Database Design | P2 | — | 4 |
| 87 | What are DynamoDB Streams, and when should they be used? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 88 | How does DynamoDB support transactions? | ADDED | NoSQL Databases; Transactions | P1 | — | 4 |
| 89 | What is Elasticsearch, and when should it be used instead of a relational database's search capabilities? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 3 |
| 90 | What is an inverted index, and how does it support full-text search? | ADDED | NoSQL Databases; Indexing | P1 | — | 4 |
| 91 | What are analyzers and tokenizers in Elasticsearch? | ADDED | NoSQL Databases | P2 | — | 4 |
| 92 | What are mappings in Elasticsearch? | ADDED | NoSQL Databases; Database Design | P2 | — | 4 |
| 93 | What is the difference between text and keyword fields in Elasticsearch? | ADDED | NoSQL Databases; Data Types & Collation | P2 | — | 4 |
| 94 | What is the difference between the match and term queries in Elasticsearch? | ADDED | NoSQL Databases | P2 | — | 4 |
| 95 | What is the difference between query context and filter context? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 96 | What does near-real-time search mean in Elasticsearch? | ADDED | NoSQL Databases | P2 | — | 4 |
| 97 | How does Elasticsearch rank search results using BM25? | ADDED | NoSQL Databases | P2 | — | 5 |
| 98 | How do primary shards and replica shards work in Elasticsearch? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | P2 | — | 4 |
| 99 | How can you efficiently paginate large Elasticsearch result sets? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 100 | How can you reindex Elasticsearch data without application downtime? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 101 | How do you keep Elasticsearch synchronized with a primary database? | ADDED | NoSQL Databases; Distributed Databases; Database Architecture | P2 | — | 3 |
| 102 | What are vector embeddings, and how are they stored in a vector database? | ADDED | NoSQL Databases; Data Types & Collation | P2 | — | 4 |
| 103 | What is the difference between semantic search and keyword search? | ADDED | NoSQL Databases | P2 | — | 4 |
| 104 | What is the difference between cosine similarity, Euclidean distance, and dot product? | ADDED | NoSQL Databases | P2 | — | 4 |
| 105 | What is the difference between exact and approximate nearest neighbor search (ANN)? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 106 | What is HNSW, and how does it work? | ADDED | NoSQL Databases; Indexing; Query Optimization & Performance | P1 | — | 5 |
| 107 | How does metadata filtering work in vector databases? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 108 | What is hybrid search, and how does it combine keyword and vector search? | ADDED | NoSQL Databases | P2 | — | 4 |
| 109 | How do you choose between pgvector, a dedicated vector database, and a search engine with vector search capabilities? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 110 | What are the trade-offs between recall, latency, and memory consumption in vector search? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 111 | What happens to stored embeddings when the embedding model changes? | ADDED | NoSQL Databases | P2 | — | 4 |
| 112 | What role does a vector database play in a Retrieval-Augmented Generation (RAG) system? | ADDED | NoSQL Databases; Database Architecture | P2 | — | 4 |
| 113 | How do nodes, relationships, labels, and properties work in Neo4j? | ADDED | NoSQL Databases; Database Design | P2 | — | 4 |
| 114 | What is the difference between graph traversal and relational joins? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 115 | What is Cypher, and how does it differ from SQL? | ADDED | NoSQL Databases | P2 | — | 4 |
| 116 | How are indexes and constraints used in Neo4j? | ADDED | NoSQL Databases; Indexing; Relational Model & Data Integrity | P1 | — | 4 |
| 117 | How does data modeling in time-series databases differ from relational data modeling? | ADDED | NoSQL Databases; Database Design | P2 | — | 4 |
| 118 | What are retention policies in time-series databases? | ADDED | NoSQL Databases; Storage & Recovery | P2 | — | 4 |
| 119 | What is downsampling in time-series databases, and why is it used? | ADDED | NoSQL Databases; Query Optimization & Performance | P1 | — | 4 |
| 120 | Do NoSQL databases use SQL? What query languages and APIs are used by different NoSQL databases? | ADDED | NoSQL Databases | P2 | — | 2 |

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
| General NoSQL Concepts & Data Modeling | P2 | 20–29, 120 | 11 | 🟢 Good |
| MongoDB | P2 | 30–47 | 18 | 🟢 Good |
| Redis & Caching | P2 | 48–71 | 24 | 🟢 Good |
| Cassandra | P3 | 72–80 | 9 | 🟢 Good |
| DynamoDB | P3 | 81–88 | 8 | 🟢 Good |
| Elasticsearch | P3 | 89–101 | 13 | 🟢 Good |
| Vector databases | P3 | 102–112 | 11 | 🟢 Good |
| Graph databases & Neo4j | P4 | 113–116 | 4 | 🟢 Good |
| Time-series databases | P4 | 117–119 | 3 | 🟢 Good |

Coverage is an expert assessment of question scope, not verified interview frequency. The 19 previously tagged questions are included in this deck. Evidence for IDs 20–119 is pending: prior citation references did not provide recoverable source URLs in the current context. Product-specific questions are retained as approved, including search engines and vector databases.

**Answer scope (ID 120):** No universal NoSQL query language; MongoDB MQL, Cassandra CQL, Redis commands, Neo4j Cypher, Elasticsearch Query DSL and ES\|QL, DynamoDB API and PartiQL, Couchbase SQL++. User-approved question; interview evidence unrecorded.

