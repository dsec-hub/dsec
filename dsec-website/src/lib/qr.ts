import QRCode from "qrcode";

/**
 * Build-time QR generation. Returns an inline SVG string (vector, no network
 * call) themed paper-on-ink so the codes sit inside the pixel cards and stay
 * crisp at any size. Rendered via dangerouslySetInnerHTML on the server - these
 * pages are statically prerendered, so the work happens once at build.
 */
export async function qrSvg(data: string): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: {
      dark: "#0a0714", // --color-ink
      light: "#f5efe2", // --color-paper
    },
  });
}
