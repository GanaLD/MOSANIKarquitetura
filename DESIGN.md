# MOSARQ — identidade aplicada à demo

## Autoridade e escopo
Manual_IDV_MosArq. (1).pdf, outubro de 2025, V01, fornecido pelo usuário. Site institucional em português brasileiro. Aplicação da identidade à demo existente; preservados hero 3D procedural, seleção de ambientes, movimento GSAP, contato e fallback SVG. A residência continua conceitual.

## Sistema visual
Fonte canônica dos tokens: assets/brand.css. O módulo 3D lê os tokens de cor com getComputedStyle.

| Token | Cor | Uso |
| --- | --- | --- |
| --moss | #6B705C | Verde Oliva: hero, seleção e contato |
| --clay | #B4572E | Aço Corten: seção comercial |
| --earth | #544340 | Terra Escura: conceito e interiores |
| --paper | #F5F5F3 | Off-white: superfícies e texto claro |
| --ink | #2B2B2B | Grafite Suave: texto |
| --deep | #3F3230 | Café Queimado: rodapé e hover |

O manual, p.27, imprime HEX incompatíveis com RGB e amostras: repete #3F3230 para Terra Escura e Corten e mostra um HEX inválido para Oliva. Foram adotados os RGB explícitos 84/67/64, 107/112/92 e 180/87/46, também presentes nos metadados do padrão RGB. Nenhum original foi corrigido.

Títulos: Archivo Black, caixa alta, tracking .05em. Corpo: Source Serif 4 Regular, entrelinha 150%. Controles e legendas: Archivo Light, caixa alta, tracking .15em. Fontes hospedadas localmente, subconjuntos Latin e Latin Extended A; licenças em assets/fonts.

## Marca e grafismos
Vetores horizontais oficiais, versão sem registro, escuros e claros. Não substituir por texto digitado nem redesenhar. As cópias web removem somente o retângulo de fundo; paths, viewBox e área de proteção permanecem intactos. Símbolo oficial em favicon. Azulejo convertido do PDF RGB oficial para SVG, preservando a arte.

## Layout e comportamento
Hero oliva com tipografia estrutural e estudo 3D sobre bancada. Conceito divide marca e azulejo. Tour com cinco controles nativos e legenda aria-live. Seções comerciais horizontais no desktop e verticais até 700px ou quando movimento reduzido está ativo. Sem alargar a página para ocultar problemas. Links de contato levam ao rodapé visível, independentemente da rolagem horizontal.

## Acessibilidade
Foco visível, link para pular navegação, imagens com dimensões, controles aria-pressed, respeito a prefers-reduced-motion. Parágrafo sobre corten em 24px para usar o requisito de contraste de texto grande; não aplicar texto pequeno off-white sobre corten. Contraste deve ser novamente conferido se mudar tamanho, peso ou cor.
