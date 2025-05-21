import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';

// Obter caminhos de módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminhos dos arquivos
const publicDir = join(__dirname, '..', 'client', 'public');
const iconPath = join(publicDir, 'brasilit-icon-512.svg');
const output192 = join(publicDir, 'brasilit-icon-192-maskable.png');
const output512 = join(publicDir, 'brasilit-icon-512-maskable.png');

// Tamanhos dos ícones
const sizes = [192, 512];

// Função para criar ícone maskable
async function createMaskableIcon(inputPath, outputPath, size) {
  try {
    // Criar um canvas com fundo transparente
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Carregar a imagem original
    const image = await loadImage(inputPath);
    
    // Calcular o tamanho do círculo (90% do tamanho do ícone para garantir bordas)
    const circleSize = size * 0.9;
    const offset = (size - circleSize) / 2;
    
    // Desenhar círculo de fundo
    ctx.fillStyle = '#FFFFFF'; // Fundo branco para o círculo
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, circleSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Desenhar o ícone centralizado
    ctx.drawImage(
      image,
      offset,
      offset,
      circleSize,
      circleSize
    );
    
    // Salvar como PNG
    const buffer = canvas.toBuffer('image/png');
    await sharp(buffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
      
    console.log(`Ícone maskable ${size}x${size} criado com sucesso em ${outputPath}`);
  } catch (error) {
    console.error('Erro ao criar ícone maskable:', error);
  }
}

// Função para verificar se um diretório existe
async function directoryExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

// Executar a geração dos ícones
async function generateIcons() {
  try {
    // Verificar se o diretório de saída existe
    if (!(await directoryExists(publicDir))) {
      await fs.mkdir(publicDir, { recursive: true });
    }
    
    // Criar os ícones maskable
    await createMaskableIcon(iconPath, output192, 192);
    await createMaskableIcon(iconPath, output512, 512);
    
    console.log('Todos os ícones maskable foram gerados com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

// Executar a geração dos ícones
generateIcons().catch(console.error);
