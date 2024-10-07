from dataclasses import dataclass


@dataclass
class PasswordChange:
    curr_password: str
    password: str
