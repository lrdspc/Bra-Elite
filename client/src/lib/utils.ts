import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  return new Date(date).toLocaleDateString('pt-BR', options || defaultOptions);
}

export function formatTime(date: Date | string | undefined): string {
  if (!date) return '';
  
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '';
  
  const dateStr = formatDate(date);
  const timeStr = formatTime(date);
  
  return `${dateStr}, ${timeStr}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDocumentNumber(doc: string | undefined): string {
  if (!doc) return '';
  
  // Format CNPJ: 12.345.678/0001-90
  if (doc.length === 14 || doc.replace(/\D/g, '').length === 14) {
    const numbers = doc.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  
  // Format CPF: 123.456.789-10
  if (doc.length === 11 || doc.replace(/\D/g, '').length === 11) {
    const numbers = doc.replace(/\D/g, '');
    return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  
  return doc;
}

export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return '';
  
  const numbers = phone.replace(/\D/g, '');
  
  // Format mobile: (11) 98765-4321
  if (numbers.length === 11) {
    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  
  // Format landline: (11) 3456-7890
  if (numbers.length === 10) {
    return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  
  return phone;
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}

export function generateProtocolNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  
  return `VT-${year}-${random}`;
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getStatusColor(status: string): string {
  switch(status) {
    case 'completed':
      return 'bg-success/10 text-success';
    case 'in_progress':
      return 'bg-primary/10 text-primary';
    case 'in_review':
      return 'bg-secondary/10 text-secondary';
    case 'draft':
    case 'pending':
      return 'bg-destructive/10 text-destructive';
    case 'scheduled':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function getStatusLabel(status: string): string {
  switch(status) {
    case 'completed':
      return 'Concluída';
    case 'in_progress':
      return 'Em andamento';
    case 'in_review':
      return 'Em revisão';
    case 'draft':
      return 'Rascunho';
    case 'pending':
      return 'Pendente';
    case 'scheduled':
      return 'Agendada';
    default:
      return status;
  }
}
