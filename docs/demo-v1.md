# MOSARQ — Demo V1

## Planta conceitual

Estudo residencial demonstrativo de 12 × 8 m, com pé-direito de 2,70 m. O eixo longitudinal separa área social a oeste e área íntima a leste. Sala integrada à cozinha e jantar, suíte com banheiro, deck ao sul e jardim periférico. As paredes externas têm 16 cm e divisórias internas 16 cm. A porta de entrada e aberturas da fachada estão representadas de forma esquemática. A planta e o modelo são um estudo visual, sujeito a conferência de circulação, estrutura, acessibilidade e normas locais por profissional habilitado.

| Zona | Posição aproximada na planta | Conteúdo 3D |
| --- | --- | --- |
| Sala | Oeste, frente | Sofá, mesa baixa, tapete |
| Cozinha e jantar | Oeste, fundos | Bancada, tampo, mesa |
| Suíte | Leste, frente | Cama, colchão, manta |
| Banheiro | Leste, fundos | Lavatório, bacia |
| Jardim | Frente e perímetro | Deck, árvores, terreno |

A mesma geometria procedural alimenta o hero e o tour. O arquivo `assets/experience.js` organiza as peças por etapa da construção e por cômodo. Cada transição de cômodo reinicia sua animação e muda a posição da câmera.

## Mapa de movimento

| Tempo | Hero |
| --- | --- |
| 0–0,8 s | Planta e bancada |
| 0,8–2,9 s | Fundação, paredes e esquadrias |
| 2,9–4,9 s | Cobertura, deck, jardim e mobiliário |
| 4,9–6,5 s | Composição exterior |

A seleção de um cômodo move a câmera por 1,7 s com interpolação suave. O mobiliário do cômodo selecionado emerge em sequência. A transição inclui arco vertical para reduzir o risco de atravessar uma parede. A seção comercial mantém rolagem horizontal com GSAP em telas acima de 700 px. Em telas estreitas, os painéis ficam empilhados.

## Assets e substituições

- A demo usa geometria 3D procedural construída no navegador. Os móveis e materiais são representações simplificadas.
- O SVG original permanece como fallback quando WebGL ou a biblioteca 3D não carrega.
- Identidade oficial aplicada na atualização local: vetores horizontais, favicon, padrão azulejo, Archivo e Source Serif 4. Consulte DESIGN.md e ASSETS.md.
- A próxima etapa de produção é exportar uma residência autoral em GLB a partir do Blender, com peças nomeadas por cômodo e etapas estruturais. Validar a planta com o arquiteto antes disso.
- Fotografias, texturas PBR, gravação cinematográfica e áudio dependem de assets aprovados. O modelo atual não representa um projeto executivo.

## Especificações para produção de mídia

1. Planta e GLB: residência térrea 12 × 8 m, salas e cozinha a oeste, suíte e banho a leste, pé-direito 2,70 m, fachada com vãos definidos, coleções independentes para estrutura, cobertura, esquadrias, mobiliário e paisagismo. Câmera 35 mm em vista oblíqua. Materiais musgo, tijolo, areia, madeira e pedra. Conferir encaixe entre planta e fachadas.
2. Hero: bancada realista de madeira com planta e escalímetro, câmera 35–50 mm oblíqua 45°, dolly-in em 6–8 s, estrutura emergindo na ordem fundação, paredes, vãos, cobertura, paisagismo, materiais. Conferir continuidade geométrica e ausência de interpenetração.
3. Interiores: entregar cômodos vazios e móveis em arquivos separados, eixos e pivôs no piso, dimensões reais, luz solar lateral suave, fotos com campo de visão 40–50°. Conferir circulação e portas.
4. Poster/fallback: enquadramento exterior da fachada em perspectiva de três quartos, tarde ensolarada, materiais fisicamente plausíveis, fundo com vegetação discreta, sem alterar a planta. Exportar AVIF/WebP responsivos.
5. Marca: usar exclusivamente o vetor aprovado. Revelação por traços técnicos e máscara discreta, 1,5–2 s, sem deformar proporções, guardar margens e contraste do manual.

## Pendências de validação

- Conferir visualmente nos viewports 1920, 1440, 1366, 1280, 1024, 768, 430 e 390 px e ajustar colisões encontradas.
- Medir LCP, CLS, tamanho de transferência e FPS nos dispositivos de destino.
- Conferir o carregamento da biblioteca 3D externa e o comportamento WebGL em aparelhos reais.
- Publicar a atualização da identidade após autorização explícita para os materiais selecionados.
- Validar circulação, mobiliário e estrutura com o arquiteto.
- Habilitar GitHub Pages para uma URL permanente. O preview da demo é temporário.

A página mantém `noindex,nofollow` durante a fase beta.
