# Fonts

Poppins (SIL OFL 1.1, see `OFL-Poppins.txt`) is self-hosted here, Latin and Latin Extended only, as the fallback for KyivType Sans.

## KyivType Sans

The site's face: `--font-ui` and `--font-text` put `"KyivType Sans"` first, with Poppins after it. `style.css` declares three weights from `KyivType/`: Regular (400), Medium (500) and Bold (700, which also serves 600). Only these three `woff2` files are kept. The family ships each weight in four versions that differ in stroke contrast (no suffix is low contrast, `2` medium, `3` high, `-` low with thin `M`, `W`, `K`); the site uses the low-contrast one, and the Serif and Titling families are not used.

Its licence is not in this repository: check the web licence before you commit these files.
