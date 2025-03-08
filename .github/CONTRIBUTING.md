# Guia de Contribuição

Obrigado por considerar contribuir para o PWA de Vistorias Técnicas da Brasilit! Este documento fornece diretrizes e padrões para ajudar você a contribuir de forma eficaz.

## Processo de Contribuição

1. Verifique as issues existentes ou crie uma nova para discutir a funcionalidade que pretende implementar
2. Faça um fork do repositório
3. Crie uma branch para sua alteração (`git checkout -b feature/nome-da-funcionalidade`)
4. Implemente suas alterações
5. Teste suas alterações, garantindo compatibilidade com recursos offline
6. Crie um Pull Request

## Padrões de Código

### Convenções de Nomenclatura

- Utilize camelCase para variáveis e funções em JavaScript/TypeScript
- Utilize PascalCase para componentes React e nomes de classes
- Utilize kebab-case para arquivos CSS e nomes de classes CSS

### Estilo de Código

- Usamos ESLint e Prettier para manter a consistência do código
- Execute `npm run lint` antes de submeter suas alterações
- Mantenha arquivos React/TSX dentro de 400 linhas quando possível
- Adicione comentários para código complexo ou não óbvio

### TypeScript

- Sempre defina tipos para props de componentes e parâmetros de função
- Evite o uso de `any`, prefira definir interfaces ou tipos específicos
- Utilize nomes descritivos para interfaces e tipos

## Testes

- Teste todas as funcionalidades em ambos os modos: online e offline
- Verifique a responsividade em múltiplos tamanhos de tela (mobile, tablet, desktop)
- Para funcionalidades offline, teste o fluxo completo de sincronização

## Compromisso com a Qualidade

- Priorize desempenho, especialmente em dispositivos móveis
- Otimize o tamanho dos bundles e assets
- Mantenha a acessibilidade (WCAG 2.1 AA)
- Garanta compatibilidade com os navegadores principais (Chrome, Safari, Firefox, Edge)

## Revisão de Código

- Todos os Pull Requests serão revisados por pelo menos um mantenedor do projeto
- Esteja aberto a feedback e disposto a fazer alterações quando solicitado
- Responda a comentários de revisão de forma construtiva

## Suporte

Se você tiver dúvidas ou precisar de ajuda, entre em contato com a equipe de desenvolvimento da Brasilit.