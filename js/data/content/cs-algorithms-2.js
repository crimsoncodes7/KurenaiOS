/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.3.4.1"] = {
  "notes": [
    {
      "h": "Linear Search"
    },
    {
      "callout": {
        "t": "info",
        "body": "Linear search (sequential search) checks each element in turn from the start until it finds the target or reaches the end. Its key advantage is that it works on ANY list — sorted or not."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "How it works",
        "body": "Start at the first element and compare it with the target. If they match, return the position. Otherwise move to the next element. If the end is reached with no match, the item is not present."
      }
    },
    {
      "steps": [
        {
          "h": "Start",
          "m": "Begin at the first element (index 0)."
        },
        {
          "h": "Compare",
          "m": "Is the current element equal to the target?",
          "n": "If yes, return its index — found."
        },
        {
          "h": "Advance",
          "m": "If not, move to the next element."
        },
        {
          "h": "Stop",
          "m": "If you pass the last element without a match, report 'not found'."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Linear search",
        "src": "FUNCTION linearSearch(list, target)\n  FOR i = 0 TO length(list) - 1\n    IF list[i] = target THEN\n      RETURN i        # found at position i\n    ENDIF\n  ENDFOR\n  RETURN -1           # not found\nENDFUNCTION"
      }
    },
    {
      "h": "Complexity"
    },
    {
      "table": {
        "head": [
          "Case",
          "Comparisons",
          "Time complexity"
        ],
        "rows": [
          [
            "Best",
            "1 (target is first)",
            "$O(1)$"
          ],
          [
            "Average",
            "about n/2",
            "$O(n)$"
          ],
          [
            "Worst",
            "n (target last or absent)",
            "$O(n)$"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Linear search",
        "body": "Check each item in order until found or end. **Best O(1)** (first item), **average and worst O(n)**. Works on **unsorted** data and needs no ordering. Simple, but slow for large lists."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "When to choose it",
        "body": "Use linear search for small lists, unsorted data, or linked structures where you cannot jump to the middle. For large sorted arrays, binary search is far faster."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconception",
        "body": "**Linear search needs a sorted list** — No; that is binary search. Linear search works on any order — which is exactly the situation where you would choose it."
      }
    }
  ],
  "flashcards": [
    [
      "How does linear search work?",
      "It compares each element in turn from the start until the target is found or the list ends."
    ],
    [
      "What is the best-case complexity of linear search?",
      "O(1) — the target is the first element."
    ],
    [
      "What is the worst-case complexity of linear search?",
      "O(n) — the target is last or not present, so all n elements are checked."
    ],
    [
      "What is the average number of comparisons for linear search?",
      "About n/2."
    ],
    [
      "Does linear search require a sorted list?",
      "No — it works on data in any order."
    ],
    [
      "When is linear search a better choice than binary search?",
      "For small or unsorted lists, or linked structures where you cannot access the middle directly."
    ],
    [
      "What does linear search return when the item is absent?",
      "A 'not found' result (e.g. -1) after checking every element."
    ],
    [
      "Why is linear search slow for large lists?",
      "Its O(n) work grows linearly with size — a million items can need a million comparisons."
    ]
  ],
  "quiz": [
    {
      "q": "Linear search has a worst-case time complexity of...?",
      "opts": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n^2)"
      ],
      "ans": 2,
      "why": "In the worst case every one of the n elements is checked."
    },
    {
      "q": "Which is TRUE of linear search?",
      "opts": [
        "It needs sorted data",
        "It works on unsorted data",
        "It is always faster than binary search",
        "It uses recursion"
      ],
      "ans": 1,
      "why": "Linear search makes no ordering assumption."
    },
    {
      "q": "The best case of linear search occurs when...?",
      "opts": [
        "the list is empty",
        "the target is the first element",
        "the target is in the middle",
        "the target is last"
      ],
      "ans": 1,
      "why": "Finding it first means a single comparison, O(1)."
    },
    {
      "q": "On average, linear search on n items performs about...?",
      "opts": [
        "n comparisons",
        "n/2 comparisons",
        "log n comparisons",
        "1 comparison"
      ],
      "ans": 1,
      "why": "On average the target is found halfway through."
    },
    {
      "q": "For a large SORTED array, which is the better search?",
      "opts": [
        "Linear search",
        "Binary search",
        "They are identical",
        "Neither works"
      ],
      "ans": 1,
      "why": "Binary search is O(log n) versus linear's O(n)."
    }
  ],
  "exam": [
    {
      "q": "State one advantage of linear search over binary search.",
      "marks": 1,
      "ms": [
        "It works on unsorted data (the list does not need to be ordered first). (1)"
      ]
    },
    {
      "q": "A list has 50 items. State the maximum number of comparisons a linear search could make, and explain when this occurs.",
      "marks": 2,
      "ms": [
        "Maximum 50 comparisons. (1)",
        "When the target is the last element, or is not in the list at all. (1)"
      ]
    },
    {
      "q": "Describe how the linear search algorithm works and analyse its time complexity for the best, average and worst cases.",
      "marks": 6,
      "ms": [
        "The algorithm examines each element in turn starting from the first. (1)",
        "It compares each element with the target and stops when a match is found. (1)",
        "If the end is reached with no match, it reports the item is absent. (1)",
        "Best case O(1) — the target is the first element. (1)",
        "Average case O(n) — about n/2 comparisons. (1)",
        "Worst case O(n) — the target is last or absent, so all n elements are checked. (1)"
      ]
    }
  ]
};

C["compsci:4.3.4.3"] = {
  "notes": [
    {
      "h": "Binary Tree Search"
    },
    {
      "callout": {
        "t": "info",
        "body": "Binary tree search finds a value in a binary search tree (BST) by exploiting its ordering: at each node, go left if the target is smaller, right if it is larger. Each step discards one subtree."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Binary search tree property",
        "body": "For every node, all values in its left subtree are smaller and all values in its right subtree are larger. This ordering lets the search eliminate half the remaining tree at each node."
      }
    },
    {
      "steps": [
        {
          "h": "Start at the root",
          "m": "Set the current node to the root of the tree."
        },
        {
          "h": "Compare",
          "m": "If the current node equals the target, it is found."
        },
        {
          "h": "Go left or right",
          "m": "If the target is smaller, move to the left child; if larger, move to the right child.",
          "n": "Each move discards the other subtree."
        },
        {
          "h": "Stop",
          "m": "If you reach an empty child (null), the value is not in the tree."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Recursive binary tree search",
        "src": "FUNCTION search(node, target)\n  IF node = null THEN\n    RETURN false          # not found\n  ELSE IF target = node.value THEN\n    RETURN true           # found\n  ELSE IF target < node.value THEN\n    RETURN search(node.left, target)\n  ELSE\n    RETURN search(node.right, target)\n  ENDIF\nENDFUNCTION"
      }
    },
    {
      "h": "Complexity"
    },
    {
      "table": {
        "head": [
          "Tree shape",
          "Height",
          "Time complexity"
        ],
        "rows": [
          [
            "Balanced",
            "about log n",
            "$O(\\log n)$"
          ],
          [
            "Unbalanced / degenerate",
            "up to n (a chain)",
            "$O(n)$"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Binary tree search",
        "body": "Use the BST ordering: smaller goes **left**, larger goes **right**. Time complexity equals the **height** of the tree: a **balanced** BST gives **O(log n)**; a **degenerate** (unbalanced) tree gives **O(n)**."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Why depth matters",
        "body": "The number of comparisons equals the path length from root to the node, i.e. the tree's height. A balanced tree has height about log n; inserting already-sorted data builds a chain of height n, destroying the speed advantage."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconception",
        "body": "**Binary tree search is always O(log n)** — only if the tree is balanced. An unbalanced BST (e.g. built from sorted input) degenerates into a list and search becomes O(n). It is also distinct from binary search, which works on a sorted array."
      }
    }
  ],
  "flashcards": [
    [
      "What ordering property does a binary search tree have?",
      "Every node's left subtree holds smaller values and its right subtree holds larger values."
    ],
    [
      "How do you decide which way to go at each node in a binary tree search?",
      "Go left if the target is smaller than the node, right if it is larger."
    ],
    [
      "What is the time complexity of binary tree search on a balanced tree?",
      "O(log n) — the height is about log n."
    ],
    [
      "What is the worst-case complexity of binary tree search?",
      "O(n) — for an unbalanced/degenerate tree that forms a chain."
    ],
    [
      "What determines the number of comparisons in binary tree search?",
      "The height of the tree (the path length from the root to the target)."
    ],
    [
      "Why can a BST degenerate to O(n)?",
      "Inserting values in sorted order builds a one-sided chain of height n instead of a balanced tree."
    ],
    [
      "How is binary tree search different from binary search?",
      "Binary search works on a sorted array; binary tree search traverses a binary search tree's nodes."
    ],
    [
      "When is the target found in binary tree search?",
      "When the current node's value equals the target; if an empty child is reached, it is absent."
    ]
  ],
  "quiz": [
    {
      "q": "In a binary search tree, a value smaller than the current node is found by going...?",
      "opts": [
        "right",
        "left",
        "up",
        "to the root"
      ],
      "ans": 1,
      "why": "Smaller values are in the left subtree."
    },
    {
      "q": "Binary tree search on a balanced tree is...?",
      "opts": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n^2)"
      ],
      "ans": 1,
      "why": "A balanced tree has height about log n."
    },
    {
      "q": "What causes binary tree search to degrade to O(n)?",
      "opts": [
        "a balanced tree",
        "an unbalanced/degenerate tree",
        "too many leaves",
        "duplicate values"
      ],
      "ans": 1,
      "why": "A degenerate tree forms a chain of height n."
    },
    {
      "q": "The number of comparisons in binary tree search equals...?",
      "opts": [
        "the number of nodes",
        "the height of the tree (path length)",
        "n/2",
        "the number of leaves"
      ],
      "ans": 1,
      "why": "Search follows one root-to-node path, whose length is the height."
    },
    {
      "q": "Inserting data in sorted order into a BST tends to produce...?",
      "opts": [
        "a perfectly balanced tree",
        "a degenerate chain (O(n) search)",
        "a full tree",
        "no tree"
      ],
      "ans": 1,
      "why": "Each new value attaches to one side, building a list-like chain."
    }
  ],
  "exam": [
    {
      "q": "State the binary search tree property.",
      "marks": 1,
      "ms": [
        "For every node, all values in the left subtree are smaller and all in the right subtree are larger. (1)"
      ]
    },
    {
      "q": "Explain why the time complexity of binary tree search depends on the shape of the tree.",
      "marks": 2,
      "ms": [
        "Search follows a path from the root down to the target, so the work equals the tree's height. (1)",
        "A balanced tree has height about log n (O(log n)), but a degenerate tree has height up to n (O(n)). (1)"
      ]
    },
    {
      "q": "Describe how the binary tree search algorithm works and analyse its time complexity for balanced and unbalanced trees.",
      "marks": 6,
      "ms": [
        "Start at the root and compare the target with the node's value. (1)",
        "If equal, the value is found. (1)",
        "If the target is smaller go to the left child, otherwise the right child. (1)",
        "Repeat until found or an empty child (null) is reached, meaning absent. (1)",
        "On a balanced tree the height is about log n, giving O(log n). (1)",
        "On an unbalanced/degenerate tree the height can be n, giving O(n). (1)"
      ]
    }
  ]
};

C["compsci:4.3.5.2"] = {
  "notes": [
    {
      "h": "Merge Sort"
    },
    {
      "callout": {
        "t": "info",
        "body": "Merge sort is a divide-and-conquer algorithm: recursively split the list in half until each part holds one element, then merge the parts back together in order."
      }
    },
    {
      "steps": [
        {
          "h": "Divide",
          "m": "Split the list into two halves."
        },
        {
          "h": "Recurse",
          "m": "Recursively merge-sort each half until sublists have length 1 (a single item is already sorted)."
        },
        {
          "h": "Merge",
          "m": "Combine two sorted sublists into one sorted list by repeatedly taking the smaller front element.",
          "n": "This is the 'conquer' step."
        },
        {
          "h": "Combine",
          "m": "Work back up the recursion until the whole list is merged and sorted."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "cap": "Merge sort",
        "src": "FUNCTION mergeSort(list)\n  IF length(list) <= 1 THEN\n    RETURN list\n  ENDIF\n  mid   = length(list) DIV 2\n  left  = mergeSort(list[0 .. mid-1])\n  right = mergeSort(list[mid .. end])\n  RETURN merge(left, right)\nENDFUNCTION"
      }
    },
    {
      "h": "The merge step"
    },
    {
      "callout": {
        "t": "def",
        "h": "Merging two sorted lists",
        "body": "Keep a pointer at the front of each sorted sublist. Compare the two front elements, copy the smaller into the output, and advance that pointer. When one list empties, append the rest of the other. The result is one sorted list."
      }
    },
    {
      "h": "Complexity"
    },
    {
      "table": {
        "head": [
          "Case",
          "Time complexity",
          "Space"
        ],
        "rows": [
          [
            "Best",
            "$O(n \\log n)$",
            "$O(n)$"
          ],
          [
            "Average",
            "$O(n \\log n)$",
            "$O(n)$"
          ],
          [
            "Worst",
            "$O(n \\log n)$",
            "$O(n)$"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Merge sort",
        "body": "Divide into halves (**log n** levels) and merge each level in **O(n)** work, giving **O(n log n) in ALL cases**. It is **stable** but needs **O(n) extra memory** for merging. Excellent for large lists."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Why O(n log n)",
        "body": "There are log n levels of halving, and merging at each level touches all n elements once — so n × log n total work, regardless of the input order."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common misconception",
        "body": "**Merge sort sorts in place** — No; it needs an O(n) auxiliary array to merge. Bubble sort is in-place (O(1) space) but far slower at O(n^2) for large lists."
      }
    }
  ],
  "flashcards": [
    [
      "What strategy does merge sort use?",
      "Divide and conquer — recursively split the list, sort the halves, then merge them."
    ],
    [
      "What is the time complexity of merge sort in all cases?",
      "O(n log n) — best, average and worst."
    ],
    [
      "What is the space complexity of merge sort?",
      "O(n) — it needs an auxiliary array to merge sublists."
    ],
    [
      "Why is merge sort O(n log n)?",
      "There are log n levels of halving and each level does O(n) merging work."
    ],
    [
      "How are two sorted sublists merged?",
      "Compare their front elements, copy the smaller to the output and advance; append the remainder when one empties."
    ],
    [
      "Is merge sort stable? Is it in place?",
      "It is stable but NOT in place (it uses O(n) extra memory)."
    ],
    [
      "When does the recursion in merge sort stop?",
      "When a sublist has length 1 (or 0), which is already sorted."
    ],
    [
      "Why does merge sort suit very large datasets?",
      "Its O(n log n) time scales far better than O(n^2) sorts, and the O(n) memory cost is usually acceptable."
    ]
  ],
  "quiz": [
    {
      "q": "Merge sort's worst-case time complexity is...?",
      "opts": [
        "O(n^2)",
        "O(n)",
        "O(n log n)",
        "O(log n)"
      ],
      "ans": 2,
      "why": "Merge sort always divides and merges in O(n log n), regardless of input."
    },
    {
      "q": "Merge sort follows which strategy?",
      "opts": [
        "Greedy",
        "Divide and conquer",
        "Brute force",
        "Backtracking"
      ],
      "ans": 1,
      "why": "It recursively divides the list, sorts halves and merges them."
    },
    {
      "q": "Merge sort's space complexity is...?",
      "opts": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n^2)"
      ],
      "ans": 2,
      "why": "It needs an O(n) auxiliary array to merge."
    },
    {
      "q": "Why is merge sort O(n log n)?",
      "opts": [
        "n passes of n work",
        "log n levels each doing O(n) merging",
        "it is random",
        "one pass only"
      ],
      "ans": 1,
      "why": "log n halving levels × O(n) merge work each."
    },
    {
      "q": "When does merge sort's recursion stop?",
      "opts": [
        "at length 1",
        "at length n",
        "never",
        "at length n/2"
      ],
      "ans": 0,
      "why": "A single-element sublist is already sorted, ending the recursion."
    }
  ],
  "exam": [
    {
      "q": "State the time complexity and space complexity of merge sort.",
      "marks": 2,
      "ms": [
        "Time complexity O(n log n) (in all cases). (1)",
        "Space complexity O(n) (extra memory for merging). (1)"
      ]
    },
    {
      "q": "Show the stages of a merge sort on the list [8, 3, 5, 1].",
      "marks": 4,
      "ms": [
        "Split: [8, 3, 5, 1] -> [8, 3] and [5, 1] -> [8],[3],[5],[1]. (1)",
        "Merge pairs: [3, 8] and [1, 5]. (1)",
        "Merge halves by comparing fronts: [1, 3, 5, 8]. (1)",
        "Correct final sorted list. (1)"
      ]
    },
    {
      "q": "Explain how merge sort works and discuss why it is preferred over bubble sort for very large lists, noting any drawback.",
      "marks": 6,
      "ms": [
        "Merge sort recursively divides the list into halves until single elements remain. (1)",
        "Sorted sublists are merged by repeatedly taking the smaller front element. (1)",
        "There are log n levels and each merges in O(n), giving O(n log n). (1)",
        "Bubble sort is O(n^2), which is far too slow for very large lists. (1)",
        "Merge sort's O(n log n) scales much better. (1)",
        "Drawback: merge sort needs O(n) extra memory, whereas bubble sort is in-place. (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);