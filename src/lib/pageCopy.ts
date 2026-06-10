export function genericizePageCopy(html: string): string {
  return html
    .replaceAll("<b>Interview angle:</b>", "<b>Where this bites you:</b>")
    .replaceAll("classic TI system-design question", "classic system-design question")
    .replaceAll("TI EnergyTrace", "a power profiler")
    .replaceAll("your CV claims circular DMA on UART/ADC", "UART/ADC DMA often works until load rises")
    .replaceAll("this question maps directly onto your Milwaukee Tool BSP work", "this question maps directly onto real BSP work")
    .replaceAll("Zephyr is your flagged gap.", "Zephyr can be unfamiliar until you have used the build pipeline directly.")
    .replaceAll("TI's CC13xx/CC26xx push Thread + Matter hard.", "Thread + Matter-capable wireless MCUs rely on these behaviors.")
    .replaceAll("TI Packet Sniffer 2 / nRF Sniffer + Wireshark", "a BLE packet sniffer plus protocol logs")
    .replaceAll("On TI parts", "On many wireless MCUs")
    .replaceAll("TI level", "silicon-vendor level")
    .replaceAll("TI's proprietary RF firmware", "controller RF firmware");
}
