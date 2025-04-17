from dataclasses import dataclass


@dataclass
class ShortUser:
    username: str
    full_name: str
    avatar_url: str
