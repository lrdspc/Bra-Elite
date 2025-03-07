import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '@/lib/utils';

// Calendar libraries
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CalendarPage: React.FC = () => {
  const [view, setView] = useState<'month' | 'list'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  // Fetch inspections
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections'],
  });

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };

  // Filter inspections for the selected day
  const getInspectionsForDate = (date: Date) => {
    if (!inspections) return [];
    
    return inspections.filter((inspection: any) => {
      if (!inspection.scheduledDate) return false;
      return isSameDay(parseISO(inspection.scheduledDate), date);
    });
  };

  // Get inspections for current month to highlight dates with inspections
  const daysWithInspections = React.useMemo(() => {
    if (!inspections) return [];
    
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return daysInMonth.map(day => {
      const hasInspections = inspections.some((inspection: any) => {
        if (!inspection.scheduledDate) return false;
        return isSameDay(parseISO(inspection.scheduledDate), day);
      });
      
      return { date: day, hasInspections };
    }).filter(day => day.hasInspections).map(day => day.date);
  }, [inspections, currentMonth]);

  // Get today's inspections for list view
  const selectedDayInspections = selectedDay ? getInspectionsForDate(selectedDay) : [];

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Calendário</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center">
            <Select
              value={view}
              onValueChange={(value: 'month' | 'list') => setView(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="list">Lista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/inspection/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Vistoria
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
            </div>
            <Button variant="outline" onClick={handleToday}>
              Hoje
            </Button>
          </div>

          {/* Calendar View or List View */}
          {view === 'month' ? (
            <div className="bg-white rounded-md shadow">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md"
                classNames={{
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                }}
                modifiers={{
                  hasInspection: daysWithInspections
                }}
                modifiersClassNames={{
                  hasInspection: "border border-primary text-primary font-semibold"
                }}
                fromMonth={new Date(2020, 0)}
                toMonth={new Date(2030, 11)}
                fixedWeeks
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Vistorias para {selectedDay ? format(selectedDay, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Hoje'}
                </h3>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{selectedDayInspections.length} vistoria(s)</span>
                </Badge>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Carregando vistorias...</p>
                </div>
              ) : selectedDayInspections.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayInspections.map((inspection: any) => (
                    <Link key={inspection.id} href={`/inspection/${inspection.id}`}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium">{inspection.projectName || `Projeto #${inspection.projectId}`}</h3>
                                <Badge className={`ml-2 ${getStatusColor(inspection.status)}`}>
                                  {getStatusLabel(inspection.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {inspection.clientName || `Cliente #${inspection.clientId}`}
                              </p>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(inspection.scheduledDate)}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mt-3 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <User className="h-4 w-4 mr-1" />
                              <span>{inspection.contactName || 'Contato não informado'}</span>
                            </div>
                            {inspection.address && (
                              <div className="flex items-center text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>
                                  {inspection.address}
                                  {inspection.number && `, ${inspection.number}`}
                                  {inspection.city && ` - ${inspection.city}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-md shadow">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">Nenhuma vistoria agendada</h3>
                  <p className="text-muted-foreground mb-4">
                    Não há vistorias agendadas para {selectedDay ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR }) : 'hoje'}
                  </p>
                  <Link href="/inspection/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agendar Vistoria
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Selected Day Inspections when in month view */}
        {view === 'month' && selectedDay && (
          <div className="mt-6">
            <h3 className="font-medium mb-4">
              Vistorias para {format(selectedDay, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            
            {isLoading ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Carregando vistorias...</p>
              </div>
            ) : selectedDayInspections.length > 0 ? (
              <div className="space-y-4">
                {selectedDayInspections.map((inspection: any) => (
                  <Link key={inspection.id} href={`/inspection/${inspection.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{inspection.projectName || `Projeto #${inspection.projectId}`}</h3>
                              <Badge className={`ml-2 ${getStatusColor(inspection.status)}`}>
                                {getStatusLabel(inspection.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {inspection.clientName || `Cliente #${inspection.clientId}`}
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(inspection.scheduledDate)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-md shadow">
                <p className="text-muted-foreground">
                  Não há vistorias agendadas para esta data
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
