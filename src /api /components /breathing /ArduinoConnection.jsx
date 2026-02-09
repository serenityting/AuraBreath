import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Usb, Wifi, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ArduinoConnection({ onConnect, onDisconnect, isConnected, connectionType }) {
  const [serialPort, setSerialPort] = useState('');
  const [wsUrl, setWsUrl] = useState('ws://192.168.1.100:81');
  const [mode, setMode] = useState('websocket'); // 'serial' or 'websocket'

  const handleConnect = () => {
    if (mode === 'websocket') {
      onConnect({ type: 'websocket', url: wsUrl });
    } else {
      onConnect({ type: 'serial', port: serialPort });
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        {isConnected ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-400" />
        )}
        Arduino Connection
      </h3>

      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === 'websocket' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('websocket')}
          className={mode === 'websocket' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}
        >
          <Wifi className="w-4 h-4 mr-2" />
          WebSocket
        </Button>
        <Button
          variant={mode === 'serial' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('serial')}
          className={mode === 'serial' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}
        >
          <Usb className="w-4 h-4 mr-2" />
          Serial
        </Button>
      </div>

      {mode === 'websocket' ? (
        <div className="space-y-3">
          <Input
            placeholder="ws://192.168.1.100:81"
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
            className="bg-slate-900 border-slate-600 text-white"
          />
          <p className="text-xs text-slate-400">
            Enter your Arduino's WebSocket server address
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Click connect to select your Arduino's serial port
          </p>
          <p className="text-xs text-slate-400">
            Requires Web Serial API support (Chrome/Edge)
          </p>
        </div>
      )}

      <div className="mt-4">
        {isConnected ? (
          <Button 
            onClick={onDisconnect}
            variant="outline"
            className="w-full border-red-500 text-red-400 hover:bg-red-500/20"
          >
            Disconnect
          </Button>
        ) : (
          <Button 
            onClick={handleConnect}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            Connect to Arduino
          </Button>
        )}
      </div>
    </Card>
  );
}
