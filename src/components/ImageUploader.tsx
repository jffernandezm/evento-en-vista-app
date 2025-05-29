
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, onImageChange }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      onImageChange(data.publicUrl);
      
      toast({
        title: "¡Imagen subida!",
        description: "La imagen se ha subido exitosamente.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Archivo muy grande",
          description: "La imagen no puede ser mayor a 5MB.",
          variant: "destructive",
        });
        return;
      }
      uploadImage(file);
    }
  };

  const removeImage = () => {
    onImageChange('');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">
        Imagen del Evento
      </label>
      
      {imageUrl ? (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Sube una imagen para tu evento</p>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Subiendo...' : 'Subir Imagen'}
          </Button>
        </div>
        
        <div className="flex-1">
          <Input
            type="url"
            placeholder="O pega URL de imagen"
            value={imageUrl}
            onChange={(e) => onImageChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
