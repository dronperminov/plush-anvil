import cv2


def crop_image_square(path: str, size: int) -> None:
    image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    height, width = image.shape[:2]
    image_size = min(width, height)

    image = image[0:image_size, 0:image_size]
    image = cv2.resize(image, (size, size), interpolation=cv2.INTER_AREA)
    cv2.imwrite(path, image)
