from dataclasses import dataclass

from fastapi import File, Form, UploadFile


@dataclass
class OrganizerImageUpdate:
    organizer_id: int = Form(...)
    image: UploadFile = File(...)
