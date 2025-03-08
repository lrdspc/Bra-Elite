# Guia de Contribuição

Obrigado pelo interesse em contribuir com o PWA de Vistorias Técnicas Brasilit! Este documento fornece diretrizes para contribuir efetivamente com o projeto.

## Ambiente de desenvolvimento

1. Certifique-se de usar Node.js versão 20 ou superior (conforme especificado no arquivo `.nvmrc`)
2. Clone o repositório
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Fluxo de trabalho de contribuição

1. Crie um fork do repositório principal
2. Crie uma branch a partir da main com um nome descritivo:
   ```bash
   git checkout -b feature/nome-descritivo
   ```
3. Faça suas alterações seguindo o estilo de código do projeto
4. Certifique-se de que o código passa em todos os testes:
   ```bash
   npm run test
   ```
5. Execute a verificação estática de tipos:
   ```bash
   npm run type-check
   ```
6. Execute o linter para garantir a qualidade do código:
   ```bash
   npm run lint
   ```
7. Faça commits com mensagens claras e descritivas
8. Envie a branch para seu fork:
   ```bash
   git push origin feature/nome-descritivo
   ```
9. Abra um Pull Request para a branch main do repositório principal

## Padrões de código

- **TypeScript**: Use tipos estáticos sempre que possível, evite `any`
- **React**: Utilize componentes funcionais e hooks
- **Estilo**: Siga as diretrizes de design existentes usando TailwindCSS e Shadcn/UI
- **Estrutura**: Mantenha a organização de arquivos existente, com componentes em `src/components`, páginas em `src/pages`, etc.
- **PWA**: Mantenha sempre a compatibilidade offline e as características do PWA

## Funcionalidades offline

O foco principal deste aplicativo é o funcionamento adequado em cenários sem conexão. Ao adicionar novos recursos:

1. Certifique-se de que todos os dados são armazenados localmente usando IndexedDB
2. Implemente a sincronização em segundo plano quando a conexão for restaurada
3. Trate casos de conflitos de sincronização adequadamente
4. Teste o recurso em modo offline

## Testes

- Desenvolva testes unitários para componentes e funções
- Adicione testes de integração para fluxos de usuário importantes
- Teste o comportamento offline de suas alterações

## Documentação

- Atualize a documentação existente conforme necessário
- Documente novas funcionalidades e comportamentos
- Inclua comentários explicativos no código para partes complexas

## Segurança

- Não cometa credenciais, tokens ou segredos
- Valide todas as entradas do usuário
- Siga as melhores práticas de segurança para aplicativos web

## Contato

Para dúvidas ou discussões, entre em contato com o time de desenvolvimento pelo e-mail: dev@brasilit.com.br