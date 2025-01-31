import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Send } from "lucide-react";

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [size, setSize] = useState("");
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_URL_API;

  const resizeImage = (file: File, maxWidth: number, maxHeight: number, callback: (blob: Blob | null) => void) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(callback, "image/jpeg", 0.8);
    };

    reader.readAsDataURL(file);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    resizeImage(file, 1024, 1024, (blob) => {
      if (!blob) {
        alert("Error al comprimir la imagen.");
        setIsLoading(false);
        return;
      }

      const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
      setSelectedImage(resizedFile);
      setPreviewUrl(URL.createObjectURL(resizedFile));
      setProcessedImage(null);
      setIsLoading(false);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedImage || !text || !size) {
      alert("Por favor, selecciona una imagen, ingresa un texto y un tamaño.");
      return;
    }

    const fontSize = parseInt(size, 10);
    if (isNaN(fontSize) || fontSize <= 0) {
      alert("El tamaño del texto debe ser un número válido mayor que 0.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("text", text);
    formData.append("size", size);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al procesar la imagen.");

      const blob = await response.blob();
      setProcessedImage(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      alert("Hubo un problema al procesar la imagen. Intenta de nuevo.");
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
            {/* Sección de carga de imagen */}
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Vista previa"
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

            {/* Campo de texto */}
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700"
              >
                Texto para la imagen
              </label>
              <input
                type="text"
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Ingresa el texto a superponer"
              />
            </div>

            {/* Campo de tamaño */}
            <div>
              <label
                htmlFor="size"
                className="block text-sm font-medium text-gray-700"
              >
                Tamaño del texto
              </label>
              <input
                type="number"
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Ejemplo: 24"
                min="1"
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={!selectedImage || !text || !size || isLoading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-live="polite"
            >
              {isLoading ? "Procesando..." : <><Send className="w-4 h-4" /> Procesar imagen</>}
            </button>
          </form>

          {/* Imagen procesada */}
          {processedImage && (
            <div className="mt-8 text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Imagen procesada
              </h2>
              <img
                src={processedImage}
                alt="Imagen procesada"
                className="max-w-full rounded-lg shadow-lg mx-auto"
              />
              <a
                href={processedImage}
                download="imagen-procesada.png"
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
