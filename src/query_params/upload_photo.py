from dataclasses import dataclass

from fastapi import File, Form, UploadFile


@dataclass
class UploadPhoto:
    image: UploadFile = File(...)
    album_id: int = Form(...)
