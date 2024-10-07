import hashlib
import os
import re
import shutil
from typing import List

from fastapi import UploadFile


def __get_hash(filename: str) -> str:
    hash_md5 = hashlib.md5()

    with open(filename, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)

    return hash_md5.hexdigest()


def get_static_hash() -> str:
    hashes = []

    for directory in ["js", "styles"]:
        for path, _, files in os.walk(os.path.join(os.path.dirname(__file__), "..", "..", "web", directory)):
            for name in files:
                hashes.append(__get_hash(os.path.join(path, name)))

    static_hash = "_".join(hashes)
    hash_md5 = hashlib.md5()
    hash_md5.update(static_hash.encode("utf-8"))
    return hash_md5.hexdigest()


def get_word_form(count: int, word_forms: List[str], only_form: bool = False) -> str:
    index = 0

    if abs(count) % 10 in {0, 5, 6, 7, 8, 9} or abs(count) % 100 in {10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20}:
        index = 2
    elif abs(count) % 10 in {2, 3, 4}:
        index = 1

    return word_forms[index] if only_form else f"{count} {word_forms[index]}"


def transliterate(name: str) -> str:
    lower_case_letters = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z", "и": "i", "й": "j",
        "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f",
        "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "y", "я": "ya",
    }

    name = "".join(lower_case_letters.get(c, c) for c in name.lower())
    name = re.sub(r"[^a-z]+", "_", name)
    return re.sub(r"_+", "_", name).strip("_")


def save_file(file: UploadFile, output_path: str) -> None:
    with open(output_path, "wb") as f:
        shutil.copyfileobj(file.file, f)


def get_extension(filename: str) -> str:
    return filename.rsplit(".", maxsplit=1)[-1]
