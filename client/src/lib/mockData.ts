import { addDays, subDays } from 'date-fns';

// Mock inspections data with coordinates for map testing
export const mockInspections = [
  {
    id: '1',
    projectId: '101',
    projectName: 'Residencial Jardim das Flores',
    clientId: '201',
    clientName: 'João Silva',
    status: 'scheduled',
    scheduledDate: addDays(new Date(), 2).toISOString(),
    protocolDate: subDays(new Date(), 5).toISOString(),
    protocolNumber: 'PROT-2025-001',
    address: 'Rua das Flores, 123',
    city: 'Curitiba',
    state: 'PR',
    latitude: -25.4284, // Curitiba
    longitude: -49.2733,
    roofModel: 'Ondulada 6mm CRFS',
    area: 120,
    technicalAnalysis: [
      {
        id: 'nc3',
        name: 'Corte de Canto Incorreto ou Ausente',
        description: 'Ausência da remoção do quadrado de 11x11cm nos cantos onde há sobreposição de telhas.',
        notes: 'Verificado em 30% das telhas instaladas.'
      }
    ]
  },
  {
    id: '2',
    projectId: '102',
    projectName: 'Comercial Centro Empresarial',
    clientId: '202',
    clientName: 'Empresa ABC Ltda',
    status: 'scheduled',
    scheduledDate: addDays(new Date(), 1).toISOString(),
    protocolDate: subDays(new Date(), 12).toISOString(),
    protocolNumber: 'PROT-2025-002',
    address: 'Av. Cândido de Abreu, 500',
    city: 'Curitiba',
    state: 'PR',
    latitude: -25.4195, // Curitiba - Centro Cívico
    longitude: -49.2640,
    roofModel: 'TopComfort 8mm',
    area: 350,
    technicalAnalysis: [
      {
        id: 'nc5',
        name: 'Fixação Irregular das Telhas',
        description: 'Uso de fixadores incompatíveis, quantidade insuficiente ou posicionamento incorreto dos parafusos/ganchos.',
        notes: 'Parafusos oxidados e em quantidade insuficiente.'
      },
      {
        id: 'nc10',
        name: 'Recobrimento Incorreto',
        description: 'Sobreposição longitudinal ou lateral insuficiente entre telhas adjacentes, comprometendo a estanqueidade.',
        notes: 'Sobreposição de apenas 10cm, quando o recomendado é 14cm.'
      }
    ]
  },
  {
    id: '3',
    projectId: '103',
    projectName: 'Industrial Parque das Indústrias',
    clientId: '203',
    clientName: 'Indústria XYZ S.A.',
    status: 'scheduled',
    scheduledDate: addDays(new Date(), 3).toISOString(),
    protocolDate: subDays(new Date(), 28).toISOString(),
    protocolNumber: 'PROT-2025-003',
    address: 'Rodovia BR-277, Km 15',
    city: 'São José dos Pinhais',
    state: 'PR',
    latitude: -25.5270, // São José dos Pinhais
    longitude: -49.1711,
    roofModel: 'Ondulada 8mm CRFS',
    area: 1200,
    technicalAnalysis: [
      {
        id: 'nc6',
        name: 'Inclinação da Telha Inferior ao Recomendado',
        description: 'Caimento abaixo do mínimo especificado pelo fabricante (15° para onduladas, 10° para estruturais).',
        notes: 'Inclinação medida de 8°, abaixo do mínimo recomendado.'
      }
    ]
  },
  {
    id: '4',
    projectId: '104',
    projectName: 'Residencial Parque Verde',
    clientId: '204',
    clientName: 'Maria Oliveira',
    status: 'scheduled',
    scheduledDate: addDays(new Date(), 5).toISOString(),
    protocolDate: subDays(new Date(), 8).toISOString(),
    protocolNumber: 'PROT-2025-004',
    address: 'Rua das Araucárias, 789',
    city: 'Curitiba',
    state: 'PR',
    latitude: -25.4444, // Curitiba - Bairro fictício
    longitude: -49.2933,
    roofModel: 'TopComfort 6mm',
    area: 90,
    technicalAnalysis: []
  },
  {
    id: '5',
    projectId: '105',
    projectName: 'Comercial Shopping Center',
    clientId: '205',
    clientName: 'Shopping Center Ltda',
    status: 'scheduled',
    scheduledDate: addDays(new Date(), 4).toISOString(),
    protocolDate: subDays(new Date(), 18).toISOString(),
    protocolNumber: 'PROT-2025-005',
    address: 'Av. Iguaçu, 3000',
    city: 'Curitiba',
    state: 'PR',
    latitude: -25.4484, // Curitiba - Água Verde
    longitude: -49.2933,
    roofModel: 'Ondulada 6mm CRFS',
    area: 2500,
    technicalAnalysis: [
      {
        id: 'nc1',
        name: 'Armazenagem Incorreta',
        description: 'Telhas estocadas em local inadequado, sem proteção contra intempéries, empilhamento incorreto ou altura excessiva.',
        notes: 'Telhas de reposição armazenadas em local exposto à chuva.'
      }
    ]
  }
];

// Mock clients data
export const mockClients = [
  {
    id: '201',
    name: 'João Silva',
    email: 'joao.silva@example.com',
    phone: '(41) 99999-1111',
    address: 'Rua das Flores, 123',
    city: 'Curitiba',
    state: 'PR'
  },
  {
    id: '202',
    name: 'Empresa ABC Ltda',
    email: 'contato@empresaabc.com',
    phone: '(41) 3333-4444',
    address: 'Av. Cândido de Abreu, 500',
    city: 'Curitiba',
    state: 'PR'
  },
  {
    id: '203',
    name: 'Indústria XYZ S.A.',
    email: 'contato@industriaxyz.com',
    phone: '(41) 3333-5555',
    address: 'Rodovia BR-277, Km 15',
    city: 'São José dos Pinhais',
    state: 'PR'
  },
  {
    id: '204',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@example.com',
    phone: '(41) 99999-2222',
    address: 'Rua das Araucárias, 789',
    city: 'Curitiba',
    state: 'PR'
  },
  {
    id: '205',
    name: 'Shopping Center Ltda',
    email: 'contato@shoppingcenter.com',
    phone: '(41) 3333-6666',
    address: 'Av. Iguaçu, 3000',
    city: 'Curitiba',
    state: 'PR'
  }
];

// Mock projects data
export const mockProjects = [
  {
    id: '101',
    name: 'Residencial Jardim das Flores',
    clientId: '201',
    address: 'Rua das Flores, 123',
    city: 'Curitiba',
    state: 'PR',
    type: 'Residencial'
  },
  {
    id: '102',
    name: 'Comercial Centro Empresarial',
    clientId: '202',
    address: 'Av. Cândido de Abreu, 500',
    city: 'Curitiba',
    state: 'PR',
    type: 'Comercial'
  },
  {
    id: '103',
    name: 'Industrial Parque das Indústrias',
    clientId: '203',
    address: 'Rodovia BR-277, Km 15',
    city: 'São José dos Pinhais',
    state: 'PR',
    type: 'Industrial'
  },
  {
    id: '104',
    name: 'Residencial Parque Verde',
    clientId: '204',
    address: 'Rua das Araucárias, 789',
    city: 'Curitiba',
    state: 'PR',
    type: 'Residencial'
  },
  {
    id: '105',
    name: 'Comercial Shopping Center',
    clientId: '205',
    address: 'Av. Iguaçu, 3000',
    city: 'Curitiba',
    state: 'PR',
    type: 'Comercial'
  }
];