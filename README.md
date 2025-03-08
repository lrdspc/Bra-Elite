# Brasilit PWA - Sistema de Vistorias Técnicas

Um aplicativo web progressivo (PWA) desenvolvido para a Brasilit, permitindo que técnicos realizem vistorias de campo com recursos offline robustos e funcionalidades avançadas.

## Principais Funcionalidades

- ✅ **Operação Offline**: Funcionamento completo em áreas sem conexão com sincronização automática ao retornar online
- 📱 **Design Mobile-First**: Interface otimizada para dispositivos móveis, com suporte completo a tablets e desktops
- 📋 **Workflow de Inspeção**: Processo guiado em etapas para coleta de dados estruturada
- 📷 **Captura de Evidências**: Fotos com marcações e anotações durante as vistorias
- 📍 **Geolocalização**: Registro automático de coordenadas e preenchimento de endereços
- 📊 **Relatórios Detalhados**: Geração automática de relatórios com todas as evidências coletadas
- 🔄 **Sincronização**: Sistema robusto de sincronização com o servidor principal

## Tecnologias

- **Frontend**: React.js com TypeScript
- **UI**: Tailwind CSS com componentes shadcn/ui
- **Armazenamento Local**: IndexedDB para persistência offline
- **PWA**: Suporte total a recursos PWA (Service Workers, Cache API, etc)
- **Backend**: Node.js com Express
- **Dados**: Suporte a PostgreSQL e armazenamento em memória para desenvolvimento

## Pré-requisitos

- Node.js 20.x
- npm 10.x ou superior

## Instalação

```bash
# Clone o repositório
git clone https://github.com/brasilit/pwa-vistorias.git
cd pwa-vistorias

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## Uso em Produção

Para compilar o aplicativo para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados no diretório `dist`.

## Contribuição

1. Faça o fork do projeto
2. Crie sua branch de funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit de suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Envie para o branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Todos os direitos reservados à Brasilit © 2025. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Para questões relacionadas ao projeto, entre em contato com a equipe de desenvolvimento da Brasilit.