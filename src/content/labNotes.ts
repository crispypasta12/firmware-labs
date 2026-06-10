export interface LabNote {
  conceptBrief: string[];
  whatToObserve: string[];
  realFirmwareChecklist: string[];
  commonTraps: string[];
  selfCheck: string[];
  codeSketch?: string;
}

export const labNotesBySlug: Record<string, LabNote> = {
  "race-condition": {
    conceptBrief: [
      "A read-modify-write operation is a sequence, not a single indivisible action. When two contexts share the same storage, a preemption between the read and the write can make one update disappear.",
      "The important lesson is ownership. Either make the update atomic, protect the sequence, or design the data flow so only one context writes the variable.",
    ],
    whatToObserve: [
      "Both tasks load the same old counter value before either store commits.",
      "The final memory value increases by one even though two increments ran.",
      "Volatile would preserve the loads and stores, but it would not merge them into an atomic transaction.",
    ],
    realFirmwareChecklist: [
      "List every variable shared by an ISR and a task, or by two tasks.",
      "Mark hardware/ISR-visible objects volatile, then separately decide the atomicity rule.",
      "Use a critical section only around the smallest read-modify-write window.",
      "Prefer queues, task notifications, or single-writer counters when the value represents events.",
    ],
    commonTraps: [
      "Assuming volatile means thread-safe.",
      "Protecting the read but not the matching write.",
      "Using a 32-bit counter safely on one MCU and then porting to a core where the access width is no longer atomic.",
    ],
    selfCheck: [
      "Where exactly can the preemption occur to lose an update?",
      "Which fixes preserve every event without blocking interrupts for long?",
      "When would a queue be a better design than a shared counter?",
    ],
    codeSketch: `volatile uint32_t counter;

void isr_or_task(void) {
  taskENTER_CRITICAL();
  counter++;
  taskEXIT_CRITICAL();
}`,
  },
  "priority-inversion": {
    conceptBrief: [
      "Priority inversion happens when a high-priority task is blocked by a low-priority owner, while unrelated medium-priority work prevents the owner from running.",
      "Priority inheritance shortens the block by temporarily lending the high priority to the low-priority mutex owner.",
    ],
    whatToObserve: [
      "Without inheritance, the medium task runs even though the high task is waiting.",
      "With inheritance, the low-priority owner gets CPU time immediately and releases the mutex sooner.",
      "The mechanism depends on mutex ownership; a binary semaphore cannot inherit priority because there is no owner.",
    ],
    realFirmwareChecklist: [
      "Use mutexes for shared resources that have an owner.",
      "Keep critical sections short and bounded.",
      "Check RTOS trace logs for high-priority tasks blocked behind medium-priority execution.",
      "Avoid taking multiple locks in inconsistent order.",
    ],
    commonTraps: [
      "Using a binary semaphore as a lock and expecting inheritance.",
      "Calling blocking APIs while holding a mutex.",
      "Treating priority inheritance as a substitute for bounded critical-section design.",
    ],
    selfCheck: [
      "Why does the medium task make the high task wait longer?",
      "What must the RTOS know to apply inheritance?",
      "What trace symptom would point to priority inversion?",
    ],
  },
  "ring-buffer": {
    conceptBrief: [
      "A ring buffer turns fixed storage into a stream by wrapping head and tail indexes. It is common in UART, SPI, logging, and DMA handoff paths.",
      "The design is simple only if the ownership rules are clear. In the common single-producer/single-consumer version, the producer owns head and the consumer owns tail.",
    ],
    whatToObserve: [
      "Head advances when bytes arrive; tail advances when the task consumes bytes.",
      "One slot is left unused so full and empty are distinguishable.",
      "Burst writes show why buffer size must be based on worst-case service latency, not average rate.",
    ],
    realFirmwareChecklist: [
      "Decide drop-new, drop-old, or backpressure behavior before writing code.",
      "Track overruns as counters that survive field diagnostics.",
      "Wake the consumer with an interrupt-safe signal instead of polling.",
      "For DMA, define how idle-line or half-transfer events publish new bytes.",
    ],
    commonTraps: [
      "Using head == tail for both full and empty.",
      "Letting both ISR and task write the same index.",
      "Forgetting that modulo arithmetic and count updates can introduce races.",
    ],
    selfCheck: [
      "Why does leaving one slot unused simplify the state machine?",
      "Which context should own head in a UART RX buffer?",
      "What should the firmware record when a byte is dropped?",
    ],
    codeSketch: `bool rb_full(void) {
  return ((head + 1u) % RB_SIZE) == tail;
}

bool rb_empty(void) {
  return head == tail;
}`,
  },
  "dma-pingpong": {
    conceptBrief: [
      "Ping-pong DMA splits a circular buffer into halves. While DMA fills one half, software processes the other half.",
      "The design works only when the processing budget for each half is lower than the time it takes DMA to fill the next half.",
    ],
    whatToObserve: [
      "Half-transfer and transfer-complete interrupts publish alternating halves.",
      "The slow CPU mode demonstrates a wrap into data that has not been consumed.",
      "The failure is timing-related, so it may appear only under load.",
    ],
    realFirmwareChecklist: [
      "Compute fill time per half from sample rate, byte width, and half size.",
      "Measure worst-case processing time, not average processing time.",
      "Clear DMA flags correctly and avoid double-consuming a half.",
      "On cached MCUs, invalidate or clean cache lines before software reads DMA data.",
    ],
    commonTraps: [
      "Sizing the buffer from nominal throughput but ignoring ISR latency.",
      "Forgetting cache coherency on Cortex-M7 or application-class MCUs.",
      "Doing expensive parsing inside the DMA interrupt instead of deferring work.",
    ],
    selfCheck: [
      "What equation decides whether the ping-pong buffer is safe?",
      "Which event tells software the first half is ready?",
      "What changes when D-cache is enabled?",
    ],
    codeSketch: `void dma_irq(void) {
  if (half_transfer()) {
    publish_half(0);
  }
  if (transfer_complete()) {
    publish_half(1);
  }
}`,
  },
  "cortex-boot": {
    conceptBrief: [
      "A Cortex-M reset begins with two reads from the vector table: the initial stack pointer and the reset handler address.",
      "Startup code then prepares the C runtime before application code runs: initialized data is copied to RAM, zero-initialized data is cleared, constructors may run, and main is called.",
    ],
    whatToObserve: [
      "The first stack pointer comes from flash, not from C code.",
      "The reset handler bridges hardware reset into the runtime environment.",
      "A bootloader must hand off both control flow and interrupt vector ownership.",
    ],
    realFirmwareChecklist: [
      "Confirm the vector table address and linker script agree.",
      "Verify the first vector points into valid RAM and the reset vector points into executable flash.",
      "When jumping to an app, disable interrupts, stop DMA, set VTOR, load MSP, then branch to reset.",
      "Check map files when startup code fails before logging is available.",
    ],
    commonTraps: [
      "Jumping to an application without updating VTOR.",
      "Leaving bootloader interrupts pending during app startup.",
      "Assuming global variables are valid before runtime initialization.",
    ],
    selfCheck: [
      "What are the first two words of a Cortex-M vector table?",
      "Why does .data need a copy step?",
      "What interrupt symptom appears when VTOR is wrong?",
    ],
  },
  "hardfault-detective": {
    conceptBrief: [
      "A HardFault is not the root cause; it is the CPU reporting that an exception could not be handled normally or that a configurable fault escalated.",
      "A disciplined investigation reads fault status registers, the stacked program counter, and the map file before guessing.",
    ],
    whatToObserve: [
      "Each clue narrows the failure from symptom to fault class to address to instruction.",
      "The stacked PC is often the fastest path to the failing line of code.",
      "Fault address registers are only meaningful when their valid bits are set.",
    ],
    realFirmwareChecklist: [
      "Capture CFSR, HFSR, BFAR, MMFAR, LR, MSP/PSP, and the stacked frame.",
      "Decode subfaults before restarting the target.",
      "Use the ELF/map file to translate PC to function and source location.",
      "Check stack overflow, invalid pointers, bad ISR priority, and DMA overwrite early.",
    ],
    commonTraps: [
      "Clearing or resetting before recording the fault frame.",
      "Treating every HardFault as a null pointer.",
      "Ignoring the EXC_RETURN value that tells which stack was active.",
    ],
    selfCheck: [
      "Which register tells you the configurable fault class?",
      "Why is the stacked PC more useful than the current PC inside the handler?",
      "What does a precise bus fault give you that an imprecise one may not?",
    ],
  },
  "struct-padding": {
    conceptBrief: [
      "Compilers insert padding so each member is placed at an address compatible with its alignment requirement.",
      "Reordering fields can reduce size, but exact byte layout should still be treated carefully when data crosses hardware, flash, or protocol boundaries.",
    ],
    whatToObserve: [
      "Moving larger fields earlier can reduce internal padding.",
      "Packed layout reduces size but may create unaligned accesses.",
      "The cheapest layout is not always the safest wire format.",
    ],
    realFirmwareChecklist: [
      "Use static assertions for structures stored in flash or shared with hardware.",
      "Prefer explicit serialization for packets and logs.",
      "Check target alignment behavior before using packed structures.",
      "Keep register overlays limited, reviewed, and compiler-aware.",
    ],
    commonTraps: [
      "Assuming sizeof equals the sum of field sizes.",
      "Using packed structures everywhere to save bytes.",
      "Writing raw structs to flash and then changing compiler flags or field order later.",
    ],
    selfCheck: [
      "Why can a packed access fault on some cores?",
      "When is explicit serialization better than a struct cast?",
      "What does tail padding do to arrays of structs?",
    ],
  },
  endianness: {
    conceptBrief: [
      "Endianness defines how a multi-byte value is laid out in memory or on a wire. The numeric value is the same; the byte order changes.",
      "Firmware regularly crosses endian boundaries when it talks to protocols, files, sensors, radios, and network stacks.",
    ],
    whatToObserve: [
      "Little-endian places the least significant byte at the lowest address.",
      "Big-endian places the most significant byte first.",
      "Single bytes do not have an endian problem; multi-byte interpretation does.",
    ],
    realFirmwareChecklist: [
      "Define protocol byte order explicitly in every packet format.",
      "Use conversion helpers instead of pointer casts.",
      "Review BLE, network, sensor, and flash formats independently.",
      "Test with asymmetric values such as 0x12345678 so mistakes are visible.",
    ],
    commonTraps: [
      "Casting a byte buffer to a struct and trusting host layout.",
      "Testing only values like 0 or 0xFFFF where order mistakes hide.",
      "Confusing bit order on a bus with byte order in memory.",
    ],
    selfCheck: [
      "What byte appears first for 0x12345678 on a little-endian MCU?",
      "Why is a wire format safer when it names byte order?",
      "How would you test an endian conversion function?",
    ],
  },
  "spi-modes": {
    conceptBrief: [
      "SPI mode is the combination of idle clock level and sampling phase. If either side disagrees, bits can be sampled on the wrong edge.",
      "The correct answer comes from the slave timing diagram, not from the MCU default.",
    ],
    whatToObserve: [
      "CPOL changes where the clock rests between transfers.",
      "CPHA changes whether the first or second edge samples data.",
      "The amber sample points are the critical moments for data validity.",
    ],
    realFirmwareChecklist: [
      "Read the slave datasheet timing diagram before selecting mode.",
      "Verify chip-select setup and hold time, not only CPOL/CPHA.",
      "Check bit order, word size, and maximum clock rate.",
      "Use a logic analyzer when received bytes are shifted or unstable.",
    ],
    commonTraps: [
      "Trying random modes until data looks plausible.",
      "Ignoring chip-select timing around multi-byte register reads.",
      "Forgetting that some devices change behavior between command and data phases.",
    ],
    selfCheck: [
      "What does CPOL describe?",
      "What does CPHA describe?",
      "What symptom suggests data is being sampled on the wrong edge?",
    ],
  },
  "layer-stack": {
    conceptBrief: [
      "A firmware stack is maintainable when each layer owns a clear decision boundary: product behavior, portable interface, peripheral mechanics, board wiring, and silicon.",
      "Good layering lets a board revision or MCU variant change without rewriting application behavior.",
    ],
    whatToObserve: [
      "Application code should express intent, not register details.",
      "Drivers own peripheral state, interrupts, DMA, and error handling.",
      "BSP code owns pins, clocks, power sequencing, and board-specific mappings.",
    ],
    realFirmwareChecklist: [
      "Keep board constants out of application code.",
      "Expose driver APIs that describe operations, not registers.",
      "Put pin mux, clock enables, and power rails in board setup.",
      "Make ownership clear for callbacks, buffers, and concurrency.",
    ],
    commonTraps: [
      "Letting application code reach into peripheral registers.",
      "Putting board-specific pin names in generic drivers.",
      "Creating a HAL so thin that it hides nothing important.",
    ],
    selfCheck: [
      "Which layer should know the UART TX pin?",
      "Which layer should know the telemetry period?",
      "What makes a driver reusable across board variants?",
    ],
  },
  "ota-state-machine": {
    conceptBrief: [
      "A robust OTA updater is a state machine because power loss, bad images, interrupted transfers, and failed boots are normal cases, not rare exceptions.",
      "The update is not complete when bytes finish downloading. It is complete only after validation, test boot, and confirmation.",
    ],
    whatToObserve: [
      "Failure paths return to a known safe image.",
      "Pending/test states protect against images that boot once and then hang.",
      "Rollback is part of the primary design, not an afterthought.",
    ],
    realFirmwareChecklist: [
      "Transfer chunks with offsets so download can resume.",
      "Validate hash and signature before booting the image.",
      "Use a watchdog-guarded test boot and require explicit confirmation.",
      "Store monotonic version or anti-rollback state where attackers cannot reset it easily.",
    ],
    commonTraps: [
      "Checking CRC per chunk but not authenticating the whole image.",
      "Marking an image permanent before it proves it can run.",
      "Designing update storage without considering power loss during metadata writes.",
    ],
    selfCheck: [
      "What is the difference between integrity and authenticity?",
      "Why does a pending image need confirmation?",
      "Where can power loss happen safely in your state machine?",
    ],
  },
  "battery-calc": {
    conceptBrief: [
      "Battery life is driven by average current, which is dominated by duty cycle in many sensor products.",
      "The arithmetic is simple, but the engineering margin is not: temperature, self-discharge, pulse current, radio retries, and battery impedance all matter.",
    ],
    whatToObserve: [
      "Small active-time changes can matter when wakeups are frequent.",
      "Longer sleep periods reduce average current but increase latency.",
      "Derating shows why nominal capacity is not a product guarantee.",
    ],
    realFirmwareChecklist: [
      "Measure sleep, active compute, sensor, and radio phases separately.",
      "Budget worst-case retries and cold-temperature capacity loss.",
      "Check pulse current against coin-cell ESR and local capacitance.",
      "Validate with a power profiler before using spreadsheet numbers for claims.",
    ],
    commonTraps: [
      "Ignoring self-discharge in multi-year products.",
      "Using typical current while marketing worst-case battery life.",
      "Measuring with a debugger attached and trusting the sleep current.",
    ],
    selfCheck: [
      "How do you compute average current from active time and period?",
      "Why can a coin cell fail during TX even when capacity remains?",
      "Which current phases would you measure separately?",
    ],
  },
  "ble-connection-timing": {
    conceptBrief: [
      "A BLE connection is a timed agreement. The central schedules anchor points, and the peripheral may skip events only within the negotiated latency and supervision timeout.",
      "The power-versus-latency tradeoff is controlled by interval, latency, timeout, PHY behavior, and how often real packets succeed.",
    ],
    whatToObserve: [
      "Increasing latency reduces wakeups but stretches the maximum time between successful packets.",
      "The supervision timer resets only when packets are exchanged successfully.",
      "Interference converts a mathematically valid parameter set into a disconnect if no packet gets through in time.",
    ],
    realFirmwareChecklist: [
      "Log the granted connection parameters, not just the requested ones.",
      "Check the latency/interval/timeout relationship before chasing RF.",
      "Use a sniffer to see whether the link dies from timeout or an explicit terminate.",
      "Account for mobile OS parameter policies when a phone is the central.",
    ],
    commonTraps: [
      "Assuming the peripheral controls connection timing.",
      "Using a long latency with a timeout that leaves no loss margin.",
      "Debugging every five-second disconnect as an application crash instead of a supervision timeout.",
    ],
    selfCheck: [
      "Who owns the final connection parameters?",
      "What resets the supervision timer?",
      "Why is timeout/2 used as a practical margin rule?",
    ],
    codeSketch: `uint32_t max_gap_ms =
  (1u + slave_latency) * connection_interval_ms;

bool has_margin = max_gap_ms < (supervision_timeout_ms / 2u);`,
  },
  "gatt-explorer": {
    conceptBrief: [
      "GATT is the structured data model used by BLE applications. Services group characteristics, characteristics expose values, and descriptors add metadata or subscription state.",
      "Notify and indicate both deliver server-to-client data, but they make different reliability and throughput tradeoffs.",
    ],
    whatToObserve: [
      "The CCCD controls whether the client has subscribed.",
      "Notifications can stream quickly because they do not wait for confirmation.",
      "Indications serialize on confirmation, making them slower but acknowledged.",
    ],
    realFirmwareChecklist: [
      "Verify the characteristic property and CCCD value before sending notifications.",
      "Handle CCCD state on reconnect, especially without bonding.",
      "Check ATT return codes when the transmit queue is full.",
      "Use indications for critical state changes only when the round trip is acceptable.",
    ],
    commonTraps: [
      "Sending notifications before the client subscribes.",
      "Expecting notifications to guarantee delivery.",
      "Using indications for high-throughput streams and then blaming RF for low speed.",
    ],
    selfCheck: [
      "What does the CCCD store?",
      "Why are indications slower than notifications?",
      "Which operation would you choose for OTA chunks and why?",
    ],
  },
  "rf-core": {
    conceptBrief: [
      "Many wireless MCUs split application work from radio-controller work. The application core requests operations; a controller core or radio subsystem owns tight RF timing.",
      "This separation improves timing determinism and power behavior, but it also means application code must respect driver context and command lifetimes.",
    ],
    whatToObserve: [
      "The app posts a command rather than bit-banging radio timing.",
      "The mailbox or command queue is the handoff boundary.",
      "The radio subsystem can run while the application core sleeps.",
    ],
    realFirmwareChecklist: [
      "Know which callbacks run in ISR, stack task, or application task context.",
      "Keep radio callbacks short and defer heavy work.",
      "Track command ownership and buffer lifetime until completion.",
      "Use vendor APIs for scheduling instead of direct RF register manipulation.",
    ],
    commonTraps: [
      "Calling radio APIs from arbitrary interrupts.",
      "Freeing or reusing command buffers before the controller is done.",
      "Assuming application CPU load cannot affect host-side radio servicing.",
    ],
    selfCheck: [
      "What timing does the controller own?",
      "Why can the app core sleep through some RF events?",
      "What context rules matter around radio callbacks?",
    ],
  },
  "clock-tree": {
    conceptBrief: [
      "Peripheral timing is derived from clocks. Changing a source, PLL, or bus divider changes the frequency seen by UARTs, timers, SPI, and other peripherals.",
      "A register value that was correct before a clock change can become wrong afterward.",
    ],
    whatToObserve: [
      "BRR is computed from the peripheral clock, not from the intended baud alone.",
      "Changing clocks without recomputing BRR creates baud error.",
      "Clock limits and readiness states are part of correct initialization.",
    ],
    realFirmwareChecklist: [
      "Wait for oscillator and PLL ready flags before switching sources.",
      "Set flash wait states before raising system clock.",
      "Recompute peripheral dividers after clock changes.",
      "Use a logic analyzer or scope to verify real baud when UART data is corrupt.",
    ],
    commonTraps: [
      "Changing a low-power clock mode and forgetting peripheral dividers.",
      "Assuming timer clocks always equal the visible APB clock.",
      "Ignoring maximum frequency and flash wait-state limits.",
    ],
    selfCheck: [
      "Which clock feeds the UART divider?",
      "Why can logs turn into garbage after a power-mode switch?",
      "What should firmware wait for before switching to a PLL?",
    ],
  },
  "i2c-anatomy": {
    conceptBrief: [
      "I2C transactions are readable on a logic analyzer because START, address, ACK/NACK, data, repeated START, and STOP each have distinct bus patterns.",
      "A write-read register access first selects the register, then uses a repeated START to read without releasing the bus.",
    ],
    whatToObserve: [
      "START and STOP are the only legal SDA transitions while SCL is high.",
      "The slave ACKs by pulling SDA low on the ninth clock.",
      "Clock stretching means the slave holds SCL low until it is ready.",
    ],
    realFirmwareChecklist: [
      "Check pull-up strength when edges rise slowly.",
      "Distinguish no-ACK address failures from data-phase failures.",
      "Implement bus recovery by toggling SCL and issuing STOP when a slave is stuck.",
      "Confirm whether documentation gives a 7-bit or shifted 8-bit address.",
    ],
    commonTraps: [
      "Using 0x90 when the driver expects 0x48.",
      "Ignoring clock stretch timeouts.",
      "Blaming firmware for a bus with weak pull-ups or an unpowered slave.",
    ],
    selfCheck: [
      "Why is repeated START used in a register read?",
      "What does no ACK on the address usually mean?",
      "How can a master recover a stuck bus?",
    ],
  },
  "zephyr-build": {
    conceptBrief: [
      "Zephyr combines hardware description, software configuration, CMake, and generated headers at build time.",
      "Devicetree describes what hardware exists; Kconfig decides which software is built; drivers consume both through generated constants.",
    ],
    whatToObserve: [
      "The board files and overlays affect generated devicetree headers.",
      "Kconfig options determine which drivers and subsystems compile.",
      "The final ELF and map file are products of generated config plus application code.",
    ],
    realFirmwareChecklist: [
      "Inspect the merged .config when a feature does not build.",
      "Inspect generated devicetree headers when a device binding or alias is wrong.",
      "Use west build output to find board, toolchain, and overlay inputs.",
      "Use Twister for repeatable unit and integration test runs where possible.",
    ],
    commonTraps: [
      "Trying to configure hardware in Kconfig instead of devicetree.",
      "Editing generated files instead of their DTS/Kconfig sources.",
      "Forgetting that an overlay may not be applied to the board being built.",
    ],
    selfCheck: [
      "What does devicetree describe?",
      "What does Kconfig select?",
      "Where would you look if a UART alias is wrong?",
    ],
  },
  "thread-mesh": {
    conceptBrief: [
      "Thread is an IPv6 mesh designed for low-power devices. Routers stay awake and route; sleepy end devices save power by polling a parent.",
      "Matter can run over Thread, while a border router connects the Thread mesh to the rest of the IP network.",
    ],
    whatToObserve: [
      "Routers can reroute when a neighbor fails.",
      "The sleepy end device does not receive immediately while its radio is off.",
      "The parent buffers downstream messages until the child polls.",
    ],
    realFirmwareChecklist: [
      "Choose end-device type based on latency and battery requirements.",
      "Tune poll period against downstream latency and power budget.",
      "Log parent changes, route changes, and child timeout events.",
      "Separate Thread network debugging from Matter application debugging.",
    ],
    commonTraps: [
      "Expecting a sleepy end device to receive instantly.",
      "Treating the border router as only a Wi-Fi bridge instead of an IP router.",
      "Debugging application timeouts without checking mesh route health.",
    ],
    selfCheck: [
      "Why does the parent buffer messages?",
      "What is the power tradeoff of a shorter poll interval?",
      "What role does a border router play?",
    ],
  },
  "context-switch": {
    conceptBrief: [
      "On Cortex-M, exception entry automatically saves part of the context. An RTOS then saves the callee-saved registers needed to resume another task.",
      "FreeRTOS uses PendSV for context switching so the switch runs at the lowest exception priority after higher-priority interrupts complete.",
    ],
    whatToObserve: [
      "Hardware and software save different register sets.",
      "Handlers use MSP while tasks normally use PSP.",
      "Each task needs enough stack for its own calls plus exception frames.",
    ],
    realFirmwareChecklist: [
      "Measure high-water marks for every task stack.",
      "Keep PendSV and SysTick priorities compatible with the RTOS port.",
      "Use trace tools or GPIO timestamps to understand scheduling latency.",
      "Avoid blocking or heavy work in ISRs that should only wake tasks.",
    ],
    commonTraps: [
      "Assuming the RTOS saves every register manually.",
      "Sizing stacks without accounting for nested calls and interrupt frames.",
      "Setting interrupt priorities that illegally call RTOS APIs.",
    ],
    selfCheck: [
      "Which registers does exception entry push automatically?",
      "Why does PendSV run at low priority?",
      "Why do tasks use separate process stacks?",
    ],
  },
  "rms-check": {
    conceptBrief: [
      "Rate-monotonic scheduling assigns higher static priority to shorter-period tasks. The Liu and Layland bound is a quick sufficient test, not the full schedulability story.",
      "Below the bound is guaranteed for the model. Above the bound may still work, but it needs response-time analysis or measurement.",
    ],
    whatToObserve: [
      "Total utilization alone can prove impossible when it exceeds 100 percent.",
      "The guarantee bound decreases toward about 69.3 percent as task count grows.",
      "The middle region is not automatically bad; it is just not proven by the simple bound.",
    ],
    realFirmwareChecklist: [
      "Use worst-case execution time, not typical execution time.",
      "Include blocking time, ISR interference, and release jitter in real analysis.",
      "Measure execution time on target hardware with production compiler settings.",
      "Add deadline monitoring for field evidence.",
    ],
    commonTraps: [
      "Treating the utilization bound as a necessary condition.",
      "Ignoring a long low-priority critical section.",
      "Measuring tasks in debug builds and using those numbers for release timing.",
    ],
    selfCheck: [
      "What priority does RMS assign to the shortest period?",
      "What does passing the bound guarantee?",
      "What analysis is needed in the maybe region?",
    ],
  },
  "ble-stack-packet": {
    conceptBrief: [
      "A BLE application packet passes through host layers and controller layers. Each layer adds responsibility and often bytes.",
      "Understanding where a byte or error appears in the stack helps connect application logs, HCI traces, sniffer captures, and RF behavior.",
    ],
    whatToObserve: [
      "The application value is only one part of the on-air packet.",
      "ATT rides over a fixed L2CAP channel for GATT traffic.",
      "The Link Layer owns timing, hopping, encryption, and connection procedures.",
    ],
    realFirmwareChecklist: [
      "Map each debug artifact to a layer: app log, ATT error, HCI event, LL packet, RF RSSI.",
      "Check negotiated MTU and data length before blaming throughput.",
      "Use HCI logs to see what the host requested and what the controller reported.",
      "Use sniffer captures for over-the-air truth when host logs disagree.",
    ],
    commonTraps: [
      "Calling every BLE issue a GATT issue.",
      "Ignoring the host/controller boundary on network-processor designs.",
      "Assuming payload bytes equal airtime bytes.",
    ],
    selfCheck: [
      "Which layer carries GATT operations on the wire?",
      "Where does channel hopping live?",
      "Why can HCI logs and sniffer captures show different parts of the story?",
    ],
  },
  "ble-channel-map": {
    conceptBrief: [
      "BLE uses 40 channels in the 2.4 GHz ISM band: three advertising channels and 37 data channels.",
      "The advertising channels are placed to improve discovery around common Wi-Fi deployments, while data channels can be excluded through adaptive frequency hopping.",
    ],
    whatToObserve: [
      "Wi-Fi channels occupy wide regions compared with 2 MHz BLE channels.",
      "Advertising channels sit in useful gaps around Wi-Fi 1, 6, and 11.",
      "Overlapped data channels are candidates for exclusion from the connection channel map.",
    ],
    realFirmwareChecklist: [
      "Use a spectrum view or sniffer when bench behavior differs from office behavior.",
      "Check whether channel map adaptation is happening under interference.",
      "Record RSSI and packet error rate, not just disconnect events.",
      "Test inside the real enclosure and installation environment.",
    ],
    commonTraps: [
      "Testing RF only on a quiet bench.",
      "Assuming advertising and connected data use the same channel behavior.",
      "Ignoring antenna detuning and enclosure effects.",
    ],
    selfCheck: [
      "How many BLE advertising channels exist?",
      "Why are channels 37, 38, and 39 placed where they are?",
      "What mechanism avoids bad data channels during a connection?",
    ],
  },
  "discovery-sim": {
    conceptBrief: [
      "BLE discovery is probabilistic because advertising events and scan windows must overlap in time and frequency.",
      "Short intervals and wide scan windows reduce discovery latency but increase power consumption on one or both devices.",
    ],
    whatToObserve: [
      "Running the same settings multiple times can produce different discovery latency.",
      "Shrinking scan duty cycle saves scanner power but can miss more advertising events.",
      "The random advertising delay helps prevent devices from colliding forever in lockstep.",
    ],
    realFirmwareChecklist: [
      "Define the product's acceptable discovery latency before choosing intervals.",
      "Measure current for advertising and scanning separately.",
      "Check whether the scanner filters by UUID, address type, flags, or legacy/extended advertising.",
      "Use a sniffer to confirm the device is actually advertising on the expected channels.",
    ],
    commonTraps: [
      "Calling a device invisible when scan duty cycle is too low.",
      "Forgetting that phone scanner apps may filter or hide extended advertising.",
      "Optimizing advertising interval without budgeting user-visible discovery latency.",
    ],
    selfCheck: [
      "What has to overlap for discovery to occur?",
      "Why does scan window affect power?",
      "Why does advertising add a random delay?",
    ],
  },
  "channel-hopping": {
    conceptBrief: [
      "A BLE connection changes data channels each connection event. Hopping spreads interference risk instead of depending on one frequency.",
      "Adaptive frequency hopping removes consistently bad channels from the map so both peers avoid them.",
    ],
    whatToObserve: [
      "CSA#1 advances through channels using an increment and then remaps excluded channels.",
      "The channel map count drops when interference is enabled.",
      "The connection still hops; it just hops over the usable subset.",
    ],
    realFirmwareChecklist: [
      "Inspect channel map updates when packet loss clusters around an interferer.",
      "Check whether the central distributes the map update as expected.",
      "Keep at least the required minimum number of data channels available.",
      "Correlate packet error rate with spectrum occupancy.",
    ],
    commonTraps: [
      "Expecting the peripheral to unilaterally choose the channel map.",
      "Confusing advertising channels with data-channel hopping.",
      "Assuming AFH fixes a link with poor RSSI or antenna margin.",
    ],
    selfCheck: [
      "What happens when the hop lands on an excluded channel?",
      "Who distributes the channel map?",
      "Why did BLE add CSA#2?",
    ],
  },
  "throughput-calc": {
    conceptBrief: [
      "BLE application throughput depends on payload per packet, packets per event, event spacing, PHY, and platform limits.",
      "Increasing MTU is often the first big win because the ATT header cost is paid over a larger payload.",
    ],
    whatToObserve: [
      "Default MTU 23 leaves only 20 bytes of ATT value payload.",
      "Shorter intervals and more packets per event increase throughput.",
      "2M PHY helps only when both peers support and grant it.",
    ],
    realFirmwareChecklist: [
      "Log negotiated MTU, data length, PHY, connection interval, and packets per event.",
      "Use notifications or write-without-response with application-level flow control for streams.",
      "Avoid indications for bulk transfer unless the round trip is acceptable.",
      "Test with the actual phone or central because policies cap parameters.",
    ],
    commonTraps: [
      "Using requested parameters in calculations instead of granted parameters.",
      "Increasing MTU but forgetting data length extension.",
      "Treating PHY rate as application throughput.",
    ],
    selfCheck: [
      "Why does MTU 247 improve payload efficiency?",
      "What BLE features matter for fast OTA?",
      "Why can a phone limit your theoretical throughput?",
    ],
  },
  "pairing-matrix": {
    conceptBrief: [
      "BLE pairing method depends heavily on IO capabilities and whether LE Secure Connections or OOB data is available.",
      "Security properties differ: encryption, passive eavesdrop resistance, and MITM protection are related but not the same.",
    ],
    whatToObserve: [
      "No-input/no-output devices usually fall back to Just Works.",
      "LE Secure Connections improves passive eavesdrop resistance through ECDH.",
      "MITM protection requires a way for users or devices to authenticate the peer.",
    ],
    realFirmwareChecklist: [
      "Document which pairing method each product mode can actually support.",
      "Handle stale bonds and full bond storage gracefully.",
      "Store and use LTK, IRK, and CSRK according to feature needs.",
      "Test deletion of bonds on only one side; it is a common field failure.",
    ],
    commonTraps: [
      "Claiming MITM protection for Just Works.",
      "Equating pairing with bonding.",
      "Ignoring IO capability changes between prototype and final enclosure.",
    ],
    selfCheck: [
      "What does bonding add after pairing?",
      "Why does Just Works lack MITM protection?",
      "Which key resolves private addresses?",
    ],
  },
  "rpa-privacy": {
    conceptBrief: [
      "Resolvable private addresses let a device change its visible address while bonded peers can still recognize it using the identity resolving key.",
      "This protects against passive tracking but requires firmware to use identity resolution instead of fixed public-address filters.",
    ],
    whatToObserve: [
      "The visible address changes after rotation.",
      "A bonded IRK can still match the new address.",
      "An unknown address does not resolve against the stored identity.",
    ],
    realFirmwareChecklist: [
      "Use the controller resolving list where available.",
      "Store IRKs with bond records and handle bond deletion correctly.",
      "Filter by identity after resolution, not only by the current over-the-air address.",
      "Log address type during reconnect debugging.",
    ],
    commonTraps: [
      "Whitelisting a phone's temporary RPA as if it were permanent.",
      "Deleting encryption keys but leaving privacy state inconsistent.",
      "Confusing random static, non-resolvable private, and resolvable private addresses.",
    ],
    selfCheck: [
      "What key resolves an RPA?",
      "Why can reconnect fail after a phone rotates its address?",
      "What should firmware store for a bonded peer?",
    ],
  },
  "ll-state-machine": {
    conceptBrief: [
      "BLE Link Layer roles come from state-machine paths. A device that advertises and accepts a connection becomes a peripheral; one that scans and initiates becomes a central.",
      "Modern devices can support multiple roles, but each connection still has clear central and peripheral responsibilities.",
    ],
    whatToObserve: [
      "Advertising can lead to a peripheral connection.",
      "Scanning plus initiating leads to a central connection.",
      "Broadcaster and observer behavior can exist without a connection.",
    ],
    realFirmwareChecklist: [
      "Log role, peer address type, and connection handle for every link.",
      "Remember the central controls connection parameters and channel map.",
      "Design multi-role products with scheduling and memory limits in mind.",
      "Use sniffer state transitions to debug failed connection establishment.",
    ],
    commonTraps: [
      "Calling every phone a client and every device a server without separating GAP and GATT roles.",
      "Assuming peripheral means low power in every product.",
      "Forgetting that one device can be central on one link and peripheral on another.",
    ],
    selfCheck: [
      "How does a device become a peripheral?",
      "How does a device become a central?",
      "Who owns the channel map in a connection?",
    ],
  },
  "ble-versions": {
    conceptBrief: [
      "BLE features arrived over many specification versions, and products only get features that both peers and controllers support.",
      "Version literacy helps debug impossible requests, such as expecting 2M PHY from a BLE 4.x peer.",
    ],
    whatToObserve: [
      "Throughput, range, privacy, and power features arrived in different releases.",
      "A stack version does not guarantee every optional feature is enabled.",
      "Feature negotiation matters as much as marketing version numbers.",
    ],
    realFirmwareChecklist: [
      "Read controller feature masks and negotiated events at runtime.",
      "Check both peer support and local stack configuration.",
      "Document graceful fallback paths for older phones or peripherals.",
      "Tie product requirements to specific BLE features, not only version numbers.",
    ],
    commonTraps: [
      "Assuming BLE 5 means 2M PHY, coded PHY, and extended advertising are all available.",
      "Ignoring phone OS policy even when the controller supports a feature.",
      "Building a product requirement around an optional feature without fallback.",
    ],
    selfCheck: [
      "Which peer capabilities must match for a feature to be used?",
      "Why is a feature mask more useful than a version label?",
      "What fallback would you design for a peer without 2M PHY?",
    ],
  },
  "ble-debug-playbook": {
    conceptBrief: [
      "BLE debugging improves when symptoms are mapped to layers: application, GATT/ATT, GAP, SMP, Link Layer, PHY, and the RF environment.",
      "The fastest path is to compare logs with over-the-air evidence and identify who ended the link, what procedure was active, and what changed recently.",
    ],
    whatToObserve: [
      "Many field symptoms have a small set of high-probability causes.",
      "Timeout lengths often point to protocol timers.",
      "Sniffer evidence can separate RF loss from host/application mistakes.",
    ],
    realFirmwareChecklist: [
      "Capture HCI logs, application logs, RSSI, connection parameters, and a sniffer trace when possible.",
      "Record terminate reason codes and which side sent them.",
      "Check CCCD, MTU, DLE, PHY, bonds, resolving list, and connection updates before changing RF hardware.",
      "Create counters for queue-full, ATT errors, supervision timeouts, encryption failures, and reconnect attempts.",
    ],
    commonTraps: [
      "Debugging from app logs only.",
      "Treating every disconnect as RF loss.",
      "Forgetting stale bonds, privacy resolution, or mobile OS parameter policy.",
    ],
    selfCheck: [
      "What artifact tells you who dropped a BLE link?",
      "What does a 30 second ATT timeout usually mean?",
      "What should you collect before visiting a customer site?",
    ],
  },
};

export function hasLabNotes(slug: string): boolean {
  return Boolean(labNotesBySlug[slug]);
}
