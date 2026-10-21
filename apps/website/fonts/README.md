# Fonts

Poppins (SIL OFL 1.1, see `OFL-Poppins.txt`) is self-hosted here, Latin and Latin Extended only. It has no Cyrillic, so Ukrainian text falls back to the system sans until a Cyrillic face is added.

## Adding KyivType Sans

Its licence is not in this repository; get the web licence and the `woff2` files yourself and put them in this folder (do not commit files you may not redistribute without checking the licence). Then in `style.css` add one `@font-face` per weight, for example:

```css
@font-face {
  font-family: "KyivType Sans";
  font-weight: 400;
  font-display: swap;
  src: url("./fonts/KyivTypeSans-Regular.woff2") format("woff2");
}
```

and put `"KyivType Sans"` first in `--font-ui` and `--font-text`.
