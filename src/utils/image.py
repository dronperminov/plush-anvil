from typing import Optional

import cv2


def crop_image_square(path: str, size: int) -> None:
    image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    height, width = image.shape[:2]
    image_size = min(width, height)

    image = image[0:image_size, 0:image_size]
    image = cv2.resize(image, (size, size), interpolation=cv2.INTER_AREA)
    cv2.imwrite(path, image)


def make_preview(input_path: str, output_path: str, preview_width: Optional[int] = 500, preview_height: Optional[int] = None) -> None:
    image = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    image_height, image_width = image.shape[:2]

    if preview_width is None:
        preview_width = int(image_width / image_height * preview_height)

    if preview_height is None:
        preview_height = int(image_height / image_width * preview_width)

    k_width = image_width / preview_width
    k_height = image_height / preview_height
    k = min(k_width, k_height)

    width = int(preview_width * k)
    height = int(preview_height * k)
    x = (image_width - width) // 2
    y = (image_height - height) // 2

    image = image[y:y + height, x:x + width]
    image = cv2.resize(image, (preview_width, preview_height), interpolation=cv2.INTER_AREA)
    cv2.imwrite(output_path, image, [cv2.IMWRITE_WEBP_QUALITY, 80])
