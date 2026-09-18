import numpy as np
from PIL import Image

W, H = 2560, 1440
WHITE = np.array([255, 255, 255], dtype=float)
LBLUE = np.array([0xDB, 0xE8, 0xFE], dtype=float)   # #DBE8FE

xs = np.linspace(0, 1, W)[None, :]
ys = np.linspace(0, 1, H)[:, None]

def save(mask, path):
    m = np.clip(mask, 0, 1)[:, :, None]
    img = WHITE * (1 - m) + LBLUE * m
    Image.fromarray(img.astype(np.uint8)).save(path, optimize=True)

def radial(cx, cy, r, p=1.5):
    ar = W / H
    d = np.sqrt(((xs - cx) * ar) ** 2 + (ys - cy) ** 2) / r
    return np.clip(1 - d, 0, 1) ** p

# ── 2장 : 우측 상단에서 퍼지는 원형 그라데이션 + 하단 좌측 옅은 번짐
m2 = radial(1.02, -0.06, 1.30, 1.35) * 1.0
m2 += radial(-0.05, 1.10, 0.75, 1.6) * 0.45
save(m2, 'bg_s2.png')

# ── 3장 : 좌측 하단 → 우측 상단 대각 그라데이션 + 우측 소프트 블롭
diag = np.clip((((1 - xs) + ys) / 2 - 0.30) / 0.70, 0, 1) ** 1.25
m3 = diag * 0.95
m3 += radial(0.80, 0.34, 0.62, 1.7) * 0.5
save(m3, 'bg_s3.png')
print('bg_s2.png bg_s3.png written')
