# Vídeo do hero: do traço ao espaço

Animação em código (Three.js) do modelo 3D real da casa: o desenho técnico se traça sobre o papel azul, a estrutura sobe dentro das linhas, a câmera desce até a rua, o acabamento sobe andar por andar e o paisagismo cresce.

- `anim.html`: cena determinística. `window.renderAt(t)` desenha o instante `t` (0 a 12 s). Parâmetros: `?w=1920&h=1080`.
- `render-frames.mjs`: captura os quadros com Playwright (`node render-frames.mjs 0 360 ./frames`), a 30 fps.
- Codificação: `ffmpeg -framerate 30 -i frames/f%04d.png -c:v libx264 -preset veryfast -crf 24 -pix_fmt yuv420p -movflags +faststart -an hero.mp4` (e uma versão 1280 px para celular).

Precisa de um servidor local na raiz do projeto e do pacote `three` em `/node_modules`.

Modelo: “Modern House”, Abbos Mirzaev (BlenderKit, Royalty Free). Provisório até o projeto MOSARQ.
