'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onClose: () => void;
}

export function QrScanner({ onScanSuccess, onScanError, onClose }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraPermissionDenied, setIsCameraPermissionDenied] = useState<boolean>(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-container';

  useEffect(() => {
    // Initialize scanner
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(scannerContainerId);
    }

    // Cleanup function to stop scanner when component unmounts
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop()
          .catch(error => {
            console.error('Error stopping scanner:', error);
          });
      }
      scannerRef.current = null;
    };
  }, [isScanning]);

  const startScanner = () => {
    if (!scannerRef.current) return;
    
    setIsScanning(true);
    setErrorMessage(null);

    const qrSuccessCallback = (decodedText: string) => {
      // Handle successful scan
      if (scannerRef.current) {
        scannerRef.current.stop()
          .then(() => {
            setIsScanning(false);
            
            // Check if the QR code is a URL
            try {
              const url = new URL(decodedText);
              // Pass the scanned content to the parent component
              onScanSuccess(decodedText);
            } catch (error) {
              setErrorMessage('Invalid QR code. Please scan a valid Solana Pay QR code.');
              if (onScanError) onScanError('Invalid QR code format');
            }
          })
          .catch(error => {
            console.error('Error stopping scanner:', error);
          });
      }
    };

    const qrErrorCallback = (error: any) => {
      // Only show user-friendly errors, not every frame error
      if (error?.name === 'NotAllowedError') {
        setIsCameraPermissionDenied(true);
        setIsScanning(false);
        setErrorMessage('Camera access denied. Please allow camera access to scan QR codes.');
        if (onScanError) onScanError('Camera permission denied');
      }
    };

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scannerRef.current.start(
      { facingMode: 'environment' }, // Use back camera if available
      config,
      qrSuccessCallback,
      qrErrorCallback
    ).catch(error => {
      if (error.name === 'NotAllowedError') {
        setIsCameraPermissionDenied(true);
        setErrorMessage('Camera access denied. Please allow camera access to scan QR codes.');
        if (onScanError) onScanError('Camera permission denied');
      } else {
        setErrorMessage(`Error starting scanner: ${error.message}`);
        if (onScanError) onScanError(error.message);
      }
      setIsScanning(false);
    });
  };

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current.stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch(error => {
          console.error('Error stopping scanner:', error);
        });
    }
  };

  return (
    <Card className="p-4 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Scan QR Code</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Position the QR code within the frame to scan it automatically
          </p>
        </div>

        {/* QR Scanner Container */}
        <div 
          id={scannerContainerId} 
          className={`aspect-square max-w-sm mx-auto border-2 border-dashed rounded-lg flex items-center justify-center
            ${isScanning ? 'border-primary' : 'border-border'}
            ${isCameraPermissionDenied ? 'bg-red-100/10' : 'bg-gray-100/5'}`}
        >
          {!isScanning && !isCameraPermissionDenied && (
            <div className="text-center p-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 mx-auto text-muted-foreground mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <p className="text-sm text-muted-foreground">Camera will appear here</p>
            </div>
          )}
          
          {isCameraPermissionDenied && (
            <div className="text-center p-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 mx-auto text-red-500 mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-500">Camera access denied. Please check your browser settings.</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-center text-red-500 text-sm p-2">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 justify-center">
          {!isScanning ? (
            <Button 
              onClick={startScanner} 
              className="bg-white text-black hover:bg-slate-100"
              disabled={isCameraPermissionDenied}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Start Camera
            </Button>
          ) : (
            <Button 
              onClick={stopScanner} 
              variant="destructive"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Stop Scanning
            </Button>
          )}
          
          <Button 
            onClick={onClose} 
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
