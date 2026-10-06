#include "server.hpp"

#include <fstream>
#include <sstream>
#include <iostream>

#include <nlohmann/json.hpp>
using json = nlohmann::json;

#include "types.hpp"
#include <chrono>

using namespace std;

static string read_html_file(const string& path) {
    ifstream file(path);
    if (!file.is_open()) {
        return "";
    }
    stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}



HTTPServer::HTTPServer(ConfigManager* configManager)
    : configM(configManager)
{
    setupWebpage();
    setupRoutes();
}

HTTPServer::~HTTPServer()
{
    svr.stop();
}

void HTTPServer::setupWebpage() {
    if (!svr.set_mount_point("/static/", "./static")) {
        cerr << "The directory static does not exist." << endl;
    }

    if (!svr.set_mount_point("/img/", "./img")) {
        cerr << "The directory img does not exist." << endl;
    }

    svr.Get("/", [](const httplib::Request& req, httplib::Response& res) {
        string html_content = read_html_file("index.html");

        if (!html_content.empty()) {
            res.set_content(html_content, "text/html");
        } else {
            res.status = 404;
            res.set_content("<h1>404 Not Found</h1>", "text/html");
        }
    });
}

void HTTPServer::setupRoutes() {
    svr.Get("/api/relayConfig", [&](const httplib::Request& req, httplib::Response& res) {
        const auto& conf = configM->getRelayConfig();

        string json_payload = "{";
        for (int r = 0; r < 8; r++) {
            json_payload.append("\"" + to_string(r) + "\": " + to_string(static_cast<int>(conf[r])));
            if (r < 7) {
                json_payload.append(", ");
            }
        }
        json_payload.append("}");
        
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content(json_payload, "application/json");
    });
    
    svr.Post("/api/relayConfig", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            const Relay id = static_cast<Relay>(j.at("id").get<int>());
            const RelayConfig status = static_cast<RelayConfig>(j.at("status").get<int>());

            configM->setRelayConfigR(id, status);
            if (configM->writeConfig())
            {
                res.status = 200;
                res.set_content("Configuration updated successfully", "text/plain");
                return;
            }
            else
            {
                cerr << "Error writing config file after setRelayConfigR!" << endl;
                res.status = 500;
                res.set_content("Internal Server Error: Failed to save configuration", "text/plain");
                return;
            }
        } catch (...) {
            // Invalid JSON
        }
        res.status = 400;
        res.set_content("Invalid JSON", "text/plain");
    });

    svr.Get("/api/buttonIrrigationTime", [&](const httplib::Request& req, httplib::Response& res) {
        const auto& btnIrrTime = configM->getButtonIrrTime();

        string json_payload = "{\"seconds\": " + to_string(btnIrrTime.count()) + "}";
        
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content(json_payload, "application/json");
    });

    svr.Post("/api/buttonIrrigationTime", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            const chrono::seconds duration = static_cast<chrono::seconds>(j.at("seconds").get<int>());
            
            configM->setButtonIrrTime(duration);
            if (configM->writeConfig())
            {
                res.status = 200;
                res.set_content("Configuration updated successfully", "text/plain");
                return;
            }
            else
            {
                cerr << "Error writing config file after setRelayConfigR!" << endl;
                res.status = 500;
                res.set_content("Internal Server Error: Failed to save configuration", "text/plain");
                return;
            }
        } catch (...) {
            // Invalid JSON
        }
        res.status = 400;
        res.set_content("Invalid JSON", "text/plain");
    });

    svr.Get("/api/scheduled", [&](const httplib::Request& req, httplib::Response& res) {
        if (!req.has_param("relay"))
        {
            res.status = 400;
            res.set_content("Missing relay parameter", "text/plain");
            return;
        }

        const string relayParam = req.get_param_value("relay");
        size_t parsedLength = 0;
        int relayNumber = 0;
        try
        {
            relayNumber = stoi(relayParam, &parsedLength);
        }
        catch (const exception&)
        {
            relayNumber = 0;
        }

        if (parsedLength != relayParam.size() || relayNumber < 1 || relayNumber > 8)
        {
            res.status = 400;
            res.set_content("Relay must be a number from 1 to 8", "text/plain");
            return;
        }

        const auto& scheduledEvents = configM->getScheduledEvents();
        const int relayIndex = relayNumber - 1;
        json response = json::array();

        for (const auto& scheduledE : scheduledEvents)
        {
            if (static_cast<int>(scheduledE.relay) != relayIndex)
            {
                continue;
            }

            response.push_back({
                {"weekdays", static_cast<int>(scheduledE.weekdays)},
                {"time", scheduledE.startTime.count()},
                {"duration", scheduledE.duration.count()}
            });
        }

        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content(response.dump(), "application/json");
    });

    svr.Post("/api/scheduled", [&](const httplib::Request& req, httplib::Response& res) {
        if (!req.has_param("relay")) {
            res.status = 400;
            res.set_content("Missing relay parameter", "text/plain");
            return;
        }

        const string relayParam = req.get_param_value("relay");
        size_t parsedLength = 0;
        int relayNumber = 0;
        try {
            relayNumber = stoi(relayParam, &parsedLength);
        }
        catch (const exception&) {
            relayNumber = 0;
        }

        if (parsedLength != relayParam.size() || relayNumber < 1 || relayNumber > 8) {
            res.status = 400;
            res.set_content("Relay must be a number from 1 to 8", "text/plain");
            return;
        }

        try {
            const auto eventList = json::parse(req.body);
            if (!eventList.is_array()) {
                throw std::invalid_argument("Request body must be a JSON array of schedule events");
            }

            const Relay relay = static_cast<Relay>(relayNumber - 1);
            vector<scheduledEvent> updatedEvents;
            updatedEvents.reserve(configM->getScheduledEvents().size());

            for (const auto& scheduledEvent : configM->getScheduledEvents()) {
                if (static_cast<int>(scheduledEvent.relay) != static_cast<int>(relay)) {
                    updatedEvents.push_back(scheduledEvent);
                }
            }

            for (const auto& event : eventList) {
                if (!event.is_object()
                    || event.size() != 3
                    || !event.contains("weekdays")
                    || !event.contains("time")
                    || !event.contains("duration")) {
                    throw std::invalid_argument(
                        "Each event must contain only weekdays, time and duration");
                }

                const int weekdays = event.at("weekdays").get<int>();
                const int time = event.at("time").get<int>();
                const int duration = event.at("duration").get<int>();

                if (weekdays < 0 || weekdays > 0x7f
                    || time < 0 || time >= 24 * 60
                    || duration < 0) {
                    throw std::invalid_argument("Invalid schedule event values");
                }

                updatedEvents.push_back({
                    relay,
                    std::chrono::seconds(duration),
                    static_cast<WeekdayMask>(weekdays),
                    std::chrono::minutes(time)
                });
            }

            configM->setScheduledEvents(updatedEvents);

            if (!configM->writeConfig()) {
                res.status = 500;
                res.set_content("Internal Server Error: Failed to save configuration", "text/plain");
                return;
            }

            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content(eventList.dump(), "application/json");
        } catch (const json::exception& ex) {
            cerr << "Invalid schedule JSON: " << ex.what() << endl;
            res.status = 400;
            res.set_content("Invalid JSON", "text/plain");
        } catch (const std::exception& ex) {
            cerr << "Invalid schedule configuration: " << ex.what() << endl;
            res.status = 400;
            res.set_content(ex.what(), "text/plain");
        }
    });
}

void HTTPServer::start(const string& host, int port) {
    cout << "Server starting at http://localhost:" << port << "..." << endl;

    if (!svr.listen(host.c_str(), port)) {
        cerr << "Error: Port " << port << " is already in use or inaccessible!" << endl;
    }
}

void HTTPServer::stop() noexcept
{
    svr.stop();
}
