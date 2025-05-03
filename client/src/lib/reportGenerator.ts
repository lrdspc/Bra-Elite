import mammoth from 'mammoth';
import JSZip from 'jszip';

// Default template content as a fallback
const DEFAULT_TEMPLATE = `
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; }
    h1 { text-align: center; font-weight: bold; text-transform: uppercase; }
    .section { margin-top: 20px; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    table, th, td { border: 1px solid black; padding: 5px; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>RELATÓRIO DE VISTORIA TÉCNICA</h1>

  <div class="section">
    <div class="section-title">1. INFORMAÇÕES GERAIS</div>
    <p><strong>Data da Vistoria:</strong> {dataVistoria}</p>
    <p><strong>Data de Abertura do Protocolo:</strong> {dataProtocolo}</p>
    <p><strong>Cliente:</strong> {cliente}</p>
    <p><strong>Empreendimento:</strong> {empreendimento}</p>
    <p><strong>Endereço:</strong> {endereco}</p>
    <p><strong>Cidade/Estado:</strong> {cidade}/{estado}</p>
    <p><strong>Protocolo FAR:</strong> {protocolo}</p>
    <p><strong>Assunto:</strong> {assunto}</p>
  </div>

  <div class="section">
    <div class="section-title">2. EQUIPE TÉCNICA</div>
    <p><strong>Técnico Responsável:</strong> {tecnico}</p>
    <p><strong>Departamento:</strong> {departamento}</p>
    <p><strong>Unidade:</strong> {unidade}</p>
    <p><strong>Coordenador Responsável:</strong> {coordenador}</p>
    <p><strong>Gerente Responsável:</strong> {gerente}</p>
    <p><strong>Regional:</strong> {regional}</p>
  </div>

  <div class="section">
    <div class="section-title">3. ANÁLISE TÉCNICA</div>
    <p>{naoConformidades}</p>
  </div>

  <div class="section">
    <div class="section-title">4. CONCLUSÃO</div>
    <p>Após análise técnica, concluímos que o resultado da vistoria é <strong>IMPROCEDENTE</strong> pelos seguintes motivos:</p>
    <ol>
      {conclusaoItens}
    </ol>
  </div>
</body>
</html>
`;

// Interface for template
export interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for report data
export interface ReportData {
  dataVistoria?: string;
  dataProtocolo?: string;
  cliente?: string;
  empreendimento?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  protocolo?: string;
  assunto?: string;
  tecnico?: string;
  departamento?: string;
  unidade?: string;
  coordenador?: string;
  gerente?: string;
  regional?: string;
  naoConformidades?: Array<{
    id: string;
    name: string;
    description: string;
    notes?: string;
  }>;
}

// Store templates in IndexedDB
export const saveTemplate = async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> => {
  // Implementation would use IndexedDB to store the template
  // For now, we'll just return a mock template
  return {
    id: `template-${Date.now()}`,
    name: template.name,
    content: template.content,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Get all templates from IndexedDB
export const getTemplates = async (): Promise<Template[]> => {
  // Implementation would use IndexedDB to get all templates
  // For now, we'll just return a mock template
  return [
    {
      id: 'default-template',
      name: 'Template Padrão',
      content: DEFAULT_TEMPLATE,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};

// Get a template by ID from IndexedDB
export const getTemplateById = async (id: string): Promise<Template | null> => {
  // Implementation would use IndexedDB to get a template by ID
  // For now, we'll just return the default template
  return {
    id: 'default-template',
    name: 'Template Padrão',
    content: DEFAULT_TEMPLATE,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Delete a template by ID from IndexedDB
export const deleteTemplate = async (id: string): Promise<void> => {
  // Implementation would use IndexedDB to delete a template by ID
};

// Replace variables in the template with actual data
const replaceVariables = (template: string, data: ReportData): string => {
  let result = template;

  // Replace simple variables
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'naoConformidades' && value) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value.toString());
    }
  });

  // Handle non-conformities
  if (data.naoConformidades && data.naoConformidades.length > 0) {
    // Format non-conformities for the analysis section
    const analysisHtml = data.naoConformidades.map(nc => `
      <div style="margin-bottom: 15px;">
        <p><strong>${nc.id}. ${nc.name}</strong></p>
        <p>${nc.description}</p>
        ${nc.notes ? `<p><em>Observações: ${nc.notes}</em></p>` : ''}
      </div>
    `).join('');

    // Format non-conformities for the conclusion section
    const conclusionHtml = data.naoConformidades.map((nc, index) => `
      <li>${nc.name}</li>
    `).join('');

    result = result.replace('{naoConformidades}', analysisHtml);
    result = result.replace('{conclusaoItens}', conclusionHtml);
  } else {
    result = result.replace('{naoConformidades}', '<p>Nenhuma não conformidade identificada.</p>');
    result = result.replace('{conclusaoItens}', '<li>Não foram identificadas não conformidades.</li>');
  }

  // Remove any remaining variable placeholders
  result = result.replace(/{[^}]+}/g, '');

  return result;
};

// Convert HTML to DOCX
export const generateReport = async (templateId: string, data: ReportData): Promise<Blob> => {
  try {
    // Get the template
    const template = await getTemplateById(templateId);
    if (!template) {
      throw new Error('Template não encontrado');
    }

    // Replace variables in the template
    const html = replaceVariables(template.content, data);

    // Create a new JSZip instance
    const zip = new JSZip();

    // Add required files for a minimal DOCX document

    // Add content types
    zip.file('[Content_Types].xml', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
        <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
        <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
      </Types>
    `);

    // Add relationships
    zip.file('_rels/.rels', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
        <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
      </Relationships>
    `);

    // Add document relationships
    zip.file('word/_rels/document.xml.rels', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
      </Relationships>
    `);

    // Add core properties
    zip.file('docProps/core.xml', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" 
                         xmlns:dc="http://purl.org/dc/elements/1.1/" 
                         xmlns:dcterms="http://purl.org/dc/terms/" 
                         xmlns:dcmitype="http://purl.org/dc/dcmitype/" 
                         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <dc:title>Relatório de Vistoria Técnica</dc:title>
        <dc:creator>Brasilit - Sistema de Vistorias</dc:creator>
        <dc:description>Relatório de vistoria técnica gerado pelo sistema Brasilit</dc:description>
        <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
        <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
      </cp:coreProperties>
    `);

    // Add app properties
    zip.file('docProps/app.xml', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" 
                  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
        <Application>Brasilit - Sistema de Vistorias</Application>
        <AppVersion>1.0.0</AppVersion>
      </Properties>
    `);

    // Add styles
    zip.file('word/styles.xml', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:style w:type="paragraph" w:styleId="Title">
          <w:name w:val="Title"/>
          <w:pPr>
            <w:jc w:val="center"/>
            <w:spacing w:before="240" w:after="240"/>
          </w:pPr>
          <w:rPr>
            <w:b/>
            <w:sz w:val="36"/>
          </w:rPr>
        </w:style>
        <w:style w:type="paragraph" w:styleId="Heading1">
          <w:name w:val="Heading 1"/>
          <w:pPr>
            <w:spacing w:before="240" w:after="120"/>
          </w:pPr>
          <w:rPr>
            <w:b/>
            <w:sz w:val="28"/>
          </w:rPr>
        </w:style>
        <w:style w:type="paragraph" w:styleId="Heading2">
          <w:name w:val="Heading 2"/>
          <w:pPr>
            <w:spacing w:before="240" w:after="120"/>
          </w:pPr>
          <w:rPr>
            <w:b/>
            <w:sz w:val="26"/>
          </w:rPr>
        </w:style>
        <w:style w:type="paragraph" w:styleId="Normal">
          <w:name w:val="Normal"/>
          <w:pPr>
            <w:spacing w:after="120"/>
          </w:pPr>
          <w:rPr>
            <w:sz w:val="24"/>
          </w:rPr>
        </w:style>
      </w:styles>
    `);

    // Convert HTML to simplified DOCX XML
    // This is a very simplified conversion - in a real app, you would use a proper HTML to DOCX converter
    const paragraphs = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>$1</w:t></w:r></w:p>')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>$1</w:t></w:r></w:p>')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>$1</w:t></w:r></w:p>')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '<w:p><w:pPr><w:pStyle w:val="Normal"/></w:pPr><w:r><w:t>$1</w:t></w:r></w:p>')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '<w:r><w:rPr><w:b/></w:rPr><w:t>$1</w:t></w:r>')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '<w:r><w:rPr><w:i/></w:rPr><w:t>$1</w:t></w:r>')
      .replace(/<div[^>]*>(.*?)<\/div>/gi, '<w:p><w:pPr><w:pStyle w:val="Normal"/></w:pPr><w:r><w:t>$1</w:t></w:r></w:p>')
      .replace(/<br\s*\/?>/gi, '<w:br/>')
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '<w:p><w:pPr><w:pStyle w:val="Normal"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t>$1</w:t></w:r></w:p>')
      // Remove any remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Escape XML special characters
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    // Create the document.xml file
    zip.file('word/document.xml', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Title"/>
            </w:pPr>
            <w:r>
              <w:t>RELATÓRIO DE VISTORIA TÉCNICA</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Heading1"/>
            </w:pPr>
            <w:r>
              <w:t>1. INFORMAÇÕES GERAIS</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Data da Vistoria: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.dataVistoria || 'Não informada'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Data de Abertura do Protocolo: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.dataProtocolo || 'Não informada'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Cliente: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.cliente || 'Não informado'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Empreendimento: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.empreendimento || 'Não informado'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Endereço: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.endereco || 'Não informado'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Cidade/Estado: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.cidade || 'Não informada'}/${data.estado || 'Não informado'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Protocolo FAR: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.protocolo || 'Não informado'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Assunto: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.assunto || 'Não informado'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Heading1"/>
            </w:pPr>
            <w:r>
              <w:t>2. EQUIPE TÉCNICA</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Técnico Responsável: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.tecnico || 'Não informado'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Departamento: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.departamento || 'Assistência Técnica'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Unidade: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.unidade || 'PR'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Coordenador Responsável: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.coordenador || 'Marlon Weingartner'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Gerente Responsável: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.gerente || 'Não informado'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>Regional: </w:t>
            </w:r>
            <w:r>
              <w:t>${data.regional || 'Sul'}</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Heading1"/>
            </w:pPr>
            <w:r>
              <w:t>3. ANÁLISE TÉCNICA</w:t>
            </w:r>
          </w:p>

          ${data.naoConformidades && data.naoConformidades.length > 0 
            ? data.naoConformidades.map(nc => `
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Heading2"/>
                </w:pPr>
                <w:r>
                  <w:t>${nc.id}. ${nc.name}</w:t>
                </w:r>
              </w:p>

              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Normal"/>
                </w:pPr>
                <w:r>
                  <w:t>${nc.description}</w:t>
                </w:r>
              </w:p>

              ${nc.notes ? `
                <w:p>
                  <w:pPr>
                    <w:pStyle w:val="Normal"/>
                  </w:pPr>
                  <w:r>
                    <w:rPr><w:i/></w:rPr>
                    <w:t>Observações: ${nc.notes}</w:t>
                  </w:r>
                </w:p>
              ` : ''}
            `).join('')
            : `
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Normal"/>
                </w:pPr>
                <w:r>
                  <w:t>Nenhuma não conformidade identificada.</w:t>
                </w:r>
              </w:p>
            `
          }

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Heading1"/>
            </w:pPr>
            <w:r>
              <w:t>4. CONCLUSÃO</w:t>
            </w:r>
          </w:p>

          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
            </w:pPr>
            <w:r>
              <w:t>Após análise técnica, concluímos que o resultado da vistoria é </w:t>
            </w:r>
            <w:r>
              <w:rPr><w:b/></w:rPr>
              <w:t>IMPROCEDENTE</w:t>
            </w:r>
            <w:r>
              <w:t> pelos seguintes motivos:</w:t>
            </w:r>
          </w:p>

          ${data.naoConformidades && data.naoConformidades.length > 0 
            ? data.naoConformidades.map((nc, index) => `
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Normal"/>
                  <w:numPr>
                    <w:ilvl w:val="0"/>
                    <w:numId w:val="1"/>
                  </w:numPr>
                </w:pPr>
                <w:r>
                  <w:t>${nc.name}</w:t>
                </w:r>
              </w:p>
            `).join('')
            : `
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Normal"/>
                  <w:numPr>
                    <w:ilvl w:val="0"/>
                    <w:numId w:val="1"/>
                  </w:numPr>
                </w:pPr>
                <w:r>
                  <w:t>Não foram identificadas não conformidades.</w:t>
                </w:r>
              </w:p>
            `
          }
        </w:body>
      </w:document>
    `);

    // Generate the DOCX file
    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

// Download the report
export const downloadReport = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
