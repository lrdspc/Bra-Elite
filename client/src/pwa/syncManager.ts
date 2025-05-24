import { inspectionDB, imageDB } from '../lib/db'; // Adjusted import path for db

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
        const response = await fetch('/api/inspections', { // Assuming API endpoint
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
        formData.append('evidenceFile', image.blob, image.fileName || 'evidence.png'); // Use 'evidenceFile' as expected by backend
        formData.append('inspectionId', image.inspectionId);
        if(image.category) formData.append('category', image.category);
        if(image.notes) formData.append('notes', image.notes);
        
        // Envia para o servidor
        const response = await fetch('/api/evidences', { // Assuming API endpoint for evidences
          method: 'POST',
          body: formData, // FormData sets Content-Type automatically
        });

        if (!response.ok) {
          throw new Error(`Erro ao sincronizar imagem: ${response.statusText}`);
        }
        
        const result = await response.json();
        // Update image ID from server response if necessary
        image.id = result.id; // Assuming server returns the new ID for the evidence
        image.fileKey = result.fileKey; // And the server-side file path/key
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
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        console.log(`Background sync for tag '${tag}' registered.`);
        return true;
      } catch (error) {
        console.error(`Erro ao registrar sincronização em segundo plano para '${tag}':`, error);
        return false;
      }
    }
    console.warn('Background Sync not supported.');
    return false;
  }
}

export const syncManager = new SyncManager();
