# Brasilit PWA - Sistema de Vistorias Técnicas

![Brasilit](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Brasilit_logo.svg/320px-Brasilit_logo.svg.png)

## Sobre o Projeto

Um Progressive Web App (PWA) para gerenciamento de vistorias técnicas da Brasilit, otimizado para uso em campo por técnicos e engenheiros.

### Funcionalidades Principais

- **Dashboard**: Visualização de estatísticas e informações relevantes
- **Vistorias**: Criação, edição e acompanhamento de vistorias técnicas
- **Modo Offline**: Trabalhe sem conexão com a internet com sincronização automática
- **Geolocalização**: Captura de coordenadas e preenchimento automático de endereços
- **Evidências Fotográficas**: Captura e anotação de imagens diretamente na aplicação
- **Relatórios**: Geração de relatórios em PDF para compartilhamento

### Stack Tecnológica

- **Frontend**: React.js, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Armazenamento**: IndexedDB (offline), banco de dados relacional (online)
- **PWA**: Service Workers, Manifest, IndexedDB, Cache API

## Instalação

```bash
# Instalação das dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## Estrutura de Diretórios

```
brasilit-pwa/
├── client/              # Código frontend em React
│   ├── public/          # Arquivos estáticos
│   └── src/             # Código fonte React
│       ├── components/  # Componentes da UI
│       ├── context/     # Contextos React
│       ├── hooks/       # Hooks customizados
│       ├── lib/         # Bibliotecas e utilitários
│       └── pages/       # Páginas da aplicação
├── server/              # Backend Node.js/Express
├── shared/              # Código compartilhado (tipos, esquemas, etc.)
└── docs/                # Documentação adicional
```

## Recursos

- **Modo Offline**: Funciona mesmo sem conexão com internet
- **Responsivo**: Adaptado para desktop, tablet e smartphones
- **Geolocalização**: Captura de coordenadas GPS de alta precisão
- **Sincronização automática**: Dados são sincronizados quando há conexão
- **Notificações**: Alertas para novos trabalhos e atualizações
- **Edição de Imagens**: Anotações e marcações em imagens capturadas
- **Assinatura Digital**: Coleta de assinaturas de clientes

## Uso do PWA

1. Acesse a aplicação pelo navegador
2. Clique em "Adicionar à Tela Inicial" para instalar o PWA
3. Faça login com suas credenciais
4. A aplicação agora funciona como um aplicativo nativo

## Licença

© Brasilit - Todos os direitos reservados