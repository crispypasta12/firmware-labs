export function genericizePageCopy(html: string): string {
  return html
    .replaceAll("<b>Interview angle:</b>", "<b>Where this bites you:</b>")
    .replaceAll("<b>Say this in the interview:</b>", "<b>Engineering takeaway:</b>")
    .replaceAll("<b>Say it like this:</b>", "<b>Engineering takeaway:</b>")
    .replaceAll("<b>The sentence that lands:</b>", "<b>Engineering takeaway:</b>")
    .replaceAll("<b>Facts to drop:</b>", "<b>Field facts:</b>")
    .replaceAll("<b>Three facts to drop:</b>", "<b>Architecture facts:</b>")
    .replaceAll("<b>Checklist to recite:</b>", "<b>Implementation checklist:</b>")
    .replaceAll("<b>Conditions to recite:</b>", "<b>Buffer invariants:</b>")
    .replaceAll("<b>The rule to recite:</b>", "<b>Timing rule:</b>")
    .replaceAll("<b>Recite:</b>", "<b>Scheduling rule:</b>")
    .replaceAll("senior flex", "strong systems answer")
    .replaceAll("what makes the answer senior", "what makes the design robust")
    .replaceAll("The senior answer", "A disciplined answer")
    .replaceAll("<b>The senior framing:</b>", "<b>Architecture framing:</b>")
    .replaceAll("they show you <code>volatile uint32_t counter; counter++;</code> and ask \"is this safe?\"", "a shared <code>volatile uint32_t counter; counter++;</code> appears in code review and the question is whether it is safe")
    .replaceAll("expect \"walk me through it\" and \"what goes wrong?\"", "be ready to explain the data path and the failure mode")
    .replaceAll("favorite interview scenario", "common bring-up failure")
    .replaceAll("classic TI system-design question", "classic system-design question")
    .replaceAll("TI EnergyTrace", "a power profiler")
    .replaceAll("a power profiler (a power profiler)", "a power profiler")
    .replaceAll("your CV claims circular DMA on UART/ADC", "UART/ADC DMA often works until load rises")
    .replaceAll("this question maps directly onto your Milwaukee Tool BSP work", "this question maps directly onto real BSP work")
    .replaceAll("Zephyr is your flagged gap.", "Zephyr can be unfamiliar until you have used the build pipeline directly.")
    .replaceAll("TI's CC13xx/CC26xx push Thread + Matter hard.", "Thread + Matter-capable wireless MCUs rely on these behaviors.")
    .replaceAll("TI Packet Sniffer 2 / nRF Sniffer + Wireshark", "a BLE packet sniffer plus protocol logs")
    .replaceAll("On TI parts", "On many wireless MCUs")
    .replaceAll("TI level", "silicon-vendor level")
    .replaceAll("TI's proprietary RF firmware", "controller RF firmware")
    .replaceAll("<b>CC2340 ships BLE 5.3</b>", "<b>modern BLE 5.3 controllers support subrating</b>")
    .replaceAll("<b>Two you must own for TI:</b>", "<b>Two version features worth knowing:</b>");
}

export function genericizeLabTag(tag: string): string {
  if (tag.startsWith("PDF")) return "Firmware fundamentals";
  if (tag.startsWith("Hub")) return "Guided practice";
  if (tag.includes("JD gap")) return "Build system";
  if (tag.includes("Highest-ROI")) return "Wireless architecture";
  if (tag.includes("Core of the role")) return "BLE timing";
  if (tag.includes("Matter context")) return "Thread / Matter";
  return tag;
}
