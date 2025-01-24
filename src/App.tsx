import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Send } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [size, setSize] = useState('');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_URL_API;

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedImage(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedImage || !text) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('text', text);
    formData.append('size', size);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process image');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Editor de imágenes
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-gray-500">Click para subir imagen</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Text Input */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                Texto para la imagen
              </label>
              <input
                type="text"
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter text to overlay"
              />
            </div>
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                Tamaño del texto
              </label>
              <input
                type="number"
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter text to overlay"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedImage || !text || isLoading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Procesar imagen
                </>
              )}
            </button>
          </form>

          {/* Processed Image Result */}
          {processedImage && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Imagen procesada</h2>
              <img 
                src={processedImage} 
                alt="Processed" 
                className="max-w-full rounded-lg shadow-lg"
              />
              <a
                href={processedImage}
                download="processed-image.png"
                className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
              >
                <ImageIcon className="w-4 h-4" />
                Descargar imagen
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;