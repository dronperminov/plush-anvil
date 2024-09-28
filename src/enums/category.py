from enum import Enum


class Category(Enum):
    MOVIES = "movies"
    MEDIA_MIX = "media-mix"
    GUESS_THE_MELODY = "guess-the-melody"
    KARAOKE = "karaoke"
    MUSIC = "music"
    HARRY_POTTER = "harry-potter"
    ABOUT_EVERYTHING = "about-everything"
    VIDEO_GAMES = "video-games"
    SOVIET = "soviet"
    OTHER = "other"

    def to_rus(self) -> str:
        category2rus = {
            Category.MOVIES: "КМС",
            Category.MEDIA_MIX: "медиа-микс",
            Category.GUESS_THE_MELODY: "УМ",
            Category.KARAOKE: "караоке",
            Category.MUSIC: "музыка",
            Category.HARRY_POTTER: "ГП",
            Category.ABOUT_EVERYTHING: "обо всём",
            Category.VIDEO_GAMES: "видеоигры",
            Category.SOVIET: "советское",
            Category.OTHER: "прочее"
        }
        return category2rus[self]

    def to_color(self) -> str:
        category2color = {
            Category.MOVIES: "#ec6b56",
            Category.MEDIA_MIX: "#b347a4",
            Category.GUESS_THE_MELODY: "#ffc154",
            Category.KARAOKE: "#6347b3",
            Category.MUSIC: "#47b39c",
            Category.HARRY_POTTER: "#478bb3",
            Category.ABOUT_EVERYTHING: "#8bc34a",
            Category.VIDEO_GAMES: "#ff5471",
            Category.SOVIET: "#00bcd4",
            Category.OTHER: "#cccccc"
        }
        return category2color[self]
