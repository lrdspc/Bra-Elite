/**
 * Utility functions for image processing
 */

/**
 * Compresses an image to a specified quality and maximum size
 * @param file The image file to compress
 * @param maxSizeInMB The maximum size in MB (default: 1MB)
 * @param quality The quality of compression (0-1, default: 0.7)
 * @returns A promise that resolves to a compressed Blob
 */
export const compressImage = async (
  file: File,
  maxSizeInMB: number = 1,
  quality: number = 0.7
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Convert maxSizeInMB to bytes
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    // If the file is already smaller than the max size, return it as is
    if (file.size <= maxSizeInBytes) {
      resolve(file);
      return;
    }
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      // Create an image element
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate the new dimensions while maintaining aspect ratio
        const aspectRatio = width / height;
        
        // If the image is very large, scale it down
        const MAX_DIMENSION = 1920; // Maximum dimension for either width or height
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            width = MAX_DIMENSION;
            height = Math.round(width / aspectRatio);
          } else {
            height = MAX_DIMENSION;
            width = Math.round(height * aspectRatio);
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert the canvas to a Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image'));
              return;
            }
            
            // If the compressed image is still too large, try again with lower quality
            if (blob.size > maxSizeInBytes && quality > 0.2) {
              compressImage(file, maxSizeInMB, quality - 0.1)
                .then(resolve)
                .catch(reject);
            } else {
              resolve(blob);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Could not load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };
  });
};

/**
 * Creates a capture grid overlay for the camera
 * @param container The container element to add the grid to
 * @returns A function to remove the grid
 */
export const createCaptureGrid = (container: HTMLElement): () => void => {
  // Create grid container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'absolute inset-0 pointer-events-none';
  gridContainer.style.zIndex = '10';
  
  // Create grid lines
  const createGridLine = (isHorizontal: boolean, position: string) => {
    const line = document.createElement('div');
    line.className = 'absolute bg-white/30';
    
    if (isHorizontal) {
      line.style.height = '1px';
      line.style.width = '100%';
      line.style.left = '0';
      line.style.top = position;
    } else {
      line.style.width = '1px';
      line.style.height = '100%';
      line.style.top = '0';
      line.style.left = position;
    }
    
    return line;
  };
  
  // Add horizontal lines (rule of thirds)
  gridContainer.appendChild(createGridLine(true, '33.33%'));
  gridContainer.appendChild(createGridLine(true, '66.66%'));
  
  // Add vertical lines (rule of thirds)
  gridContainer.appendChild(createGridLine(false, '33.33%'));
  gridContainer.appendChild(createGridLine(false, '66.66%'));
  
  // Add center crosshair
  const crosshair = document.createElement('div');
  crosshair.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none';
  
  const crosshairCircle = document.createElement('div');
  crosshairCircle.className = 'w-6 h-6 rounded-full border border-white/50';
  
  crosshair.appendChild(crosshairCircle);
  gridContainer.appendChild(crosshair);
  
  // Add grid to container
  container.appendChild(gridContainer);
  
  // Return function to remove grid
  return () => {
    container.removeChild(gridContainer);
  };
};

/**
 * Organizes evidence images by non-conformity
 * @param evidences Array of evidence images
 * @param nonConformities Array of non-conformities
 * @returns Object with non-conformity IDs as keys and arrays of evidence images as values
 */
export const organizeEvidencesByNonConformity = (
  evidences: Array<{
    id: string;
    url: string;
    category: string;
    nonConformityId?: string;
    notes?: string;
    annotations?: any[];
  }>,
  nonConformities: Array<{
    id: string;
    name: string;
  }>
) => {
  const result: Record<string, any[]> = {};
  
  // Initialize result with empty arrays for each non-conformity
  nonConformities.forEach(nc => {
    result[nc.id] = [];
  });
  
  // Add a category for general evidences not associated with any non-conformity
  result['general'] = [];
  
  // Organize evidences
  evidences.forEach(evidence => {
    if (evidence.nonConformityId && result[evidence.nonConformityId]) {
      result[evidence.nonConformityId].push(evidence);
    } else {
      result['general'].push(evidence);
    }
  });
  
  return result;
};