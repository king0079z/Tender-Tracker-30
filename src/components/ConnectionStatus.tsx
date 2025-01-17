import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export function ConnectionStatus() {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    error: string | null;
    lastChecked: string;
  }>({
    isConnected: false,
    error: null,
    lastChecked: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/test-db');
        const data = await response.json();
        
        setStatus({
          isConnected: data.success,
          error: data.error || null,
          lastChecked: new Date().toLocaleTimeString()
        });
      } catch (error) {
        setStatus({
          isConnected: false,
          error: 'Failed to connect to the database',
          lastChecked: new Date().toLocaleTimeString()
        });
      }
    };

    // Check connection immediately
    checkConnection();

    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Database Connection Status
          {status.isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last checked:</span>
            <span className="text-sm">{status.lastChecked}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className={`text-sm ${status.isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {status.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {status.error && (
            <Alert variant="destructive">
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{status.error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}