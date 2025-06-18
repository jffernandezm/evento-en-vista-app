
import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content, className = '' }) => {
  const formatText = (text: string) => {
    // Validar que el texto sea una cadena válida
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Convertir **texto** a negrita
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convertir *texto* a cursiva
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convertir saltos de línea
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  // Validar que content sea una cadena antes de procesar
  const safeContent = content || '';

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: formatText(safeContent) }}
    />
  );
};

export default RichTextDisplay;
