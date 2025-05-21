'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// Using a simple div with animation for spinner to avoid import issues
// This will be replaced by the Spinner component once TS resolves its module imports

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onClose: () => void;
}

export function QrScanner({ onScanSuccess, onScanError, onClose }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraPermissionDenied, setIsCameraPermissionDenied] = useState<boolean>(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerStateRef = useRef<Html5QrcodeScannerState | null>(null);
  const scannerContainerId = 'qr-scanner-container';
  
  // Safe scanner state checker
  const isScannerActive = useCallback(() => {
    if (!scannerRef.current) return false;
    try {
      return scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING;
    } catch (error) {
      console.warn('Error checking scanner state:', error);
      return false;
    }
  }, []);

  // Initialize scanner on component mount
  useEffect(() => {
    try {
      if (!scannerRef.current) {
        console.log('Creating QR scanner instance...');
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }
    } catch (error) {
      console.error('Error creating scanner instance:', error);
      setErrorMessage('Failed to initialize scanner');
    }
    
    // Clean up on unmount
    return () => {
      // Only attempt to stop the scanner if the reference exists
      if (scannerRef.current) {
        try {
          // Use the state tracking from the library itself to be 100% sure
          const currentState = scannerRef.current.getState();
          scannerStateRef.current = currentState;
          
          if (currentState === Html5QrcodeScannerState.SCANNING) {
            console.log('Stopping active scanner on unmount (verified state)...');
            scannerRef.current.stop()
              .then(() => {
                console.log('Scanner stopped successfully on unmount');
              })
              .catch(e => {
                // This should never happen now with our state checks
                console.warn('Warning stopping scanner on unmount:', e);
              });
          } else {
            console.log(`Scanner in state ${currentState}, no need to stop on unmount`);
          }
        } catch (error) {
          // Just log any other errors without failing
          console.warn('Warning during scanner cleanup:', error);
        } finally {
          // Always clear the references
          scannerRef.current = null;
          scannerStateRef.current = null;
          setIsScanning(false);
        }
      }
    };
  }, []); // No dependencies needed

  const startScanner = async () => {
    if (!scannerRef.current) {
      setErrorMessage('Scanner not initialized. Please reload the page.');
      return;
    }
    
    // Reset state
    setErrorMessage(null);
    setIsInitializing(true);
    
    try {

      const qrSuccessCallback = (decodedText: string) => {
        console.log('QR code successfully scanned:', decodedText);
        
        // Process the QR code first to validate it
        let isValid = false;
        try {
          // Validate URL format
          new URL(decodedText);
          isValid = true;
        } catch (error) {
          isValid = false;
        }
        
        // Only try to stop scanner if it's still valid
        if (scannerRef.current) {
          try {
            // Use the state tracking from the library itself
            const currentState = scannerRef.current.getState();
            scannerStateRef.current = currentState;
            
            // First safely update our React state
            setIsScanning(false);
            
            if (currentState === Html5QrcodeScannerState.SCANNING) {
              console.log('Stopping active scanner after QR success (verified state)...');
              
              // Now safely stop the scanner
              scannerRef.current.stop()
                .then(() => {
                  console.log('Scanner stopped successfully after QR scan');
                  // Finally process the result after scanner is stopped
                  if (isValid) {
                    onScanSuccess(decodedText);
                  } else {
                    setErrorMessage('Invalid QR code format. Please scan a valid Solana Pay QR code.');
                    if (onScanError) onScanError('Invalid QR code format');
                  }
                })
                .catch(error => {
                  console.warn('Warning stopping scanner after success:', error);
                  // Still process the result even if stopping fails
                  if (isValid) {
                    onScanSuccess(decodedText);
                  } else {
                    setErrorMessage('Invalid QR code format. Please scan a valid Solana Pay QR code.');
                    if (onScanError) onScanError('Invalid QR code format');
                  }
                });
            } else {
              // Scanner isn't running, just process the result directly
              console.log(`Scanner in state ${currentState}, processing QR result directly`);
              if (isValid) {
                onScanSuccess(decodedText);
              } else {
                setErrorMessage('Invalid QR code format. Please scan a valid Solana Pay QR code.');
                if (onScanError) onScanError('Invalid QR code format');
              }
            }
          } catch (error) {
            console.warn('Warning in QR success handler:', error);
            // Process the result even if there was an error
            if (isValid) {
              onScanSuccess(decodedText);
            } else {
              setErrorMessage('Invalid QR code format. Please scan a valid Solana Pay QR code.');
              if (onScanError) onScanError('Invalid QR code format');
            }
          }
        }
      };

      const qrErrorCallback = (error: unknown) => {
        // Filter out common expected errors during scanning
        const errorStr = String(error);
        
        // These are normal errors that happen when no QR code is in view
        // No need to log or show these to the user
        if (errorStr.includes('No barcode or QR code detected') || 
            errorStr.includes('NotFoundException') ||
            errorStr.includes('No MultiFormat Readers were able to detect the code')) {
          // Don't log these expected errors during normal scanning
          return;
        }
        
        // Log unexpected errors
        console.error('QR scan error:', error);
        
        // Type guard to check if error is an object with name property
        // Use proper type checking before accessing properties
        if (error && typeof error === 'object' && 'name' in error) {
          // Now TypeScript knows error has a name property
          const errorWithName = error as { name: string };
          
          if (errorWithName.name === 'NotAllowedError') {
            setIsCameraPermissionDenied(true);
            setIsScanning(false);
            setIsInitializing(false);
            setErrorMessage('Camera access denied. Please allow camera access to scan QR codes.');
            if (onScanError) onScanError('Camera permission denied');
          }
        }
      };

      // Configuration for HTML5QrCode scanner
      const config = {
        fps: 10,
        // qrbox is the scan area size - this is a valid property name from the library
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      };

      console.log('Starting QR scanner with config:', config);
      
      // Start the scanner
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' }, // Use back camera if available
          config,
          qrSuccessCallback,
          qrErrorCallback
        );
        
        setIsScanning(true);
        setIsInitializing(false);
        console.log('QR scanner started successfully');
        
      } catch (error: unknown) { // Using type narrowing instead of any
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('Failed to start scanner:', error);
        setIsInitializing(false);
        
        // Type checking before accessing error.name
        if (typeof error === 'object' && error !== null && 'name' in error && (error as { name: string }).name === 'NotAllowedError') {
          setIsCameraPermissionDenied(true);
          setErrorMessage('Camera access denied. Please allow camera access to scan QR codes.');
          if (onScanError) onScanError('Camera permission denied');
        } else {
          setErrorMessage(`Error starting scanner: ${errorMessage}`);
          if (onScanError) onScanError(errorMessage);
        }
      }
    } catch (e: unknown) { // Using unknown instead of any
      console.error('Exception in startScanner:', e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      setErrorMessage(`Failed to initialize camera: ${errorMsg}`);
      setIsInitializing(false);
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) {
      setIsScanning(false);
      return;
    }
    
    try {
      // First check if scanner is actually running using the library's state
      const currentState = scannerRef.current.getState();
      scannerStateRef.current = currentState;
      
      // Always update UI state first
      setIsScanning(false);
      setErrorMessage('Stopping camera...');
      
      if (currentState === Html5QrcodeScannerState.SCANNING) {
        console.log('Stopping active scanner (verified state)...');
        // Then stop the scanner
        await scannerRef.current.stop();
        console.log('QR scanner stopped successfully');
      } else {
        console.log(`Scanner in state ${currentState}, no need to stop`);
      }
      
      // Always clear the error message
      setErrorMessage(null);
      
    } catch (error) {
      console.warn('Warning stopping scanner:', error);
      setErrorMessage(null); // Still clear the message even if there was an error
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
        <div className="relative">
          <div 
            id={scannerContainerId} 
            className={`aspect-square max-w-sm mx-auto border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden
              ${isScanning ? 'border-primary' : 'border-border'}
              ${isCameraPermissionDenied ? 'bg-red-100/10' : 'bg-gray-100/5'}`}
            style={{ height: '300px', width: '300px' }}
          />
          
          {/* Loading Overlay */}
          {isInitializing && (
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center z-10">
              <div className="text-center p-4">
                <div className="mx-auto mb-3">
                  <div className="inline-block animate-spin rounded-full border-3 border-solid border-current border-r-transparent h-8 w-8" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                </div>
                <p className="text-sm text-white">Initializing camera...</p>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!isScanning && !isInitializing && !isCameraPermissionDenied && (
            <div className="absolute inset-0 flex items-center justify-center">
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
            </div>
          )}
          
          {/* Active Scanning Indicator */}
          {isScanning && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-2 rounded text-sm text-center z-20">
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span>Scanning for QR code...</span>
              </div>
            </div>
          )}
          
          {/* Permission Denied State */}
          {isCameraPermissionDenied && (
            <div className="absolute inset-0 flex items-center justify-center">
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
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && !isInitializing && (
          <div className="text-center text-red-500 text-sm p-2">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 justify-center">
          {!isScanning && !isInitializing ? (
            <Button 
              onClick={() => startScanner()} 
              className="bg-white text-black hover:bg-slate-100"
              disabled={isCameraPermissionDenied || isInitializing}
              type="button"
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
          ) : isScanning ? (
            <Button 
              onClick={() => stopScanner()} 
              variant="destructive"
              type="button"
              disabled={isInitializing}
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
          ) : (
            <Button 
              disabled
              className="bg-white text-black opacity-50"
              type="button"
            >
              <div className="inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent h-4 w-4 mr-2" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              Initializing...
            </Button>
          )}
          
          <Button 
            onClick={() => onClose()} 
            variant="outline"
            type="button"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
