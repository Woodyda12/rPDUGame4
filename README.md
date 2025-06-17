 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a//dev/null b/README.md
index 0000000000000000000000000000000000000000..2acb9276ca739ee7ae10dd3ff06625119c502e2e 100644
--- a//dev/null
+++ b/README.md
@@ -0,0 +1,18 @@
+# Grid Glider – Design for Cost Edition
+
+A simple endless runner built with [Three.js](https://threejs.org/) showcasing cost-saving principles in an engineering context. Glide over a glowing grid, dodge symbolic obstacles and rack up the highest score you can.
+
+## Setup
+No installation required. Clone or download this repository and open `index.html` in any modern desktop web browser.
+
+## Controls
+- **Left / Right Arrows** or **A / D** – move the player left or right
+- **R** – restart after game over
+
+## Gameplay
+Avoid oncoming obstacles as they move toward you. Your score increases the longer you survive and the speed slowly ramps up. Colliding with an obstacle ends the run.
+
+## Assets
+Placeholder textures for the obstacle symbols are located in the `assets/` directory and loaded directly by the game.
+
+Enjoy and feel free to modify or extend the game!
 
EOF
)
