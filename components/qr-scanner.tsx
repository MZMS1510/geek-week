"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Html5QrcodeModule = typeof import("html5-qrcode");
type ScannerInstance = InstanceType<Html5QrcodeModule["Html5Qrcode"]>;

const ELEMENT_ID = "qr-scanner-region";
const TOKEN_RE = /^[A-Z2-9]{10}$/;

export function QrScanner() {
  const router = useRouter();
  const scannerRef = useRef<ScannerInstance | null>(null);
  const handledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const mod = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new mod.Html5Qrcode(ELEMENT_ID, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decoded) => {
            const value = decoded.trim().toUpperCase();
            if (handledRef.current) return;
            if (!TOKEN_RE.test(value)) return;
            handledRef.current = true;
            scanner.stop().catch(() => {});
            router.push(`/staff/award/${value}`);
          },
          () => {}
        );
        if (!cancelled) setRunning(true);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Could not access camera. Check permissions.");
      }
    }

    start();
    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop()
          .catch(() => {})
          .then(() => s.clear().catch(() => {}));
      }
    };
  }, [router]);

  return (
    <div className="flex flex-col gap-4">
      <div
        id={ELEMENT_ID}
        className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-black"
      />
      {error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <div className="text-center text-sm text-muted-foreground">
          {running ? "Point the camera at the participant's QR code." : "Starting camera…"}
        </div>
      )}
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="w-full"
      >
        Cancel
      </Button>
    </div>
  );
}
