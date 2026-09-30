#pragma once

#include <algorithm>
#include <array>
#include <cstddef>
#include <cstdint>
#include <ctime>

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

using WeekdayMask = std::uint8_t;

constexpr WeekdayMask weekdayBit(Weekday weekday)
{
    return static_cast<WeekdayMask>(1u << static_cast<unsigned int>(weekday));
}

constexpr bool includesWeekday(WeekdayMask weekdays, Weekday weekday)
{
    return (weekdays & weekdayBit(weekday)) != 0;
}

inline Weekday get_current_weekday(const std::tm* local_time)
{
    if (!local_time)
    {
        return Weekday::Sunday;
    }

    return static_cast<Weekday>(local_time->tm_wday);
}

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
