#pragma once

#include <chrono>
#include "types.hpp"

struct scheduledEvent {
    Relay relay;
    std::chrono::seconds duration;
    WeekdayMask weekdays;
    std::chrono::minutes startTime;
};
