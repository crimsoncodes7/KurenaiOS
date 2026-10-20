# Examiner's report notes

One file per board paper (`aqa-7517-2.md`, `edexcel-9ma0-1.md`, …), written by
reading the reports that `tools/fetch_reports.py` saved into your own
`~/Downloads/A-level` folder. The reports themselves never enter the repo.

Each note is **paraphrased** (invariant 125): what was asked, what most
candidates did, what earned the marks, citing its series and question.

```
## June 2023 · Q04.2 (4 marks) · 4.5.4.8 normalisation
- Asked: normalise a floating-point number and give the exponent.
- Most: shifted the mantissa the wrong way and kept the old exponent.
- Marks: correct mantissa (1), exponent adjusted to match (1), …
```

The Companion's Misconceptions Blacklist and its post-mortems of the hardest
questions are written from these notes. Where no report exists, the item says
"from the mark scheme". It never invents an examiner's comment.

## What's here (20 October 2026)

| Paper | Series with notes | Not reachable |
|---|---|---|
| AQA 7517 Paper 1 | June 2022 | 2017–19, 2023–25 |
| AQA 7517 Paper 2 | June 2022, June 2023 | 2017–19, 2024–25 |
| AQA 7516 Paper 1 | June 2022, June 2023 | 2017–19, 2024–25 |
| AQA 7516 Paper 2 | June 2022, June 2023 | 2017–19, 2024–25 |
| Edexcel 9MA0 / 8MA0 | — | Pearson's feedback has no stable address |

AQA's file store only still serves its 2022 and 2023 reports; older and
newer ones redirect to a page that no longer exists. To add more, put
`<paper-id> <sitting> <url>` lines in `tools/exam-index/report-urls.txt`
(one per report: AQA's, Pearson's Examiners' reports / Principal Examiner
Feedback, or a copy you have) and rerun `python3 tools/fetch_reports.py`.

smoke90 (I) holds every `### Q…` heading here to a question of that series
in the index, with the same marks.
