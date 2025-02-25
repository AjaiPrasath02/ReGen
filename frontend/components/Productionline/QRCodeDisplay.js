import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from 'semantic-ui-react';

const QRCodeDisplay = ({ cpuQR, serialNumber }) => {
    const handleDownload = () => {
        const svg = document.getElementById("qr-code");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const margin = 10;
        canvas.width = svg.width.baseVal.value + (margin * 2);
        canvas.height = svg.height.baseVal.value + (margin * 2);

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, margin, margin);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `CPU-QR-${serialNumber || "code"}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2>{cpuQR}</h2>
            <h4>CPU QR Code:</h4>
            <div>
                <QRCodeSVG id="qr-code" value={cpuQR} size={256} level="H" />
            </div>
            <div style={{ marginTop: "10px" }}>
                <Button color="green" onClick={handleDownload}>
                    Download QR Code
                </Button>
            </div>
        </div>
    );
};

export default QRCodeDisplay;