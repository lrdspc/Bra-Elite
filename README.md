# Brasilit Vistorias Técnicas PWA

Aplicativo web progressivo (PWA) para vistorias técnicas da Brasilit - Saint-Gobain.

## Estrutura do Projeto

O projeto foi reorganizado para seguir as melhores práticas de PWA:

```
client/
├── public/               # Arquivos públicos
│   ├── manifest.json     # Configuração do PWA
│   ├── offline.html      # Página offline
│   └── icons/            # Ícones do aplicativo
├── src/
│   ├── components/       # Componentes React
│   │   └── pwa/          # Componentes específicos do PWA
│   ├── hooks/            # Hooks personalizados
│   │   ├── useNetworkStatus.ts
│   │   ├── usePWAInstall.ts
│   │   └── useServiceWorker.ts
│   ├── lib/
│   │   └── pwa.ts        # Utilitários para PWA
│   └── pages/            # Páginas da aplicação
```

## Funcionalidades PWA

- **Instalável**: O aplicativo pode ser instalado em dispositivos móveis e desktop
- **Offline**: Funciona mesmo sem conexão com a internet
- **Sincronização em segundo plano**: Sincroniza dados quando a conexão é restabelecida
- **Notificações push**: Receba notificações importantes
- **Atualizações automáticas**: Notifica o usuário quando há uma nova versão

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar assets do PWA
npm run generate:pwa-assets

# Construir para produção
npm run build
```

## Tecnologias

- React + TypeScript
- Vite + PWA Plugin
- Workbox para cache e estratégias offline
- IndexedDB para armazenamento local
- Service Workers para funcionalidades offline

## Melhores Práticas Implementadas

1. **Service Worker Otimizado**: Estratégias de cache adequadas para diferentes tipos de recursos
2. **Manifest Completo**: Configuração completa do Web App Manifest
3. **Experiência Offline**: Página offline personalizada e sincronização em segundo plano
4. **Instalação Simplificada**: Botão de instalação e detecção de compatibilidade
5. **Atualizações Transparentes**: Notificação de novas versões disponíveis
6. **Performance**: Otimização de cache e carregamento de recursos