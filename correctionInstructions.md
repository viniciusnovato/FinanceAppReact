# Prompt para o TRAE - Correção de Problemas na Aplicação Financeira (React Native)

## Contexto
Estou desenvolvendo um ERP financeiro em **React Native**.  
No entanto, estou enfrentando alguns problemas de usabilidade e layout.

## Problemas Identificados

1. **Scroll ausente / elementos cortados**
   - As páginas não apresentam barra de rolagem.
   - Isso causa o corte de elementos da tela, que não ficam visíveis ao usuário.
   - O esperado é que todas as telas do ERP tenham **ScrollView** ou outra solução equivalente que permita visualizar todo o conteúdo sem cortes.

2. **Área de perfil intermitente**
   - A seção de perfil (onde deve aparecer o e-mail do usuário logado) aparece e desaparece rapidamente.
   - Isso gera uma experiência inconsistente para o usuário.
   - O esperado é que o campo do perfil permaneça estável na tela, mostrando corretamente os dados do usuário logado.

## O que fazer
- Revisar a estrutura de layout e navegação das telas.
- Implementar corretamente `ScrollView`, `FlatList` ou `SectionList` onde necessário para garantir rolagem.
- Verificar se há problemas de **state management** ou de **async render** que estão fazendo a área do perfil desaparecer.
- Sugerir boas práticas para evitar cortes de elementos em diferentes resoluções de tela.
- Garantir que a área do perfil seja carregada de forma consistente e persistente.

## Objetivo
Corrigir esses problemas para que:
- Todas as páginas tenham rolagem adequada e sem cortes de elementos.
- A área do perfil funcione de forma estável, exibindo corretamente o e-mail do usuário logado.