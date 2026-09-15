#include "server.hpp"

#include <fstream>
#include <sstream>
#include <iostream>

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
    
    /*svr.Post("/api/relayConfig", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            int id = j.at("id").get<int>();
            int status = j.at("status").get<int>();

            if (id >= 0 && id <= 7 && status >= 0 && status <= 2) {
                ctrl->setConfigure(id, status);
                res.set_content("JSON received", "text/plain");
                return;
            }
        } catch (...) {
            // Invalid JSON
        }
        res.status = 400;
        res.set_content("Invalid JSON", "text/plain");
    });*/
}

void HTTPServer::start(const string& host, int port) {
    cout << "Server starting at http://localhost:8080..." << endl;

    if (!svr.listen(host.c_str(), port)) {
        cerr << "Error: Port 8080 is already in use!" << endl;
    }
}

void HTTPServer::stop() noexcept
{
    svr.stop();
}
