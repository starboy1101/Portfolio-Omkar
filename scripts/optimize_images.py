from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets"
PUBLIC = ROOT / "public"
RESAMPLE = Image.Resampling.LANCZOS


def resize_to_width(source_name: str, output_name: str, width: int, quality: int = 84) -> None:
    source = ASSETS / source_name
    output = ASSETS / output_name
    with Image.open(source) as image:
        image.load()
        height = round(image.height * width / image.width)
        resized = image.resize((width, height), RESAMPLE)
        mode = "RGBA" if "A" in resized.getbands() else "RGB"
        resized.convert(mode).save(output, "WEBP", quality=quality, method=6)


def optimize_og_image() -> None:
    source = PUBLIC / "og-portfolio.png"
    if not source.is_file():
        return
    with Image.open(source) as image:
        optimized = image.convert("RGB").resize((1200, 630), RESAMPLE)
        optimized.save(
            PUBLIC / "og-portfolio.jpg",
            "JPEG",
            quality=86,
            optimize=True,
            progressive=True,
            subsampling=1,
        )


def favicon_canvas(size: int) -> Image.Image:
    scale = 4
    canvas_size = size * scale
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    factor = canvas_size / 64

    def points(values: list[tuple[float, float]]) -> list[tuple[int, int]]:
        return [(round(x * factor), round(y * factor)) for x, y in values]

    draw.rounded_rectangle(
        (0, 0, canvas_size - 1, canvas_size - 1),
        radius=round(16 * factor),
        fill="#0f172a",
    )
    mark = points(
        [
            (17, 42),
            (17, 22),
            (24, 22),
            (32, 33),
            (40, 22),
            (47, 22),
            (47, 42),
            (40, 42),
            (40, 32),
            (32, 42),
            (24, 32),
            (24, 42),
        ]
    )
    mask = Image.new("L", (canvas_size, canvas_size), 0)
    ImageDraw.Draw(mask).polygon(mark, fill=255)
    gradient = Image.new("RGBA", (canvas_size, canvas_size))
    gradient_pixels = gradient.load()
    for y in range(canvas_size):
        for x in range(canvas_size):
            progress = min(1.0, max(0.0, (x + y) / (2 * max(1, canvas_size - 1))))
            red = round(37 + (124 - 37) * progress)
            green = round(99 + (58 - 99) * progress)
            blue = round(235 + (237 - 235) * progress)
            gradient_pixels[x, y] = (red, green, blue, 255)
    canvas.alpha_composite(Image.composite(gradient, Image.new("RGBA", gradient.size), mask))
    center = (round(49 * factor), round(15 * factor))
    radius = round(4 * factor)
    draw.ellipse(
        (center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius),
        fill="#a78bfa",
    )
    return canvas.resize((size, size), RESAMPLE)


def generate_favicons() -> None:
    for size, name in (
        (16, "favicon-16x16.png"),
        (32, "favicon-32x32.png"),
        (180, "apple-touch-icon.png"),
        (192, "android-chrome-192x192.png"),
        (512, "android-chrome-512x512.png"),
    ):
        favicon_canvas(size).save(PUBLIC / name, "PNG", optimize=True)

    favicon_canvas(256).save(
        PUBLIC / "favicon.ico",
        "ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )


def main() -> None:
    variants = (
        ("Person.png", "Person-426.webp", 426, 84),
        ("Person.png", "Person-768.webp", 768, 84),
        ("AIchat.png", "AIchat-480.webp", 480, 84),
        ("AIchat.png", "AIchat-960.webp", 960, 84),
        ("Portfolioimg.png", "Portfolioimg-480.webp", 480, 84),
        ("Portfolioimg.png", "Portfolioimg-960.webp", 960, 84),
        ("Weatherimg.png", "Weatherimg-480.webp", 480, 84),
        ("Weatherimg.png", "Weatherimg-960.webp", 960, 84),
        ("Bikeimg.png", "Bikeimg-470.webp", 470, 84),
        ("Bikeimg.png", "Bikeimg-940.webp", 940, 84),
        ("LOS.png", "LOS-480.webp", 480, 84),
        ("LOS.png", "LOS-960.webp", 960, 84),
        ("mockup.png", "mockup-450.webp", 450, 86),
        ("mockup.png", "mockup-900.webp", 900, 86),
        ("AIPortfolio.png", "AIPortfolio-480.webp", 480, 84),
        ("AIPortfolio.png", "AIPortfolio-960.webp", 960, 84),
        ("LLMEvaluatio.png", "LLMEvaluatio-480.webp", 480, 84),
        ("LLMEvaluatio.png", "LLMEvaluatio-960.webp", 960, 84),
        ("SQLGenerator.png", "SQLGenerator-480.webp", 480, 84),
        ("SQLGenerator.png", "SQLGenerator-960.webp", 960, 84),
        ("Flipkartprice.png", "Flipkartprice-480.webp", 480, 84),
        ("Flipkartprice.png", "Flipkartprice-960.webp", 960, 84),
        ("Multimodelimage.png", "Multimodelimage-480.webp", 480, 84),
        ("Multimodelimage.png", "Multimodelimage-960.webp", 960, 84),
        ("Supplychain.png", "Supplychain-480.webp", 480, 84),
        ("Supplychain.png", "Supplychain-960.webp", 960, 84),
    )
    for source, output, width, quality in variants:
        resize_to_width(source, output, width, quality)

    optimize_og_image()
    generate_favicons()


if __name__ == "__main__":
    main()
