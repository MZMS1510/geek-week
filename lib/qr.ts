import { customAlphabet } from "nanoid";
import QRCode from "qrcode";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const generateQrToken = customAlphabet(alphabet, 10);

export async function renderQrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
