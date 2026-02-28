'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface IOSDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
}

export function IOSDateTimePicker({ value, onChange, minDate }: IOSDateTimePickerProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentDay = now.getDate().toString().padStart(2, '0');
  const currentHour = now.getHours().toString().padStart(2, '0');
  
  const currentMinute = "00";
  
  const initialDate = value ? value.split('T')[0] : `${currentYear}-${currentMonth}-${currentDay}`;
  const initialTime = value ? value.split('T')[1]?.slice(0, 5) || `${currentHour}:${currentMinute}` : `${currentHour}:${currentMinute}`;
  
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  
  const getDayAndMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0')
    };
  };
  
  const [selectedDay, setSelectedDay] = useState(getDayAndMonth(initialDate).day);
  const [selectedMonth, setSelectedMonth] = useState(getDayAndMonth(initialDate).month);
  
  const [hourPart, minutePart] = selectedTime.split(':');
  
  useEffect(() => {
    if (value) {
      const [dateStr, timeStr] = value.split('T');
      if (dateStr) {
        setSelectedDate(dateStr);
        const dm = getDayAndMonth(dateStr);
        setSelectedDay(dm.day);
        setSelectedMonth(dm.month);
      }
      if (timeStr) {
        setSelectedTime(timeStr.slice(0, 5));
      }
    }
  }, [value]);
  
  const getDaysInMonth = (month: string) => {
    const year = currentYear;
    const monthNum = parseInt(month);
    return new Date(year, monthNum, 0).getDate();
  };

  const generateDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = (i + 1).toString().padStart(2, '0');
      return { value: day, label: day };
    });
  };
  
  const generateMonths = () => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    return months.map((month, index) => ({
      value: (index + 1).toString().padStart(2, '0'),
      label: month
    }));
  };
  
  const generateHours = () => Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: hour, label: hour };
  });
  
  const generateMinutes = () => [0, 15, 30, 45].map(min => ({
    value: min.toString().padStart(2, '0'),
    label: min.toString().padStart(2, '0')
  }));
  
  const days = generateDays();
  const months = generateMonths();
  const hours = generateHours();
  const minutes = generateMinutes();
  
  // When month changes, validate the selected day
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const dayNum = parseInt(selectedDay);
    if (dayNum > daysInMonth) {
      const lastDay = daysInMonth.toString().padStart(2, '0');
      handleDateChange(lastDay, selectedMonth);
    }
  }, [selectedMonth]);
  
  const handleTimeChange = useCallback((newHour: string, newMinute: string) => {
    const newTime = `${newHour}:${newMinute}`;
    setSelectedTime(newTime);
    const combined = `${selectedDate}T${newTime}`;
    onChange(combined);
  }, [selectedDate, onChange]);

  const handleDateChange = useCallback((newDay: string, newMonth: string) => {
    setSelectedDay(newDay);
    setSelectedMonth(newMonth);
    const dateString = `${currentYear}-${newMonth}-${newDay}`;
    const testDate = new Date(dateString);
    if (!isNaN(testDate.getTime())) {
      setSelectedDate(dateString);
      const combined = `${dateString}T${selectedTime}`;
      onChange(combined);
    }
  }, [selectedTime, onChange, currentYear]);
  
  // Picker compatto
  const SimplePicker = ({ 
    items, 
    value, 
    onChange, 
    label,
    width = 'w-20'
  }: { 
    items: { value: string; label: string }[], 
    value: string, 
    onChange: (val: string) => void,
    label: string,
    width?: string
  }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemHeight = 36;
    const containerHeight = 160;
    const centerOffset = (containerHeight - itemHeight) / 2; // 62px
    const [isInitialized, setIsInitialized] = useState(false);
    
    // Trova l'indice selezionato
    const selectedIndex = items.findIndex(item => item.value === value);
    
    // Inizializza la posizione di scroll solo una volta al mount
    useEffect(() => {
      if (scrollContainerRef.current && !isInitialized && selectedIndex !== -1) {
        const container = scrollContainerRef.current;
        const scrollTo = selectedIndex * itemHeight;
        container.scrollTop = scrollTo;
        setIsInitialized(true);
      }
    }, [isInitialized, selectedIndex]);
    
    const handleItemClick = (itemValue: string) => {
      // Aggiorna il valore - lo scroll viene gestito automaticamente dall'useEffect
      onChange(itemValue);
    };
    
    return (
      <div className={`flex flex-col items-center ${width}`}>
        <label className="text-[9px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">{label}</label>
        
        <div className="relative h-[160px] overflow-hidden rounded-xl border border-border/60 bg-muted/30 shadow-inner">
          {/* Lista scrollabile */}
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Padding top per centrare il primo elemento */}
            <div style={{ height: centerOffset }} />
            
            {items.map((item, index) => {
              const isSelected = item.value === value;
              const distance = Math.abs(index - selectedIndex);
              // Se è un numero (giorno, ora, minuto) aggiungi spaziatura per bilanciarlo con le lettere
              const isNumeric = /^\d+$/.test(item.label);
              
              return (
                <div
                  key={item.value}
                  className="h-[36px] flex items-center justify-center cursor-pointer select-none snap-center"
                  onClick={() => handleItemClick(item.value)}
                >
                  <span 
                    className={`font-semibold transition-all duration-150 px-2 py-0.5 rounded-md ${
                      isSelected 
                        ? 'text-primary font-bold bg-primary/15 shadow-sm scale-110 text-[18px]' 
                        : distance === 1 
                          ? 'text-foreground/60 text-[16px]' 
                          : 'text-foreground/30 text-[16px]'
                    }`}
                    style={{ 
                      display: 'inline-block',
                      letterSpacing: isNumeric ? '0.15em' : '0',
                      fontVariantNumeric: isNumeric ? 'tabular-nums' : 'normal'
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
            
            {/* Padding bottom per centrare l'ultimo elemento */}
            <div style={{ height: centerOffset }} />
          </div>
          
          {/* Sfumature */}
          <div className="absolute top-0 left-0 right-0 h-[55px] bg-gradient-to-b from-background via-background/95 to-transparent pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-[55px] bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-20" />
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Data e Ora in due rettangoli separati */}
      
      <div className="flex justify-center items-start gap-2">
        {/* Data */}
        
        <div className="bg-muted/30 rounded-xl p-3 flex flex-col items-center">
          <h3 className="text-[11px] font-bold text-foreground mb-1 uppercase tracking-wide bg-primary/10 px-3 py-1 rounded-full">Data</h3>
          <div className="flex items-center gap-1">
            <SimplePicker
              items={days}
              value={selectedDay}
              onChange={(newDay) => handleDateChange(newDay, selectedMonth)}
              label="Giorno"
              width="w-16"
            />
            <SimplePicker
              items={months}
              value={selectedMonth}
              onChange={(newMonth) => handleDateChange(selectedDay, newMonth)}
              label="Mese"
              width="w-16"
            />
          </div>
        </div>
        
        {/* Ora */}
        
        <div className="bg-muted/30 rounded-xl p-3 flex flex-col items-center">
          <h3 className="text-[11px] font-bold text-foreground mb-1 uppercase tracking-wide bg-primary/10 px-3 py-1 rounded-full">Ora</h3>
          <div className="flex items-center gap-1">
            <SimplePicker
              items={hours}
              value={hourPart || currentHour}
              onChange={(newHour) => handleTimeChange(newHour, minutePart || currentMinute)}
              label="Ore"
              width="w-16"
            />
            <SimplePicker
              items={minutes}
              value={minutePart || currentMinute}
              onChange={(newMinute) => handleTimeChange(hourPart || currentHour, newMinute)}
              label="Min"
              width="w-16"
            />
          </div>
        </div>
      </div>
      
      {/* Anteprima */}
      {selectedDate && (
        <div className="text-center p-2 bg-primary/5 rounded-lg">
          <p className="text-sm font-medium">
            {(new Date(selectedDate + 'T' + selectedTime).toLocaleString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(/(^\w)|(\s\w)/g, (match) => match.toUpperCase()))}
          </p>
        </div>
      )}
    </div>
  );
}
