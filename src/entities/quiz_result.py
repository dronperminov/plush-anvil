from dataclasses import dataclass


@dataclass
class QuizResult:
    position: int
    teams: int
    players: int

    def to_dict(self) -> dict:
        return {
            "position": self.position,
            "teams": self.teams,
            "players": self.players
        }

    @classmethod
    def from_dict(cls: "QuizResult", data: dict) -> "QuizResult":
        return cls(
            position=data["position"],
            teams=data["teams"],
            players=data["players"]
        )
