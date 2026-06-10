export interface Track {
  slug: string;
  title: string;
  summary: string;
  labNums: string[];
}

export interface LabInfo {
  num: string;
  slug: string;
  title: string;
  track: string;
  description: string;
  maxWidth?: number;
  simplifications: string[];
}

const defaultSimplifications = [
  "Teaching model for review: it emphasizes the failure mode and debugging signal, not every vendor register or stack edge case.",
  "Timing, current, radio, and scheduler numbers are approximate unless the lab explicitly derives them from the controls.",
];

export const tracks: Track[] = [
  {
    slug: "concurrency-rtos",
    title: "Concurrency & RTOS",
    summary: "Race conditions, priority inversion, context switching, and fixed-priority schedulability.",
    labNums: ["01", "02", "20", "21"],
  },
  {
    slug: "memory-machine",
    title: "Memory & Machine",
    summary: "Reset flow, HardFault triage, structure layout, endianness, and clock-derived peripheral behavior.",
    labNums: ["05", "06", "07", "08", "16"],
  },
  {
    slug: "drivers-buses",
    title: "Drivers & Buses",
    summary: "Data movement, buffering, SPI modes, firmware layering, and decoded I2C transactions.",
    labNums: ["03", "04", "09", "10", "17"],
  },
  {
    slug: "wireless",
    title: "Wireless",
    summary: "BLE timing, GATT, Thread, packet layers, discovery, hopping, security, privacy, and field debugging.",
    labNums: ["13", "14", "19", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
  },
  {
    slug: "shipping-firmware",
    title: "Shipping Firmware",
    summary: "OTA update states, battery budgeting, radio-core separation, and build-system mental models.",
    labNums: ["11", "12", "15", "18"],
  },
];

export const labs: LabInfo[] = [
  { num: "01", slug: "race-condition", title: "Why counter++ loses updates", track: "concurrency-rtos", description: "Step through a preemption interleaving that loses an increment.", simplifications: defaultSimplifications },
  { num: "02", slug: "priority-inversion", title: "Priority inversion & priority inheritance", track: "concurrency-rtos", description: "Watch a medium-priority task stretch a mutex block, then compare priority inheritance.", simplifications: defaultSimplifications },
  { num: "03", slug: "ring-buffer", title: "Ring buffer - head, tail, full vs empty", track: "drivers-buses", description: "Move head and tail through a bounded UART-style FIFO.", simplifications: defaultSimplifications },
  { num: "04", slug: "dma-pingpong", title: "Circular DMA + half/full interrupts", track: "drivers-buses", description: "Simulate ping-pong DMA service timing and overrun pressure.", simplifications: defaultSimplifications },
  { num: "05", slug: "cortex-boot", title: "Cortex-M reset to main()", track: "memory-machine", description: "Trace vector fetch, stack setup, runtime init, and main entry.", simplifications: defaultSimplifications },
  { num: "06", slug: "hardfault-detective", title: "HardFault detective", track: "memory-machine", description: "Reveal the register clues in a realistic fault investigation.", simplifications: defaultSimplifications },
  { num: "07", slug: "struct-padding", title: "Struct padding playground", track: "memory-machine", description: "Reorder members and see how alignment changes object size.", simplifications: defaultSimplifications },
  { num: "08", slug: "endianness", title: "Endianness visualizer", track: "memory-machine", description: "Type a value and compare little-endian and big-endian byte order.", simplifications: defaultSimplifications },
  { num: "09", slug: "spi-modes", title: "SPI modes - CPOL / CPHA explorer", track: "drivers-buses", description: "Compare sampling edges across all four SPI modes.", simplifications: defaultSimplifications },
  { num: "10", slug: "layer-stack", title: "App / HAL / Driver / BSP ownership", track: "drivers-buses", description: "Open each firmware layer and check what it should own.", simplifications: defaultSimplifications },
  { num: "11", slug: "ota-state-machine", title: "OTA dual-bank update state machine", track: "shipping-firmware", description: "Drive an update through download, validation, test boot, confirm, and rollback.", simplifications: defaultSimplifications },
  { num: "12", slug: "battery-calc", title: "Coin-cell budget calculator", track: "shipping-firmware", description: "Change duty-cycle assumptions and see battery-life impact.", simplifications: defaultSimplifications },
  { num: "13", slug: "ble-connection-timing", title: "BLE connection events", track: "wireless", description: "Tune interval, latency, and supervision timeout until disconnect behavior is predictable.", simplifications: defaultSimplifications },
  { num: "14", slug: "gatt-explorer", title: "GATT hierarchy explorer", track: "wireless", description: "Expand the profile tree and race notify against indicate.", simplifications: defaultSimplifications },
  { num: "15", slug: "rf-core", title: "RF core dual-CPU architecture", track: "shipping-firmware", description: "Step through how app code hands radio timing to a controller core.", simplifications: defaultSimplifications },
  { num: "16", slug: "clock-tree", title: "Clock tree to baud rate", track: "memory-machine", description: "Break UART baud by changing clocks without recomputing the divider.", simplifications: defaultSimplifications },
  { num: "17", slug: "i2c-anatomy", title: "I2C write-read transaction", track: "drivers-buses", description: "Inspect a decoded write-read waveform with repeated start and optional stretching.", simplifications: defaultSimplifications },
  { num: "18", slug: "zephyr-build", title: "Zephyr build flow", track: "shipping-firmware", description: "Follow DTS and Kconfig inputs into generated headers and final binaries.", simplifications: defaultSimplifications },
  { num: "19", slug: "thread-mesh", title: "Thread mesh routing", track: "wireless", description: "Deliver a message through routers to a sleepy end device.", simplifications: defaultSimplifications },
  { num: "20", slug: "context-switch", title: "FreeRTOS context switch", track: "concurrency-rtos", description: "See hardware and software stack frames across a task switch.", simplifications: defaultSimplifications },
  { num: "21", slug: "rms-check", title: "RMS schedulability quick-check", track: "concurrency-rtos", description: "Enter task utilizations and compare against the Liu and Layland bound.", simplifications: defaultSimplifications },
  { num: "22", slug: "ble-stack-packet", title: "BLE protocol stack packet builder", track: "wireless", description: "Click through stack layers and watch headers accumulate on a notification.", maxWidth: 1000, simplifications: defaultSimplifications },
  { num: "23", slug: "ble-channel-map", title: "BLE channels & Wi-Fi coexistence", track: "wireless", description: "Toggle Wi-Fi bands and see which BLE channels overlap.", maxWidth: 1000, simplifications: defaultSimplifications },
  { num: "24", slug: "discovery-sim", title: "Advertising & scanning discovery", track: "wireless", description: "Run the probabilistic overlap between advertising events and scan windows.", maxWidth: 1000, simplifications: ["Teaching model for review: discovery timing is randomized, seeded only in visual tests so screenshots are reproducible.", ...defaultSimplifications] },
  { num: "25", slug: "channel-hopping", title: "Channel hopping & AFH", track: "wireless", description: "Step connection events through a channel map and remap blocked channels.", maxWidth: 1000, simplifications: defaultSimplifications },
  { num: "26", slug: "throughput-calc", title: "GATT throughput calculator", track: "wireless", description: "Move MTU, interval, PHY, and packet-count controls to estimate application throughput.", maxWidth: 1000, simplifications: defaultSimplifications },
  { num: "27", slug: "pairing-matrix", title: "Pairing & security matrix", track: "wireless", description: "Choose IO capabilities and read the resulting pairing method and key properties.", maxWidth: 1000, simplifications: defaultSimplifications },
  { num: "28", slug: "rpa-privacy", title: "Resolvable private addresses", track: "wireless", description: "Rotate an address and resolve it against a bonded identity key.", maxWidth: 1000, simplifications: defaultSimplifications },
  { num: "29", slug: "ll-state-machine", title: "Link Layer state machine", track: "wireless", description: "Drive advertising, scanning, initiating, central, and peripheral state transitions.", maxWidth: 1000, simplifications: defaultSimplifications },
  { num: "30", slug: "ble-versions", title: "BLE 4.0 to 5.4 feature timeline", track: "wireless", description: "Click spec versions and connect features to when they arrived.", maxWidth: 1000, simplifications: defaultSimplifications },
  { num: "31", slug: "ble-debug-playbook", title: "BLE debugging playbook", track: "wireless", description: "Expand field symptoms and compare likely root causes.", maxWidth: 1000, simplifications: defaultSimplifications },
];

export const featuredLabNums = ["01", "04", "13", "23", "26", "31"];

export function labBySlug(slug: string): LabInfo | undefined {
  return labs.find((lab) => lab.slug === slug);
}

export function labByNum(num: string): LabInfo | undefined {
  return labs.find((lab) => lab.num === num);
}

export function trackBySlug(slug: string): Track | undefined {
  return tracks.find((track) => track.slug === slug);
}

export function labsForTrack(trackSlug: string): LabInfo[] {
  const track = trackBySlug(trackSlug);
  if (!track) return [];
  return track.labNums.map((num) => labByNum(num)).filter((lab): lab is LabInfo => Boolean(lab));
}

export function labNav(slug: string): { track?: Track; prev?: LabInfo; next?: LabInfo } {
  const lab = labBySlug(slug);
  if (!lab) return {};
  const track = trackBySlug(lab.track);
  const ordered = labsForTrack(lab.track);
  const idx = ordered.findIndex((item) => item.slug === slug);
  return {
    track,
    prev: idx > 0 ? ordered[idx - 1] : undefined,
    next: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : undefined,
  };
}
