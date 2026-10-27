import argparse
import json
import math
import os
import re
import sys
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path

DEFAULT_DIR = Path(__file__).resolve().parent.parent / "knowledge"
K1 = 1.5
B = 0.75
MIN_SCORE = 0.2
STOPWORDS = {"the", "and", "for", "are", "can", "how", "what", "who", "when", "does", "with", "need", "into", "from", "this", "that", "our", "any"}


@dataclass(frozen=True)
class Chunk:
    source: str
    section: str
    text: str


@dataclass(frozen=True)
class Hit:
    source: str
    section: str
    text: str
    score: float


def stem(word: str) -> str:
    return word[:-1] if len(word) > 4 and word.endswith("s") and not word.endswith("ss") else word


def terms(text: str) -> list[str]:
    return [stem(t) for t in re.findall(r"[a-z0-9]+", text.lower()) if len(t) > 2 and t not in STOPWORDS]


def chunk_documents(root: Path) -> list[Chunk]:
    chunks: list[Chunk] = []
    for doc in sorted(root.glob("*.md")):
        for block in re.split(r"^## ", doc.read_text(), flags=re.MULTILINE)[1:]:
            section, _, body = block.partition("\n")
            chunks.append(Chunk(doc.name, section.strip(), " ".join(body.split())))
    return chunks


class Index:
    def __init__(self, chunks: list[Chunk]) -> None:
        self.chunks = chunks
        self.counts = [Counter(terms(f"{c.section} {c.text}")) for c in chunks]
        self.lengths = [sum(c.values()) for c in self.counts]
        self.average = sum(self.lengths) / len(self.lengths) if chunks else 0.0
        frequency: Counter[str] = Counter(t for c in self.counts for t in c)
        self.idf = {t: math.log(1 + (len(chunks) - n + 0.5) / (n + 0.5)) for t, n in frequency.items()}

    def bm25(self, i: int, query: list[str]) -> float:
        counts, length = self.counts[i], self.lengths[i]
        return sum(
            self.idf[t] * counts[t] * (K1 + 1) / (counts[t] + K1 * (1 - B + B * length / self.average))
            for t in set(query)
            if t in counts
        )

    def search(self, question: str, k: int = 3) -> list[Hit]:
        query = terms(question)
        scored = [Hit(c.source, c.section, c.text, round(self.bm25(i, query), 3)) for i, c in enumerate(self.chunks)]
        return sorted((h for h in scored if h.score >= MIN_SCORE), key=lambda h: h.score, reverse=True)[:k]


def knowledge_dir(override: str | None) -> Path:
    return Path(override or os.environ.get("HANDBOOK_DIR") or DEFAULT_DIR)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(prog="handbook_search")
    parser.add_argument("question")
    parser.add_argument("--k", type=int, default=3)
    parser.add_argument("--dir")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)
    root = knowledge_dir(args.dir)
    if not root.is_dir():
        print(f"knowledge folder not found: {root}", file=sys.stderr)
        return 2
    hits = Index(chunk_documents(root)).search(args.question, args.k)
    if args.json:
        print(json.dumps([asdict(h) for h in hits], indent=2))
    elif not hits:
        print("NO RELEVANT KNOWLEDGE FOUND")
    else:
        for hit in hits:
            print(f"[{hit.source} > {hit.section}] ({hit.score})\n{hit.text}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
