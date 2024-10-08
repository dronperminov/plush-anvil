from dataclasses import dataclass

from fastapi import File, Form, UploadFile


@dataclass
class AvatarChange:
    x: float = Form(...)
    y: float = Form(...)
    size: float = Form(...)
    image: UploadFile = File(...)
