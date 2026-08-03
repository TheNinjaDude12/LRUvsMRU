# Cache Simulation Analysis - Machine 6
---
**Course**: CSARCH2
**Section**: S40

**Group Members**:
- Domingo, Stefan Manuel
- Escano, Ewan Rafael
- Gamilla, Martin James
- Garcia Jr., Frederick Voltair
- Gutierrez, Hanz Gabriel


---
## 1 System Specifications
Here are the parameters for cache simulation.

-   **Mapping Technique**: Fully Associative
-   **Replacement Policies Evaluated**: Least Recently Used (LRU) vs. Most Recently Used (MRU)
-   **Block Size**: 16 Words.
-   **Number of Cache Blocks (n)**: 4.
-   **Read Policy**: Non-load-through.

---
## 2 Test Cases
### Test Case 1: Sequential
-   **Memory Sequence**: `0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7`


| Metric | LRU | MRU |
| --- | ---: | ---: |
| Total memory access count | 16 | 16 |
| Cache hit count | 0 | 4 |
| Cache miss count | 16 | 12 |
| Cache hit rate | 0.00% | 25.00% |
| Cache miss rate | 100.00% | 75.00% |
| Average Memory Access Time (AMAT) | 1620 ns | 1620.25 ns |
| Total memory access time | 2832 ns | 2188 ns |

| Block | LRU Data | MRU Data |
| ---: | ---: | ---: |
| 0 | 3 | 4 |
| 1 | 2 | 0 |
| 2 | 1 | 3 |
| 3 | 0 | 1 |

### Test Case 2: Mid-repeat
-   **Sequence Example**: `0, 1, 2, 3, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 3, 2, 1, 0, 7, 6, 5, 4, 3, 2, 1, 0, 7, 6, 5, 4, 3, 2, 1, 0`


| Metric | LRU | MRU |
| --- | ---: | ---: |
| Total memory access count | 40 | 40 |
| Cache hit count | 4 | 17 |
| Cache miss count | 36 | 23 |
| Cache hit rate | 10.00% | 42.50% |
| Cache miss rate | 90.00% | 57.50% |
| Average Memory Access Time (AMAT) | 1620.1 ns | 1620.425 ns |
| Total memory access time | 6436 ns | 4343 ns |

| Block | LRU Data | MRU Data |
| ---: | ---: | ---: |
| 0 | 4 | 0 |
| 1 | 5 | 1 |
| 2 | 6 | 6 |
| 3 | 7 | 7 |

### Test Case 3: Random

-   **Memory Sequence**: `96, 312, 588, 250, 886, 86, 629, 312, 377, 605, 689, 381, 94, 224, 874, 373, 486, 812, 599, 909, 147, 624, 132, 1020, 349, 974, 685, 388, 221, 152, 890, 445, 513, 440, 209, 308, 353, 629, 251, 44, 889, 441, 125, 892, 917, 262, 250, 164, 877, 886, 507, 620, 944, 256, 437, 599, 869, 90, 79, 645, 551, 654, 370, 759`

| Metric | LRU | MRU |
| --- | ---: | ---: |
| Total memory access count | 64 | 64 |
| Cache hit count | 0 | 2 |
| Cache miss count | 64 | 62 |
| Cache hit rate | 0.00% | 3.13% |
| Cache miss rate | 100.00% | 96.88% |
| Average Memory Access Time (AMAT) | 1620 ns | 1620.03125 ns |
| Total memory access time | 11328 ns | 11006 ns |

**Cache State**
| Block | LRU Data | MRU Data |
| ---: | ---: | ---: |
| 0 | 551 | 96 |
| 1 | 654 | 353 |
| 2 | 370 | 588 |
| 3 | 759 | 759 |

---
## 3 Analysis & Discussion
- MRU outperforms LRU on all test case sequences as it yields higher hit rates and lower total memory access time.
  - Test Case 1: MRU yielded a 25.00% hit rate vs. 0.00% for LRU

  - Test Case 2: MRU yielded a 42.50% hit rate vs. 10.00% for LRU

  - Test Case 3: MRU yielded a 3.13% hit rate vs. 0.00% for LRU

- While the Average Memory Access Time (AMAT) per access shows a small difference variation between the two operations with an average of 1620 ns, comparing Total Memory Access Time suggests significant performance gains under MRU:  
  - Test Case 1: MRU reduced total access time by 644 ns.
  - Test Case 2: MRU reduced total access time by 2093 ns.
  - Test Case 3: MRU reduced total access time by 322 ns.

---
## 4 Conclusion
Based on our simulation results, the Most Recently Used (MRU) performed better than the Least Recently Used (LRU) across all three test sequences with higher hit rates and faster overall memory access times.

This occurs because our tests focused on repeating patterns and loops. In these specific situations, LRU constantly removes the wrong data right before they are needed again, which slows down the entire system. MRU avoids this problem by holding onto older data and only replacing the newest item, keeping parts of the cache useful.

MRU is much better at handling repeating loops and continuous scans. Therefore, software design could consider using MRU for specialized tasks such as database searches where data is processed in repetitive patterns.
