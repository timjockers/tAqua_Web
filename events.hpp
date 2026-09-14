#pragma once

#include <chrono>
#include "types.hpp"

class irrigationEvent{};


class relayEvent : public irrigationEvent {
public:
    relayEvent(Relay r);

    Relay getRelay() const;

protected:
    Relay relay;
};


class durationEvent : public relayEvent {
public:
    durationEvent(Relay r, std::chrono::seconds irrDuration);

protected:
    std::chrono::seconds duration;
    std::chrono::system_clock::time_point startTime;
};


class buttonEvent : public durationEvent {
public:
    using durationEvent::durationEvent;
};


class scheduledEvent : public durationEvent {
public:
    scheduledEvent(Relay r, std::chrono::seconds irrDuration, Weekday weekday, std::chrono::minutes startTime);

private:
    Weekday wday;
    std::chrono::minutes starttime; // Minutes past midnight
};
