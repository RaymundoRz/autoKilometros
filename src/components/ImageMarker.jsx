import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";

const ImageMarker = ({ imageUrl, onAreasSelected }) => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [rectangles, setRectangles] = useState([]);

    useEffect(() => {
        // Inicializar el canvas de Fabric.js
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: "#f0f0f0",
        });

        setCanvas(fabricCanvas);

        // Evento para agregar un rectángulo
        fabricCanvas.on("mouse:down", (event) => {
            if (event.target) return; // Ignorar si se hace clic sobre un objeto

            const pointer = fabricCanvas.getPointer(event.e);
            const rect = new fabric.Rect({
                left: pointer.x,
                top: pointer.y,
                width: 100,
                height: 100,
                fill: "rgba(0, 0, 255, 0.3)",
                stroke: "blue",
                strokeWidth: 2,
            });

            fabricCanvas.add(rect);
            setRectangles((prev) => [...prev, rect]);
        });

        return () => {
            fabricCanvas.dispose();
        };
    }, []);

    useEffect(() => {
        // Cargar la imagen en el canvas
        if (canvas && imageUrl) {
            fabric.Image.fromURL(imageUrl, (img) => {
                img.scaleToWidth(canvas.width);
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            });
        }
    }, [canvas, imageUrl]);

    const handleExportAreas = () => {
        // Exportar las coordenadas de los rectángulos
        const areas = rectangles.map((rect) => ({
            left: rect.left,
            top: rect.top,
            width: rect.width * rect.scaleX,
            height: rect.height * rect.scaleY,
        }));

        onAreasSelected(areas);
    };

    return (
        <div className="flex flex-col items-center">
            <canvas ref={canvasRef} />
            <button
                onClick={handleExportAreas}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Export Selected Areas
            </button>
        </div>
    );
};

export default ImageMarker;
