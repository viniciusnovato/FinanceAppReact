import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  label?: string;
  value: string;
  onDateChange: (date: string) => void;
  error?: string;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onDateChange,
  error,
  placeholder = 'Selecione uma data',
  mode = 'date',
  minimumDate,
  maximumDate,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Converte string para Date ou usa data atual se vazio
  const getDateValue = (): Date => {
    if (!value) return new Date();
    
    // Tenta converter diferentes formatos de data
    const dateFormats = [
      // DD/MM/YYYY
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{2})-(\d{2})$/,
    ];

    for (const format of dateFormats) {
      const match = value.match(format);
      if (match) {
        if (format.source.includes('(\\d{2})\\/(\\d{2})\\/(\\d{4})')) {
          // DD/MM/YYYY format
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (format.source.includes('(\\d{4})-(\\d{2})-(\\d{2})')) {
          // YYYY-MM-DD format
          const [, year, month, day] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
    }

    // Se não conseguir converter, tenta criar Date diretamente
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // Formata Date para string DD/MM/YYYY
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Formata Date para string HH:MM
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Formata Date para string DD/MM/YYYY HH:MM
  const formatDateTime = (date: Date): string => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  const getFormattedValue = (): string => {
    if (!value) return '';
    
    const date = getDateValue();
    switch (mode) {
      case 'time':
        return formatTime(date);
      case 'datetime':
        return formatDateTime(date);
      default:
        return formatDate(date);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      let formattedDate: string;
      switch (mode) {
        case 'time':
          formattedDate = formatTime(selectedDate);
          break;
        case 'datetime':
          formattedDate = formatDateTime(selectedDate);
          break;
        default:
          formattedDate = formatDate(selectedDate);
          break;
      }
      onDateChange(formattedDate);
    }
  };

  const openPicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  // Funções do calendário
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[date.getMonth()];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = formatDate(selectedDate);
    onDateChange(formattedDate);
    setShowPicker(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Dias vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.emptyDay} />
      );
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = value && getDateValue().getDate() === day && 
                        getDateValue().getMonth() === currentDate.getMonth() &&
                        getDateValue().getFullYear() === currentDate.getFullYear();
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayButton, isSelected && styles.selectedDay]}
          onPress={() => selectDate(day)}
        >
          <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Pressable
        style={({ pressed }) => [
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled,
          pressed && !disabled && styles.inputPressed,
        ]}
        onPress={openPicker}
        disabled={disabled}
      >
        <Text style={[
          styles.inputText,
          !value && styles.placeholderText,
          disabled && styles.disabledText,
        ]}>
          {getFormattedValue() || placeholder}
        </Text>
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={disabled ? '#94A3B8' : '#64748B'} 
        />
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal para Web */}
      {showPicker && Platform.OS === 'web' && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={closePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecionar Data</Text>
              
              {/* Cabeçalho do calendário */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={() => navigateMonth('prev')}
                >
                  <Ionicons name="chevron-back" size={20} color="#374151" />
                </TouchableOpacity>
                
                <Text style={styles.monthYear}>
                  {getMonthName(currentDate)} {currentDate.getFullYear()}
                </Text>
                
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={() => navigateMonth('next')}
                >
                  <Ionicons name="chevron-forward" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Dias da semana */}
              <View style={styles.weekDays}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>

              {/* Grid do calendário */}
              <View style={styles.calendarGrid}>
                {renderCalendar()}
              </View>
              
              <TextInput
                style={styles.dateInput}
                value={value}
                onChangeText={(text) => {
                  // Formatar automaticamente DD/MM/YYYY
                  let formatted = text.replace(/\D/g, '');
                  if (formatted.length >= 2) {
                    formatted = formatted.substring(0, 2) + '/' + formatted.substring(2);
                  }
                  if (formatted.length >= 5) {
                    formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9);
                  }
                  onDateChange(formatted);
                }}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={closePicker}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  onPress={closePicker}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* DateTimePicker para Mobile */}
      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={getDateValue()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          {...(Platform.OS === 'ios' && {
            onTouchCancel: closePicker,
          })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  inputPressed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#3B82F6',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  disabledText: {
    color: '#94A3B8',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Estilos do calendário
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    width: 32,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  emptyDay: {
    width: '14.28%',
    height: 40,
  },
  dayButton: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    margin: 1,
  },
  selectedDay: {
    backgroundColor: '#3B82F6',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default DatePicker;