import { renderQrDataUrl } from "@/lib/qr";

export async function QrDisplay({ token }: { token: string }) {
  const dataUrl = await renderQrDataUrl(token);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl bg-white p-4 shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="Your QR code" className="h-64 w-64 md:h-80 md:w-80" />
      </div>
      <code className="text-sm tracking-widest text-muted-foreground">{token}</code>
    </div>
  );
}
