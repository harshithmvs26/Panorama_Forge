import os
import cv2
import numpy as np

def generate_sample_sets(base_dir: str):
    """
    Generates 4 rich sample image sets (Campus, Building, Landscape, Road)
    with high feature density and realistic camera perspective shifts.
    """
    os.makedirs(base_dir, exist_ok=True)
    categories = ["campus", "building", "landscape", "road"]

    for cat in categories:
        cat_dir = os.path.join(base_dir, cat)
        os.makedirs(cat_dir, exist_ok=True)

        # Create wide base scene (width 1600, height 800) with detailed textures & patterns
        canvas = np.zeros((800, 1600, 3), dtype=np.uint8)

        # Gradient background
        for y in range(800):
            r = int(50 + 150 * (y / 800))
            g = int(80 + 100 * (1.0 - y / 800))
            b = int(180 - 80 * (y / 800))
            canvas[y, :] = [b, g, r]

        # Add rich geometrical patterns for high SIFT feature count
        if cat == "campus":
            # Campus building, windows, trees, clock tower
            cv2.rectangle(canvas, (200, 300), (600, 700), (120, 100, 80), -1)
            cv2.rectangle(canvas, (700, 200), (1100, 700), (90, 80, 70), -1)
            cv2.rectangle(canvas, (1150, 350), (1450, 700), (100, 110, 130), -1)
            # Clock tower
            cv2.rectangle(canvas, (850, 80), (950, 200), (80, 70, 60), -1)
            cv2.circle(canvas, (900, 140), 30, (220, 220, 240), -1)
            cv2.line(canvas, (900, 140), (900, 120), (0, 0, 0), 3)
            cv2.line(canvas, (900, 140), (915, 140), (0, 0, 0), 3)

            # Windows grid
            for wx in range(230, 570, 40):
                for wy in range(340, 660, 50):
                    cv2.rectangle(canvas, (wx, wy), (wx + 25, wy + 30), (230, 240, 250), -1)
                    cv2.rectangle(canvas, (wx, wy), (wx + 25, wy + 30), (30, 30, 30), 2)
            for wx in range(730, 1070, 50):
                for wy in range(240, 660, 50):
                    cv2.rectangle(canvas, (wx, wy), (wx + 30, wy + 30), (240, 250, 230), -1)
                    cv2.rectangle(canvas, (wx, wy), (wx + 30, wy + 30), (30, 30, 30), 2)

            # Trees
            for tx in [100, 650, 1120, 1500]:
                cv2.rectangle(canvas, (tx - 15, 550), (tx + 15, 750), (30, 50, 80), -1)
                cv2.circle(canvas, (tx, 520), 60, (40, 140, 40), -1)
                cv2.circle(canvas, (tx - 20, 490), 40, (50, 160, 50), -1)

        elif cat == "building":
            # Skyscraper facade with dense geometric window grid & architecture details
            for bx in range(100, 1500, 300):
                h_top = 100 + (bx % 200)
                cv2.rectangle(canvas, (bx, h_top), (bx + 260, 750), (60 + (bx%50), 70, 90), -1)
                for wx in range(bx + 20, bx + 240, 35):
                    for wy in range(h_top + 30, 720, 40):
                        cv2.rectangle(canvas, (wx, wy), (wx + 20, wy + 25), (220, 220, 150), -1)
                        cv2.line(canvas, (wx, wy + 12), (wx + 20, wy + 12), (50, 50, 50), 1)

        elif cat == "landscape":
            # Mountain range, sun, lake, pine trees
            cv2.circle(canvas, (1300, 200), 70, (100, 220, 255), -1) # Sun
            # Mountains
            pts1 = np.array([[0, 700], [300, 250], [650, 700]], np.int32)
            pts2 = np.array([[400, 700], [800, 180], [1200, 700]], np.int32)
            pts3 = np.array([[950, 700], [1350, 300], [1600, 700]], np.int32)
            cv2.fillPoly(canvas, [pts1], (70, 90, 110))
            cv2.fillPoly(canvas, [pts2], (90, 110, 130))
            cv2.fillPoly(canvas, [pts3], (80, 100, 120))
            # Mountain peaks snow
            snow2 = np.array([[730, 250], [800, 180], [870, 250]], np.int32)
            cv2.fillPoly(canvas, [snow2], (240, 240, 250))
            # Foliage textures
            np.random.seed(42)
            for _ in range(300):
                rx = np.random.randint(50, 1550)
                ry = np.random.randint(550, 780)
                cv2.circle(canvas, (rx, ry), np.random.randint(3, 8), (30, np.random.randint(120, 200), 40), -1)

        else: # road
            # Highway perspective, street lights, signboards, cars
            cv2.rectangle(canvas, (0, 450), (1600, 800), (70, 70, 75), -1) # Road asphalt
            # Lane markings
            for lx in range(0, 1600, 100):
                cv2.rectangle(canvas, (lx, 610), (lx + 50, 625), (240, 240, 240), -1)
            # Billboard signboards with text
            cv2.rectangle(canvas, (300, 150), (600, 350), (40, 120, 200), -1)
            cv2.putText(canvas, "PANORAMAFORGE", (320, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
            cv2.putText(canvas, "DIP PROJECT", (360, 290), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)

            cv2.rectangle(canvas, (1000, 180), (1300, 360), (200, 80, 40), -1)
            cv2.putText(canvas, "SIFT + RANSAC", (1020, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        # Add global texture noise overlay so SIFT finds thousands of rich keypoint features everywhere
        np.random.seed(123)
        noise = np.random.randint(-20, 20, canvas.shape, dtype=np.int16)
        canvas_noisy = np.clip(canvas.astype(np.int16) + noise, 0, 255).astype(np.uint8)

        # Extract 3 overlapping frames (Left, Center, Right) using camera panning perspective simulation
        h, w = canvas.shape[:2]
        crop_w = 700

        # Frame 1: Left view (x = 0 to 700)
        frame1 = canvas_noisy[100:700, 50:750]

        # Frame 2: Center view with ~50% overlap (x = 450 to 1150)
        # Apply slight perspective skew to simulate camera rotation
        frame2_raw = canvas_noisy[100:700, 450:1150]
        pts_src = np.float32([[0,0], [700,0], [700,600], [0,600]])
        pts_dst = np.float32([[0,5], [700,20], [700,580], [0,595]])
        M2 = cv2.getPerspectiveTransform(pts_src, pts_dst)
        frame2 = cv2.warpPerspective(frame2_raw, M2, (700, 600))

        # Frame 3: Right view with ~50% overlap (x = 850 to 1550)
        frame3_raw = canvas_noisy[100:700, 850:1550]
        pts_dst3 = np.float32([[0,15], [700,0], [700,600], [0,585]])
        M3 = cv2.getPerspectiveTransform(pts_src, pts_dst3)
        frame3 = cv2.warpPerspective(frame3_raw, M3, (700, 600))

        cv2.imwrite(os.path.join(cat_dir, "img1.jpg"), frame1)
        cv2.imwrite(os.path.join(cat_dir, "img2.jpg"), frame2)
        cv2.imwrite(os.path.join(cat_dir, "img3.jpg"), frame3)

    print("Sample image sets generated successfully.")

if __name__ == "__main__":
    generate_sample_sets("backend/sample_images")
