import { inspectionDB, imageDB } from './db';

/**
 * Gerenciador de sincronização para dados offline
 */
export class SyncManager {
  private isSyncing = false;

  /**
   * Inicia o processo de sincronização
   */
  async syncAll(): Promise<{ success: boolean; message: string }> {
    if (this.isSyncing) {
      return { success: false, message: 'Sincronização já em andamento' };
    }

    if (!navigator.onLine) {
      return { success: false, message: 'Sem conexão com a internet' };
    }

    try {
      this.isSyncing = true;
      
      // Sincroniza inspeções pendentes
      const pendingInspections = await inspectionDB.getPendingSync();
      if (pendingInspections.length > 0) {
        await this.syncInspections(pendingInspections);
      }
      
      // Sincroniza imagens pendentes
      const pendingImages = await imageDB.getPendingSync();
      if (pendingImages.length > 0) {
        await this.syncImages(pendingImages);
      }
      
      return { 
        success: true, 
        message: `Sincronização concluída: ${pendingInspections.length} inspeções e ${pendingImages.length} imagens` 
      };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return { 
        success: false, 
        message: `Erro na sincronização: ${(error as Error).message}` 
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincroniza inspeções pendentes com o servidor
   */
  private async syncInspections(inspections: any[]): Promise<void> {
    for (const inspection of inspections) {
      try {
        // Envia para o servidor
        const response = await fetch('/api/inspections', {
          method: inspection.id.startsWith('local-') ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inspection),
        });

        if (!response.ok) {
          throw new Error(`Erro ao sincronizar inspeção: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Atualiza o ID se for uma nova inspeção
        if (inspection.id.startsWith('local-')) {
          const oldId = inspection.id;
          inspection.id = result.id;
          
          // Atualiza referências em imagens
          const relatedImages = await imageDB.getByInspection(oldId);
          for (const image of relatedImages) {
            image.inspectionId = result.id;
            await imageDB.save(image);
          }
        }
        
        // Marca como sincronizado
        inspection.syncStatus = 'synced';
        await inspectionDB.save(inspection);
      } catch (error) {
        console.error(`Erro ao sincronizar inspeção ${inspection.id}:`, error);
        inspection.syncStatus = 'failed';
        await inspectionDB.save(inspection);
      }
    }
  }

  /**
   * Sincroniza imagens pendentes com o servidor
   */
  private async syncImages(images: any[]): Promise<void> {
    for (const image of images) {
      try {
        // Cria um FormData para envio da imagem
        const formData = new FormData();
        formData.append('image', image.blob);
        formData.append('inspectionId', image.inspectionId);
        formData.append('caption', image.caption || '');
        
        // Envia para o servidor
        const response = await fetch('/api/images', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erro ao sincronizar imagem: ${response.statusText}`);
        }
        
        // Marca como sincronizado
        image.syncStatus = 'synced';
        await imageDB.save(image);
      } catch (error) {
        console.error(`Erro ao sincronizar imagem ${image.id}:`, error);
        image.syncStatus = 'failed';
        await imageDB.save(image);
      }
    }
  }

  /**
   * Registra uma tarefa de sincronização em segundo plano
   */
  async registerBackgroundSync(): Promise<boolean> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-inspections');
        return true;
      } catch (error) {
        console.error('Erro ao registrar sincronização em segundo plano:', error);
        return false;
      }
    }
    return false;
  }
}

export const syncManager = new SyncManager();