# MOSARQ — demo de arquitetura e paisagismo

Atualização local da identidade oficial, pronta para revisão. Consulte DESIGN.md para tokens, ASSETS.md para fontes dos materiais e docs/validacao-identidade.md para testes e pendências.

Execute `python -m http.server 4173` na pasta e abra http://localhost:4173.

Repositório: https://github.com/GanaLD/MOSANIKarquitetura

A atualização ainda não foi enviada ao GitHub nem publicada. A pasta de origem no Drive foi utilizada somente para leitura e download. A residência 3D segue conceitual; não houve criação de GLB fotorealista nesta etapa.

## Atualização — galeria e dock 3D
- `assets/ui.js`: dock do tour 3D (pílula deslizante, setas do teclado) e sanfona de imagens (hover/foco/clique, entrada com GSAP, sem movimento com `prefers-reduced-motion`).
- Seção `#galeria` após o scroll horizontal GSAP; no mobile vira lista vertical expansível.
- Regenerar o GLB: `python3 tools/build_house_glb.py`.
