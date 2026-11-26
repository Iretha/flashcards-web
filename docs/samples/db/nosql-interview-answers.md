# NoSQL Interview Answers — Senior Java Developer

Source: `nosql-interview-questions.md` in branch `feature/card-classification-study-filters`.

Concise interview-ready answers. NoSQL behaviors and guarantees vary by product, deployment, version, and configuration.

### 1. What is NoSQL Database?

**Answer:** NoSQL refers to databases using non-relational data models, such as documents, key-value, wide-column, or graphs. They vary widely in consistency, schemas, and transactions; it does not mean they cannot support SQL.

### 2. What is the CAP theorem, and what are its implications for distributed databases?

**Answer:** CAP says that during a network partition, a distributed system cannot simultaneously guarantee linearizable consistency and availability for every request. Without a partition, this CP/AP trade-off does not apply in the same way.

### 3. What is the difference between strong consistency and eventual consistency?

**Answer:** Strong consistency usually means a read reflects the latest completed write under a specified model; eventual consistency permits stale reads but converges if updates stop and communication succeeds.

### 4. What is the difference between CP and AP systems? Can you provide examples?

**Answer:** During a partition, CP systems may reject requests to preserve consistency; AP systems continue serving requests while accepting possible divergence. Classification applies to particular operations/configurations, not necessarily an entire product.

### 5. What is the difference between relational (SQL) and non-relational (NoSQL) databases?

**Answer:** Relational databases emphasize tables, declarative SQL, constraints, and joins; NoSQL products offer alternative models and often design for specific distribution or access patterns. Features overlap.

### 6. How do you choose between a relational and a NoSQL database for a new application?

**Answer:** Start with required invariants, query patterns, relationships, transactions, scale, operations, and team expertise. Relational is a sound default; choose NoSQL when its specific model or scaling properties solve demonstrated needs.

### 7. What are the main types of NoSQL databases, and what are their typical use cases?

**Answer:** Key-value stores suit caching/session lookup; document stores suit nested entities; wide-column stores suit partitioned high-throughput workloads; graph stores suit relationship traversals.

### 8. What is the difference between ACID and BASE?

**Answer:** ACID denotes transaction guarantees; BASE loosely describes basically available, soft-state, eventually consistent designs. They are not strict mutually exclusive database categories.

### 9. Do NoSQL databases support ACID transactions?

**Answer:** Yes. Many NoSQL engines support atomic operations and some provide multi-record ACID transactions, with scope, isolation, and performance constraints varying by product.

### 10. What is the difference between a fixed schema and a flexible schema?

**Answer:** Fixed schemas enforce declared structures; flexible schemas permit records with different fields. Flexible does not mean validation or schema governance is unnecessary.

### 11. What is a document database, and when should it be used?

**Answer:** Document databases store self-contained structured documents, often JSON-like, and suit aggregate-oriented data with evolving nested attributes.

### 12. What is a key-value database, and when should it be used?

**Answer:** Key-value databases retrieve values by keys efficiently and suit caches, counters, sessions, and simple access patterns; rich ad hoc joins are generally limited.

### 13. What is a graph database, and when should it be used?

**Answer:** Graph databases store connected entities and their relationships, enabling efficient multi-hop traversal and relationship-centric queries.

### 14. What is a wide-column database, and when should it be used?

**Answer:** Wide-column stores organize records by partition and clustering keys, often supporting high-scale writes and predictable queries rather than arbitrary joins.

### 15. What is a time-series database, and when should it be used?

**Answer:** Time-series databases optimize timestamped observations, ingestion, temporal aggregation, retention, and compression, useful for metrics, telemetry, and sensor data.

### 16. What is a vector database, and when should it be used?

**Answer:** Vector databases index numerical embeddings for similarity search, commonly used in semantic retrieval and RAG; exact features vary by product.

### 17. What is a NewSQL database, and how does it differ from traditional relational and NoSQL databases?

**Answer:** NewSQL generally describes distributed relational systems combining SQL and ACID transactions with horizontal scaling; it is an informal category, not a formal SQL standard.

### 18. What is polyglot persistence, and when should it be used?

**Answer:** Polyglot persistence uses different storage technologies for different workloads; it is justified when benefits outweigh operational complexity and cross-store consistency costs.

### 19. What is NoSQL injection, and how can it be prevented?

**Answer:** NoSQL injection manipulates query structures or operators via untrusted input, for example a document query object. Validate types, use safe driver APIs, allowlist operators, and enforce least privilege.

### 20. How does data modeling in NoSQL differ from relational database modeling?

**Answer:** Relational models often normalize around entities and constraints; NoSQL models frequently organize data around aggregates, partition keys, and known query patterns.

### 21. What is access-pattern-driven data modeling in NoSQL?

**Answer:** Access-pattern-driven modeling chooses keys, indexes, and record shapes based on how data is read and written, to avoid expensive scans or cross-partition operations.

### 22. How do you model relationships in NoSQL databases without relying on joins?

**Answer:** Embed closely coupled bounded data, store related IDs for independent entities, or materialize read models. Each choice trades query simplicity against duplication and consistency work.

### 23. What are the advantages and disadvantages of data duplication in NoSQL databases?

**Answer:** Duplication can eliminate joins and reduce read latency, but increases storage and requires coordinated updates, reconciliation, and careful ownership of source data.

### 24. What are quorum reads and writes, and how do they affect consistency and availability?

**Answer:** Quorums require acknowledgments from configurable numbers of replicas; overlapping read/write sets can improve freshness, but actual guarantees depend on replication, failures, and protocol details.

### 25. What is a hot partition, and how can it be prevented?

**Answer:** A hot partition receives disproportionate requests, limiting throughput. Choose well-distributed keys, avoid monotonically concentrated writes, and shard hot keys where semantics permit.

### 26. How do conditional writes help prevent concurrent update conflicts in NoSQL databases?

**Answer:** Conditional writes such as compare-and-set or version checks update data only if an expected condition still holds, preventing overwrites or enabling conflict detection.

### 27. How do you manage schema evolution in a schemaless database?

**Answer:** Use schema versions, backward-compatible readers, validation, gradual migrations, and explicit handling of missing fields; schemaless storage still needs application contracts.

### 28. How do secondary indexes work in NoSQL databases, and what are their trade-offs?

**Answer:** Secondary indexes locate records by non-primary attributes but add write/storage overhead and may have locality, consistency, or scaling limitations.

### 29. How do transactions in NoSQL databases differ from transactions in relational databases?

**Answer:** Many NoSQL systems favor single-record atomicity or restricted transaction scopes; others support multi-record ACID transactions. Compare guarantees and operational cost rather than assuming NoSQL lacks transactions.

### 30. How does MongoDB store and organize data using documents and collections?

**Answer:** MongoDB stores BSON documents in collections; each document has an _id, and collections generally allow varying field structures with optional validation.

### 31. What is the difference between BSON and JSON?

**Answer:** JSON is a textual interchange format; BSON is a binary document format with additional types such as dates, ObjectId, and binary data, subject to BSON-specific limits.

### 32. What are the advantages and disadvantages of MongoDB compared to relational databases?

**Answer:** MongoDB supports flexible nested documents and convenient aggregate reads; drawbacks can include duplication, limited relational constraints, and complex cross-document updates.

### 33. When should you embed documents versus reference them in MongoDB?

**Answer:** Embed data read and updated together when bounded; reference independently changing, shared, or unbounded entities to avoid growing documents and write contention.

### 34. How do you model one-to-many and many-to-many relationships in MongoDB?

**Answer:** One-to-many may use embedded arrays or child references; many-to-many typically uses arrays of references or a separate association collection, based on access and size.

### 35. What is ObjectId in MongoDB, and how does it work?

**Answer:** ObjectId is a 12-byte BSON identifier typically generated from timestamp, process-related randomness, and a counter; it is usually unique and approximately time ordered, not guaranteed globally sorted.

### 36. What is the MongoDB aggregation pipeline, and how does it work?

**Answer:** MongoDB aggregation pipelines pass documents through stages such as $match, $group, $project, and $sort to transform and aggregate results.

### 37. What is the difference between find() and aggregate() in MongoDB?

**Answer:** find() retrieves matching documents with projection and options; aggregate() supports multi-stage transformations, grouping, joins, and complex analysis.

### 38. What types of indexes does MongoDB support, and when should each be used?

**Answer:** MongoDB supports single-field, compound, multikey, text, geospatial, hashed, wildcard, and other indexes; choose based on filters, sorting, and index maintenance costs.

### 39. What is the Equality, Sort, Range (ESR) rule for MongoDB compound indexes?

**Answer:** The ESR guideline orders equality fields before sort fields, then range fields in compound indexes, but selectivity and workload may justify exceptions.

### 40. How do you identify and optimize slow MongoDB queries?

**Answer:** Use profiler/slow-query metrics and explain('executionStats') to inspect scans, index selection, sorting, and examined-versus-returned documents; optimize predicates and indexes.

### 41. What is the difference between single-document atomicity and multi-document transactions in MongoDB?

**Answer:** Operations modifying one MongoDB document are atomic; multi-document transactions give grouped ACID operations but introduce additional coordination and resource costs.

### 42. How do replica sets work in MongoDB?

**Answer:** A replica set has a primary accepting writes and secondaries replicating the oplog; elections provide failover, with durability/read behavior controlled by concerns.

### 43. How does sharding work in MongoDB?

**Answer:** Sharding partitions collections across shards by a shard key; mongos routers direct operations and balancers move data. Poor shard keys cause hotspots or scatter-gather queries.

### 44. What are MongoDB Change Streams, and when should they be used?

**Answer:** Change Streams expose ordered change events from supported deployments for integrations and projections; consumers need resumability, duplicate handling, and retention awareness.

### 45. What are TTL indexes in MongoDB?

**Answer:** TTL indexes automatically remove documents once indexed date/time conditions expire; deletion is asynchronous and not a precise scheduler.

### 46. What are read concern and write concern in MongoDB?

**Answer:** Read concern specifies visibility/consistency guarantees for reads; write concern specifies acknowledgments and durability level for writes. Neither alone captures all isolation semantics.

### 47. What are the limitations and risks of using large documents and unbounded arrays in MongoDB?

**Answer:** Large documents risk hitting MongoDB's BSON document size limit and costly rewrites; unbounded arrays increase contention and indexing/memory overhead. Use bounded or referenced structures.

### 48. What is Redis, and what are its common use cases?

**Answer:** Redis is an in-memory data structure server used for caching, counters, rate limiting, session storage, queues, and streams, with configurable persistence.

### 49. Why is Redis so fast?

**Answer:** Redis keeps working data in memory and processes commands efficiently with compact structures; performance still depends on command complexity, networking, and workload.

### 50. What data structures does Redis support, and when should each be used?

**Answer:** Redis supports strings, hashes, lists, sets, sorted sets, streams, and more; use strings for cache/counters, hashes for fields, sorted sets for rankings, and streams for consumer groups.

### 51. What is the difference between Redis and local in-memory caching?

**Answer:** Local cache is process-private and very fast but fragmented across instances; Redis is shared across applications with network latency and a separate failure mode.

### 52. What is the difference between Redis and Memcached?

**Answer:** Both offer in-memory key-value caching; Redis supports richer data structures, persistence, replication, and scripting, whereas Memcached is simpler and mainly focused on caching.

### 53. What are cache hits and cache misses?

**Answer:** A cache hit finds the requested value in cache; a miss requires fetching or computing it elsewhere. Hit ratio alone does not capture cache effectiveness.

### 54. What is the difference between cache-aside, read-through, write-through, and write-behind caching?

**Answer:** Cache-aside lets applications load on miss; read-through lets the cache layer fetch; write-through updates storage synchronously; write-behind queues storage writes asynchronously.

### 55. What is TTL in Redis, and how do you choose an appropriate expiration time?

**Answer:** TTL is a key's expiry duration. Choose it based on acceptable staleness, update frequency, memory budget, and recovery behavior; add jitter when appropriate.

### 56. What is the difference between cache expiration and cache eviction?

**Answer:** Expiration removes keys based on elapsed TTL; eviction removes keys to satisfy memory policies, possibly before their TTL ends.

### 57. What eviction policies does Redis support, including LRU and LFU?

**Answer:** Redis supports policies such as allkeys-lru, allkeys-lfu, volatile-lru, volatile-lfu, volatile-ttl, random, and noeviction, depending on version and configuration.

### 58. How do you keep a Redis cache consistent with the underlying database?

**Answer:** Typical cache-aside writes update the database then invalidate affected keys; use versioning, TTL, or event-based invalidation when races and staleness matter.

### 59. What is cache stampede, and how can it be prevented?

**Answer:** A stampede happens when many requests recompute the same missing/hot value simultaneously. Use single-flight locking, soft expiration, prewarming, or stale-while-revalidate.

### 60. What is cache penetration, and how can it be prevented?

**Answer:** Cache penetration occurs when repeated requests for nonexistent data bypass cache. Cache negative results briefly, validate inputs, and consider Bloom filters where useful.

### 61. What is cache avalanche, and how can it be prevented?

**Answer:** A cache avalanche is a burst of many cache misses from synchronized expiry or cache outage; stagger TTLs, warm keys, and protect the backend with limits.

### 62. What is the difference between RDB and AOF persistence in Redis?

**Answer:** RDB persistence writes periodic snapshots, potentially losing changes since the last snapshot; AOF records write commands for replay with configurable fsync and rewrite behavior.

### 63. How does Redis support atomic operations and transactions?

**Answer:** Redis executes each command atomically relative to other commands on a server; MULTI/EXEC groups commands without SQL-style rollback, while Lua scripts can implement atomic logic.

### 64. What is Redis pipelining, and how does it differ from a transaction?

**Answer:** Pipelining sends multiple commands without waiting for each response, reducing network latency; it does not make the commands a single atomic transaction.

### 65. What is the difference between Redis Pub/Sub and Redis Streams?

**Answer:** Pub/Sub broadcasts transient messages to current subscribers without replay; Streams persist entries and support consumer groups, IDs, and acknowledgments.

### 66. What is the difference between Redis Sentinel and Redis Cluster?

**Answer:** Sentinel monitors and coordinates failover for Redis replication deployments; Redis Cluster partitions keys across nodes and supports replication/failover.

### 67. How do you implement a distributed lock using Redis, and what are its limitations?

**Answer:** Acquire a key using SET NX with expiry and a unique token; release only if the token matches. Expiry, partitions, pauses, and stale lock holders require careful safeguards such as fencing tokens.

### 68. How can Redis be used to implement rate limiting?

**Answer:** Use atomic counters or sorted-set windows with expiry, preferably scripted atomically, to enforce fixed-window, sliding-window, or token-bucket policies.

### 69. How should an application behave when Redis becomes unavailable?

**Answer:** Treat Redis as a dependency with defined failure behavior: use bounded timeouts, circuit breakers, fallback or controlled rejection, and protect the primary database from overload.

### 70. What is the hot key problem in Redis, and how can it be mitigated?

**Answer:** A hot Redis key attracts disproportionate traffic and can overload one shard; use local near-caches, replicas for suitable reads, or distribute workloads when correctness permits.

### 71. How can Redis be used to implement idempotency?

**Answer:** Store an idempotency key with a state/result using conditional creation and expiry; coordinate it with business writes to avoid claiming success before durable completion.

### 72. What is Apache Cassandra, and when should it be used or avoided?

**Answer:** Apache Cassandra is a distributed wide-column database for high-write, high-availability, partition-key-based access; avoid it when complex joins, arbitrary queries, or multi-row relational transactions dominate.

### 73. What is the difference between Cassandra and MongoDB?

**Answer:** Cassandra uses partition-oriented tables, distributed writes, and query-led schemas; MongoDB uses flexible document collections with richer document queries and aggregation.

### 74. How does Cassandra's primary-key structure work, and what is the difference between partition and clustering keys?

**Answer:** A Cassandra partition key determines token-based data placement; clustering columns define ordering within a partition. Together they form the primary key.

### 75. How does Cassandra's tunable consistency work?

**Answer:** Cassandra offers per-operation consistency levels such as ONE, QUORUM, and ALL; stronger quorums improve consistency under specific replication conditions but reduce availability.

### 76. What are the advantages of Cassandra's masterless architecture?

**Answer:** Masterless replication lets any eligible coordinator handle requests and avoids a single primary bottleneck, but reconciliation and consistency tuning remain necessary.

### 77. Why is ALLOW FILTERING generally discouraged in Cassandra?

**Answer:** ALLOW FILTERING may require scanning/filtering large distributed datasets rather than efficient partition access, producing unpredictable latency.

### 78. What are lightweight transactions (LWT) in Cassandra?

**Answer:** Lightweight transactions use consensus-based conditional updates, typically IF clauses, to provide compare-and-set semantics at higher latency than ordinary writes.

### 79. What are tombstones in Cassandra, and how do they affect performance?

**Answer:** Tombstones mark deletes/expiry until compaction can safely purge them; excess tombstones make reads slower and raise memory and maintenance costs.

### 80. How do Cassandra's commit log, memtables, SSTables, and compaction work together?

**Answer:** Writes go to a commit log and memtable; memtables flush into immutable SSTables, which compaction merges and cleans up, subject to tombstone safety.

### 81. What is Amazon DynamoDB, and when should it be used?

**Answer:** DynamoDB is AWS's managed key-value/document database with automatic partitioning and low-latency key-based access, well-suited to predictable high-scale workloads.

### 82. What is the difference between a partition key and a sort key in DynamoDB?

**Answer:** The partition key determines data distribution; an optional sort key orders items sharing a partition key and enables range queries.

### 83. What is the difference between Global Secondary Indexes (GSI) and Local Secondary Indexes (LSI)?

**Answer:** GSIs can use different partition/sort keys and are maintained asynchronously; LSIs share the base table's partition key and have stricter creation/size limitations.

### 84. What is the difference between Query and Scan operations in DynamoDB?

**Answer:** Query efficiently retrieves items for a specified partition key (and optional sort condition); Scan examines table/index items broadly and becomes costly at scale.

### 85. What is the difference between strongly consistent and eventually consistent reads in DynamoDB?

**Answer:** Strongly consistent reads are supported for base tables and LSIs in eligible regions, but not GSIs; eventual reads may temporarily miss recent writes.

### 86. What is single-table design in DynamoDB, and what are its trade-offs?

**Answer:** Single-table design co-locates multiple entity types by access patterns and keys, enabling efficient queries but adding modeling complexity and coupling.

### 87. What are DynamoDB Streams, and when should they be used?

**Answer:** DynamoDB Streams capture ordered item-level changes for asynchronous processing, Lambda triggers, or projections; consumers should handle retries and duplicates.

### 88. How does DynamoDB support transactions?

**Answer:** DynamoDB TransactWriteItems/TransactGetItems offer ACID behavior for bounded groups of items, with documented item/size/region constraints.

### 89. What is Elasticsearch, and when should it be used instead of a relational database's search capabilities?

**Answer:** Elasticsearch is a distributed search and analytics engine suited to advanced full-text relevance, aggregations, and search-scale indexing; keep relational storage as the source of truth when transactions and joins matter.

### 90. What is an inverted index, and how does it support full-text search?

**Answer:** An inverted index maps terms to documents/positions, enabling efficient token lookup and relevance scoring without scanning every document.

### 91. What are analyzers and tokenizers in Elasticsearch?

**Answer:** Analyzers transform text into indexed/search tokens using character filters, tokenizers, and token filters; matching analyzers matters for search quality.

### 92. What are mappings in Elasticsearch?

**Answer:** Mappings define field types and indexing rules, including text, keyword, numeric, date, object, and vector fields; incorrect mapping can require reindexing.

### 93. What is the difference between text and keyword fields in Elasticsearch?

**Answer:** text fields are analyzed for full-text search; keyword fields store exact terms for filters, sorting, and aggregations.

### 94. What is the difference between the match and term queries in Elasticsearch?

**Answer:** match analyzes query text for full-text matching; term matches exact indexed terms without text analysis, so it is usually suited to keyword fields.

### 95. What is the difference between query context and filter context?

**Answer:** Query context calculates relevance scores; filter context evaluates yes/no criteria and generally avoids scoring, often allowing caching.

### 96. What does near-real-time search mean in Elasticsearch?

**Answer:** Indexed changes become searchable after refresh, commonly with a short delay; a successful write is not necessarily visible to search immediately.

### 97. How does Elasticsearch rank search results using BM25?

**Answer:** BM25 ranks documents using term frequency, inverse document frequency, and length normalization; relevance depends on analyzers, fields, and tuning.

### 98. How do primary shards and replica shards work in Elasticsearch?

**Answer:** Primary shards own data partitions; replica shards copy primaries to support read scaling and fault tolerance. Allocation/recovery depend on cluster health.

### 99. How can you efficiently paginate large Elasticsearch result sets?

**Answer:** Use search_after with a stable sort and preferably a point-in-time view for deep pagination; from/size becomes expensive for large offsets.

### 100. How can you reindex Elasticsearch data without application downtime?

**Answer:** Create a new index with updated mappings, backfill/reindex data, keep changes synchronized, then atomically switch aliases and retire the old index.

### 101. How do you keep Elasticsearch synchronized with a primary database?

**Answer:** Use transactional outbox or change-data-capture pipelines, idempotent updates, replay/checkpointing, and reconciliation; Elasticsearch is usually an eventually consistent projection.

### 102. What are vector embeddings, and how are they stored in a vector database?

**Answer:** Embeddings are fixed-length numeric vectors produced by a model to represent semantic features; vector indexes store them with IDs and metadata for similarity search.

### 103. What is the difference between semantic search and keyword search?

**Answer:** Keyword search matches explicit terms and lexical relevance; semantic search compares embedding similarity and can retrieve conceptually related text without exact words.

### 104. What is the difference between cosine similarity, Euclidean distance, and dot product?

**Answer:** Cosine similarity compares vector angle, Euclidean distance measures geometric separation, and dot product combines magnitude and orientation; normalization affects ranking equivalence.

### 105. What is the difference between exact and approximate nearest neighbor search (ANN)?

**Answer:** Exact nearest-neighbor search scores every candidate for full recall; ANN indexes trade some recall for much lower latency and resource use.

### 106. What is HNSW, and how does it work?

**Answer:** HNSW builds a hierarchical navigable small-world graph of vector neighbors, enabling approximate search by traversing promising links rather than scanning all vectors.

### 107. How does metadata filtering work in vector databases?

**Answer:** Metadata filtering constrains candidates by structured fields such as tenant, date, or category; pre- vs post-filter implementations affect recall, latency, and security.

### 108. What is hybrid search, and how does it combine keyword and vector search?

**Answer:** Hybrid search combines lexical relevance (for example BM25) with embedding similarity, merging rankings through score normalization or reciprocal rank fusion.

### 109. How do you choose between pgvector, a dedicated vector database, and a search engine with vector search capabilities?

**Answer:** Choose pgvector when data already lives in PostgreSQL and scale fits; dedicated vector stores for specialized scale/operations; search engines when lexical and vector retrieval must coexist.

### 110. What are the trade-offs between recall, latency, and memory consumption in vector search?

**Answer:** Higher recall often costs more computation, memory, and latency; tune ANN parameters and index structure against representative labeled queries.

### 111. What happens to stored embeddings when the embedding model changes?

**Answer:** A new embedding model may change vector dimensions and geometry, making old and new embeddings incomparable; version vectors and re-embed/reindex consistently.

### 112. What role does a vector database play in a Retrieval-Augmented Generation (RAG) system?

**Answer:** In RAG, a vector database retrieves relevant chunks by embedding similarity; the application then supplies selected context to the language model, often with reranking and filters.

### 113. How do nodes, relationships, labels, and properties work in Neo4j?

**Answer:** Neo4j represents entities as nodes, connections as typed directed relationships, and attributes as properties; labels categorize nodes for querying/indexing.

### 114. What is the difference between graph traversal and relational joins?

**Answer:** Graph traversal follows stored relationships through hops; relational joins match rows by keys. Performance depends on path depth, selectivity, and indexes.

### 115. What is Cypher, and how does it differ from SQL?

**Answer:** Cypher is a declarative graph query language using patterns such as MATCH (a)-[:KNOWS]->(b); SQL focuses on relations, joins, and tabular projections.

### 116. How are indexes and constraints used in Neo4j?

**Answer:** Neo4j indexes speed node/relationship lookup on properties; constraints enforce uniqueness, key, or property requirements depending on edition/version.

### 117. How does data modeling in time-series databases differ from relational data modeling?

**Answer:** Time-series models center each observation on time, measured value, and labels/tags, optimizing ordered writes, time windows, and aggregations rather than general relational normalization.

### 118. What are retention policies in time-series databases?

**Answer:** Retention policies automatically expire or remove time-series data after configured periods, controlling storage and compliance requirements.

### 119. What is downsampling in time-series databases, and why is it used?

**Answer:** Downsampling aggregates high-resolution readings into coarser time buckets, reducing storage and query cost while losing detail.

### 120. Do NoSQL databases use SQL? What query languages and APIs are used by different NoSQL databases?

**Answer:** No universal query language exists: MongoDB uses MQL, Cassandra CQL, Redis commands, Neo4j Cypher, Elasticsearch Query DSL/ES|QL, DynamoDB APIs/PartiQL, and Couchbase SQL++. Some are SQL-like, but NoSQL is not equivalent to 'no SQL'.
