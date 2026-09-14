#pragma once

// Weekdays
enum class Weekday {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
};

// The 3 possible relay configurations
enum class RelayConfig {
    UNUSED = 0,
    VALVE = 1,
    PERMANENTPOWER = 2
};

// Relays
enum class Relay {
    R1 = 0,
    R2 = 1,
    R3 = 2,
    R4 = 3,
    R5 = 4,
    R6 = 5,
    R7 = 6,
    R8 = 7
};
