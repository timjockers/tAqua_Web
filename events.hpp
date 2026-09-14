#pragma once

#include <chrono>
#include "types.hpp"

struct scheduledEvent {
    Relay relay;
    std::chrono::seconds duration;
    Weekday weekday;
    std::chrono::minutes startTime;
};
