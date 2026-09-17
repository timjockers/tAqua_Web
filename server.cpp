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
