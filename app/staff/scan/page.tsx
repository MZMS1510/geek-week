import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrScanner } from "@/components/qr-scanner";

export default function ScanPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Escanear QR</CardTitle>
      </CardHeader>
      <CardContent>
        <QrScanner />
      </CardContent>
    </Card>
  );
}
